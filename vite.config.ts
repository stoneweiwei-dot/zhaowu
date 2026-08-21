import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: false }),
    tsconfigPaths(),
    react(),
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
