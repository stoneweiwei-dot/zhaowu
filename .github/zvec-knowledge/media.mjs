import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ZVecCollectionSchema,
  ZVecCreateAndOpen,
  ZVecDataType,
  ZVecIndexType,
  ZVecOpen,
} from "@zvec/zvec";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_INDEX = resolve(HERE, ".cache/media-index");
const SUPABASE_URL = (process.env.ZHAOWU_SUPABASE_URL || "https://plgpxusmemnmzckbwtiv.supabase.co").replace(/\/$/, "");
const SUPABASE_KEY = process.env.ZHAOWU_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";
const OWNER_MUSIC_MANIFEST_URL =
  process.env.ZHAOWU_OWNER_MUSIC_MANIFEST_URL ||
  "https://raw.githubusercontent.com/stoneweiwei-dot/zhaowu/owner-music/public/audio/owner-manifest.json";

function stableId(parts) {
  return createHash("sha1").update(parts.join("\u0000"), "utf8").digest("hex");
}

function strings(value) {
  return Array.isArray(value) ? value.map(String).map((x) => x.trim()).filter(Boolean) : [];
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${new URL(url).pathname}`);
  return res.json();
}

async function supabaseRows(table, params) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return fetchJson(url.toString(), {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  });
}

function galleryKind(row) {
  if (row.category === "loading") {
    return String(row.content_type || "").startsWith("video/") ? "login-video" : "login-art";
  }
  if (row.category === "visual-library") return "gallery-image";
  if (row.category === "background") return "gallery-background";
  if (row.category === "dragon-sticker") return "dragon-sticker";
  if (row.category === "tea-guardian") return "tea-guardian";
  return "gallery-media";
}

function kindAliases(kind) {
  const aliases = {
    "login-video": "登入影片 登录视频 login loading intro animation video",
    "login-art": "登入圖片 登录图片 login loading intro art image",
    "gallery-image": "圖庫 图片库 gallery visual library artwork 命誥圖 命诰图",
    "gallery-background": "圖庫背景 图片库背景 gallery background",
    "dragon-sticker": "小綠龍 小绿龙 dragon sticker",
    "tea-guardian": "茶仙 茶守護 茶守护 tea guardian",
    "gallery-media": "圖庫 媒體 图片库 媒体 gallery media",
    "homepage-background": "首頁背景 首页背景 wallpaper homepage background daily rotation",
    "background-music": "背景音樂 背景音乐 music audio soundtrack",
    "background-music-legacy": "背景音樂 背景音乐 legacy owner music audio github",
  };
  return aliases[kind] || kind;
}

function storageRef(bucket, path) {
  return `supabase://${bucket}/${String(path || "").replace(/^\/+/, "")}`;
}

function galleryDoc(row, knowledge) {
  const kind = galleryKind(row);
  const tags = strings(row.tags);
  const subject = strings(knowledge?.subject_labels);
  const style = strings(knowledge?.style_labels);
  const motifs = strings(knowledge?.motifs);
  const moods = strings(knowledge?.mood_labels);
  const roles = strings(knowledge?.use_roles);
  const content = [
    kindAliases(kind),
    row.title,
    row.asset_key,
    row.category,
    ...tags,
    ...subject,
    ...style,
    ...motifs,
    ...moods,
    ...roles,
    knowledge?.summary,
    knowledge?.rationale,
  ].filter(Boolean).join("\n");

  return {
    id: stableId(["supabase-gallery", row.id]),
    fields: {
      media_kind: kind,
      source: "supabase-gallery",
      asset_id: String(row.id),
      title: clean(row.title || row.asset_key),
      category: clean(row.category),
      content_type: clean(row.content_type || ""),
      location: storageRef(row.bucket_id || "zhaowu-gallery", row.storage_path),
      tags: [...tags, ...subject, ...style, ...motifs, ...moods, ...roles].join(" "),
      search_text: content,
      enabled: Boolean(row.enabled),
      current: Boolean(row.is_primary),
      updated_at: clean(row.updated_at || ""),
    },
  };
}

function backgroundDoc(row) {
  return {
    id: stableId(["supabase-background", row.id]),
    fields: {
      media_kind: "homepage-background",
      source: "supabase-backgrounds",
      asset_id: String(row.id),
      title: clean(row.name),
      category: clean(row.theme || "daily-rotation"),
      content_type: clean(row.content_type || "image"),
      location: storageRef("zhaowu-backgrounds", row.storage_path),
      tags: [row.source, row.theme, ...(row.days_of_week || []).map((x) => `weekday-${x}`)].filter(Boolean).join(" "),
      search_text: [
        kindAliases("homepage-background"),
        row.name,
        row.source,
        row.theme,
        ...(row.days_of_week || []).map((x) => `weekday ${x}`),
      ].filter(Boolean).join("\n"),
      enabled: Boolean(row.enabled),
      current: row.theme === "wallpaper",
      updated_at: clean(row.updated_at || ""),
    },
  };
}

