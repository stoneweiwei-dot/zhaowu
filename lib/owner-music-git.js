import { createDecipheriv, createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { Client } from "ssh2";

export const REPO = "stoneweiwei-dot/zhaowu";
export const BRANCH = "owner-music";
export const MANIFEST_PATH = "public/audio/owner-manifest.json";
export const TRACK_DIR = "public/audio/tracks";
export const MAX_BYTES = 12 * 1024 * 1024;
export const SCRATCH_DIR = "public/audio/scratch";
const KEY_SALT = "zhaowu-music-ssh-v1";
const EMPTY_SHA = "0".repeat(40);
const sealedKey = JSON.parse(fs.readFileSync(new URL("./owner-music-ssh.json", import.meta.url), "utf8"));

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

function sshReceivePack(privateKey, packfile, oldSha, newSha) {
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
          if (!/ok refs\/heads\/owner-music/.test(out) && !/unpack ok/.test(out)) {
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

function treeEntries(object) {
  if (Array.isArray(object)) return object;
  if (object && Array.isArray(object.entries)) return object.entries;
  return [];
}

async function listCommitOids(dir, commitSha) {
  const seen = new Set([commitSha]);
  async function walk(oid) {
    if (seen.has(oid)) return;
    seen.add(oid);
    const obj = await git.readObject({ fs, dir, oid });
    if (obj.type === "tree") {
      for (const entry of treeEntries(obj.object)) await walk(entry.oid);
    }
  }
  const commit = await git.readCommit({ fs, dir, oid: commitSha });
  await walk(commit.commit.tree);
  return [...seen];
}

async function withRepo(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zw-music-"));
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
    });
    await git.checkout({ fs, dir, ref: `origin/${BRANCH}`, force: true });
    await git.branch({ fs, dir, ref: BRANCH, checkout: true, force: true });
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function emptyManifest() {
  return { version: 1, activeId: null, tracks: [] };
}

export function publicTrackUrl(filename, version) {
  const qs = version ? `?v=${encodeURIComponent(version)}` : "";
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${TRACK_DIR}/${filename}${qs}`;
}

export async function readOwnerMusicManifest() {
  const info = await git.getRemoteInfo({
    http,
    url: `https://github.com/${REPO}.git`,
  });
  const sha = info?.refs?.heads?.[BRANCH];
  if (!sha) return emptyManifest();
  const url = `https://raw.githubusercontent.com/${REPO}/${sha}/${MANIFEST_PATH}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return emptyManifest();
  const body = await res.json().catch(() => null);
  if (!body || typeof body !== "object") return emptyManifest();
  const tracks = Array.isArray(body.tracks) ? body.tracks : [];
  return {
    version: 1,
    activeId: body.activeId ? String(body.activeId) : null,
    tracks,
    commitSha: sha,
  };
}

async function commitAndPush(dir, privateKey, message) {
  const oldSha = await git.resolveRef({ fs, dir, ref: "HEAD" }).catch(() => EMPTY_SHA);
  const newSha = await git.commit({
    fs,
    dir,
    message,
    author: { name: "zhaowu-owner", email: "owner@zhaowu.local" },
  });
  const oids = await listCommitOids(dir, newSha);
  const packed = await git.packObjects({ fs, dir, oids });
  const packfile = Buffer.from(packed.packfile || packed);
  await sshReceivePack(privateKey, packfile, oldSha, newSha);
  return newSha;
}

function writeManifestFile(dir, manifest) {
  const payload = {
    version: 1,
    activeId: manifest.activeId || null,
    tracks: manifest.tracks || [],
  };
  fs.mkdirSync(path.join(dir, "public/audio/tracks"), { recursive: true });
  fs.writeFileSync(path.join(dir, MANIFEST_PATH), `${JSON.stringify(payload)}\n`);
}

export async function saveOwnerMusicTrack(secret, file) {
  const privateKey = decryptOwnerSshKey(secret);
  const id = randomBytes(8).toString("hex");
  const ext = file.ext;
  const filename = `${id}${ext}`;
  return withRepo(async (dir) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_PATH), "utf8"));
    fs.mkdirSync(path.join(dir, TRACK_DIR), { recursive: true });
    fs.writeFileSync(path.join(dir, TRACK_DIR, filename), file.buffer);
    const createdAt = new Date().toISOString();
    const track = {
      id,
      name: file.name,
      filename,
      url: publicTrackUrl(filename, id),
      contentType: file.contentType,
      fileSize: file.buffer.length,
      enabled: true,
      createdAt,
    };
    const tracks = (Array.isArray(manifest.tracks) ? manifest.tracks : []).map((row) => ({
      ...row,
      enabled: false,
    }));
    tracks.unshift(track);
    const next = { version: 1, activeId: id, tracks };
    writeManifestFile(dir, next);
    await git.add({ fs, dir, filepath: `${TRACK_DIR}/${filename}` });
    await git.add({ fs, dir, filepath: MANIFEST_PATH });
    const commitSha = await commitAndPush(dir, privateKey, `owner-music: add ${filename}`);
    track.url = publicTrackUrl(filename, commitSha);
    next.commitSha = commitSha;
    return next;
  });
}

export async function activateOwnerMusicTrack(secret, trackId) {
  const privateKey = decryptOwnerSshKey(secret);
  return withRepo(async (dir) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_PATH), "utf8"));
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    if (!tracks.some((row) => row.id === trackId)) throw new Error("找不到這首曲目。");
    const next = {
      version: 1,
      activeId: trackId,
      tracks: tracks.map((row) => ({ ...row, enabled: row.id === trackId })),
    };
    writeManifestFile(dir, next);
    await git.add({ fs, dir, filepath: MANIFEST_PATH });
    const commitSha = await commitAndPush(dir, privateKey, `owner-music: activate ${trackId}`);
    next.commitSha = commitSha;
    return next;
  });
}

export async function deleteOwnerMusicTrack(secret, trackId) {
  const privateKey = decryptOwnerSshKey(secret);
  return withRepo(async (dir) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_PATH), "utf8"));
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    const target = tracks.find((row) => row.id === trackId);
    if (!target) throw new Error("找不到這首曲目。");
    if (manifest.activeId === trackId) throw new Error("請先改播其他曲目再刪除。");
    const filepath = `${TRACK_DIR}/${target.filename}`;
    const abs = path.join(dir, filepath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
    try { await git.remove({ fs, dir, filepath }); } catch {}
    const next = {
      version: 1,
      activeId: manifest.activeId || null,
      tracks: tracks.filter((row) => row.id !== trackId),
    };
    writeManifestFile(dir, next);
    await git.add({ fs, dir, filepath: MANIFEST_PATH });
    const commitSha = await commitAndPush(dir, privateKey, `owner-music: delete ${trackId}`);
    next.commitSha = commitSha;
    return next;
  });
}

function safeUploadId(value) {
  const id = String(value || "").trim();
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id) ? id : "";
}

async function removeScratch(dir, uploadId) {
  const rel = `${SCRATCH_DIR}/${uploadId}`;
  const abs = path.join(dir, rel);
  if (!fs.existsSync(abs)) return;
  for (const name of fs.readdirSync(abs)) {
    const filepath = `${rel}/${name}`;
    fs.unlinkSync(path.join(dir, filepath));
    try { await git.remove({ fs, dir, filepath }); } catch {}
  }
  fs.rmdirSync(abs);
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

  return withRepo(async (dir) => {
    const relDir = `${SCRATCH_DIR}/${uploadId}`;
    fs.mkdirSync(path.join(dir, relDir), { recursive: true });
    const partName = `${String(index).padStart(3, "0")}.part`;
    fs.writeFileSync(path.join(dir, relDir, partName), file.buffer);
    await git.add({ fs, dir, filepath: `${relDir}/${partName}` });

    const present = [];
    for (let i = 0; i < total; i += 1) {
      const partPath = path.join(dir, relDir, `${String(i).padStart(3, "0")}.part`);
      if (fs.existsSync(partPath)) present.push(partPath);
    }
    if (present.length < total) {
      await commitAndPush(dir, privateKey, `owner-music: chunk ${uploadId} ${index + 1}/${total}`);
      return { pending: true, received: present.length, total };
    }

    const combined = Buffer.concat(present.map((partPath) => fs.readFileSync(partPath)));
    if (combined.length > MAX_BYTES) throw new Error("AUDIO_TOO_LARGE");

    const id = randomBytes(8).toString("hex");
    const ext = file.ext;
    const filename = `${id}${ext}`;
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_PATH), "utf8"));
    fs.mkdirSync(path.join(dir, TRACK_DIR), { recursive: true });
    fs.writeFileSync(path.join(dir, TRACK_DIR, filename), combined);
    const createdAt = new Date().toISOString();
    const track = {
      id,
      name: file.name,
      filename,
      url: publicTrackUrl(filename, id),
      contentType: file.contentType,
      fileSize: combined.length,
      enabled: true,
      createdAt,
    };
    const tracks = (Array.isArray(manifest.tracks) ? manifest.tracks : []).map((row) => ({
      ...row,
      enabled: false,
    }));
    tracks.unshift(track);
    const next = { version: 1, activeId: id, tracks };
    writeManifestFile(dir, next);
    await git.add({ fs, dir, filepath: `${TRACK_DIR}/${filename}` });
    await git.add({ fs, dir, filepath: MANIFEST_PATH });
    await removeScratch(dir, uploadId);
    const commitSha = await commitAndPush(dir, privateKey, `owner-music: add ${filename}`);
    track.url = publicTrackUrl(filename, commitSha);
    next.commitSha = commitSha;
    return next;
  });
}
