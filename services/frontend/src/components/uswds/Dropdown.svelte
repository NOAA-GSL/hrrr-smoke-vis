<script>
  import FormGroup from "./FormGroup.svelte";

  export let options = [];
  export let id;
  export let label;
  export let selected;
</script>

<FormGroup id={id} label={label}>
  <select id={id} class="usa-select" name={id} bind:value={selected}>
    {#each options as opt}
      <option value={opt.value}>{opt.text}</option>
    {/each}
  </select>
</FormGroup>
