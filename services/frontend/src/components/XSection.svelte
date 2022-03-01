<script>
  import {
    path,
    runHour,
    smokeScale,
    thresholds,
    validTime
  } from "../stores.js";
  import * as api from "../api.js";
  import AxisBottom from "./AxisBottom.svelte";
  import AxisLeft from "./AxisLeft.svelte";
  import Contour from "./Contour.svelte";
  import HrrrMap from "./HrrrMap.svelte";
  import Loading from "./Loading.svelte";

  import {
    contours,
    geoPath,
    geoTransform,
    scaleLinear,
  } from "d3";
  import { mesh } from "topojson-client";

  let width = 0;
  let height = 0;
  let mapSize = 0;
  let smoke = [];
  let xScale = scaleLinear();
  let yScale = scaleLinear();
  let contourPath;

  $: ready = $runHour !== null && $validTime !== null && $path !== null;
  $: data = ready ? api.xsection({
    runHour: $runHour,
    validTime: $validTime,
    ...$path
  }) : Promise.resolve(null)

  $: data.then(function (xsection) {
    if (xsection === null) return;
    smoke = contours().size([xsection.columns, xsection.rows]).thresholds($thresholds)(xsection.massden);
    xScale = scaleLinear().domain([0, xsection.columns]).range([0, width]);
    yScale = scaleLinear().domain([0, xsection.rows]).range([height, 0]);
    contourPath = geoPath(geoTransform({
      point: function (x, y) {
        this.stream.point(xScale(x), yScale(y));
      },
    }));
  });
</script>

<div class="hrrr-xsection">
  <Loading promise={data}>
    <div class="container">
      <div class="chart" bind:offsetWidth={width} bind:offsetHeight={height}>
        <svg class="x-section" viewBox="0 0 {width} {height}">
          <Contour contours={smoke} fill={$smokeScale} path={contourPath} />
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
  </Loading>
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
