// Generate simple placeholder PWA icons with no external dependencies.
// Draws set-chips (three squares) on the ink background — on-brand with the
// app's set-chip motif. Run with: npm run icons
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
mkdirSync(OUT, { recursive: true })

const INK = [0x18, 0x1b, 0x22]
const CHIPS = [
  [0xd6, 0x45, 0x3d], // strength red
  [0x4f, 0x9d, 0x4a], // easy-run green
  [0x7a, 0x5a, 0xf0], // long-run purple
]

function render(size, maskable) {
  const buf = Buffer.alloc(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = INK[0]
    buf[i * 4 + 1] = INK[1]
    buf[i * 4 + 2] = INK[2]
    buf[i * 4 + 3] = 255
  }
  // Keep the mark inside the maskable safe zone (~80%).
  const area = maskable ? 0.5 : 0.64
  const availW = size * area
  const chip = availW / 3.56
  const gap = chip * 0.28
  const totalW = chip * 3 + gap * 2
  const x0 = (size - totalW) / 2
  const y0 = (size - chip) / 2
  for (let c = 0; c < 3; c++) {
    fillRect(buf, size, x0 + c * (chip + gap), y0, chip, chip, CHIPS[c])
  }
  return buf
}

function fillRect(buf, size, x, y, w, h, rgb) {
  const x1 = Math.round(x)
  const y1 = Math.round(y)
  const x2 = Math.round(x + w)
  const y2 = Math.round(y + h)
  for (let py = y1; py < y2; py++) {
    for (let px = x1; px < x2; px++) {
      if (px < 0 || py < 0 || px >= size || py >= size) continue
      const i = (py * size + px) * 4
      buf[i] = rgb[0]
      buf[i + 1] = rgb[1]
      buf[i + 2] = rgb[2]
      buf[i + 3] = 255
    }
  }
}

// ---- minimal PNG encoder (RGBA, 8-bit) ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(rgba, size) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function write(name, size, maskable) {
  const png = encodePNG(render(size, maskable), size)
  writeFileSync(join(OUT, name), png)
  console.log(`wrote public/${name} (${png.length} bytes)`)
}

write('icon-192.png', 192, false)
write('icon-512.png', 512, false)
write('icon-maskable-192.png', 192, true)
write('icon-maskable-512.png', 512, true)
write('apple-touch-icon.png', 180, false)
