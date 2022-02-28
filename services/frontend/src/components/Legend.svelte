<script>
  import { extent } from "d3-array";
  import { smokeScale, thresholds } from "../stores.js";

  let width = 0;
  let height = 0;

  $: swatchHeight = height / ($thresholds.length - 1);
  $: ticks = $thresholds.map((t, idx, arr) => [t, arr[idx + 1]]);
</script>
<div class="legend" bind:offsetWidth={width} bind:offsetHeight={height}>
  <svg viewBox="0 0 {width} {height}" {width} {height}>
    <g>
      {#each ticks as tick, idx}
        <rect class="swatch"
              y={height - (idx + 1) * swatchHeight}
              width={width/2} height={swatchHeight}
              fill={$smokeScale(tick[0])} />
      {/each}
    </g>
    <g transform="translate({width/2}, 0)">
      {#each $thresholds as tick, idx}
        <text class="tick-label" x=8 y={height - idx * swatchHeight}>{tick}</text>
      {/each}
    </g>
  </svg>
</div>
<style>
  .legend {
    padding: 0;
  }

  .swatch {
    stroke: white;
    stroke-width: 1px;
  }

  text {
    dominant-baseline: middle;
    fill: currentColor;
  }
</style>
