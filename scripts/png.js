import { deflateSync } from 'node:zlib';

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

export function createBitmap(width, height, background = null) {
  const bitmap = { width, height, data: new Uint8Array(width * height * 4) };
  if (background) {
    for (let index = 0; index < width * height; index++) bitmap.data.set(background, index * 4);
  }
  return bitmap;
}

export function rgba(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
}

export function paintPixels(bitmap, rows, palette, x, y, scale = 1) {
  rows.forEach((row, dy) => [...row].forEach((pixel, dx) => {
    if (pixel === '.') return;
    const color = rgba(palette[pixel]);
    for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
      const px = x + dx * scale + sx;
      const py = y + dy * scale + sy;
      if (px >= 0 && px < bitmap.width && py >= 0 && py < bitmap.height) bitmap.data.set(color, (py * bitmap.width + px) * 4);
    }
  }));
}

export function encodePng(bitmap) {
  const stride = bitmap.width * 4;
  const raw = Buffer.alloc((stride + 1) * bitmap.height);
  for (let y = 0; y < bitmap.height; y++) raw.set(bitmap.data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(bitmap.width, 0);
  header.writeUInt32BE(bitmap.height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
