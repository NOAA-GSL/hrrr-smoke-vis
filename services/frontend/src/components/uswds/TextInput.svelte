<script>
  import FormGroup from "./FormGroup.svelte";

  export let value;
  export let id;
  export let label;
</script>

<FormGroup {id} {label}>
  <input {id} {value} class="usa-input">
</FormGroup>
