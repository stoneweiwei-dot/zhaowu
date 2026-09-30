import { createDecipheriv, createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sealedKey from "./owner-music-ssh.json" with { type: "json" };
import {
  BRANCH,
  MANIFEST_PATH,
  MAX_BYTES,
  REPO,
  SCRATCH_DIR,
  TRACK_DIR,
  publicTrackUrl,
} from "./owner-music-public.js";

export { BRANCH, MANIFEST_PATH, MAX_BYTES, REPO, SCRATCH_DIR, TRACK_DIR } from "./owner-music-public.js";
const KEY_SALT = "zhaowu-music-ssh-v1";

let gitRuntime = null;
let gitRuntimePromise = null;

async function loadGitRuntime() {
  if (gitRuntime) return gitRuntime;
  if (!gitRuntimePromise) gitRuntimePromise = import("isomorphic-git").then((mod) => mod.default || mod);
  gitRuntime = await gitRuntimePromise;
  return gitRuntime;
}

function deriveKey(secret) {
  return createHash("sha256").update(`${secret}|${KEY_SALT}`, "utf8").digest();
}

export function decryptOwnerSshKey(secret) {
  const sealed = sealedKey;
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret), Buffer.from(sealed.iv, "base64"));
  decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(sealed.data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function pkt(s) {
  const payload = Buffer.from(s, "utf8");
  const len = (payload.length + 4).toString(16).padStart(4, "0");
  return Buffer.concat([Buffer.from(len, "ascii"), payload]);
}

function consumePackets(buf) {
  const packets = [];
  let offset = 0;
  while (offset + 4 <= buf.length) {
    const hex = buf.subarray(offset, offset + 4).toString("ascii");
    if (!/^[0-9a-fA-F]{4}$/.test(hex)) break;
    if (hex === "0000") {
      packets.push({ flush: true });
      offset += 4;
      continue;
    }
    const len = parseInt(hex, 16);
    if (!Number.isFinite(len) || len < 4 || offset + len > buf.length) break;
    packets.push({ data: buf.subarray(offset + 4, offset + len) });
    offset += len;
  }
  return { packets, offset };
}

async function sshReceivePack(privateKey, packfile, oldSha, newSha) {
  const { Client } = await import("ssh2");
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => {
      conn.end();
      reject(new Error("曲目保存逾時，請再試一次。"));
    }, 28000);
    const fail = (error) => {
      clearTimeout(timeout);
      conn.end();
      reject(error);
    };
    conn.on("error", fail);
    conn.on("ready", () => {
      conn.exec(`git-receive-pack '${REPO}.git'`, (err, stream) => {
        if (err) return fail(err);
        let buf = Buffer.alloc(0);
        let sent = false;
        const chunks = [];
        const trySend = () => {
          if (sent) return;
          const parsed = consumePackets(buf);
          if (!parsed.packets.some((packet) => packet.flush)) return;
          sent = true;
          const cmd = `${oldSha} ${newSha} refs/heads/${BRANCH}\0 report-status side-band-64k ofs-delta agent=zhaowu-r130\n`;
          stream.write(pkt(cmd));
          stream.write(Buffer.from("0000"));
          stream.write(packfile);
          stream.end();
        };
        stream.on("data", (d) => {
          buf = Buffer.concat([buf, d]);
          chunks.push(d);
          trySend();
        });
        stream.stderr.on("data", (d) => chunks.push(d));
        stream.on("close", (code) => {
          clearTimeout(timeout);
          conn.end();
          const out = Buffer.concat(chunks).toString("utf8");
          if (/ng refs\/heads\/owner-music/.test(out) || (!/ok refs\/heads\/owner-music/.test(out) && !/unpack ok/.test(out))) {
            // `out` is the raw git-receive-pack pkt-line stream: when the
            // failure happens before our push command is ever acknowledged
            // (auth hiccup, dropped connection, stale tip), it is just the
            // tail of the connection's *initial ref advertisement* — every
            // branch in the repo, e.g. refs/heads/visual-baseline/today-
            // regression, plus raw commit SHAs — not a human-readable
            // rejection reason. Dumping that raw tail verbatim into the
            // owner-facing error banner (pre-fix) showed exactly that kind
            // of meaningless, alarming garbage. Log the full response
            // server-side only (Vercel function logs) and give the owner a
            // clean, bounded message instead.
            console.error(`[owner-music] git-receive-pack push to refs/heads/${BRANCH} rejected (exit ${code}): ${out.slice(-1500)}`);
            // "cannot lock ref ... is at <sha> but expected <sha>": the tip we read through the
            // GitHub REST API was stale (a previous push had just landed). GitHub tells us the
            // real tip, so the caller can rebuild on top of it instead of failing the upload.
            const actual = /is at ([0-9a-f]{40}) but expected/.exec(out);
            reject(Object.assign(new Error("曲目保存失敗，請稍後再試一次；若持續失敗請截圖聯絡站主排查。"), { actualTip: actual ? actual[1] : undefined }));
            return;
          }
          resolve({ code, out });
        });
      });
    });
    conn.connect({
      host: "github.com",
      username: "git",
      privateKey,
      readyTimeout: 15000,
    });
  });
}

