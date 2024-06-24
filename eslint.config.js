import cinnabarPlugin from "@cinnabar-forge/eslint-plugin";

export default [
  ...cinnabarPlugin.default.map((config) => ({
    ...config,
    files: ["src/**/*.ts"],
    rules: {
      ...config.rules,
      "security/detect-object-injection": "off",
    },
  })),
];
