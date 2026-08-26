import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("gallery client uses the dedicated Supabase gallery bucket", async () => {
  const source = await read("src/lib/gallery-assets.ts");
  assert.match(source, /const BUCKET = "zhaowu-gallery"/);
  assert.match(source, /bucket_id: BUCKET/);
  assert.match(source, /galleryPublicUrl\(path: string, bucketId = BUCKET\)/);
  assert.match(source, /is_primary=eq\.true/);
  assert.match(source, /file\.size > 10 \* 1024 \* 1024/);
});

test("owner gallery route is owner-gated and registered", async () => {
  const [route, tree, manager] = await Promise.all([
    read("src/routes/gallery.tsx"),
    read("src/routeTree.gen.ts"),
    read("src/components/owner-gallery-manager.tsx"),
  ]);
  assert.match(route, /!user\.isOwner/);
  assert.match(route, /OwnerGalleryManager/);
  assert.match(tree, /'\/gallery'/);
  assert.match(manager, /"reference-style"/);
  assert.match(manager, /galleryPublicUrl\(asset\.storage_path, asset\.bucket_id\)/);
});

test("tea portrait resolves current owner gallery art with static fallback", async () => {
  const [report, image] = await Promise.all([
    read("src/components/tea-guardian-report.tsx"),
    read("src/components/tea-gallery-image.tsx"),
  ]);
  assert.match(report, /TeaGalleryImage teaId=\{tea\.id\}/);
  assert.match(image, /resolvePrimaryGalleryAssets\("tea-guardian", \[teaId\]\)/);
  assert.match(image, /galleryPublicUrl\(asset\.storage_path, asset\.bucket_id\)/);
  assert.match(image, /setSrc\(fallback\)/);
});
