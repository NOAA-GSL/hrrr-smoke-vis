<script>
  import {
    borders,
    path,
    smokeScale,
    thresholds,
  } from "../stores.js";
  import Loading from "./Loading.svelte";

  import { contours } from "d3-contour";
  import { geoPath, geoAlbers, geoCircle, geoTransform } from "d3-geo";
  import { afterUpdate } from "svelte";

  export let data;
  let smoke;
  let width = 0;
  let height = 0;

  let canvas;
  let pathCanvas;
  let startPoint = null;

  $: counties = $borders?.counties;
  $: states = $borders?.states;

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

  $: data.then(function (d) {
    smoke = d;
  });

  $: {
    // Redraw the map whenever the smoke data or the projection change.
    // Other changes that should trigger a redraw are handled by
    // afterUpdate, because they should affect DOM.
    smoke;
    projection;
    draw();
  }

  afterUpdate(draw);

  function drawPath(context, color, width, radius, p, path) {
    const c = geoCircle().radius(radius);

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;

    context.beginPath();
    p(path);
    context.stroke();

    context.beginPath();
    c.center(path.coordinates[0]);
    p(c());
    c.center(path.coordinates[1]);
    p(c());
    context.fill();
  }

  function draw() {
    if (!(canvas && projection)) return;

    const context = canvas.getContext("2d");

    context.clearRect(0, 0, width, height);

    // Use a geoTransform here instead of our geoAlbers projection because
    // there is something wrong with the GeoJSON coming from the backend that
    // causes D3 to just draw a polygon over the entire earth for all layers in
    // the contour plot. I have a suspicion that geoTransform doesn't perform
    // any clipping the way the projections do, and that whatever is unusual
    // about the GoeJSON is throwing off the clipping calculations, which is
    // why geoTransform works and projections don't. d3.geoBounds reports
    // [[-180, -90], [180, 90]] for the smoke object, which is incorrect,
    // because the HRRR data extends only a little ways beyond CONUS, so the
    // bounds should be similar to the bounds of the state object:
    // [[-124.848974, 24.396307999999998],
    // [-66.88544399999999, 49.37948101090466]].
    const p = geoPath(
      geoTransform({
        point: function (x, y) {
          const [px, py] = projection([x, y]);
          this.stream.point(px, py);
        },
      }),
      context
    );

    const style = getComputedStyle(canvas);

    if (counties) {
      context.strokeStyle = style.getPropertyValue("--county-border-color");
      context.lineWidth = +style.getPropertyValue("--county-border-width");

      context.beginPath();
      p(counties);
      context.stroke();
    }

    if (states) {
      context.save();
      context.strokeStyle = style.getPropertyValue("--state-border-color");
      context.lineWidth = +style.getPropertyValue("--state-border-width");

      context.beginPath();
      p(states);
      context.stroke();
      context.restore();
    }

    if (smoke?.features) {
      context.save();
      context.globalAlpha = 0.2;
      smoke.features.forEach(function (feature) {
        context.fillStyle = feature.properties.fill;
        context.beginPath();
        p(feature);
        context.fill();
      });
      context.restore();
    }

    if (xsectionPath) {
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
        xsectionPath,
      );
      drawPath(
        context,
        style.getPropertyValue("--path-color"),
        +style.getPropertyValue("--path-width"),
        4 * degPerPx,
        p,
        xsectionPath,
      );
    }
  }

  function handleMouseMove(event) {
    if (!startPoint) return;

    const { left, top } = pathCanvas.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const coords = projection.invert([x, y]);
    const context = pathCanvas.getContext("2d");
    const p = geoPath(projection, context);
    const style = getComputedStyle(canvas);
    const path = {
      type: "LineString",
      coordinates: [
        startPoint,
        coords,
      ],
    };

    context.clearRect(0, 0, width, height);

    const degPerPx = Math.max(
      Math.abs(startPoint[0] - coords[0]) / width,
      Math.abs(startPoint[1] - coords[1]) / height
    );

    drawPath(
      context,
      style.getPropertyValue("background-color"),
      +style.getPropertyValue("--path-width") + 6,
      7 * degPerPx,
      p,
      path,
    );
    drawPath(
      context,
      style.getPropertyValue("--path-color"),
      +style.getPropertyValue("--path-width"),
      4 * degPerPx,
      p,
      path,
    );
  }

  function handleKeyUp(event) {
    if (event.key !== "Escape") return;
    startPoint = null;
    pathCanvas.removeEventListener("mousemove", handleMouseMove);
    pathCanvas.getContext("2d").clearRect(0, 0, width, height);
  }

  function handleClick(event) {
    const { left, top } = pathCanvas.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const coords = projection.invert([x, y]);

    if (!startPoint) {
      startPoint = coords;
      pathCanvas.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("keyup", handleKeyUp);
      return;
    }

    pathCanvas.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("keyup", handleKeyUp);
    pathCanvas.getContext("2d").clearRect(0, 0, width, height);

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
      class="hrrr-map"
      width={width}
      height={height}
    ></canvas>
    <canvas
      bind:this={pathCanvas}
      on:click={handleClick}
      {width}
      {height}
    ></canvas>
  </Loading>
</div>

<style lang="scss">
  @use "uswds";

  .container {
    aspect-ratio: 1/1;
    width: 100%;
    overflow: hidden;
    cursor: crosshair;
  }

  .hrrr-map {
    --county-border-color: #{uswds.color("base-light")};
    --county-border-width: 1;
    --state-border-color: #{uswds.color("base")};
    --state-border-width: 1;
    --path-color: #{uswds.color("ink")};
    --path-width: 2;

    background-color: var(--bg-color);
  }
</style>
