import { derived, writable } from "svelte/store";

// __HRRR_XSECTION_API__ gets replaced during the build with the URL for
// fetching cross-sections.
const HRRR_XSECTION_API = __HRRR_XSECTION_API__;

export const path = writable({
  startLat: null,
  startLng: null,
  endLat: null,
  endLng: null,
});

export const xsection = derived(
  [path],
  ([$path], set) => {
    if (!($path.startLat && $path.startLng && $path.endLat && $path.endLng)) return;

    fetch(HRRR_XSECTION_API, {
      method: "POST",
      body: JSON.stringify($path),
    })
      .then((response) => response.json())
      .then((data) => set(data));
  },
  {}
);
