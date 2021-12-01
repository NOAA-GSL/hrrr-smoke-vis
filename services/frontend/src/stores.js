import { derived, writable } from "svelte/store";

// __HRRR_XSECTION_API__ gets replaced during the build with the URL for
// fetching cross-sections.
export const HRRR_XSECTION_API = __HRRR_XSECTION_API__;

export const forecast = writable("");

export const path = writable({
  startLat: null,
  startLng: null,
  endLat: null,
  endLng: null,
});

export const xsection = derived(
  [forecast, path],
  ([$forecast, $path], set) => {
    if (!$forecast) return;
    if (!($path.startLat && $path.startLng && $path.endLat && $path.endLng)) return;

    const query = new URLSearchParams({forecast: $forecast, ...$path});
    fetch(`${HRRR_XSECTION_API}/xsection/?${query.toString()}`)
      .then((response) => response.json())
      .then((data) => set(data));
  },
  {
    "massden": [],
    "potentialTemperature": [],
    "rows": 0,
    "columns": 0,
  }
);
