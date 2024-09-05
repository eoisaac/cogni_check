/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint/eslint-plugin"],
  ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
};
