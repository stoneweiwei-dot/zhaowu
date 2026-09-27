import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ZVecCollectionSchema,
  ZVecCreateAndOpen,
  ZVecDataType,
  ZVecIndexType,
  ZVecOpen,
} from "@zvec/zvec";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../..");
const DEFAULT_INDEX = resolve(HERE, ".cache/current-index");
const CLASSIC_CORPUS = resolve(HERE, "verified-classics.json");

const AUTHORITY_FILES = [
  "AGENTS.md",
  "docs/CURRENT-STATE.md",
  "docs/FOCUSED-REPORT.md",
  "docs/ANALYSIS-INGESTION-POLICY.md",
  "docs/STONE-R6.2.2-CURRENT-MASTER.md",
  "docs/STONE-R6.2.2-CURRENT-MASTER-DECLARATION.md",
  "docs/STONE-R6.2.2-SIX-PATCHES.md",
  "docs/STONE-R6.2.1-P2-STRUCTURAL-DYNAMICS.md",
  "docs/STONE-R6.2.1-P3-PINKU-BINGYAO-GATE.md",
];

function stableId(parts) {
  return createHash("sha1").update(parts.join("\u0000"), "utf8").digest("hex");
}

function compact(text) {
  return text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
}

function splitMarkdown(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  const sections = [];
  let heading = "document";
  let buf = [];
  const flush = () => {
    const body = compact(buf.join("\n"));
    if (body) sections.push({ heading, body });
    buf = [];
  };
  for (const line of lines) {
    if (/^#{1,4}\s+/.test(line)) {
      flush();
      heading = line.replace(/^#{1,4}\s+/, "").trim() || "section";
    } else {
      buf.push(line);
    }
  }
  flush();

  const chunks = [];
  for (const section of sections) {
    if (section.body.length <= 2200) {
      chunks.push(section);
      continue;
    }
    const paragraphs = section.body.split(/\n\s*\n|(?<=[。！？.!?])\s+/);
    let current = "";
    let n = 1;
    for (const paragraph of paragraphs) {
      const next = current ? current + "\n" + paragraph : paragraph;
      if (next.length > 2000 && current) {
        chunks.push({ heading: section.heading + " · " + n++, body: current });
        current = paragraph;
      } else {
        current = next;
      }
    }
    if (current) chunks.push({ heading: section.heading + (n > 1 ? " · " + n : ""), body: current });
  }
  return chunks;
}

function governanceDocs() {
  const docs = [];
  for (const rel of AUTHORITY_FILES) {
    const path = resolve(REPO_ROOT, rel);
    if (!existsSync(path)) throw new Error("Missing authority file: " + rel);
    const text = readFileSync(path, "utf8");
    splitMarkdown(text).forEach((chunk, idx) => {
      docs.push({
        id: stableId(["governance", rel, chunk.heading, String(idx)]),
        fields: {
          kind: "governance",
          source: rel,
          locator: chunk.heading,
          authority: "CURRENT_ONLY",
          content: chunk.heading + "\n" + chunk.body,
          tags: "current governance contract",
          avoid: "",
          score_bias: 20,
        },
      });
    });
  }
  return docs;
}

function classicDocs() {
  const payload = JSON.parse(readFileSync(CLASSIC_CORPUS, "utf8"));
  return payload.items.map((item) => ({
    id: stableId(["classic", item.source_slug, item.passage_key]),
    fields: {
      kind: "classic",
      source: item.source_title,
      locator: item.locator,
      authority: "VERIFIED_CLASSIC",
      content: [
        item.source_title,
        item.original_text,
        item.display_note_zh_hant,
        ...(item.theme_tags ?? []),
        ...(item.question_tags ?? []),
        ...(item.element_tags ?? []),
        ...(item.stem_tags ?? []),
        ...(item.branch_tags ?? []),
      ].filter(Boolean).join("\n"),
      tags: [...(item.theme_tags ?? []), ...(item.question_tags ?? [])].join(" "),
      avoid: (item.avoid_tags ?? []).join(" "),
      score_bias: Number(item.score_bias ?? 0),
    },
  }));
}

function schema() {
  return new ZVecCollectionSchema({
    name: "zhaowu_current_knowledge",
    fields: [
      { name: "kind", dataType: ZVecDataType.STRING },
      { name: "source", dataType: ZVecDataType.STRING },
      { name: "locator", dataType: ZVecDataType.STRING },
      { name: "authority", dataType: ZVecDataType.STRING },
      {
        name: "content",
        dataType: ZVecDataType.STRING,
        indexParams: {
          indexType: ZVecIndexType.FTS,
          tokenizerName: "ngram",
          filters: ["lowercase"],
          extraParams: JSON.stringify({ ngram_min: 2, ngram_max: 3 }),
        },
      },
      { name: "tags", dataType: ZVecDataType.STRING },
      { name: "avoid", dataType: ZVecDataType.STRING },
      { name: "score_bias", dataType: ZVecDataType.INT32 },
    ],
  });
}

function build(indexPath = DEFAULT_INDEX) {
  rmSync(indexPath, { recursive: true, force: true });
  mkdirSync(dirname(indexPath), { recursive: true });
  const docs = [...governanceDocs(), ...classicDocs()];
  const collection = ZVecCreateAndOpen(indexPath, schema());
  try {
    const statuses = collection.insertSync(docs);
    const failed = statuses.filter((status) => status && status.ok === false);
    if (failed.length) throw new Error("ZVec insert failed for " + failed.length + " documents");
    collection.optimizeSync();
  } finally {
    collection.closeSync();
  }
  return { indexPath, count: docs.length };
}

function search(query, indexPath = DEFAULT_INDEX, topk = 8) {
  if (!query?.trim()) throw new Error("Search query is required.");
  const collection = ZVecOpen(indexPath);
  try {
    return collection.querySync({
      fieldName: "content",
      fts: { matchString: query.trim() },
      topk,
      includeVector: false,
      outputFields: ["kind", "source", "locator", "authority", "content", "tags", "avoid", "score_bias"],
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
    const f = doc.fields ?? {};
    console.log(
      [
        "#" + (idx + 1),
        "score=" + Number(doc.score ?? 0).toFixed(4),
        f.authority,
        f.kind,
        f.source,
        f.locator,
      ].filter(Boolean).join(" | "),
    );
    console.log(String(f.content ?? "").slice(0, 700));
    console.log("");
  }
}

function smoke() {
  const root = mkdtempSync(join(tmpdir(), "zhaowu-zvec-"));
  const indexPath = join(root, "index");
  try {
    const built = build(indexPath);
    const current = search("R6.2.2 CURRENT MASTER", indexPath, 5);
    if (!current.some((x) => x.fields?.authority === "CURRENT_ONLY")) {
      throw new Error("CURRENT governance reopen search returned no authoritative result");
    }
    const classic = search("上善若水", indexPath, 5);
    if (!classic.some((x) => x.fields?.source === "道德經")) {
      throw new Error("Verified classic reopen search returned no 道德經 result");
    }
    console.log(JSON.stringify({
      ok: true,
      engine: "@zvec/zvec@0.7.1",
      docs: built.count,
      reopen_fts: true,
      current_top: current[0]?.fields?.source ?? null,
      classic_top: classic[0]?.fields?.source ?? null,
    }, null, 2));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const [command = "smoke", ...rest] = process.argv.slice(2);
if (command === "build") {
  console.log(JSON.stringify(build(), null, 2));
} else if (command === "search") {
  if (!existsSync(DEFAULT_INDEX)) build();
  printResults(search(rest.join(" ")));
} else if (command === "smoke") {
  smoke();
} else {
  console.error("Usage: node knowledge.mjs [build|search <query>|smoke]");
  process.exitCode = 2;
}
