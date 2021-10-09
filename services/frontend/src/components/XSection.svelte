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
    "potentialTemperature": [],
    "rows": 0,
    "columns": 0,
  };

  let thresholds = [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 60, 100, 200, 210];

  $: smoke = contours().size([data.columns, data.rows]).thresholds(thresholds)(data.massden);
  $: potentialTemperature = contours().size([data.columns, data.rows])(data.potentialTemperature);

  onMount(() => {
    fetch("/data/sample.json")
      .then((res) => res.json())
      .then((json) => {
        data = json;
      });
  });
</script>

<svg viewBox="0 0 {data.columns} {data.rows}" width="300" height="300" preserveAspectRatio="none">
  <Contour contours={smoke} fill={scaleSequential(extent(thresholds), interpolateRdPu)} path={geoPath()} />
  <Contour contours={potentialTemperature} stroke={() => "black"} path={geoPath()} />
</svg>
