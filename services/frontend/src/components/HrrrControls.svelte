<script>
  import { path } from "../stores.js";
  import { FormGroup } from "./uswds";

  let startLat = null;
  let startLng = null;
  let endLat = null;
  let endLng = null;

  function update() {
    path.set({
      startLat: parseFloat(startLat),
      startLng: parseFloat(startLng),
      endLat: parseFloat(endLat),
      endLng: parseFloat(endLng),
    });
  }
</script>

<section class="hrrr-controls" aria-label="Controls">
  <fieldset class="usa-fieldset">
    <legend class="usa-legend">Start</legend>
    <FormGroup id="start-latitude" label="Latitude">
      <input id="start-latitude" type="number" bind:value={startLat} class="usa-input">
    </FormGroup>
    <FormGroup id="start-longitude" label="Longitude">
      <input id="start-longitude" type="number" bind:value={startLng} class="usa-input">
    </FormGroup>
  </fieldset>

  <fieldset class="usa-fieldset">
    <legend class="usa-legend">End</legend>
    <FormGroup id="end-latitude" label="Latitude">
      <input id="end-latitude" type="number"bind:value={endLat} class="usa-input">
    </FormGroup>
    <FormGroup id="end-longitude" label="Longitude">
      <input id="end-longitude" type="number" bind:value={endLng} class="usa-input">
    </FormGroup>
  </fieldset>
  <button class="usa-button" on:click={update}>Update</button>
</section>
