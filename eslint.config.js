import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["src/**/*.ts"],
  extends: [
    tseslint.configs.recommended,
  ],
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["error", { 
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_"
    }],
  },
  ignores: ["dist/", "node_modules/"],
});
