<script>
  export let scale;
  export let transform;
</script>

<g class="axis" {transform} text-anchor="middle">
  {#each scale.ticks() as tick}
    <g class="tick" transform="translate({scale(tick)}, 0)">
      <line y2="-8" />
      <text y="-12">{tick}</text>
    </g>
  {/each}
</g>
