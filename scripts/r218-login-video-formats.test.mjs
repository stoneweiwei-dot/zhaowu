import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (p) => readFile(new URL(p, root), "utf8");
const MAINSTREAM = ["mp4", "m4v", "mov", "webm", "3gp", "mkv", "avi", "wmv", "flv", "mpg", "ts", "ogv"];

test("r218 accepts every mainstream video container, including iPhone .MOV screen recordings", async () => {
  const formats = await source("src/lib/video-formats.ts");
  for (const ext of MAINSTREAM) assert.match(formats, new RegExp(`\\b"?${ext}"?:\\s*"video/`), `missing ${ext}`);
  assert.match(formats, /mov:\s*"video\/quicktime"/);
  assert.match(formats, /"video\/\*"/);
  assert.doesNotMatch(formats, /image\//);
});

test("r218 upload paths resolve MIME from extension when the device reports none", async () => {
  const [manager, direct, bridge, client] = await Promise.all([
    source("src/components/owner-login-visuals-manager.tsx"),
    source("src/lib/gallery-assets.ts"),
    source("src/lib/bridge/gallery-assets.ts"),
    source("src/lib/owner-data-client.ts"),
  ]);
  assert.match(manager, /resolveLoginVideoType\(file\)/);
  assert.doesNotMatch(manager, /file\.type !== "video\/mp4"/);
  assert.doesNotMatch(manager, /throw new Error\(copy\.tooLong\)/);
  for (const file of [direct, bridge]) assert.match(file, /resolveLoginVideoType\(file\)/);
  assert.match(bridge, /contentType: \(loading && videoType\)/);
  assert.match(client, /new File\(\[file\], file\.name, \{ type: ticket\.contentType \}\)/);
});

test("r218 server allowlists match the client format list", async () => {
  const [edge, migration] = await Promise.all([
    source("supabase/functions/zhaowu-owner-data/index.ts"),
    source("supabase/migrations/20260928100000_login_video_all_mainstream_formats.sql"),
  ]);
  for (const mime of ["video/quicktime", "video/x-m4v", "video/x-matroska", "video/x-msvideo", "video/x-ms-wmv", "video/x-flv", "video/mpeg", "video/mp2t", "video/3gpp", "video/ogg"]) {
    assert.ok(edge.includes(`"${mime}"`), `edge function missing ${mime}`);
    assert.ok(migration.includes(`'${mime}'`), `bucket migration missing ${mime}`);
  }
});

test("r218 login page still stops playback at 15 seconds and falls back on decode errors", async () => {
  const login = await source("src/routes/login.tsx");
  assert.match(login, /currentTime >= 15/);
  assert.match(login, /onError=\{\(\) => \{/);
});
