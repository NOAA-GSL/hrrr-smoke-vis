const debug = require("debug")("HRRRSmoke");
const express = require("express");
const nunjucks = require("nunjucks");

const path = require("path");

const app = express();
const port = process.env.HTTP_PORT || 3000;

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV === "development",
});

app.set("view engine", "njk");

if (process.env.NODE_ENV === "development") {
  app.use("/css", express.static(path.join(__dirname, "static", "css")));
  app.use("/img", express.static(path.join(__dirname, "static", "img")));
  app.use("/js", express.static(path.join(__dirname, "static", "js")));
}

app.get("/favicon.ico", function (req, res) {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

app.get("/", function (req, res) {
  res.render("index");
});

app.listen(port, function () {
  debug(`Listening at http://localhost:${port}`);
});
