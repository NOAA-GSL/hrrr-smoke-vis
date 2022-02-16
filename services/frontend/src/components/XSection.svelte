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
    scaleThreshold,
  } from "d3";
  import { mesh } from "topojson-client";

  let thresholds = [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 60, 100, 200, 210];

  let width = 0;
  let height = 0;
  let mapSize = 0;

  $: smoke = contours().size([$xsection.columns, $xsection.rows]).thresholds(thresholds)($xsection.massden);
  $: xScale = scaleLinear().domain([0, $xsection.columns]).range([0, width]);
  $: yScale = scaleLinear().domain([0, $xsection.rows]).range([height, 0]);
  $: path = geoPath(geoTransform({
    point: function (x, y) {
      this.stream.point(xScale(x), yScale(y));
    },
  }));
  $: fillScale = scaleThreshold(thresholds, thresholds.map((_, idx, arr) => {
    return interpolateRdPu(idx / (arr.length - 1));
  }));
</script>

<div class="hrrr-xsection container">
  <div class="chart" bind:offsetWidth={width} bind:offsetHeight={height}>
    <svg class="x-section" viewBox="0 0 {width} {height}">
      <Contour contours={smoke} fill={fillScale} {path} />
      <g class="axis">
        <AxisLeft scale={yScale} />
      </g>
      <AxisBottom scale={xScale} transform="translate(0, {height})" />
    </svg>
  </div>

  <div class="map" bind:offsetWidth={mapSize}>
    <HrrrMap width={mapSize} height={mapSize} />
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

  .chart,
  .map {
    grid-area: chart;
    overflow: hidden;
  }

  .map {
    width: 25%;
    border: 1px solid var(--fg-color, black);
    aspect-ratio: 1 / 1;
    justify-self: end;
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
