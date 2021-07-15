require("svelte/register")({
  hydratable: true,
});

const App = require("./App.svelte").default;

const debug = require("debug")("HRRRSmoke");
const express = require("express");

const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.HTTP_PORT || 3000;

// Serve static files in development.
if (process.env.NODE_ENV === "development") {
  app.use("/css", express.static(path.join(__dirname, "static", "css")));
  app.use("/fonts", express.static(path.join(__dirname, "static", "fonts")));
  app.use("/img", express.static(path.join(__dirname, "static", "img")));
  app.use("/js", express.static(path.join(__dirname, "static", "js")));
}

// Nothing fancy, just a favicon.
app.get("/favicon.ico", function (req, res) {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

// Route for the service worker, which must be served from the same host.
app.get("/serviceworker.js", function (req, res) {
  res.sendFile(path.join(__dirname, "serviceworker.js"));
});

// Make this a progressive web app (PWA) with a manifest.
app.get("/manifest.json", function (req, res) {
  res.sendFile(path.join(__dirname, "manifest.json"));
});

// Application landing page
app.get("/", function (req, res) {
  const {head, html, css} = App.render();

  const page = fs.readFileSync(path.join(__dirname, "index.html"), 'utf-8')
    .replace("%svelte.head%", head)
    .replace("%svelte.body%", html);

  res.send(page);
});

// Run the app. The URL is logged using debug to the HRRRSmoke namespace.
app.listen(port, function () {
  debug(`Listening at http://localhost:${port}`);
});
