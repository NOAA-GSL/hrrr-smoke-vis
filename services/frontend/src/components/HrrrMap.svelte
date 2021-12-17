<script>
  import { path } from "../stores.js";

  import { geoPath, geoAlbers, geoCircle } from "d3-geo";
  import { mesh } from "topojson-client";
  import { filter as topoFilter } from "topojson-simplify";
  import { onMount } from "svelte";

  export let width = 0;
  export let height = 0;
  let borderData;
  let canvas;
  let context;

  $: xsectionPath = {
    type: "LineString",
    coordinates: [
      [$path.startLng, $path.startLat],
      [$path.endLng, $path.endLat],
    ],
  };

  $: ready = !!borderData
    && $path.startLng !== null
    && $path.startLat !== null
    && $path.endLng !== null
    && $path.endLat !== null;

  onMount(() => {
    context = canvas.getContext("2d");

    fetch("/data/us.json")
      .then((res) => res.json())
      .then((geodata) => {
        borderData = geodata;
      });
  });

  $: if (ready) {
    const counties = mesh(borderData, borderData.objects.counties);
    const states = mesh(borderData, borderData.objects.states);

    const projection = geoAlbers().fitExtent([[5, 5], [width - 10, height - 10]], xsectionPath);
    const p = geoPath(projection, context);

    const style = getComputedStyle(canvas);

    context.clearRect(0, 0, width, height);

    context.strokeStyle = style.getPropertyValue("--county-border-color");
    context.lineWidth = +style.getPropertyValue("--county-border-width");

    context.beginPath();
    p(counties);
    context.stroke();

    context.strokeStyle = style.getPropertyValue("--state-border-color");
    context.lineWidth = +style.getPropertyValue("--state-border-width");

    context.beginPath();
    p(states);
    context.stroke();

    context.strokeStyle = style.getPropertyValue("--path-color");
    context.lineWidth = +style.getPropertyValue("--path-width");

    context.beginPath();
    p(xsectionPath);
    context.stroke();

    const c = geoCircle().radius(Math.max(
      Math.abs($path.startLng - $path.endLng) / width * 4,
      Math.abs($path.startLat - $path.endLat) / height * 4
    ));
    context.fillStyle = "#000000"
    context.beginPath();
    c.center(xsectionPath.coordinates[0]);
    p(c());
    c.center(xsectionPath.coordinates[1]);
    p(c());
    context.fill();
    context.stroke();
  };
</script>

<canvas
  bind:this="{canvas}"
  class="hrrr-map"
  width={width}
  height={height}
></canvas>
