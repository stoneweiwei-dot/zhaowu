// Web-sized derivatives of the STONE original PNG plates/film.
// Originals stay untouched under /mythic-atlas/{originals,zodiac,films}/ and
// remain the "open full-resolution original" link target. Derivatives live in
// /mythic-atlas/web/ (WebP q80 at native 941px width, 240px thumbnails, 720p
// H.264 film) and are generated from the originals; see
// docs/mythic-atlas/web-derivatives-20261030.md.
export type MythicPlateFolder = "originals" | "zodiac";

export function mythicWebPlate(folder: MythicPlateFolder, pngFile: string): string {
  return `/mythic-atlas/web/${folder}/${pngFile.replace(/\.png$/i, ".webp")}`;
}

export function mythicWebThumb(folder: MythicPlateFolder, pngFile: string): string {
  return `/mythic-atlas/web/${folder}/${pngFile.replace(/\.png$/i, "-thumb.webp")}`;
}

export const MYTHIC_WEB_FILM = "/mythic-atlas/web/films/huangquan-chronicles-720p.mp4";
export const MYTHIC_WEB_FILM_POSTER = "/mythic-atlas/web/films/huangquan-chronicles-poster.webp";
