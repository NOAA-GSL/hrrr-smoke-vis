<script>
  import * as api from "../api.js";
  import {
    path,
    runHour,
    smokeScale,
    thresholds,
    validTime,
  } from "../stores.js";
  import Loading from "./Loading.svelte";

  import { extent } from "d3-array";
  import { contours } from "d3-contour";
  import { geoPath, geoAlbers, geoCircle, geoStream, geoTransform } from "d3-geo";
  import { mesh } from "topojson-client";
  import { afterUpdate, onMount } from "svelte";

  export let width = 0;
  export let height = 0;
  let borderData;
  let canvas;
  let context;
  let data;
  let smoke;
  let startPoint = null;

  let projection = geoAlbers();

  $: ready = $runHour !== null && $validTime !== null;
  $: if (ready) {
    data = api.vertical($runHour, $validTime)
  }

  $: smoke = data.then(function (data) {
    const contourGenerator = contours()
      .size([data.columns, data.rows])
      .thresholds($thresholds);

    return contourGenerator(data.massden)
      .filter((multiPolygon) => multiPolygon.value > 0);
  });

  $: xsectionPath = $path ? {
    type: "LineString",
    coordinates: [
      [$path.startLng, $path.startLat],
      [$path.endLng, $path.endLat],
    ],
  } : null;

  onMount(() => {
    fetch("/data/us.json")
      .then((res) => res.json())
      .then((geodata) => {
        borderData = geodata;
        render();
      });
  });

  function drawPath(color, width, radius, p) {
    const c = geoCircle().radius(radius);

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;

    context.beginPath();
    p(xsectionPath);
    context.stroke();

    context.beginPath();
    c.center(xsectionPath.coordinates[0]);
    p(c());
    c.center(xsectionPath.coordinates[1]);
    p(c());
    context.fill();
  }

  async function render() {
    context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);

    if (!borderData) return;

    const counties = mesh(borderData, borderData.objects.counties);
    const states = mesh(borderData, borderData.objects.states);

    projection.fitExtent(
      [[5, 5], [width - 10, height - 10]],
      xsectionPath || states
    );

    const p = geoPath(projection, context);

    const style = getComputedStyle(canvas);

    context.strokeStyle = style.getPropertyValue("--county-border-color");
    context.lineWidth = +style.getPropertyValue("--county-border-width");

    context.beginPath();
    p(counties);
    context.stroke();

    context.save();
    context.strokeStyle = style.getPropertyValue("--state-border-color");
    context.lineWidth = +style.getPropertyValue("--state-border-width");

    context.beginPath();
    p(states);
    context.stroke();
    context.restore();

    data.then(function (verticallyIntegrated) {
      const smokePath = geoPath(geoTransform({
        point: function (x, y) {
          const i = Math.max(0, Math.min(verticallyIntegrated.columns, Math.floor(x)));
          const j = Math.max(0, Math.min(verticallyIntegrated.rows, Math.floor(y)));

          if (i >= verticallyIntegrated.columns || j >= verticallyIntegrated.rows) return;

          const [px, py] = projection([
            verticallyIntegrated.longitude[j][i],
            verticallyIntegrated.latitude[j][i],
          ]);

          if ([px, py].every(isFinite)) {
            this.stream.point(px, py);
          }
        },
      }), context);

      context.save();
      context.globalAlpha = 0.8;
      smoke.then(function (data) {
        data.forEach(function (d) {
          context.fillStyle = $smokeScale(d.value);
          context.beginPath();
          smokePath(d);
          context.fill();
        });
      });
      context.restore();
    });

    if (!xsectionPath) return;

    const degPerPx = Math.max(
      Math.abs($path.startLng - $path.endLng) / width,
      Math.abs($path.startLat - $path.endLat) / height
    );

    drawPath(
      style.getPropertyValue("background-color"),
      +style.getPropertyValue("--path-width") + 6,
      7 * degPerPx,
      p,
    );
    drawPath(
      style.getPropertyValue("--path-color"),
      +style.getPropertyValue("--path-width"),
      4 * degPerPx,
      p,
    );
  }

  function handleClick(event) {
    const { left, top } = canvas.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const coords = projection.invert([x, y]);

    if (!startPoint) {
      startPoint = coords;
      return;
    }

    path.set({
      startLat: startPoint[1],
      startLng: startPoint[0],
      endLat: coords[1],
      endLng: coords[0],
    });

    startPoint = null;
  }

  afterUpdate(render);
</script>

<Loading promise={smoke}>
  <canvas
    bind:this={canvas}
    on:click={handleClick}
    class="hrrr-map"
    width={width}
    height={height}
  ></canvas>
</Loading>
