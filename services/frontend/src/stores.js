/** @module stores */
import { derived, writable } from "svelte/store";
import * as api from "./api.js";

/**
 * Forecast initialization time in ISO 8601 format.
 * @type {?string}
 */
export const runHour = writable(null);

/**
 * Offset in hours from the initialization time of the forecast.
 * @type {?number}
 */
export const validTime = writable(null);

/**
 * Definition of the path across which the cross-section is calculated.
 *
 * @type {?Object}
 * @property {number} startLat - Starting latitude of the path
 * @property {number} startLng - Starting longitude of the path
 * @property {number} endLat   - Ending latitude of the path
 * @property {number} endLng   - Ending longitude of the path
 */
export const path = writable(null);

const emptyXSection = {
  massden: [],
  rows: 0,
  columns: 0,
};

/**
 * Cross-section of smoke density
 *
 * @type {Object}
 * @property {Array.number} massden - 1D array of smoke density in micrograms / meter
 * @property {number}       rows    - Number of rows in the dataset
 * @property {number}       columns - Number of columns in the dataset
 */
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
