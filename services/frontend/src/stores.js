import { writable } from "svelte/store";

export const forecast = writable(null);

export const path = writable({
  startLat: null,
  startLng: null,
  endLat: null,
  endLng: null,
});

export const xsection = writable(
  {
    "massden": [],
    "potentialTemperature": [],
    "rows": 0,
    "columns": 0,
  }
);
