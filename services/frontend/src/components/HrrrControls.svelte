<script>
  import { onMount } from "svelte";

  import { path, HRRR_XSECTION_API } from "../stores.js";
  import CoordinateInput from "./CoordinateInput.svelte";
  import { Dropdown } from "./uswds";

  let start = { "lat": null, "lng": null };
  let end = { "lat": null, "lng": null };

  let forecasts = {};
  $: runTimes = Object.keys(forecasts).map(function (k) {
    return { value: k, text: k };
  });

  let run = "";
  $: forecastHours = (forecasts[run] || []).map(function (f) {
    return { value: f.forecast, text: `${f.forecastHour} (${f.validTime})` };
  });

  let forecast;

  onMount(async function () {
    forecasts = await fetch(`${HRRR_XSECTION_API}/forecasts/`)
      .then((response) => response.json());
  });

  function update() {
    path.set({
      startLat: parseFloat(start.lat),
      startLng: parseFloat(start.lng),
      endLat: parseFloat(end.lat),
      endLng: parseFloat(end.lng),
    });
  }
</script>

<section class="hrrr-controls stack" aria-label="Controls">
  <h2>Forecast</h2>
  <Dropdown id="run-time" label="Run Time" options={runTimes} bind:selected={run} />
  <Dropdown id="forecast-hour" label="Forecast Hour" options={forecastHours} bind:selected={forecast} />

  <h2>Cross-section Path</h2>
  <CoordinateInput id="start" label="Start" coordinate={start} />
  <CoordinateInput id="end" label="End" coordinate={end} />
  <button class="usa-button" on:click={update}>Update</button>
</section>
