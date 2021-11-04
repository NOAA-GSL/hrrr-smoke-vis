<script>
  import { startLat, startLng, endLat, endLng } from "../stores.js";
  import TextInput from "./uswds/TextInput.svelte";
</script>

<section class="hrrr-controls" aria-label="Controls">
  <fieldset class="usa-fieldset">
    <legend class="usa-legend">Start</legend>
    <TextInput id="start-latitude" label="Latitude" bind:value={$startLat} />
    <TextInput id="start-longitude" label="Longitude" bind:value={$startLng} />
  </fieldset>
  <fieldset class="usa-fieldset">
    <legend class="usa-legend">End</legend>
    <TextInput id="end-latitude" label="Latitude" bind:value={$endLat} />
    <TextInput id="end-longitude" label="Longitude" bind:value={$endLng} />
  </fieldset>
</section>
