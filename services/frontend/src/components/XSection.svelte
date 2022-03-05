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
  let massden = [];
  let xScale = scaleLinear();
  let yScale = scaleLinear();
  let contourPath;

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
    massden = xsection.massden;
  });

  $: smoke = contours().size([columns, rows]).thresholds($thresholds)(massden);
  $: xScale = scaleLinear().domain([0, columns]).range([0, width]);
  $: yScale = scaleLinear().domain([0, rows]).range([height, 0]);
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
        <Contour contours={smoke} fill={$smokeScale} path={contourPath} />
        <Axis orientation="right" scale={yScale} />
        <Axis orientation="top" scale={xScale} transform="translate(0, {height})" />
      </svg>
    </div>

    <div class="map">
      <HrrrMap data={mapData} />
    </div>

    <small class="axis-title left">Pressure (mb, from Standard Atmosphere)</small>
    <small class="axis-title bottom">Distance (km)</small>
  </div>
</Loading>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

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
