import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths(), react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
