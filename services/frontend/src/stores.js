/** @module stores */
import { scaleThreshold } from "d3-scale";
import { interpolateOrRd } from "d3-scale-chromatic";
import { derived, readable, writable } from "svelte/store";
import * as api from "./api.js";

/**
 * Forecast initialization time in ISO 8601 format.
 * @type {?string}
 */
export const runHour = writable(null);

/**
 * Offset in hours from the initialization time of the forecast.
 * @type {number}
 */
export const validTime = writable(0);

/**
 * Thresholds for the smoke concentration contour levels.
 * @type {Array[number]}
 */
export const thresholds = readable(
  [0, 1, 4, 7, 11, 15, 20, 25, 30, 40, 50, 75, 150, 250, 500]
);

export const smokeScale = derived(
  thresholds,
  ($thresholds, set) => {
    const colors = $thresholds.map((_, idx, arr) => {
      return interpolateOrRd(idx / (arr.length - 1));
    });

    set(scaleThreshold($thresholds, colors));
  }
);

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

export const verticallyIntegrated = derived(
  [runHour, validTime],
  ([$runHour, $validTime], set) => {
    if ($runHour === null || $validTime === null) return;

    api.vertical($runHour, $validTime).then((data) => set(data));
  }
);

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
