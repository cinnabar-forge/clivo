import cinnabarPlugin from "@cinnabar-forge/eslint-plugin";

export default [
  ...cinnabarPlugin.default.map((config) => ({
    ...config,
    files: ["src/**/*.ts"],
  })),
  {
    files: ["src/**/*.ts"],
    rules: {
      "security/detect-object-injection": "off",
    },
  },
  {
    ignores: ["bin/**/*", "build/**/*", "dist/**/*"],
  },
];
