<script>
  import { path } from "../stores.js";
  import CoordinateInput from "./CoordinateInput.svelte";

  let start = { "lat": null, "lng": null };
  let end = { "lat": null, "lng": null };

  function update() {
    path.set({
      startLat: parseFloat(start.lat),
      startLng: parseFloat(start.lng),
      endLat: parseFloat(end.lat),
      endLng: parseFloat(end.lng),
    });
  }
</script>

<section class="hrrr-controls" aria-label="Controls">
  <CoordinateInput id="start" label="Start" coordinate={start} />
  <CoordinateInput id="end" label="End" coordinate={end} />
  <button class="usa-button" on:click={update}>Update</button>
</section>
