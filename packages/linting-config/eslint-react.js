/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve("./eslint-base.js"),
    "plugin:react-hooks/recommended",
    "plugin:react-namespace-import/recommended",
    "@rocketseat/eslint-config/react",
  ],
  globals: { JSX: true },
  env: { browser: true, es2020: true },
  plugins: ["react-refresh"],
  rules: {
    "react-namespace-import/no-namespace-import": "error",
    "no-unused-expressions": "error",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