const TMP_PREFIX = "zw-music-";

function sweepStaleTmp() {
  // A timed-out invocation never reaches `finally`, and warm Vercel instances
  // keep /tmp. Remove leftovers older than 2 minutes so they cannot fill it.
  try {
    const root = os.tmpdir();
    for (const name of fs.readdirSync(root)) {
      if (!name.startsWith(TMP_PREFIX)) continue;
      const full = path.join(root, name);
      try {
        if (Date.now() - fs.statSync(full).mtimeMs > 120000) fs.rmSync(full, { recursive: true, force: true });
      } catch { /* best effort */ }
    }
  } catch { /* best effort */ }
}

// isomorphic-git's fetch has no partial-clone filter: even with depth:1 and
// singleBranch it downloads every blob reachable from the tip commit, i.e.
// the whole ~150MB library on every single-track edit. That full transfer
// (not just the old checkout step) is what kept costing ENOSPC/timeouts
// after the r223 fix. The repo is public, so instead we read the tree
// structure and any file we actually need through GitHub's read-only Git
// Data REST API (ref + a recursive tree listing are pure metadata; blob
// content is fetched only for paths we read). No git fetch, no blob
// download for the ~69 unrelated existing tracks, ever.
const GITHUB_API = `https://api.github.com/repos/${REPO}`;
const GH_HEADERS = { "user-agent": "zhaowu-owner-music", accept: "application/vnd.github+json" };

