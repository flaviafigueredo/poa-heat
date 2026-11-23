import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Testes ficam ao lado do código que testam, com final .test.ts ou .test.tsx.
    include: ["scripts/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
  },
});
