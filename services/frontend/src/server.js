const debug = require("debug")("HRRRSmoke");
const express = require("express");

const app = express();
const port = process.env.HTTP_PORT || 3000;

app.get("/", function (req, res) {
  res.send("Hello");
});

app.listen(port, function () {
  debug(`Listening at http://localhost:${port}`);
});
