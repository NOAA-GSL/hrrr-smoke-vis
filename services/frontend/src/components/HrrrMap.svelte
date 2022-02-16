<script>
  import { path, verticallyIntegrated } from "../stores.js";
  import * as api from "../api.js";

  import { extent } from "d3-array";
  import { contours } from "d3-contour";
  import { geoPath, geoAlbers, geoCircle, geoStream, geoTransform } from "d3-geo";
  import { scaleLinear, scaleSqrt, scaleThreshold } from "d3-scale";
  import { interpolateRdPu } from "d3-scale-chromatic";
  import { mesh } from "topojson-client";
  import { afterUpdate, onMount } from "svelte";

  export let width = 0;
  export let height = 0;
  let borderData;
  let canvas;
  let context;
  let smoke;
  let startPoint = null;

  let thresholds = [0, 1, 4, 7, 11, 15, 20, 25, 30, 40, 50, 75, 150, 250, 500];

  let projection = geoAlbers();

  $: if ($verticallyIntegrated) {
    smoke = contours().size(
        [$verticallyIntegrated.columns, $verticallyIntegrated.rows]
      )
      .thresholds(thresholds)($verticallyIntegrated.massden)
      .filter((multiPolygon) => multiPolygon.value > 0);
  }

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

  function render() {
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

    if (!$verticallyIntegrated) return;

    const fillColor = scaleThreshold(thresholds, thresholds.map((_, idx, arr) => {
      return interpolateRdPu(idx / (arr.length - 1));
    }));
    const smokePath = geoPath(geoTransform({
      point: function (x, y) {
        const i = Math.max(0, Math.min($verticallyIntegrated.columns, Math.floor(x)));
        const j = Math.max(0, Math.min($verticallyIntegrated.rows, Math.floor(y)));

        if (i >= $verticallyIntegrated.columns || j >= $verticallyIntegrated.rows) return;

        const [px, py] = projection([
          $verticallyIntegrated.longitude[j][i],
          $verticallyIntegrated.latitude[j][i],
        ]);

        if ([px, py].every(isFinite)) {
          this.stream.point(px, py);
        }
      },
    }), context);

    context.save();
    context.globalAlpha = 0.8;
    smoke.forEach(function (d) {

      context.fillStyle = fillColor(d.value);
      context.beginPath();
      smokePath(d);
      context.fill();

    });
    context.restore();

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

<canvas
  bind:this={canvas}
  on:click={handleClick}
  class="hrrr-map"
  width={width}
  height={height}
></canvas>
