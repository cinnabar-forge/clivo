import cinnabarPlugin from "@cinnabar-forge/eslint-plugin";

const files = ["src/**/*.ts"];
const ignores = ["bin/**/*", "build/**/*", "dist/**/*"];

export default [
  ...cinnabarPlugin.default.map((config) => ({
    ...config,
    files,
  })),
  {
    files,
    rules: {
      "security/detect-object-injection": "off",
    },
  },
  {
    ignores,
  },
];
