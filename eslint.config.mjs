import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off", // Desliga erro do {} em routes.d.ts
      "@typescript-eslint/no-unused-vars": "off"        // Neutraliza os avisos do 'handler'
    }
  },

  // Ignora pastas de build, arquivos de ambiente e os exemplos do Cypress
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "cypress/**" // Ignora a pasta inteira do Cypress para não poluir o QA
  ]),
]);

export default eslintConfig;