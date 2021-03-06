import { color } from "d3-color";

// __HRRR_XSECTION_API__ gets replaced during the build with the URL for
// fetching cross-sections.
const HRRR_XSECTION_API = __HRRR_XSECTION_API__;

export function borders() {
  return fetch('/data/us.json')
    .then((response) => response.json());
}

export function forecasts() {
  return fetch(`${HRRR_XSECTION_API}/forecasts/`)
    .then((response) => response.json());
}

export function vertical(runHour, validTime, thresholds, colors) {

  const query = new URLSearchParams({
    runHour,
    validTime,
    levels: thresholds.join(","),
    colors: colors.map((rgba) => color(rgba).formatHex()).join(",")
  });

  return fetch(`${HRRR_XSECTION_API}/vertical/?${query.toString()}`)
    .then((response) => response.json());
}

export function xsection(forecast) {
  const query = new URLSearchParams(forecast);

  return fetch(`${HRRR_XSECTION_API}/xsection/?${query.toString()}`)
    .then((response) => response.json());
}
