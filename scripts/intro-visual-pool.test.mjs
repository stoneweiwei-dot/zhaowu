import assert from "node:assert/strict";
import test from "node:test";
import { fetchIntroVisualOverride } from "../src/lib/intro-visual-source.ts";

// Guards the fix for: the /gallery "開場影片" admin panel lets the owner
// upload several videos and tag each day/login-day, night/login-night, or
// leave it common (src/components/owner-login-visuals-manager.tsx), but
// fetchIntroVisualOverride() only ever read a single is_primary row, so that
// grouping never reached the homepage IntroGate and uploads beyond the one
// pinned video were invisible. It now rotates randomly across the enabled,
// themed pool, while an explicit pin still always wins deterministically.
globalThis.window = globalThis;

function stubFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return handler(String(url));
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

function rowsResponse(rows) {
  return { ok: true, json: async () => rows };
}

test("an explicit owner pin (is_primary) always wins over the pool", async () => {
  const stub = stubFetch((url) => {
    if (url.includes("is_primary=eq.true")) {
      return rowsResponse([{ storage_path: "loading/pin/pin.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-night"] }]);
    }
    return rowsResponse([
      { storage_path: "loading/a/a.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-day"] },
      { storage_path: "loading/b/b.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-day"] },
    ]);
  });
  try {
    const result = await fetchIntroVisualOverride("day");
    assert.ok(result?.videoUrl.endsWith("loading/pin/pin.mp4"), `expected the pinned clip, got ${result?.videoUrl}`);
    assert.ok(stub.calls.some((u) => u.includes("category=eq.loading")));
    assert.ok(stub.calls.some((u) => u.includes("enabled=eq.true")));
  } finally {
    stub.restore();
  }
});

test("with no pin, rotates randomly across the enabled pool matching the visitor's theme", async () => {
  const stub = stubFetch((url) => {
    if (url.includes("is_primary=eq.true")) return rowsResponse([]);
    return rowsResponse([
      { storage_path: "loading/night-1/n1.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-night"] },
      { storage_path: "loading/night-2/n2.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-night"] },
      { storage_path: "loading/night-3/n3.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-night"] },
      { storage_path: "loading/day-1/d1.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-day"] },
      { storage_path: "loading/not-video/x.jpg", bucket_id: "zhaowu-gallery", content_type: "image/jpeg", tags: ["loading", "login-background"] },
      { storage_path: "loading/untagged/u.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading"] },
    ]);
  });
  try {
    const seen = new Set();
    for (let i = 0; i < 40; i += 1) {
      const result = await fetchIntroVisualOverride("night");
      assert.ok(result?.videoUrl.includes("/loading/night-"), `expected a night-tagged clip, got ${result?.videoUrl}`);
      seen.add(result.videoUrl);
    }
    assert.ok(seen.size > 1, `expected more than one distinct pick across 40 draws, got ${[...seen]}`);
  } finally {
    stub.restore();
  }
});

test("falls back to the whole enabled pool when nothing matches the requested theme", async () => {
  const stub = stubFetch((url) => {
    if (url.includes("is_primary=eq.true")) return rowsResponse([]);
    return rowsResponse([
      { storage_path: "loading/common-1/c1.mp4", bucket_id: "zhaowu-gallery", content_type: "video/mp4", tags: ["loading", "login-background", "login-common"] },
    ]);
  });
  try {
    const result = await fetchIntroVisualOverride("day");
    assert.ok(result?.videoUrl.endsWith("loading/common-1/c1.mp4"));
  } finally {
    stub.restore();
  }
});

test("returns null (built-in default stays) when nothing is enabled or the read fails", async () => {
  for (const handler of [() => rowsResponse([]), () => { throw new Error("network down"); }]) {
    const stub = stubFetch(handler);
    try {
      assert.equal(await fetchIntroVisualOverride("day"), null);
    } finally {
      stub.restore();
    }
  }
});
