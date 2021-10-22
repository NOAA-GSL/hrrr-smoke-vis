<script>
  import TextInput from "./uswds/TextInput.svelte";
</script>

<section class="hrrr-controls" aria-label="Controls">
  <fieldset class="usa-fieldset">
    <legend class="usa-legend">Start</legend>
    <TextInput id="start-latitude" label="Latitude" />
    <TextInput id="start-longitude" label="Longitude" />
  </fieldset>
  <fieldset class="usa-fieldset">
    <legend class="usa-legend">End</legend>
    <TextInput id="end-latitude" label="Latitude" />
    <TextInput id="end-longitude" label="Longitude" />
  </fieldset>
</section>
