// __HRRR_XSECTION_API__ gets replaced during the build with the URL for
// fetching cross-sections.
const HRRR_XSECTION_API = __HRRR_XSECTION_API__;

export function forecasts() {
  return fetch(`${HRRR_XSECTION_API}/forecasts/`)
    .then((response) => response.json());
}

export function xsection(forecast, path) {
  const query = new URLSearchParams({ forecast, ...path });

  return fetch(`${HRRR_XSECTION_API}/xsection/?${query.toString()}`)
    .then((response) => response.json());
}
