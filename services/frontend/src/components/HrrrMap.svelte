<script>
  import { path } from "../stores.js";

  import { geoPath, geoAlbers } from "d3-geo";
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

    const projection = geoAlbers().fitExtent([[20, 20], [width - 40, height - 40]], xsectionPath);
    const p = geoPath(projection, context);

    context.clearRect(0, 0, width, height);

    context.strokeStyle = "#a9aeb1";

    context.lineWidth = 1;
    context.beginPath();
    p(counties);
    context.stroke();

    context.lineWidth = 2;
    context.beginPath();
    p(states);
    context.stroke();
  };
</script>

<canvas
  bind:this="{canvas}"
  width={width}
  height={height}
></canvas>

