import resolve from "@rollup/plugin-node-resolve";

export default {
  input: {
    HrrrMap: "src/components/HrrrMap.js",
  },
  output: {
    dir: "public/js/",
    format: "es"
  },
  plugins: [
    resolve(),
  ]
};
