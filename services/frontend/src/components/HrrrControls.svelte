<script>
  import { onMount } from "svelte";

  import * as api from "../api.js";
  import { forecast } from "../stores.js";
  import { readableDate, addTime } from "../utils.js";
  import CoordinateInput from "./CoordinateInput.svelte";
  import { Dropdown } from "./uswds";

  export let start = { "lat": null, "lng": null };
  export let end = { "lat": null, "lng": null };
  export let validTime = {};

  let forecasts = [];
  let forecastIdx;
  let forecastHour;

  $: forecastHours = forecasts[forecastIdx]?.validTimes.map((validTime) => {
    const forecast = forecasts[forecastIdx];
    const forecastHour = addTime(forecast.date, validTime);

    return {
      value: validTime,
      text: `${readableDate(forecastHour)} (+${validTime})`,
    };
  });

  onMount(async function () {
    forecasts = await api.forecasts()
      .then((dates) => dates.map((forecast, idx) => {
        let runHour = new Date(forecast.runHour);
        return {
          value: idx,
          text: readableDate(runHour),
          date: runHour,
          dateStr: forecast.runHour,
          validTimes: forecast.validTimes,
        };
      }));
  });

  function update() {
    forecast.set({
      runHour: forecasts[forecastIdx].dateStr,
      validTime: forecastHour,
      startLat: parseFloat(start.lat),
      startLng: parseFloat(start.lng),
      endLat: parseFloat(end.lat),
      endLng: parseFloat(end.lng),
    });
  }
</script>

<section class="hrrr-controls stack" aria-label="Controls">
  <h2>Forecast</h2>
  <Dropdown id="run-hour" label="Run Hour" options={forecasts} bind:selected={forecastIdx} />
  <Dropdown id="forecast-hour" label="Forecast Hour" options={forecastHours} bind:selected={forecastHour} />

  <h2>Cross-section Path</h2>
  <CoordinateInput id="start" label="Start" coordinate={start} />
  <CoordinateInput id="end" label="End" coordinate={end} />
  <button class="usa-button" on:click={update}>Update</button>
</section>
