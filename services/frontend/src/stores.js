import { derived, writable } from "svelte/store";

// __HRRR_XSECTION_API__ gets replaced during the build with the URL for
// fetching cross-sections.
const HRRR_XSECTION_API = __HRRR_XSECTION_API__;

export const startLat = writable(null);
export const startLng = writable(null);
export const endLat = writable(null);
export const endLng = writable(null);

export const xsection = derived(
  [startLat, startLng, endLat, endLng],
  ([$startLat, $startLng, $endLat, $endLng], set) => {
    console.info({ $startLat, $startLng, $endLat, $endLng });

    if (!($startLat && $startLng && $endLat && $endLng)) return;

    fetch(HRRR_XSECTION_API, {
      method: "POST",
      body: JSON.stringify({
        startLat: parseFloat($startLat),
        startLng: parseFloat($startLng),
        endLat: parseFloat($endLat),
        endLng: parseFloat($endLng),
      }),
    })
      .then((response) => response.json())
      .then((data) => set(data));
  },
  {}
);
