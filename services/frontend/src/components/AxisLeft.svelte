<script>
  export let scale;
</script>

{#each scale.ticks() as tick}
  <g class="tick" transform="translate(0, {scale(tick)})">
    <line x2="8" />
    <text x="12" dy="0.3em">{tick}</text>
  </g>
{/each}
