import { forecast, path } from "./stores.js";
import App from "./App.svelte";

const params = new URLSearchParams(window.location.search);
let pth = {};

for (let [k, v] of params.entries()) {
  switch (k) {
    case "forecast":
      forecast.set(v);
      break;
    case "startLat":
    case "startLng":
    case "endLat":
    case "endLng":
      pth[k] = +v;
      break;
    default:
      console.warn(`Unknown URL parameter: ${k}`);
      break;
  }
}

if (Object.keys(pth).length > 0) {
  path.set(pth);
}

const app = new App({
  target: document.body,
});

export default app;
