<script>
  import { geoPath, geoAlbers } from "d3-geo";
  import { mesh } from "topojson-client";
  import { onMount } from "svelte";

  export let showCounties = false;

  let width = 800;
  let height = 500;
  let borderData;
  let canvas;
  let context;

  onMount(() => {
    context = canvas.getContext("2d");

    fetch("/data/us.json")
      .then((res) => res.json())
      .then((geodata) => {
        borderData = geodata;
        redraw();
      });
  });

  const redraw = () => {
    console.log('redraw');
    if (!borderData) return;

    const states = mesh(borderData, borderData.objects.states);
    const projection = geoAlbers().fitSize([width, height], states);
    const path = geoPath(projection, context);

    context.strokeStyle = "#a9aeb1";

    if (showCounties) {
      context.lineWidth = 1;
      context.beginPath();
      path(mesh(borderData, borderData.objects.counties));
      context.stroke();
    }

    context.lineWidth = 2;
    context.beginPath();
    path(states);
    context.stroke();
  };

  /* function resize(width, height) { */
  /*   this.basemap.setAttribute("height", height); */
  /*   this.basemap.setAttribute("width", width); */

  /*   console.log(`Resized: ${width}, ${height}`); */
  /*   this.redraw(); */
  /* } */
</script>

<canvas
  bind:this="{canvas}"
  width={width}
  height={height}
></canvas>

<style>
  canvas {
    width: 100%;
  }
</style>

