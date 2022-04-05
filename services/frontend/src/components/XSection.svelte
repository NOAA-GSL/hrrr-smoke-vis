<script>
  import {
    path,
    runHour,
    smokeScale,
    thresholds,
    validTime
  } from "../stores.js";
  import * as api from "../api.js";
  import Axis from "./Axis.svelte";
  import Contour from "./Contour.svelte";
  import HrrrMap from "./HrrrMap.svelte";
  import Loading from "./Loading.svelte";

  import {
    contours,
    extent,
    format,
    geoPath,
    geoTransform,
    scaleLinear,
  } from "d3";
  import { mesh } from "topojson-client";

  export let mapData;

  let width = 0;
  let height = 0;

  let columns = 0;
  let rows = 0;
  let distance = 0;
  let isobaricPressure = [];
  let massden = [];
  let xScale = scaleLinear();
  let yScale = scaleLinear();
  let contourPath;
  let chartMargin = {
    top: 24,
    right: 24,
    bottom: 32,
    left: 64,
  };

  $: chartWidth = Math.max(width - chartMargin.left - chartMargin.right, 0);
  $: chartHeight = Math.max(height - chartMargin.top - chartMargin.bottom, 0);

  $: ready = $runHour !== null && $validTime !== null && $path !== null;
  $: data = ready ? api.xsection({
      runHour: $runHour,
      validTime: $validTime,
      ...$path
    }) : Promise.resolve(null);

  $: data.then(function (xsection) {
    if (xsection === null) return;

    columns = xsection.columns;
    rows = xsection.rows;
    isobaricPressure = xsection.isobaricPressure;

    // Convert distnace from meters to kilometers
    distance = xsection.distance / 1000;

    massden = xsection.massden;
  });

  $: smoke = contours().size([columns, rows]).thresholds($thresholds)(massden);
  $: xScale = scaleLinear().domain([0, columns]).range([0, chartWidth]);
  $: yScale = scaleLinear().domain([0, rows]).range([chartHeight, 0]);
  $: distanceScale = scaleLinear().domain([0, distance]).range([0, chartWidth]);
  $: pressureScale = scaleLinear().domain(extent(isobaricPressure)).range([0, chartHeight]);
  $: contourPath = geoPath(geoTransform({
    point: function (x, y) {
      this.stream.point(xScale(x), yScale(y));
    },
  }));
</script>

<Loading promise={data} classNames="hrrr-xsection">
  <div class="container">
    <div class="chart" bind:offsetWidth={width} bind:offsetHeight={height}>
      <svg class="x-section" viewBox="0 0 {width} {height}">
        <g transform="translate({chartMargin.left}, {chartMargin.top})">
          <Contour contours={smoke} fill={$smokeScale} path={contourPath} />
        </g>
        <Axis orientation="left" scale={pressureScale} transform="translate({chartMargin.left}, {chartMargin.top})" />
        <Axis orientation="bottom" scale={distanceScale} transform="translate({chartMargin.left}, {chartHeight + chartMargin.top})"
              format={format(",d")} />
      </svg>
    </div>

    <div class="map">
      <HrrrMap data={mapData} showCounties=true />
    </div>

    <small class="axis-title left">Pressure (mb, from Standard Atmosphere)</small>
    <small class="axis-title bottom">Distance (km)</small>
  </div>
</Loading>

<style>
  .container {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      "left-axis chart       right-axis"
      "......... bottom-axis ..........";

    height: 100%;
    overflow: hidden;
  }

  .chart,
  .map {
    grid-area: chart;
    overflow: hidden;
  }

  .chart {
    height: 100%;
    z-index: 0;
  }

  .map {
    width: 25%;
    border: 1px solid var(--text-1);
    aspect-ratio: 1 / 1;
    justify-self: end;
    z-index: 1;
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
