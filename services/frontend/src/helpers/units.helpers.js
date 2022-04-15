const standardSeaLevelPressure = 1013.25;
const metersPerKilometer = 1000;

/**
 * Return the pressure in mb for `height`
 *
 * @param {Number} height Height in kilometers
 * @returns {Number} pressure in millibars
 */
export function heightToPressure(height) {
  // Coefficients
  const a = 0.0000225577;
  const b = 5.2559;

  const heightInMeters = height * metersPerKilometer;
  const pressureInMb = standardSeaLevelPressure * Math.pow(1 - a * heightInMeters, b);

  return pressureInMb;
}

/**
 * Return the height in km above sea level for `pressure`
 *
 * @param {Number} pressure isobaric pressure in millibars (mb)
 * @returns {Number} height above sea level in km
 */
export function pressureToHeight(pressure) {

  // Coefficients
  const a = 44330.7606715224;
  const b = 1 / 5.2559;

  const heightInMeters = a * (1 - Math.pow(pressure / standardSeaLevelPressure, b));

  return heightInMeters / metersPerKilometer;
}
