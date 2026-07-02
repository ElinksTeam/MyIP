import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "dist/**",
    "frontend/**",
    "server/**",
    "api/**",
    "common/**",
    "tests/**",
    "public/**",
    "backend-server.js",
    "frontend-server.js",
    "server.js",
    "vite.config.js"
  ]),
]);
