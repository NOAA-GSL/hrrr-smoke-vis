import css from "rollup-plugin-css-only";
import livereload from "rollup-plugin-livereload";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;

      server = require("child_process").spawn(
        "npm",
        ["run", "serve"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    }
  };
}

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/js/main.js"
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
        hydratable: production,
      },
    }),
    css({ output: "app.css" }),
    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    !production && serve(),
    !production && livereload("public"),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
