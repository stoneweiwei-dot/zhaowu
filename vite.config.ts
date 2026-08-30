import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { execFileSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";

function writeGeneratedPublicAssets(): Plugin {
  const write = () => {
    execFileSync(process.execPath, ["scripts/write-home-icons.mjs"], {
      stdio: "inherit",
    });
    execFileSync(process.execPath, ["scripts/write-intro-media.mjs"], {
      stdio: "inherit",
    });
  };
  return {
    name: "zhaowu-generated-public-assets",
    buildStart() {
      write();
    },
    configureServer() {
      write();
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [
    writeGeneratedPublicAssets(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    tsconfigPaths(),
    react(),
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
