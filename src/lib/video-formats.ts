/**
 * Login-animation video formats (r218, owner instruction 2026-09-28: every mainstream
 * video format must upload, including iPhone screen recordings which are .MOV).
 *
 * Upload acceptance and browser playback are different things: the formats in
 * BROWSER_PLAYABLE play natively in Safari/Chrome; the rest are stored as-is and the
 * login page falls back to its poster/built-in clip if the viewing browser cannot decode
 * them (no server-side transcoding is used, keeping infrastructure at zero cost).
 */
export const LOGIN_VIDEO_TYPES_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  qt: "video/quicktime",
  webm: "video/webm",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  mkv: "video/x-matroska",
  ogv: "video/ogg",
  avi: "video/x-msvideo",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  mpg: "video/mpeg",
  mpeg: "video/mpeg",
  ts: "video/mp2t",
  mts: "video/mp2t",
  m2ts: "video/mp2t",
};

export const LOGIN_VIDEO_MIME_TYPES = Array.from(new Set([
  ...Object.values(LOGIN_VIDEO_TYPES_BY_EXTENSION),
  "video/avi",
  "video/msvideo",
]));

export const BROWSER_PLAYABLE_VIDEO_TYPES = [
  "video/mp4",
  "video/x-m4v",
  "video/quicktime",
  "video/webm",
  "video/3gpp",
  "video/3gpp2",
  "video/ogg",
];

export const LOGIN_VIDEO_ACCEPT = [
  "video/*",
  ...Object.keys(LOGIN_VIDEO_TYPES_BY_EXTENSION).map((ext) => `.${ext}`),
].join(",");

/** Resolve a canonical MIME type; iOS/Windows often report an empty or aliased file.type. */
export function resolveLoginVideoType(file: { name: string; type: string }): string | null {
  const reported = (file.type || "").toLowerCase();
  if (reported === "video/avi" || reported === "video/msvideo") return "video/x-msvideo";
  if (LOGIN_VIDEO_MIME_TYPES.includes(reported)) return reported;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  return LOGIN_VIDEO_TYPES_BY_EXTENSION[ext] ?? null;
}

export function isBrowserPlayableVideoType(type: string) {
  return BROWSER_PLAYABLE_VIDEO_TYPES.includes(type.toLowerCase());
}
