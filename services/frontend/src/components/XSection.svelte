<script>
  import AxisBottom from "./AxisBottom.svelte";
  import AxisLeft from "./AxisLeft.svelte";
  import Contour from "./Contour.svelte";

  import { onMount } from "svelte";
  import {
    contours,
    extent,
    geoPath,
    geoTransform,
    interpolateRdPu,
    scaleLinear,
    scaleSequentialSqrt,
  } from "d3";
  import { mesh } from "topojson-client";

  let data = {
    "massden": [],
    "potentialTemperature": [],
    "rows": 0,
    "columns": 0,
  };

  let thresholds = [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 60, 100, 200, 210];

  let width = 0;
  let height = 0;

  $: smoke = contours().size([data.columns, data.rows]).thresholds(thresholds)(data.massden);
  $: potentialTemperature = contours().size([data.columns, data.rows])(data.potentialTemperature);
  $: xScale = scaleLinear().domain([0, data.columns]).range([0, width]);
  $: yScale = scaleLinear().domain([0, data.rows]).range([height, 0]);
  $: path = geoPath(geoTransform({
    point: function (x, y) {
      this.stream.point(xScale(x), yScale(y));
    },
  }));

  onMount(() => {
    fetch("/data/sample.json")
      .then((res) => res.json())
      .then((json) => {
        data = json;
      });
  });
</script>

<div class="hrrr-xsection container">
  <div bind:offsetWidth={width} bind:offsetHeight={height}>
    <svg viewBox="0 0 {width} {height}">
      <Contour contours={smoke.filter((d) => d.value > 0)} fill={scaleSequentialSqrt(extent(thresholds), interpolateRdPu)} {path} />
      <Contour contours={potentialTemperature} stroke={() => "black"} {path} />
      <g class="axis">
        <AxisLeft scale={yScale} />
      </g>
      <AxisBottom scale={xScale} transform="translate(0, {height})" />
    </svg>
  </div>
  <small class="axis-title left">Pressure (mb, from Standard Atmosphere)</small>
  <small class="axis-title bottom">Distance (km)</small>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      "left-axis chart       right-axis"
      "......... bottom-axis ..........";
  }

  svg {
    grid-area: chart;
  }

  .axis-title {
    text-align: center;
  }

  .axis-title.bottom {
    grid-area: bottom-axis;
  }

  .axis-title.left {
    writing-mode: vertical-rl;
  }

  .axis-title.left {
    grid-area: left-axis;
    transform: rotate(180deg);
  }
</style>
