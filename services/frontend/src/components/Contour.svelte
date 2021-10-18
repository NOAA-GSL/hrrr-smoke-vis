<script>
  export let path;
  export let stroke = () => "none";
  export let strokeWeight = () => 0;
  export let fill = () => "none";
  export let contours = [];
</script>

{#each contours as contour}
  <path d={path(contour)}
        fill={fill(contour.value)}
        stroke={stroke(contour.value)}
        stroke-weight={strokeWeight(contour.value)}>
  </path>
{/each}
