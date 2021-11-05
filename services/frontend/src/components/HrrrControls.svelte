<script>
  import { path } from "../stores.js";
  import TextInput from "./uswds/TextInput.svelte";

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
    <TextInput id="start-latitude" label="Latitude" bind:value={startLat} />
    <TextInput id="start-longitude" label="Longitude" bind:value={startLng} />
  </fieldset>
  <fieldset class="usa-fieldset">
    <legend class="usa-legend">End</legend>
    <TextInput id="end-latitude" label="Latitude" bind:value={endLat} />
    <TextInput id="end-longitude" label="Longitude" bind:value={endLng} />
  </fieldset>
  <button class="usa-button" on:click={update}>Update</button>
</section>