async function ghJson(urlPath) {
  const res = await fetch(`${GITHUB_API}${urlPath}`, { headers: GH_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${urlPath} 讀取失敗（HTTP ${res.status}）`);
  return res.json();
}

async function fetchBranchTreeMap(tipOverride) {
  let tip = tipOverride;
  if (!tip) {
    const ref = await ghJson(`/git/refs/heads/${BRANCH}?t=${Date.now()}`);
    tip = ref?.object?.sha;
  }
  if (!tip) throw new Error("找不到 owner-music 分支。");
  const data = await ghJson(`/git/trees/${tip}?recursive=1`);
  if (data.truncated) throw new Error("曲庫結構過大，無法讀取。");
  const treeMap = new Map();
  for (const entry of data.tree || []) {
    if (entry.type === "blob" || entry.type === "tree") {
      treeMap.set(entry.path, { mode: entry.mode, type: entry.type, sha: entry.sha });
    }
  }
  return { tip, treeMap };
}

async function withRepo(fn) {
  // Git and SSH are write-path-only. Public music GETs must not evaluate
  // any of these dependencies.
  //
  // The working tree is never checked out and only NEW objects (the changed
  // blob(s), the touched tree spine, and the commit) are written locally,
  // packed and pushed, so /tmp use and upload size no longer scale with the
  // library.
  sweepStaleTmp();
  const git = await loadGitRuntime();
  let tipOverride;
  for (let attempt = 0; ; attempt += 1) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));
    try {
      await git.init({ fs, dir, defaultBranch: BRANCH });
      const { tip, treeMap } = await fetchBranchTreeMap(tipOverride);
      return await fn({ git, dir, tip, treeMap });
    } catch (error) {
      // Stale-tip race (see sshReceivePack): rebuild the whole operation on GitHub's real tip.
      if (error?.actualTip && attempt < 3 && error.actualTip !== tipOverride) {
        tipOverride = error.actualTip;
        continue;
      }
      throw error;
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
}

function childrenAt(treeMap, dirPath) {
  const prefix = dirPath ? `${dirPath}/` : "";
  const byName = new Map();
  for (const [entryPath, entry] of treeMap) {
    if (!entryPath.startsWith(prefix)) continue;
    const rest = entryPath.slice(prefix.length);
    if (!rest || rest.includes("/")) continue; // not a direct child of dirPath
    byName.set(rest, { mode: entry.mode, path: rest, oid: entry.sha, type: entry.type });
  }
  return byName;
}

async function readFileAt(repo, filepath) {
  const entry = repo.treeMap.get(filepath);
  if (!entry || entry.type !== "blob") return null;
  const data = await ghJson(`/git/blobs/${entry.sha}`);
  if (data.encoding !== "base64") throw new Error("曲目資料編碼不支援。");
  return Buffer.from(data.content, "base64");
}

async function listDirAt(repo, dirPath) {
  return [...childrenAt(repo.treeMap, dirPath).keys()];
}

async function readManifestAt(repo) {
  const buf = await readFileAt(repo, MANIFEST_PATH);
  if (!buf) throw new Error("找不到曲目清單（owner-manifest.json）。");
  return JSON.parse(buf.toString("utf8"));
}

function manifestBuffer(manifest) {
  return Buffer.from(`${JSON.stringify({
    version: 1,
    activeId: manifest.activeId || null,
    tracks: manifest.tracks || [],
  })}\n`);
}

// changes: Map<repo-relative path, Buffer | null(delete)>. Builds the new tree
// from repo.treeMap (sourced via the GitHub REST API, not a git fetch) without
// a working directory, referencing every untouched sibling by its existing
// oid rather than reading it, and returns the new commit oid.
async function commitChanges(repo, privateKey, message, changes, push = sshReceivePack) {
  const { git, dir, tip, treeMap } = repo;
  const newOids = new Set();

  async function rewrite(dirPath, pending) {
    const byName = childrenAt(treeMap, dirPath);
    const groups = new Map();
    for (const [p, value] of pending) {
      const slash = p.indexOf("/");
      if (slash < 0) {
        if (value == null) {
          byName.delete(p);
        } else {
          const oid = await git.writeBlob({ fs, dir, blob: value });
          newOids.add(oid);
          byName.set(p, { mode: "100644", path: p, oid, type: "blob" });
        }
      } else {
        const seg = p.slice(0, slash);
        if (!groups.has(seg)) groups.set(seg, new Map());
        groups.get(seg).set(p.slice(slash + 1), value);
      }
    }
    for (const [seg, sub] of groups) {
      const childPath = dirPath ? `${dirPath}/${seg}` : seg;
      const nextOid = await rewrite(childPath, sub);
      if (nextOid === null) byName.delete(seg);
      else byName.set(seg, { mode: "040000", path: seg, oid: nextOid, type: "tree" });
    }
    if (!byName.size) return null;
    const oid = await git.writeTree({ fs, dir, tree: [...byName.values()] });
    newOids.add(oid);
    return oid;
  }

  const treeOid = await rewrite("", changes);
  if (!treeOid) throw new Error("曲目庫不可為空樹。");
  const who = { name: "zhaowu-owner", email: "owner@zhaowu.local", timestamp: Math.floor(Date.now() / 1000), timezoneOffset: 0 };
  const newSha = await git.writeCommit({
    fs,
    dir,
    commit: { message: `${message}\n`, tree: treeOid, parent: [tip], author: who, committer: who },
  });
  newOids.add(newSha);
  const packed = await git.packObjects({ fs, dir, oids: [...newOids] });
  const packfile = Buffer.from(packed.packfile || packed);
  try {
    await push(privateKey, packfile, tip, newSha);
  } catch (error) {
    // The SSH reply is sometimes missing/unparsable even though GitHub already
    // accepted the push (the commit lands on the branch, but the upload was
    // reported as failed and the client aborted the remaining chunks). The
    // branch tip is the source of truth: if it is our commit, the push worked.
    if (await branchTipIs(newSha)) return newSha;
    throw error;
  }
  return newSha;
}

async function branchTipIs(sha) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const ref = await ghJson(`/git/refs/heads/${BRANCH}`);
      if (ref?.object?.sha === sha) return true;
    } catch { /* retry */ }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  return false;
}

function newTrackRecord(id, filename, file, size) {
  return {
    id,
    name: file.name,
    filename,
    url: publicTrackUrl(filename, id),
    contentType: file.contentType,
    fileSize: size,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
}

async function addTrackCommit(repo, privateKey, file, buffer, extraChanges = new Map()) {
  const id = randomBytes(8).toString("hex");
  const filename = `${id}${file.ext}`;
  const manifest = await readManifestAt(repo);
  const track = newTrackRecord(id, filename, file, buffer.length);
  const tracks = (Array.isArray(manifest.tracks) ? manifest.tracks : []).map((row) => ({ ...row, enabled: false }));
  tracks.unshift(track);
  const next = { version: 1, activeId: id, tracks };
  const changes = new Map(extraChanges);
  changes.set(`${TRACK_DIR}/${filename}`, buffer);
  changes.set(MANIFEST_PATH, manifestBuffer(next));
  const commitSha = await commitChanges(repo, privateKey, `owner-music: add ${filename}`, changes);
  track.url = publicTrackUrl(filename, commitSha);
  next.commitSha = commitSha;
  return next;
}

export async function saveOwnerMusicTrack(secret, file) {
  const privateKey = decryptOwnerSshKey(secret);
  return withRepo((repo) => addTrackCommit(repo, privateKey, file, file.buffer));
}

export async function activateOwnerMusicTrack(secret, trackId) {
  const privateKey = decryptOwnerSshKey(secret);
  return withRepo(async (repo) => {
    const manifest = await readManifestAt(repo);
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    if (!tracks.some((row) => row.id === trackId)) throw new Error("找不到這首曲目。");
    const next = {
      version: 1,
      activeId: trackId,
      tracks: tracks.map((row) => ({ ...row, enabled: row.id === trackId })),
    };
    next.commitSha = await commitChanges(repo, privateKey, `owner-music: activate ${trackId}`, new Map([[MANIFEST_PATH, manifestBuffer(next)]]));
    return next;
  });
}

export async function renameOwnerMusicTrack(secret, trackId, nextName) {
  const privateKey = decryptOwnerSshKey(secret);
  const cleaned = String(nextName || "").replace(/[\\/]/g, "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (!cleaned) throw new Error("曲目名稱不能留空。");
  return withRepo(async (repo) => {
    const manifest = await readManifestAt(repo);
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    if (!tracks.some((row) => row.id === trackId)) throw new Error("找不到這首曲目。");
    const next = {
      version: 1,
      activeId: manifest.activeId || null,
      tracks: tracks.map((row) => row.id === trackId ? { ...row, name: cleaned } : row),
    };
    next.commitSha = await commitChanges(repo, privateKey, `owner-music: rename ${trackId}`, new Map([[MANIFEST_PATH, manifestBuffer(next)]]));
    return next;
  });
}

export async function deleteOwnerMusicTracks(secret, trackIds) {
  const privateKey = decryptOwnerSshKey(secret);
  const ids = [...new Set((Array.isArray(trackIds) ? trackIds : []).map((value) => String(value || "").trim()).filter(Boolean))].slice(0, 100);
  if (!ids.length) throw new Error("請先選擇要刪除的曲目。");
  return withRepo(async (repo) => {
    const manifest = await readManifestAt(repo);
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    const existing = new Map(tracks.map((row) => [row.id, row]));
    const missing = ids.filter((id) => !existing.has(id));
    if (missing.length) throw new Error("部分曲目已不存在，請刷新後再試。");
    if (manifest.activeId && ids.includes(manifest.activeId)) throw new Error("目前播放中的曲目不能批量刪除，請先改播其他曲目。");
    const changes = new Map();
    for (const id of ids) changes.set(`${TRACK_DIR}/${existing.get(id).filename}`, null);
    const next = {
      version: 1,
      activeId: manifest.activeId || null,
      tracks: tracks.filter((row) => !ids.includes(row.id)),
    };
    changes.set(MANIFEST_PATH, manifestBuffer(next));
    next.commitSha = await commitChanges(repo, privateKey, `owner-music: delete ${ids.length} tracks`, changes);
    return next;
  });
}

export async function deleteOwnerMusicTrack(secret, trackId) {
  const privateKey = decryptOwnerSshKey(secret);
  return withRepo(async (repo) => {
    const manifest = await readManifestAt(repo);
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    const target = tracks.find((row) => row.id === trackId);
    if (!target) throw new Error("找不到這首曲目。");
    if (manifest.activeId === trackId) throw new Error("請先改播其他曲目再刪除。");
    const next = {
      version: 1,
      activeId: manifest.activeId || null,
      tracks: tracks.filter((row) => row.id !== trackId),
    };
    const changes = new Map([
      [`${TRACK_DIR}/${target.filename}`, null],
      [MANIFEST_PATH, manifestBuffer(next)],
    ]);
    next.commitSha = await commitChanges(repo, privateKey, `owner-music: delete ${trackId}`, changes);
    return next;
  });
}

function safeUploadId(value) {
  const id = String(value || "").trim();
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id) ? id : "";
}

export async function saveOwnerMusicChunk(secret, file) {
  const privateKey = decryptOwnerSshKey(secret);
  const uploadId = safeUploadId(file.uploadId);
  if (!uploadId) throw new Error("上傳識別無效。");
  const index = Number(file.chunkIndex);
  const total = Number(file.chunkTotal);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index < 0 || total < 1 || index >= total || total > 8) {
    throw new Error("分塊上傳參數無效。");
  }
  if (!file.buffer?.length) throw new Error("EMPTY_AUDIO");
  if (file.buffer.length > 3.6 * 1024 * 1024) throw new Error("AUDIO_TOO_LARGE");

  return withRepo(async (repo) => {
    const relDir = `${SCRATCH_DIR}/${uploadId}`;
    const partName = (i) => `${String(i).padStart(3, "0")}.part`;
    const existingNames = new Set(await listDirAt(repo, relDir));
    existingNames.add(partName(index));
    const presentCount = [...Array(total).keys()].filter((i) => existingNames.has(partName(i))).length;
    if (presentCount < total) {
      await commitChanges(repo, privateKey, `owner-music: chunk ${uploadId} ${index + 1}/${total}`, new Map([[`${relDir}/${partName(index)}`, file.buffer]]));
      return { pending: true, received: presentCount, total };
    }

    const parts = [];
    for (let i = 0; i < total; i += 1) {
      if (i === index) { parts.push(file.buffer); continue; }
      const buf = await readFileAt(repo, `${relDir}/${partName(i)}`);
      if (!buf) throw new Error("分塊資料遺失，請重新上傳。");
      parts.push(buf);
    }
    const combined = Buffer.concat(parts);
    if (combined.length > MAX_BYTES) throw new Error("AUDIO_TOO_LARGE");
    const cleanup = new Map();
    for (const name of existingNames) cleanup.set(`${relDir}/${name}`, null);
    return addTrackCommit(repo, privateKey, file, combined, cleanup);
  });
}

// Exposed for scripts/owner-music-git-plumbing.test.mjs (no network / no ssh).
export const __plumbing = { commitChanges, readFileAt, listDirAt, readManifestAt, manifestBuffer, loadGitRuntime };
