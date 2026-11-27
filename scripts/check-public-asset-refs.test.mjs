import assert from "node:assert/strict";
import test from "node:test";
import { assetRefs } from "./check-public-asset-refs.mjs";

test("extracts distinct local asset URLs without queries, fragments or external hosts", () => {
  const source = [
    '<img src="/gallery/a.jpg?v=1" srcset="/gallery/a.jpg 1x, /gallery/b.webp 2x">',
    "url(/art/detail.svg#panel)", '"/sb/storage/v1/object/public/image.jpg"',
    '"https://zhao-wu.com/gallery/Sky%20study.jpg?size=1"',
    '"https://example.com/remote.png"', '"//example.com/external.png"',
    'art.endsWith("/suffix.webp")', '<a href="/gallery">', '"/src/assets/c.png"',
  ].join("\n");
  assert.deepEqual([...assetRefs(source, "fixture.tsx")].sort(),
    ["/art/detail.svg", "/gallery/Sky study.jpg", "/gallery/a.jpg", "/gallery/b.webp", "/src/assets/c.png"]);
});

test("the numbered gallery checks originals and thumbnails separately", () => {
  const source = [
    'className="yunyi-wall-grid">{Array.from({ length: 2 },',
    'src = `/articles/yunyi-shenxiang/${nn}.webp`',
    'thumbSrc = `/articles/yunyi-shenxiang/thumbs/${nn}.webp`',
  ].join("\n");
  assert.deepEqual([...assetRefs(source, "src/routes/yunyi-shenxiang.tsx")].sort(), [
    "/articles/yunyi-shenxiang/01.webp", "/articles/yunyi-shenxiang/02.webp",
    "/articles/yunyi-shenxiang/thumbs/01.webp", "/articles/yunyi-shenxiang/thumbs/02.webp",
  ]);
});