function musicDoc(row) {
  return {
    id: stableId(["supabase-music", row.id]),
    fields: {
      media_kind: "background-music",
      source: "supabase-audio",
      asset_id: String(row.id),
      title: clean(row.name || row.original_name),
      category: "background-music",
      content_type: clean(row.content_type || "audio"),
      location: storageRef("zhaowu-audio", row.storage_path),
      tags: [row.codec, row.original_name].filter(Boolean).join(" "),
      search_text: [
        kindAliases("background-music"),
        row.name,
        row.original_name,
        row.codec,
      ].filter(Boolean).join("\n"),
      enabled: Boolean(row.enabled),
      current: Boolean(row.enabled),
      updated_at: clean(row.updated_at || ""),
    },
  };
}

function legacyMusicDoc(row, activeId) {
  const mastering = row.mastering && typeof row.mastering === "object" ? row.mastering : {};
  return {
    id: stableId(["github-owner-music", row.id]),
    fields: {
      media_kind: "background-music-legacy",
      source: "github-owner-music",
      asset_id: String(row.id),
      title: clean(row.name),
      category: "background-music",
      content_type: clean(row.contentType || "audio"),
      location: clean(row.url || `github://owner-music/public/audio/tracks/${row.filename || ""}`),
      tags: [
        mastering.profile,
        mastering.originalPath,
        row.filename,
      ].filter(Boolean).join(" "),
      search_text: [
        kindAliases("background-music-legacy"),
        row.name,
        row.filename,
        mastering.profile,
        mastering.originalPath,
      ].filter(Boolean).join("\n"),
      enabled: true,
      current: String(row.id) === String(activeId || ""),
      updated_at: clean(row.createdAt || ""),
    },
  };
}

