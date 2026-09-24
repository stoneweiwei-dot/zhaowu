import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { execFileSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";

function resolveReleaseId() {
  const fromEnvironment =
    process.env.ZHAOWU_RELEASE_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA;
  if (fromEnvironment?.trim()) return fromEnvironment.trim();

  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

const RELEASE_ID = resolveReleaseId();

function writeGeneratedPublicAssets(): Plugin {
  const write = () => {
    execFileSync(process.execPath, ["scripts/write-r96-assets.mjs"], {
      stdio: "inherit",
    });
    execFileSync(process.execPath, ["scripts/write-home-icons.mjs"], {
      stdio: "inherit",
    });
    execFileSync(process.execPath, ["scripts/write-release-assets.mjs"], {
      stdio: "inherit",
      env: { ...process.env, ZHAOWU_RELEASE_ID: RELEASE_ID },
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
  define: {
    __ZHAOWU_RELEASE_ID__: JSON.stringify(RELEASE_ID),
  },
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
