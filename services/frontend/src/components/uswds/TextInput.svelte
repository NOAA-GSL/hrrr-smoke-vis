<script>
  export let type = "text";
  export let value = "";
  export let id;
  export let label;
</script>

<div class="usa-form-group">
  <label for="{id}" class="usa-label">{label}</label>
  <input {id} {type} {value} class="usa-input">
</div>
