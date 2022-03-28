<script>
  import { FormGroup } from "./uswds";

  export let id;
  export let label;
  export let err;
  export let lat;
  export let lng;

  $: errId = `${id}-error-message`;
  $: attrs = err ? { "aria-describedby": errId } : {};
</script>

<fieldset {id} class="coordinate-input" {...attrs} >
  <legend>{label}</legend>

  {#if err}
    <p id={errId} class="usa-error-message">{err}</p>
  {/if}
  <FormGroup id="{id}-longitude" label="Longitude" labelClass="uppercase">
    <input id="{id}-longitude" class="usa-input" type="number" bind:value={lng}>
  </FormGroup>

  <FormGroup id="{id}-latitude" label="Latitude" labelClass="uppercase">
    <input id="{id}-latitude" class="usa-input" type="number" bind:value={lat}>
  </FormGroup>
</fieldset>


<style type="text/scss">
  @use "uswds";

  .coordinate-input {
    display: flex;
    flex-wrap: wrap;
    gap: uswds.units(2);
  }

  .usa-error-message {
    flex: 100% 0 0;
    color: uswds.color("error-light");
  }

  :global(.coordinate-input > *) {
    flex: 1 0 6ch;
    min-width: 6ch;
  }

  legend {
    flex: 0 0 100%;
  }
</style>
