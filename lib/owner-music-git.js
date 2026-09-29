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
            reject(new Error(`曲目保存失敗。${out.slice(-300) || `ssh ${code}`}`));
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

async function withRepo(fn) {
  // Git, its Node HTTP adapter and SSH are write-path-only. Public music GETs
  // must not evaluate any of these dependencies.
  //
  // Only the branch tip is fetched (pack objects stay inside the git dir). The
  // working tree is never checked out and only NEW objects are packed and
  // pushed, so /tmp use and upload size no longer scale with the library.
  sweepStaleTmp();
  const git = await loadGitRuntime();
  const { default: http } = await import("isomorphic-git/http/node");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));
  try {
    await git.init({ fs, dir, defaultBranch: BRANCH });
    await git.addRemote({ fs, dir, remote: "origin", url: `https://github.com/${REPO}.git` });
    await git.fetch({
      fs,
      http,
      dir,
      url: `https://github.com/${REPO}.git`,
      remote: "origin",
      ref: BRANCH,
      singleBranch: true,
      depth: 1,
      tags: false,
    });
    const tip = await git.resolveRef({ fs, dir, ref: `refs/remotes/origin/${BRANCH}` });
    return await fn({ git, dir, tip });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function readFileAt(repo, filepath) {
  try {
    const { blob } = await repo.git.readBlob({ fs, dir: repo.dir, oid: repo.tip, filepath });
    return Buffer.from(blob);
  } catch {
    return null;
  }
}

async function listDirAt(repo, filepath) {
  try {
    const { tree } = await repo.git.readTree({ fs, dir: repo.dir, oid: repo.tip, filepath });
    return tree.map((entry) => entry.path);
  } catch {
    return [];
  }
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
// from the tip's tree without a working directory and returns the new oids.
async function commitChanges(repo, privateKey, message, changes, push = sshReceivePack) {
  const { git, dir, tip } = repo;
  const newOids = new Set();
  const tipCommit = (await git.readCommit({ fs, dir, oid: tip })).commit;

  async function rewrite(treeOid, pending) {
    const existing = treeOid ? (await git.readTree({ fs, dir, oid: treeOid })).tree : [];
    const byName = new Map(existing.map((e) => [e.path, { mode: e.mode, path: e.path, oid: e.oid, type: e.type }]));
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
      const current = byName.get(seg);
      const nextOid = await rewrite(current && current.type === "tree" ? current.oid : null, sub);
      if (nextOid === null) byName.delete(seg);
      else byName.set(seg, { mode: "040000", path: seg, oid: nextOid, type: "tree" });
    }
    if (!byName.size) return null;
    const oid = await git.writeTree({ fs, dir, tree: [...byName.values()] });
    newOids.add(oid);
    return oid;
  }

  const treeOid = await rewrite(tipCommit.tree, changes);
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
  await push(privateKey, packfile, tip, newSha);
  return newSha;
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
