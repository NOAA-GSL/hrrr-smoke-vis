const debug = require("debug")("HRRRSmoke");
const express = require("express");
const nunjucks = require("nunjucks");

const path = require("path");

const app = express();
const port = process.env.HTTP_PORT || 3000;

// Set up Nunjucks for express. Only watch files in development.
nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV === "development",
});

app.set("view engine", "njk");

// Serve static files in development.
if (process.env.NODE_ENV === "development") {
  app.use("/css", express.static(path.join(__dirname, "static", "css")));
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
  res.render("index");
});

// Run the app. The URL is logged using debug to the HRRRSmoke namespace.
app.listen(port, function () {
  debug(`Listening at http://localhost:${port}`);
});
