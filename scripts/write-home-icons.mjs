import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function paintSeal(pixels, size) {
  const set = (x, y, rgb) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    pixels[i] = rgb[0];
    pixels[i + 1] = rgb[1];
    pixels[i + 2] = rgb[2];
  };
  const inside = (x, y, l, t, r, b, rad) => {
    const cx = x < l + rad ? l + rad : x > r - rad ? r - rad : x;
    const cy = y < t + rad ? t + rad : y > b - rad ? b - rad : y;
    if (x >= l + rad && x <= r - rad) return y >= t && y <= b;
    if (y >= t + rad && y <= b - rad) return x >= l && x <= r;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= rad * rad;
  };
  const pad = Math.round(size * 0.13);
  const radius = Math.round(size * 0.08);
  const innerPad = Math.round(size * 0.04);
  const inR = Math.max(2, radius - 2);
  const l = pad;
  const t = pad;
  const rgt = size - pad - 1;
  const btm = size - pad - 1;
  const il = l + innerPad;
  const it = t + innerPad;
  const ir = rgt - innerPad;
  const ib = btm - innerPad;
  const fill = [122, 44, 34];
  const outline = [215, 181, 106];
  const inner = [230, 201, 138];
  const gold = [246, 231, 196];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const wash = 244 - Math.round((y / size) * 14);
      set(x, y, [wash, wash - 12, wash - 28]);
      if (inside(x, y, l, t, rgt, btm, radius)) set(x, y, outline);
      if (inside(x, y, l + 2, t + 2, rgt - 2, btm - 2, Math.max(1, radius - 2))) set(x, y, fill);
      if (inside(x, y, il, it, ir, ib, inR) && !inside(x, y, il + 2, it + 2, ir - 2, ib - 2, Math.max(1, inR - 2))) {
        set(x, y, inner);
      }
    }
  }
  const barW = Math.round(size * 0.28);
  const barH = Math.round(size * 0.08);
  const cx = Math.round(size / 2);
  for (const y0 of [Math.round(size * 0.40), Math.round(size * 0.56)]) {
    for (let y = y0; y < y0 + barH; y += 1) {
      for (let x = cx - barW; x < cx + barW; x += 1) set(x, y, gold);
    }
  }
}

function encodePng(size) {
  const pixels = Buffer.alloc(size * size * 3);
  paintSeal(pixels, size);
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 3 + 1)] = 0;
    pixels.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

export function writeHomeIcons() {
  const files = [
    ["public/apple-touch-icon.png", 180],
    ["public/apple-touch-icon-precomposed.png", 180],
    ["public/icons/apple-touch-icon.png", 180],
    ["public/icons/icon-192.png", 192],
    ["public/icons/icon-512.png", 512],
  ];
  const written = [];
  for (const [rel, size] of files) {
    const path = resolve(ROOT, rel);
    mkdirSync(dirname(path), { recursive: true });
    const buffer = encodePng(size);
    if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
      throw new Error(`${rel} is not a valid PNG`);
    }
    writeFileSync(path, buffer);
    written.push({ rel, bytes: buffer.length });
  }
  return written;
}

writeHomeIcons();
