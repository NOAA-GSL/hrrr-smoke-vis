<script>
  export let scale;
  export let transform = "";
  export let orientation = "bottom";
  export let tickLength = 8;
  export let tickPadding = 4;

  $: isHorizontal = (["top", "bottom"].includes(orientation));
  $: tickEnd = (["top", "left"].includes(orientation))
    ? tickLength * -1
    : tickLength;
  $: labelPos = (["top", "left"].includes(orientation))
    ? (tickLength + tickPadding) * -1
    : (tickLength + tickPadding);

  function tickTransform(tick) {
    return isHorizontal
      ? `translate(${scale(tick)}, 0)`
      : `translate(0, ${scale(tick)})`;
  }
</script>

<g class="axis" {transform}>
  {#each scale.ticks() as tick}
    <g class="tick" transform="{tickTransform(tick)}">
      {#if isHorizontal}
        <line y2="{tickEnd}" />
        <text y="{labelPos}">{tick}</text>
      {:else}
        <line x2="{tickEnd}" />
        <text x="{labelPos}">{tick}</text>
      {/if}
    </g>
  {/each}
</g>

<style lang="scss">
  line {
    stroke: var(--text-1);
  }

  text {
    fill: var(--text-1);

    &[x] {
      dominant-baseline: middle;
    }

    &[y] {
      text-anchor: middle;
    }
  }
</style>
