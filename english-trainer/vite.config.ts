import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Собранная версия коммитится в ../trainer и открывается как сайт
// (GitHub Pages). base: './' — относительные пути, работает по любому URL.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../trainer",
    emptyOutDir: true
  },
  test: {
    environment: "node"
  }
} as never);
