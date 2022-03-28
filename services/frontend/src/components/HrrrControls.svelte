<script>
  import { onMount } from "svelte";

  import * as api from "../api.js";
  import { runHour, validTime, path } from "../stores.js";
  import { readableDate, addTime } from "../utils.js";
  import CoordinateInput from "./CoordinateInput.svelte";
  import { Dropdown } from "./uswds";

  export let start = { "lat": null, "lng": null };
  export let end = { "lat": null, "lng": null };

  let startError = "";
  let endError = "";
  let forecasts = [];

  $: forecastHours = forecasts.find(({ value }) => value === $runHour)?.validTimes;

  onMount(async function () {
    forecasts = await api.forecasts()
      .then((dates) => dates.sort((a, b) => {
          // Sort in reverse chronological order so that recent forecast runs
          // are at the top of the dropdown.
          if (a.runHour < b.runHour) return 1;
          return -1;
        }).map((forecast) => {
          let runHour = new Date(forecast.runHour);
          return {
            value: forecast.runHour,
            text: readableDate(runHour),
            date: runHour,
            validTimes: forecast.validTimes.map((forecastOffset) => {
              const forecastHour = addTime(runHour, forecastOffset);

              return {
                value: forecastOffset,
                text: `${readableDate(forecastHour)} (+${forecastOffset})`,
              };
            }),
          };
        }));
    if (!$runHour) {
      runHour.set(forecasts[0].value);
    }
  });

  function update() {
    startError = (start.lat && start.lng) ? "" : "Start coordinate is required";
    endError = (end.lat && end.lng) ? "" : "End coordinate is required";

    if (startError || endError) return;

    path.set({
      startLat: parseFloat(start.lat),
      startLng: parseFloat(start.lng),
      endLat: parseFloat(end.lat),
      endLng: parseFloat(end.lng),
    });
  }

  function reset() {
    startError = "";
    endError = "";
    path.set(null);
  }
</script>

<section class="hrrr-controls flow" aria-label="Controls">
  <h2>Forecast</h2>
  <Dropdown id="run-hour" label="Run Hour" options={forecasts} bind:selected={$runHour} />
  <Dropdown id="forecast-hour" label="Forecast Hour" options={forecastHours} bind:selected={$validTime} />

  <h2>Cross-section Path</h2>
  <p><small>Click anywhere on the map to define a path, or enter the coordinates here.</small></p>
  <CoordinateInput id="start" label="Start" coordinate={start} err={startError} />
  <CoordinateInput id="end" label="End" coordinate={end} err={endError} />
  <div class="switcher">
    <button class="usa-button usa-button--outline usa-button--inverse" disabled={$path === null} on:click={reset}>Clear Path</button>
    <button class="usa-button" on:click={update}>Get Cross-section</button>
  </div>
</section>
