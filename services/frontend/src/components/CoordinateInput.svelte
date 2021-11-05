<script>
  import { FormGroup } from "./uswds";

  export let id;
  export let label;
  export let coordinate = { "lat": null, "lng": null };
</script>

<fieldset {id} class="usa-fieldset">
  <legend class="usa-legend">{label}</legend>

  <FormGroup id="{id}-longitude" label="Longitude">
    <input id="{id}-longitude" type="number" bind:value={coordinate.lng} class="usa-input">
  </FormGroup>

  <FormGroup id="{id}-latitude" label="Latitude">
    <input id="{id}-latitude" type="number" bind:value={coordinate.lat} class="usa-input">
  </FormGroup>
</fieldset>
