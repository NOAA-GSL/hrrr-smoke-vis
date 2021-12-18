<script>
  import { forecast, path } from "./stores.js";
  import Header from "./components/Header.svelte";
  import HrrrControls from "./components/HrrrControls.svelte";
  import XSection from "./components/XSection.svelte";

  $: start = {
    lat: $path.startLat,
    lng: $path.startLng,
  };

  $: end = {
    lat: $path.endLat,
    lng: $path.endLng,
  };

  $: {
    // Initialize the state from our stores
    let state = {
      forecast: $forecast,
      startLat: $path.startLat,
      startLng: $path.startLng,
      endLat: $path.endLat,
      endLng: $path.endLng,
    };

    // Filter out any null state so we don't include those params in the URL
    state = Object.keys(state).reduce(function (o, key) {
      if (state[key] !== null) o[key] = state[key];
      return o;
    }, {});

    // If the new state differs from the current state, update the browser
    // history.
    const currentState = new URLSearchParams(window.location.search);
    const params = new URLSearchParams(state);
    const keys = new Set([...params.keys(), ...currentState.keys()]);

    const stateDiffers = Array.from(keys).some(function (k) {
      return params.get(k) !== currentState.get(k);
    });

    if (stateDiffers) {
      let url = new URL(window.location.href);

      url.search = params.toString();

      console.info(`Navigating to ${url.toString()}`);

      history.pushState(state, "", url.toString());
    }
  };

  function handlePopState(event) {
    const state = event.state;

    forecast.set(state.forecast || null);
    path.set({
      startLat: state.startLat || null,
      startLng: state.startLng || null,
      endLat: state.endLat || null,
      endLng: state.endLng || null,
    });
  }
</script>

<svelte:window on:popstate={handlePopState} />

<Header />
<HrrrControls forecast={$forecast} {start} {end} />
<XSection />
