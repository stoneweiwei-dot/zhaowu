import { randomBytes } from "node:crypto";
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

// Server-only GitHub contents credential. Never commit a key, passphrase, or ciphertext.
const TOKEN_ENV = "ZHAOWU_OWNER_MUSIC_GITHUB_TOKEN";
const OWNER_SAVE_FAILED = "曲目保存失敗，請稍後再試一次；若持續失敗請截圖聯絡站主排查。";
const OWNER_TOKEN_MISSING = "曲目保存尚未設定伺服器憑證，請先在主機設定寫入權杖。";
const OWNER_TOKEN_REJECTED = "曲目保存憑證被拒絕，請確認主機寫入權杖。";

const GITHUB_API = `https://api.github.com/repos/${REPO}`;
const GH_HEADERS = { "user-agent": "zhaowu-owner-music", accept: "application/vnd.github+json" };

function ownerSaveError(extra) {
  return Object.assign(new Error(OWNER_SAVE_FAILED), extra || {});
}

function musicWriteToken() {
  const token = String(process.env[TOKEN_ENV] || "").trim();
  if (token.length < 20 || /[\s]/.test(token)) {
    console.error("[owner-music] write credential missing");
    const error = new Error(OWNER_TOKEN_MISSING);
    error.code = "MUSIC_WRITE_UNCONFIGURED";
    throw error;
  }
  return token;
}

// The password session is already checked by the write API. The value is not a
// decryption key and is never logged, hashed into a store, or sent to GitHub.
function assertOwnerWriteSecret(secret) {
  if (typeof secret !== "string" || secret.length < 8) {
    throw new Error("曲目保存需要站主密碼登入。");
  }
}

async function ghJson(urlPath) {
  const res = await fetch(`${GITHUB_API}${urlPath}`, { headers: GH_HEADERS });
  if (!res.ok) throw new Error(`GitHub ${urlPath} 讀取失敗（HTTP ${res.status}）`);
  return res.json();
}

