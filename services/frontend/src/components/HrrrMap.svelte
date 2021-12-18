<script>
  import { forecast } from "../stores.js";

  import { geoPath, geoAlbers, geoCircle } from "d3-geo";
  import { mesh } from "topojson-client";
  import { filter as topoFilter } from "topojson-simplify";
  import { afterUpdate, onMount } from "svelte";

  export let width = 0;
  export let height = 0;
  let borderData;
  let canvas;
  let context;

  $: xsectionPath = {
    type: "LineString",
    coordinates: [
      [$forecast.startLng, $forecast.startLat],
      [$forecast.endLng, $forecast.endLat],
    ],
  };

  $: ready = !!borderData
    && $forecast.startLng !== null
    && $forecast.startLat !== null
    && $forecast.endLng !== null
    && $forecast.endLat !== null;

  onMount(() => {
    fetch("/data/us.json")
      .then((res) => res.json())
      .then((geodata) => {
        borderData = geodata;
      });
  });

  function drawPath(color, width, radius, p) {
    const c = geoCircle().radius(radius);

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;

    context.beginPath();
    p(xsectionPath);
    context.stroke();

    context.beginPath();
    c.center(xsectionPath.coordinates[0]);
    p(c());
    c.center(xsectionPath.coordinates[1]);
    p(c());
    context.fill();
  }

  afterUpdate(() => {
    context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);

    if (!ready) return;

    const counties = mesh(borderData, borderData.objects.counties);
    const states = mesh(borderData, borderData.objects.states);

    const projection = geoAlbers().fitExtent([[5, 5], [width - 10, height - 10]], xsectionPath);
    const p = geoPath(projection, context);

    const style = getComputedStyle(canvas);

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

    const degPerPx = Math.max(
      Math.abs($forecast.startLng - $forecast.endLng) / width,
      Math.abs($forecast.startLat - $forecast.endLat) / height
    );

    drawPath(
      style.getPropertyValue("background-color"),
      +style.getPropertyValue("--path-width") + 6,
      7 * degPerPx,
      p,
    );
    drawPath(
      style.getPropertyValue("--path-color"),
      +style.getPropertyValue("--path-width"),
      4 * degPerPx,
      p,
    );
  });
</script>

<canvas
  bind:this="{canvas}"
  class="hrrr-map"
  width={width}
  height={height}
></canvas>
