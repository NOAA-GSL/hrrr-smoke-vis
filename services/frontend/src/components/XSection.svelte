<script>
  import { xsection } from "../stores.js";
  import AxisBottom from "./AxisBottom.svelte";
  import AxisLeft from "./AxisLeft.svelte";
  import Contour from "./Contour.svelte";
  import HrrrMap from "./HrrrMap.svelte";

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

  let thresholds = [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 60, 100, 200, 210];

  let width = 0;
  let height = 0;
  let mapSize = 0;

  $: smoke = contours().size([$xsection.columns, $xsection.rows]).thresholds(thresholds)($xsection.massden);
  $: potentialTemperature = contours().size([$xsection.columns, $xsection.rows])($xsection.potentialTemperature);
  $: xScale = scaleLinear().domain([0, $xsection.columns]).range([0, width]);
  $: yScale = scaleLinear().domain([0, $xsection.rows]).range([height, 0]);
  $: path = geoPath(geoTransform({
    point: function (x, y) {
      this.stream.point(xScale(x), yScale(y));
    },
  }));
</script>

<div class="hrrr-xsection container">
  <div class="chart-container" bind:offsetWidth={width} bind:offsetHeight={height}>
    <svg class="x-section" viewBox="0 0 {width} {height}">
      <Contour contours={smoke.filter((d) => d.value > 0)} fill={scaleSequentialSqrt(extent(thresholds), interpolateRdPu)} {path} />
      <Contour contours={potentialTemperature} stroke={() => "black"} {path} />
      <g class="axis">
        <AxisLeft scale={yScale} />
      </g>
      <AxisBottom scale={xScale} transform="translate(0, {height})" />
    </svg>
    <div class="map" bind:offsetWidth={mapSize}>
      <HrrrMap width={mapSize} height={mapSize} />
    </div>
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

  .chart-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-area: chart;
  }

  .chart-container .x-section {
    grid-area: 1 / 1 / -1 / -1;
  }

  .chart-container .map {
    grid-area: 1 / -2 / 2 / -1;
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
