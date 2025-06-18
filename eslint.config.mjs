import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables during development
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow any type during development
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn",
      // Allow empty object types
      "@typescript-eslint/no-empty-object-type": "warn",
      // Allow prefer-const warnings
      "prefer-const": "warn",
      // Allow exhaustive deps warnings
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
