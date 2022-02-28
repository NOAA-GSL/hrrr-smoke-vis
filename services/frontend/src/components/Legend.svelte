<script>
  import { extent } from "d3-array";
  import { scaleLinear } from "d3-scale";
  import { smokeScale, thresholds } from "../stores.js";

  let width = 0;
  let height = 0;

  $: y = scaleLinear().domain(extent($thresholds)).range([height, 0]);
  $: ticks = $thresholds.map((t, idx, arr) => [t, arr[idx + 1]]);
</script>
<div class="legend" bind:offsetWidth={width} bind:offsetHeight={height}>
  <svg viewBox="0 0 {width} {height}" {width} {height}>
    {#each ticks as tick}
      {#if isFinite(tick[1])}
        <rect class="swatch"
              y={y(tick[1])}
              {width} height={y(tick[0]) - y(tick[1])}
              fill={$smokeScale(tick[0])} />
      {/if}
    {/each}
  </svg>
</div>
<style>
  .swatch {
    stroke: white;
    stroke-width: 1px;
  }
</style>
