<script>
  export let showCounties;
</script>

<form method="get">
  <div>
    <input type="checkbox" name="showCounties" id="showCounties" bind:checked={showCounties}>
    <label for="showCounties">Show Counties</label>
  </div>
</form>
