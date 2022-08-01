<script>
  import { extent } from "d3-array";
  import { palette, palettes, thresholds } from "../stores.js";

  export let title;

  let colors = $palettes[$palette];


  let height = 0;
  $: if (palette) {
       colors = $palettes[$palette]
  }

  $: swatchHeight = height / $thresholds.length;
  $: ticks = $thresholds.map((t, idx, arr) => [t, arr[idx + 1]]);
</script>

<div class="legend">
  <span class="title">{title}</span>
  <div class="axis" bind:offsetHeight={height}>
    <svg viewBox="0 0 56 {height}" width="56" {height}>
      <g>
        {#each ticks as tick, idx}
          {#if idx + 1 < ticks.length}
            <rect class="swatch"
                  y={height - (idx + 1) * swatchHeight}
                  width="24" height={swatchHeight}
                  fill={$colors(tick[0])} />
          {:else}
            <path class="swatch"
                  d="M 12,0
                     l 12,20.8
                     l 0,{swatchHeight - 20.8}
                     l -24,0
                     l 0,{(swatchHeight - 20.8) * -1}
                     l 12,-20.8"
                  fill={$colors(tick[0])}></path>
            {/if}
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
    grid-template-rows: 100%;
    grid-template-areas: "axis title";

    height: 100%;
    overflow: hidden;
    padding-block: 0.5rem;
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
