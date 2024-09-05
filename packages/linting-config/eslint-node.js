/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve("./eslint-base.js"),
    "@rocketseat/eslint-config/node",
  ],
  env: { node: true, jest: true },
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-useless-constructor": "off",
  },
};