async function collectMedia() {
  const [gallery, knowledge, backgrounds, music, ownerManifest] = await Promise.all([
    supabaseRows("gallery_assets", {
      enabled: "eq.true",
      select: "id,category,asset_key,title,storage_path,bucket_id,content_type,tags,enabled,is_primary,updated_at",
      order: "updated_at.desc",
      limit: "1000",
    }),
    supabaseRows("gallery_asset_knowledge", {
      select: "asset_id,subject_labels,style_labels,motifs,mood_labels,use_roles,summary,rationale,analysis_status,client_eligible,confidence,updated_at",
      limit: "1000",
    }),
    supabaseRows("background_assets", {
      enabled: "eq.true",
      select: "id,source,name,storage_path,content_type,enabled,days_of_week,theme,updated_at",
      order: "updated_at.desc",
      limit: "1000",
    }),
    supabaseRows("background_music_assets", {
      enabled: "eq.true",
      select: "id,name,original_name,storage_path,content_type,codec,file_size,enabled,updated_at",
      order: "updated_at.desc",
      limit: "1000",
    }),
    fetchJson(OWNER_MUSIC_MANIFEST_URL).catch(() => ({ activeId: null, tracks: [] })),
  ]);

  const knowledgeByAsset = new Map(knowledge.map((row) => [String(row.asset_id), row]));
  const docs = [
    ...gallery.map((row) => galleryDoc(row, knowledgeByAsset.get(String(row.id)))),
    ...backgrounds.map(backgroundDoc),
    ...music.map(musicDoc),
    ...((Array.isArray(ownerManifest.tracks) ? ownerManifest.tracks : []).map((row) => legacyMusicDoc(row, ownerManifest.activeId))),
  ];

  const counts = docs.reduce((acc, doc) => {
    const key = doc.fields.media_kind;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    docs,
    counts,
    sources: {
      gallery: gallery.length,
      gallery_knowledge_public: knowledge.length,
      backgrounds: backgrounds.length,
      supabase_music: music.length,
      legacy_owner_music: Array.isArray(ownerManifest.tracks) ? ownerManifest.tracks.length : 0,
    },
  };
}

function schema() {
  return new ZVecCollectionSchema({
    name: "zhaowu_media_catalog",
    fields: [
      { name: "media_kind", dataType: ZVecDataType.STRING },
      { name: "source", dataType: ZVecDataType.STRING },
      { name: "asset_id", dataType: ZVecDataType.STRING },
      { name: "title", dataType: ZVecDataType.STRING },
      { name: "category", dataType: ZVecDataType.STRING },
      { name: "content_type", dataType: ZVecDataType.STRING },
      { name: "location", dataType: ZVecDataType.STRING },
      { name: "tags", dataType: ZVecDataType.STRING },
      {
        name: "search_text",
        dataType: ZVecDataType.STRING,
        indexParams: {
          indexType: ZVecIndexType.FTS,
          tokenizerName: "ngram",
          filters: ["lowercase"],
          extraParams: JSON.stringify({ ngram_min: 2, ngram_max: 3 }),
        },
      },
      { name: "enabled", dataType: ZVecDataType.BOOL },
      { name: "current", dataType: ZVecDataType.BOOL },
      { name: "updated_at", dataType: ZVecDataType.STRING },
    ],
  });
}

async function build(indexPath = DEFAULT_INDEX) {
  rmSync(indexPath, { recursive: true, force: true });
  mkdirSync(dirname(indexPath), { recursive: true });
  const inventory = await collectMedia();
  const collection = ZVecCreateAndOpen(indexPath, schema());
  try {
    const statuses = collection.insertSync(inventory.docs);
    const failed = statuses.filter((status) => status && status.ok === false);
    if (failed.length) throw new Error(`ZVec media insert failed for ${failed.length} documents`);
    collection.optimizeSync();
  } finally {
    collection.closeSync();
  }
  return { indexPath, count: inventory.docs.length, counts: inventory.counts, sources: inventory.sources };
}

function search(query, indexPath = DEFAULT_INDEX, topk = 12) {
  if (!query?.trim()) throw new Error("Media search query is required.");
  const collection = ZVecOpen(indexPath);
  try {
    return collection.querySync({
      fieldName: "search_text",
      fts: { matchString: query.trim() },
      topk,
      includeVector: false,
      outputFields: [
        "media_kind", "source", "asset_id", "title", "category",
        "content_type", "location", "tags", "enabled", "current", "updated_at",
      ],
      params: { indexType: ZVecIndexType.FTS, defaultOperator: "OR" },
    });
  } finally {
    collection.closeSync();
  }
}

function printResults(results) {
  if (!results.length) {
    console.log("NO_MATCH");
    return;
  }
  for (const [idx, doc] of results.entries()) {
    const f = doc.fields || {};
    console.log([
      `#${idx + 1}`,
      `score=${Number(doc.score || 0).toFixed(4)}`,
      f.media_kind,
      f.source,
      f.title,
      f.current ? "CURRENT" : "",
    ].filter(Boolean).join(" | "));
    console.log(f.location || "");
    if (f.tags) console.log(`tags: ${String(f.tags).slice(0, 360)}`);
    console.log("");
  }
}

async function smoke() {
  const root = mkdtempSync(join(tmpdir(), "zhaowu-zvec-media-"));
  const indexPath = join(root, "index");
  try {
    const built = await build(indexPath);
    const requiredKinds = ["gallery-image", "homepage-background", "login-video", "background-music-legacy"];
    for (const kind of requiredKinds) {
      if (!built.counts[kind]) throw new Error(`Media inventory missing required kind: ${kind}`);
    }

    const login = search("登入 影片", indexPath, 12);
    if (!login.some((x) => x.fields?.media_kind === "login-video")) {
      throw new Error("Reopened media FTS did not return a login video");
    }

    const music = search("背景 音樂", indexPath, 20);
    if (!music.some((x) => String(x.fields?.media_kind || "").startsWith("background-music"))) {
      throw new Error("Reopened media FTS did not return background music");
    }

    const gallery = search("圖庫 visual library", indexPath, 20);
    if (!gallery.some((x) => x.fields?.media_kind === "gallery-image")) {
      throw new Error("Reopened media FTS did not return gallery images");
    }

    console.log(JSON.stringify({
      ok: true,
      engine: "@zvec/zvec@0.7.1",
      docs: built.count,
      counts: built.counts,
      sources: built.sources,
      reopen_fts: true,
      login_video_top: login.find((x) => x.fields?.media_kind === "login-video")?.fields?.title || null,
      music_top: music.find((x) => String(x.fields?.media_kind || "").startsWith("background-music"))?.fields?.title || null,
      gallery_top: gallery.find((x) => x.fields?.media_kind === "gallery-image")?.fields?.title || null,
      private_report_images_indexed: false,
    }, null, 2));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const [command = "smoke", ...rest] = process.argv.slice(2);
if (command === "build") {
  console.log(JSON.stringify(await build(), null, 2));
} else if (command === "search") {
  if (!existsSync(DEFAULT_INDEX)) await build();
  printResults(search(rest.join(" ")));
} else if (command === "inventory") {
  const inventory = await collectMedia();
  console.log(JSON.stringify({ count: inventory.docs.length, counts: inventory.counts, sources: inventory.sources }, null, 2));
} else if (command === "smoke") {
  await smoke();
} else {
  console.error("Usage: node media.mjs [build|search <query>|inventory|smoke]");
  process.exitCode = 2;
}
