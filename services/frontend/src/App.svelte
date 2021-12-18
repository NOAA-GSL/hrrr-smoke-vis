<script>
  import { onMount } from "svelte";
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

  onMount(function () {
    const params = new URLSearchParams(window.location.search);
    let pth = {};

    for (let [k, v] of params.entries()) {
      switch (k) {
        case "forecast":
          forecast.set(v);
          break;
        case "startLat":
        case "startLng":
        case "endLat":
        case "endLng":
          pth[k] = v;
          break;
        default:
          console.warn(`Unknown URL parameter: ${k}`);
          break;
      }
    }

    if (Object.keys(pth).length > 0) {
      path.set(pth);
    }
  });
</script>

<Header />
<HrrrControls forecast={$forecast} {start} {end} />
<XSection />
