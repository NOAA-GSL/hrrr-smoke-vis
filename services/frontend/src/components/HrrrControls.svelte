<script>
  import { onMount } from "svelte";

  import * as api from "../api.js";
  import * as stores from "../stores.js";
  import CoordinateInput from "./CoordinateInput.svelte";
  import { Dropdown } from "./uswds";

  export let start = { "lat": null, "lng": null };
  export let end = { "lat": null, "lng": null };
  export let forecast = {};

  let forecasts = [];

  onMount(async function () {
    forecasts = await api.forecasts()
      .then((dates) => dates.map((dt) => {
        return {
          value: dt.forecast,
          text: dt.display,
        };
      }));
  });

  function update() {
    const path = {
      startLat: parseFloat(start.lat),
      startLng: parseFloat(start.lng),
      endLat: parseFloat(end.lat),
      endLng: parseFloat(end.lng),
    };

    stores.forecast.set(forecast);
    stores.path.set(path);
  }
</script>

<section class="hrrr-controls stack" aria-label="Controls">
  <h2>Forecast</h2>
  <Dropdown id="forecast-hour" label="Forecast Hour" options={forecasts} bind:selected={forecast} />

  <h2>Cross-section Path</h2>
  <CoordinateInput id="start" label="Start" coordinate={start} />
  <CoordinateInput id="end" label="End" coordinate={end} />
  <button class="usa-button" on:click={update}>Update</button>
</section>
