<script>
  import { onMount } from "svelte";

  import {
    contours,
    extent,
    geoIdentity,
    geoPath,
    interpolateRdPu,
    scaleSequential,
  } from "d3";
  import { mesh } from "topojson-client";

  let data = {
    "massden": [],
    "rows": 0,
    "columns": 0,
  };


  $: smokeContours = contours().size([data.columns, data.rows])(data.massden);
  $: smokeColor = scaleSequential(extent(data.massden), interpolateRdPu);

  $: path = geoPath();

  $: {
    console.log(smokeContours[0]);
  };

  onMount(() => {
    fetch("/data/sample.json")
      .then((res) => res.json())
      .then((json) => {
        data = json;
      });
  });
</script>
<svg viewBox="0 0 {data.columns} {data.rows}" width="300" height="300" preserveAspectRatio="none">
{#each smokeContours as contour}
  <path d={path(contour)} fill={smokeColor(contour.value)}></path>
{/each}
</svg>
