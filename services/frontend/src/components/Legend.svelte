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
    {#each ticks as tick, idx}
      {#if isFinite(tick[1])}
        <rect class="swatch"
              y={height - (idx + 1) * swatchHeight}
              {width} height={swatchHeight}
              fill={$smokeScale(tick[0])} />
      {/if}
    {/each}
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
</style>
