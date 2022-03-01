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
 * @type {number[]}
 */
export const thresholds = readable(
  [0, 1, 4, 7, 11, 15, 20, 25, 30, 40, 50, 75, 150, 250, 500]
);

/**
 * D3 scaleThreshold for coloring smoke concentration.
 * @type {Function}
 */
export const smokeScale = derived(
  thresholds,
  ($thresholds, set) => {
    const colors = $thresholds.map((_, idx, arr) => {
      return interpolateOrRd((idx + 1) / arr.length);
    });

    // Add one additional color because we need n+1 values in the output range
    // for a threshold scale.
    set(scaleThreshold($thresholds, [interpolateOrRd(0), ...colors]));
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
