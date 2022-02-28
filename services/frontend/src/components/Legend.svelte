<script>
  import { extent } from "d3-array";
  import { smokeScale, thresholds } from "../stores.js";

  export let title;

  let height = 0;

  $: swatchHeight = height / $thresholds.length;
  $: ticks = $thresholds.map((t, idx, arr) => [t, arr[idx + 1]]);
</script>

<div class="legend">
  <span class="title">{title}</span>
  <div class="axis" bind:offsetHeight={height}>
    <svg viewBox="0 0 56 {height}" width="56" {height}>
      <g>
        {#each ticks as tick, idx}
          <rect class="swatch"
                y={height - (idx + 1) * swatchHeight}
                width="24" height={swatchHeight}
                fill={$smokeScale(tick[0])} />
        {/each}
      </g>
      <g transform="translate(32, 0)">
        {#each $thresholds as tick, idx}
          <text class="tick-label" y={height - idx * swatchHeight}>{tick}</text>
        {/each}
      </g>
    </svg>
  </div>
</div>

<style>
  svg {
    overflow: visible;
  }

  .legend {
    padding: 0;
    display: grid;
    grid-template-columns: min-content min-content;
    grid-template-areas: "axis title";
  }

  .axis {
    grid-area: axis;
  }

  .swatch {
    stroke: white;
    stroke-width: 1px;
  }

  .title {
    grid-area: title;
    writing-mode: vertical-lr;
    text-orientation: sideways;
    align-self: center;
  }

  .tick-label {
    dominant-baseline: middle;
    fill: currentColor;
  }
</style>
