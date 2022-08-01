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
  [0, 1, 2, 4, 6, 8, 12, 16, 20, 25, 30, 40, 60, 100, 200]
);

/**
 * Thresholds for the column smoke concentration contour levels.
 * @type {number[]}
 */
export const upper_thresholds = readable(
  [0, 1, 4, 7, 11, 15, 20, 25, 30, 40, 50, 75, 150, 250, 500]
);

/**
 * Palette for the colors used in the imagery.
 * @type {string}
 */
export const palette = writable("Smoke");

/** 
 * smokecolors colors for orginal colormap used on HRRR
 * @type {string[]}
 */
export const smokecolors = [
   'rgba(252,254,255,0)',
   'rgba(202, 235, 251, 255)',  
   'rgba(150, 212, 243, 255)',  
   'rgba(106, 173, 220, 255)',  
   'rgba( 72, 147, 184, 255)',  
   'rgba( 73, 167, 116, 255)',  
   'rgba(106, 191,  74, 255)',  
   'rgba(197, 217,  85, 255)',  
   'rgba(249, 205,  81, 255)',  
   'rgba(246, 140,  55, 255)',  
   'rgba(236,  86,  41, 255)',  
   'rgba(218,  47,  40, 255)',  
   'rgba(190,  28,  35, 255)',  
   'rgba(158,  23,  28, 255)',  
   'rgba(140,  35,  204, 255)'  
];

/**
 * D3 scaleThreshold for coloring smoke concentration.
 * @type {Function}
 */
const hrrrScale = derived(
  thresholds,
  ($thresholds, set) => {
    const colors = $thresholds.map((_, idx, arr) => {
      return smokecolors[idx];
    });

    // Add one additional color because we need n+1 values in the output range
    // for a threshold scale.
    set(scaleThreshold($thresholds, [interpolateMagma(0), ...colors]));
  }
);


/**
 * D3 scaleThreshold for coloring smoke concentration.
 * @type {Function}
 */
const magmaScale = derived(
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

export const palettes = readable({
  "Smoke": hrrrScale,
  "Magma": magmaScale
});


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
