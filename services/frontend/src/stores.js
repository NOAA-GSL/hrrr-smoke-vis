import { derived, writable } from "svelte/store";
import * as api from "./api.js";

export const forecast = writable(null);

export const path = writable({
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
  [forecast, path],
  ([$forecast, $path], set) => {
    const ready =
      $forecast &&
      $path.startLat &&
      $path.startLng &&
      $path.endLat &&
      $path.endLng;

    if (!ready) {
      set(emptyXSection);
      return;
    }

    api.xsection($forecast, $path).then((data) => set(data));
  },
  emptyXSection
);
