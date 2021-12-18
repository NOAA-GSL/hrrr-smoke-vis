import { forecast } from "./stores.js";
import App from "./App.svelte";

const params = new URLSearchParams(window.location.search);
let fcst = {};

for (let [k, v] of params.entries()) {
  switch (k) {
    case "forecast":
      fcst.forecast = v;
      break;
    case "startLat":
    case "startLng":
    case "endLat":
    case "endLng":
      fcst[k] = +v;
      break;
    default:
      console.warn(`Unknown URL parameter: ${k}`);
      break;
  }
}

if (Object.keys(fcst).length > 0) {
  forecast.set(fcst);
}

const app = new App({
  target: document.body,
});

export default app;
