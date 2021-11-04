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

    if (!($startLat && $startLng && $endLat && $endLng)) {
      set({});
      return;
    }

    fetch(HRRR_XSECTION_API, {
      method: "POST",
      body: {
        startLat: $startLat,
        startLng: $startLng,
        endLat: $endLat,
        endLng: $endLng,
      },
    })
      .then((response) => response.json())
      .then((data) => set(data));
  }
);
