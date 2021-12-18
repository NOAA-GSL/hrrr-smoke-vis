import { derived, writable } from "svelte/store";
import * as api from "./api.js";

export const forecast = writable({
  forecast: null,
  startLat: null,
  startLng: null,
  endLat: null,
  endLng: null,
});

const emptyXSection = {
  massden: [],
  potentialTemperature: [],
  rows: 0,
  columns: 0,
};

export const xsection = derived(
  forecast,
  ($forecast, set) => {
    console.info("xsection store");
    const ready =
      $forecast.forecast &&
      $forecast.startLat &&
      $forecast.startLng &&
      $forecast.endLat &&
      $forecast.endLng;

    if (!ready) {
      set(emptyXSection);
      return;
    }

    api.xsection($forecast).then((data) => set(data));
  },
  emptyXSection
);
