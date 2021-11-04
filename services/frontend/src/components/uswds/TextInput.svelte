<script>
  export let value = "";
  export let id;
  export let label;
</script>

<div class="usa-form-group">
  <label for="{id}" class="usa-label">{label}</label>
  <input {id} bind:value={value} class="usa-input">
</div>
