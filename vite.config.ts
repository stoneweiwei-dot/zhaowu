import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
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
    transformIndexHtml(html) {
      return html.replaceAll("__ZHAOWU_RELEASE__", RELEASE_ID);
    },
  };
}

/**
 * Self-host the ffmpeg.wasm core (owner-only audio optimiser) so it no longer depends on jsDelivr.
 * The 31 MB binary is copied from the pinned devDependency into dist at build time and is never committed.
 */
function selfHostFfmpegCore(): Plugin {
  const files = ["ffmpeg-core.js", "ffmpeg-core.wasm"];
  return {
    name: "zhaowu-selfhost-ffmpeg-core",
    apply: "build",
    closeBundle() {
      const from = "node_modules/@ffmpeg/core/dist/esm";
      const to = "dist/vendor/ffmpeg-core";
      if (!files.every((f) => existsSync(`${from}/${f}`))) {
        console.warn("zhaowu-selfhost-ffmpeg-core: @ffmpeg/core not installed; owner optimiser falls back to jsDelivr.");
        return;
      }
      mkdirSync(to, { recursive: true });
      for (const f of files) copyFileSync(`${from}/${f}`, `${to}/${f}`);
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
    selfHostFfmpegCore(),
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
