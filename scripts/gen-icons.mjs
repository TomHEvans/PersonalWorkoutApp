// Generate the PWA icons with no external dependencies. Run with: npm run icons
//
// The mark is a barbell — two plates a side and a bar — drawn from rounded
// rectangles in the app's own palette (accent plates, text-white bar, ink
// background). It is defined geometrically rather than exported from a design
// tool so this script stays the single source of truth: same output on any
// machine, no fonts and no image libraries involved.
//
// Shapes are anti-aliased by supersampling coverage (4x4 samples per pixel)
// against a signed distance function, which the previous hard-edged fillRect
// could not do — rounded corners need it or they come out as visible steps.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
mkdirSync(OUT, { recursive: true })

const INK = [0x14, 0x16, 0x1c] // --bg
const ACCENT = [0x4f, 0x8c, 0xff] // --accent
const BAR = [0xe8, 0xeb, 0xf1] // --text

// The mark, in a 100x100 design space centred on (50, 50). Its bounding box is
// x 6..94, y 30..70 — wide and short, which is what keeps it comfortably
// inside the maskable safe circle (see FRACTION below).
//
// The bar is drawn first and runs 2 units under each inner plate: two shapes
// that merely touched would each anti-alias against the background and leave a
// faint seam down the join.
const SHAPES = [
  { x: 34, y: 46, w: 32, h: 8, r: 4, rgb: BAR }, // bar
  { x: 22, y: 30, w: 14, h: 40, r: 3.5, rgb: ACCENT }, // inner plates
  { x: 64, y: 30, w: 14, h: 40, r: 3.5, rgb: ACCENT },
  { x: 6, y: 38, w: 12, h: 24, r: 3, rgb: ACCENT }, // outer plates
  { x: 82, y: 38, w: 12, h: 24, r: 3, rgb: ACCENT },
]

const MARK_W = 88 // design-space width of the bounding box above

// How much of the icon's width the mark spans. Maskable icons are cropped to
// the centre 80% circle, so the mark's half-diagonal (48.33 design units) has
// to stay inside a radius of 0.4: at 0.66 it lands at 0.363, with room spare.
const FRACTION = { any: 0.76, maskable: 0.66 }

// Signed distance to a rounded rectangle: negative inside, positive outside,
// crossing zero exactly on the edge. Sampling its sign gives the coverage that
// makes the corners smooth.
function sdRoundRect(px, py, s) {
  const cx = s.x + s.w / 2
  const cy = s.y + s.h / 2
  const qx = Math.abs(px - cx) - (s.w / 2 - s.r)
  const qy = Math.abs(py - cy) - (s.h / 2 - s.r)
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - s.r
}

const SAMPLES = 4 // per axis, so 16 coverage samples per pixel

function render(size, maskable) {
  const buf = Buffer.alloc(size * size * 4)
  const scale = (FRACTION[maskable ? 'maskable' : 'any'] * size) / MARK_W
  const offset = size / 2 - 50 * scale // design (50,50) -> pixel centre
  const toDesign = (p) => (p - offset) / scale

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = INK[0]
      let g = INK[1]
      let b = INK[2]
      for (const s of SHAPES) {
        let hits = 0
        for (let sy = 0; sy < SAMPLES; sy++) {
          for (let sx = 0; sx < SAMPLES; sx++) {
            const dx = toDesign(px + (sx + 0.5) / SAMPLES)
            const dy = toDesign(py + (sy + 0.5) / SAMPLES)
            if (sdRoundRect(dx, dy, s) <= 0) hits++
          }
        }
        if (hits === 0) continue
        const a = hits / (SAMPLES * SAMPLES)
        r = Math.round(r + (s.rgb[0] - r) * a)
        g = Math.round(g + (s.rgb[1] - g) * a)
        b = Math.round(b + (s.rgb[2] - b) * a)
      }
      const i = (py * size + px) * 4
      buf[i] = r
      buf[i + 1] = g
      buf[i + 2] = b
      buf[i + 3] = 255
    }
  }
  return buf
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
