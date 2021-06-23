const debug = require("debug")("HRRRSmoke");
const express = require("express");

const path = require("path");

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.get("/favicon.ico", function (req, res) {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

app.get("/", function (req, res) {
  res.send("Hello");
});

app.listen(port, function () {
  debug(`Listening at http://localhost:${port}`);
});
