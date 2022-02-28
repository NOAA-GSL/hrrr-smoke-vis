<script>
  import { runHour, validTime, path } from "./stores.js";
  import Footer from "./components/Footer.svelte";
  import Header from "./components/Header.svelte";
  import HrrrControls from "./components/HrrrControls.svelte";
  import HrrrMap from "./components/HrrrMap.svelte";
  import Legend from "./components/Legend.svelte";
  import XSection from "./components/XSection.svelte";

  let mapWidth = 0;
  let mapHeight = 0;

  $: start = {
    lat: $path?.startLat,
    lng: $path?.startLng,
  };

  $: end = {
    lat: $path?.endLat,
    lng: $path?.endLng,
  };

  $: {
    // Initialize the state from our stores
    let state = {
      runHour: $runHour,
      validTime: $validTime,
      ...$path
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
    const state = event.state || {};

    if (state.runHour) {
      runHour.set(state.runHour);
    }

    if (Number.isFinite(state.validTime)) {
      validTime.set(state.validTime);
    }

    let pth = {};
    let coordProps = [
      'startLat', 'startLng', 'endLat', 'endLng',
    ];

    for (let coord of coordProps) {
      if (Number.isFinite(state[coord])) {
        pth[coord] = state[coord];
      }
    }

    if (Object.keys(pth).length > 0) {
      path.set(pth);
    }
  }
</script>

<svelte:window on:popstate={handlePopState} />

<Header />
<HrrrControls {start} {end} />
{#if $path}
  <XSection />
{:else}
  <div class="main" bind:offsetWidth={mapWidth} bind:offsetHeight={mapHeight}>
    <HrrrMap width={mapWidth} height={mapHeight} />
  </div>
{/if}
  <Legend title="Smoke Concentration (µg / m³)"/>
<Footer />
