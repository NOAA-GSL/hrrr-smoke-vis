import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
	input: "src/main.js",
	output: {
		sourcemap: true,
		format: "es",
		name: "hrrrsmoke",
		file: "src/static/js/bundle.js"
	},
	plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production,
				hydratable: true
			}
		}),

		resolve({
			browser: true,
			dedupe: ["svelte"]
		}),
		commonjs(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
