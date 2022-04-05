/** @module stores */
import { scaleThreshold } from "d3-scale";
import { interpolateMagma } from "d3-scale-chromatic";
import { derived, readable, writable } from "svelte/store";
import { mesh } from "topojson-client";
import * as api from "./api.js";

let _borders;

/**
 * US state and county borders as GeoJSON.
 */
export const borders = readable(null, function (set) {
  if (_borders) {
    set(_borders);
    return;
  }

  api.borders().then(function (borders) {
    _borders = {
      counties: mesh(borders, borders.objects.counties),
      states: mesh(borders, borders.objects.states),
    };

    set(_borders);
  });
});

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
  [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 100, 200]
);

/**
 * D3 scaleThreshold for coloring smoke concentration.
 * @type {Function}
 */
export const smokeScale = derived(
  thresholds,
  ($thresholds, set) => {
    const colors = $thresholds.map((_, idx, arr) => {
      return interpolateMagma((idx + 1) / arr.length);
    });

    // Add one additional color because we need n+1 values in the output range
    // for a threshold scale.
    set(scaleThreshold($thresholds, [interpolateMagma(0), ...colors]));
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
