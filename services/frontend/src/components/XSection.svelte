<script>
  import Contour from "./Contour.svelte";

  import { onMount } from "svelte";
  import {
    contours,
    extent,
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

  let thresholds = [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 60, 100, 200, 210];

  $: smokeContours = contours().size([data.columns, data.rows]).thresholds(thresholds)(data.massden);

  onMount(() => {
    fetch("/data/sample.json")
      .then((res) => res.json())
      .then((json) => {
        data = json;
      });
  });
</script>
<svg viewBox="0 0 {data.columns} {data.rows}" width="300" height="300" preserveAspectRatio="none">
  <Contour contours={smokeContours} fill={scaleSequential(extent(thresholds), interpolateRdPu)} path={geoPath()} />
</svg>