async function ghWrite(urlPath, method, body) {
  const token = musicWriteToken();
  let res;
  try {
    res = await fetch(`${GITHUB_API}${urlPath}`, {
      method,
      redirect: "manual",
      headers: {
        ...GH_HEADERS,
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    console.error(`[owner-music] GitHub ${method} ${urlPath} request failed`);
    throw ownerSaveError();
  }
  if (res.status >= 300 && res.status < 400) {
    console.error(`[owner-music] GitHub ${method} ${urlPath} redirected HTTP ${res.status}`);
    throw ownerSaveError();
  }
  const raw = typeof res.text === "function" ? await res.text() : "";
  let data = {};
  if (raw) {
    try { data = JSON.parse(raw); } catch { data = {}; }
  }
  if (!res.ok) {
    console.error(`[owner-music] GitHub ${method} ${urlPath} failed HTTP ${res.status}`);
    if (res.status === 401 || res.status === 403) throw new Error(OWNER_TOKEN_REJECTED);
    const error = ownerSaveError();
    if (res.status === 422 && urlPath.includes("/git/refs/")) {
      try {
        const ref = await ghJson(`/git/refs/heads/${BRANCH}?t=${Date.now()}`);
        if (ref?.object?.sha) error.actualTip = ref.object.sha;
      } catch { /* withRepo still stops after the bounded retries */ }
    }
    throw error;
  }
  return data;
}

async function fetchBranchTreeMap(tipOverride) {
  let tip = tipOverride;
  if (!tip) {
    const ref = await ghJson(`/git/refs/heads/${BRANCH}?t=${Date.now()}`);
    tip = ref?.object?.sha;
  }
  if (!tip) throw new Error("找不到 owner-music 分支。");
  // GET /git/trees/{commit}?recursive=1 echoes the commit SHA, not the tree.
  // base_tree must be the tree object from the commit.
  const commit = await ghJson(`/git/commits/${tip}`);
  const rootTreeSha = commit?.tree?.sha;
  if (!rootTreeSha) throw new Error("找不到曲庫版本，無法保存。");
  const data = await ghJson(`/git/trees/${rootTreeSha}?recursive=1`);
  if (data.truncated) throw new Error("曲庫結構過大，無法讀取。");
  const treeMap = new Map();
  for (const entry of data.tree || []) {
    if (entry.type === "blob" || entry.type === "tree") {
      treeMap.set(entry.path, { mode: entry.mode, type: entry.type, sha: entry.sha });
    }
  }
  return { tip, treeMap, rootTreeSha };
}

async function withRepo(fn) {
  // Public music GETs never enter this module. Writes read the public tree,
  // then publish only the changed blobs through the Git Data API.
  let tipOverride;
  for (let attempt = 0; ; attempt += 1) {
    try {
      const repo = await fetchBranchTreeMap(tipOverride);
      return await fn(repo);
    } catch (error) {
      // Stale-tip race: rebuild the whole operation on GitHub's real tip.
      if (error?.actualTip && attempt < 3 && error.actualTip !== tipOverride) {
        tipOverride = error.actualTip;
        continue;
      }
      throw error;
    }
  }
}

function childrenAt(treeMap, dirPath) {
  const prefix = dirPath ? `${dirPath}/` : "";
  const byName = new Map();
  for (const [entryPath, entry] of treeMap) {
    if (!entryPath.startsWith(prefix)) continue;
    const rest = entryPath.slice(prefix.length);
    if (!rest || rest.includes("/")) continue;
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

// changes: Map<repo-relative path, Buffer | null(delete)>.
// Untouched files stay on base_tree and are never re-uploaded.
async function commitChanges(repo, message, changes) {
  if (!repo?.rootTreeSha) throw new Error("找不到曲庫版本，無法保存。");
  const entries = [];
  for (const [filePath, value] of changes) {
    if (value == null) {
      entries.push({ path: filePath, mode: "100644", type: "blob", sha: null });
      continue;
    }
    const created = await ghWrite("/git/blobs", "POST", {
      content: Buffer.from(value).toString("base64"),
      encoding: "base64",
    });
    if (!created?.sha) throw ownerSaveError();
    entries.push({ path: filePath, mode: "100644", type: "blob", sha: created.sha });
  }
  const tree = await ghWrite("/git/trees", "POST", {
    base_tree: repo.rootTreeSha,
    tree: entries,
  });
  if (!tree?.sha) throw ownerSaveError();
  const who = { name: "zhaowu-owner", email: "owner@zhaowu.local" };
  const commit = await ghWrite("/git/commits", "POST", {
    message: `${message}\n`,
    tree: tree.sha,
    parents: [repo.tip],
    author: who,
    committer: who,
  });
  const newSha = commit?.sha;
  if (!newSha) throw ownerSaveError();
  try {
    await ghWrite(`/git/refs/heads/${BRANCH}`, "PATCH", { sha: newSha });
  } catch (error) {
    if (error?.message !== OWNER_SAVE_FAILED) throw error;
    if (error.actualTip && error.actualTip !== newSha) throw error;
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

async function addTrackCommit(repo, file, buffer, extraChanges = new Map()) {
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
  const commitSha = await commitChanges(repo, `owner-music: add ${filename}`, changes);
  track.url = publicTrackUrl(filename, commitSha);
  next.commitSha = commitSha;
  return next;
}

export async function saveOwnerMusicTrack(secret, file) {
  assertOwnerWriteSecret(secret);
  return withRepo((repo) => addTrackCommit(repo, file, file.buffer));
}

export async function activateOwnerMusicTrack(secret, trackId) {
  assertOwnerWriteSecret(secret);
  return withRepo(async (repo) => {
    const manifest = await readManifestAt(repo);
    const tracks = Array.isArray(manifest.tracks) ? manifest.tracks : [];
    if (!tracks.some((row) => row.id === trackId)) throw new Error("找不到這首曲目。");
    const next = {
      version: 1,
      activeId: trackId,
      tracks: tracks.map((row) => ({ ...row, enabled: row.id === trackId })),
    };
    next.commitSha = await commitChanges(repo, `owner-music: activate ${trackId}`, new Map([[MANIFEST_PATH, manifestBuffer(next)]]));
    return next;
  });
}

export async function renameOwnerMusicTrack(secret, trackId, nextName) {
  assertOwnerWriteSecret(secret);
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
    next.commitSha = await commitChanges(repo, `owner-music: rename ${trackId}`, new Map([[MANIFEST_PATH, manifestBuffer(next)]]));
    return next;
  });
}

export async function deleteOwnerMusicTracks(secret, trackIds) {
  assertOwnerWriteSecret(secret);
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
    next.commitSha = await commitChanges(repo, `owner-music: delete ${ids.length} tracks`, changes);
    return next;
  });
}

export async function deleteOwnerMusicTrack(secret, trackId) {
  assertOwnerWriteSecret(secret);
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
    next.commitSha = await commitChanges(repo, `owner-music: delete ${trackId}`, changes);
    return next;
  });
}

function safeUploadId(value) {
  const id = String(value || "").trim();
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id) ? id : "";
}

export async function saveOwnerMusicChunk(secret, file) {
  assertOwnerWriteSecret(secret);
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
      await commitChanges(repo, `owner-music: chunk ${uploadId} ${index + 1}/${total}`, new Map([[`${relDir}/${partName(index)}`, file.buffer]]));
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
    return addTrackCommit(repo, file, combined, cleanup);
  });
}

export const __plumbing = { withRepo, commitChanges, readFileAt, listDirAt, readManifestAt, manifestBuffer };

/** Persist the owner's public visual selection without changing main or audio assets. */
export async function saveSharedSiteSkin(secret, skin) {
  assertOwnerWriteSecret(secret);
  const { SITE_SKIN_PATH, validSiteSkin } = await import("./owner-site-skin-public.js");
  if (!validSiteSkin(skin)) throw new Error("未知主題皮膚，未儲存。");
  return withRepo(async (repo) => {
    const record = { skin, updatedAt: new Date().toISOString() };
    const buffer = Buffer.from(JSON.stringify(record) + "\n", "utf8");
    const sha = await commitChanges(repo, `site-skin: publish ${skin}`, new Map([[SITE_SKIN_PATH, buffer]]));
    return { ...record, revision: sha };
  });
}
