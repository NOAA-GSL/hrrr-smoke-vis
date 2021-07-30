import resolve from "@rollup/plugin-node-resolve";

export default {
  input: {
    HrrrMap: "src/components/HrrrMap.js",
  },
  output: {
    dir: "src/static/js/",
    format: "es"
  },
  plugins: [
    resolve(),
  ]
};
