import { runHour, validTime, palette, path } from "./stores.js";
import App from "./App.svelte";

const params = new URLSearchParams(window.location.search);
let initPath = {};

for (let [k, v] of params.entries()) {
  switch (k) {
    case "runHour":
      runHour.set(v);
      break;
    case "validTime":
      validTime.set(+v);
      break;
    case "palette":
      palette.set(v);
      break;
    case "startLat":
    case "startLng":
    case "endLat":
    case "endLng":
      initPath[k] = +v;
      break;
    default:
      console.warn(`Unknown URL parameter: ${k}`);
      break;
  }
}

if (Object.keys(initPath).length > 0) {
  path.set(initPath);
}

const app = new App({
  target: document.body,
});

export default app;
