import { derived, writable } from "svelte/store";
import * as api from "./api.js";

export const runHour = writable(null);
export const validTime = writable(null);

export const path = writable(null);

const emptyXSection = {
  massden: [],
  rows: 0,
  columns: 0,
};

export const xsection = derived(
  [runHour, validTime, path],
  ([$runHour, $validTime, $path], set) => {
    const ready =
      $runHour &&
      $validTime !== null &&  // 0 is a possible validTime
      $path.startLat &&
      $path.startLng &&
      $path.endLat &&
      $path.endLng;

    if (!ready) {
      set(emptyXSection);
      return;
    }

    api.xsection({
      runHour: $runHour,
      validTime: $validTime,
      ...$path
    }).then((data) => set(data));
  },
  emptyXSection
);
