require("svelte/register")({
  hydratable: true,
});

const fs = require("fs/promises");

const App = require(`${__dirname}/../src/App.svelte`).default;
const { head, html, css } = App.render();

const buildDir = `${__dirname}/../public`;

fs.mkdir(buildDir, { recursive: true }).then(function () {
  return fs.readFile(`${__dirname}/../src/app.html`, "utf-8")
    .then(function (data) {
      return data
        .replace("<!--svelte.head-->", head)
        .replace("<!--svelte.body-->", html);
    })
    .then(function (data) {
      return fs.writeFile(`${buildDir}/index.html`, data);
    });
});
