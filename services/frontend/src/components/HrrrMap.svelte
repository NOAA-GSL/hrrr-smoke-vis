<script>
  import {
    borders,
    path,
    smokeScale,
    thresholds,
  } from "../stores.js";
  import Loading from "./Loading.svelte";

  import { contours } from "d3-contour";
  import { geoPath, geoAlbers, geoCircle, geoStream, geoTransform } from "d3-geo";
  import { afterUpdate } from "svelte";

  export let data;
  let width = 0;
  let height = 0;

  let canvas;
  let smoke;
  let columns = 0;
  let rows = 0;
  let latitude;
  let longitude;
  let startPoint = null;

  $: counties = $borders?.counties;
  $: states = $borders?.states;

  $: data.then(function (data) {
    if (data === null) return;
    const contourGenerator = contours()
      .size([data.columns, data.rows])
      .thresholds($thresholds);

    smoke = contourGenerator(data.massden)
      .filter((multiPolygon) => multiPolygon.value > 0);
    columns = data.columns;
    rows = data.rows;
    longitude = data.longitude;
    latitude = data.latitude;
  });

  $: xsectionPath = $path ? {
    type: "LineString",
    coordinates: [
      [$path.startLng, $path.startLat],
      [$path.endLng, $path.endLat],
    ],
  } : null;

  $: projection = (width > 0 && height > 0 && (xsectionPath || states))
    ? geoAlbers().fitExtent(
      [[5, 5], [width - 10, height - 10]],
      xsectionPath || states
    )
    : null;

  $: {
    // Redraw the map whenever the smoke data or the projection change.
    // Other changes that should trigger a redraw are handled by
    // afterUpdate, because they should affect DOM.
    smoke;
    draw();
  }

  afterUpdate(draw);

  function drawPath(context, color, width, radius, p) {
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

  function draw() {
    if (!(canvas && projection)) return;

    console.log(`redraw map ${width}×${height}`);
    const context = canvas.getContext("2d");

    console.log('clearing map');
    console.log(context);
    context.clearRect(0, 0, width, height);

    const p = geoPath(projection, context);

    const style = getComputedStyle(canvas);

    if (counties) {
      console.log("drawing counties");
      context.strokeStyle = style.getPropertyValue("--county-border-color");
      context.lineWidth = +style.getPropertyValue("--county-border-width");

      context.beginPath();
      p(counties);
      context.stroke();
    }

    if (states) {
      console.log("drawing states");
      context.save();
      context.strokeStyle = style.getPropertyValue("--state-border-color");
      context.lineWidth = +style.getPropertyValue("--state-border-width");

      context.beginPath();
      p(states);
      context.stroke();
      context.restore();
    }

    if (smoke) {
      console.assert(columns > 0, 'columns must be > 0');
      console.assert(rows > 0, 'rows must be > 0');
      console.assert(longitude.length > 0, 'longitude.length must be > 0');
      console.assert(latitude.length > 0, 'latitude.length must be > 0');
      console.log("drawing smoke");

      const smokePath = geoPath(geoTransform({
        point: function (x, y) {
          const i = Math.max(0, Math.min(columns, Math.floor(x)));
          const j = Math.max(0, Math.min(rows, Math.floor(y)));

          if (i >= columns || j >= rows) return;

          const [px, py] = projection([
            longitude[j][i],
            latitude[j][i],
          ]);

          if ([px, py].every(isFinite)) {
            this.stream.point(px, py);
          }
        },
      }), context);

      context.save();
      context.globalAlpha = 0.8;
      smoke.forEach(function (d) {
        context.fillStyle = $smokeScale(d.value);
        context.beginPath();
        smokePath(d);
        context.fill();
      });
      context.restore();
    }

    if (xsectionPath) {
      console.assert(width > 0, 'width should be positive');
      console.assert(height > 0, 'height should be positive');
      console.log("drawing path");

      const degPerPx = Math.max(
        Math.abs($path.startLng - $path.endLng) / width,
        Math.abs($path.startLat - $path.endLat) / height
      );

      drawPath(
        context,
        style.getPropertyValue("background-color"),
        +style.getPropertyValue("--path-width") + 6,
        7 * degPerPx,
        p,
      );
      drawPath(
        context,
        style.getPropertyValue("--path-color"),
        +style.getPropertyValue("--path-width"),
        4 * degPerPx,
        p,
      );
    }

    console.log("redraw complete");
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
</script>

<div class="container" bind:offsetWidth={width} bind:offsetHeight={height}>
  <Loading promise={data}>
    <canvas
      bind:this={canvas}
      on:click={handleClick}
      class="hrrr-map"
      width={width}
      height={height}
    ></canvas>
  </Loading>
</div>

<style>
  .container {
    aspect-ratio: 1/1;
    width: 100%;
    overflow: hidden;
  }
</style>
