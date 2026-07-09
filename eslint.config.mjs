import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Relax strict TypeScript types for development flexibility
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Relax React unescaped characters & hooks rules
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // Allow standard image tags
      "@next/next/no-img-element": "off",
      
      // Allow let instead of const for flexibility
      "prefer-const": "warn"
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore script files and tests from strict production linting
    "scripts/**",
    "src/__tests__/**"
  ]),
]);

export default eslintConfig;
