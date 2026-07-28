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

// The mark, in a 100x100 design space: a lifter with a barbell locked out
// overhead. Everything is a capsule — a segment with a thickness and round
// caps — because limbs are diagonal and a stick figure built from axis-aligned
// rectangles cannot bend. A zero-length capsule is a circle, which is the head.
//
// Joints deliberately overlap rather than meet: two shapes that merely touched
// would each anti-alias against the background and leave a seam down the join.
// So the torso runs up under the head, the arms start inside the shoulder line
// and the hands run up into the bar.
//
// The arms hang off a shoulder capsule rather than off the torso directly.
// Attaching them at the centre line would drive them through the head on the
// way up; from the shoulders they pass outside it with daylight to spare, which
// is what keeps the figure readable once it is 60 px on a home screen.
const T_LIMB = 7.5
const SHAPES = [
  // barbell overhead
  { x1: 26, y1: 16, x2: 74, y2: 16, t: 8, rgb: BAR }, // bar
  { x1: 26, y1: 9, x2: 26, y2: 23, t: 8, rgb: ACCENT }, // plates
  { x1: 74, y1: 9, x2: 74, y2: 23, t: 8, rgb: ACCENT },
  // figure. The shoulders sit low enough to leave a neck: with them any higher
  // the head reads as sunk into them once the icon is 60 px.
  { x1: 41, y1: 48, x2: 33, y2: 20, t: T_LIMB, rgb: ACCENT }, // arms, hands into the bar
  { x1: 59, y1: 48, x2: 67, y2: 20, t: T_LIMB, rgb: ACCENT },
  { x1: 41, y1: 48, x2: 59, y2: 48, t: T_LIMB, rgb: ACCENT }, // shoulders
  { x1: 50, y1: 30, x2: 50, y2: 30, t: 17, rgb: ACCENT }, // head
  { x1: 50, y1: 40, x2: 50, y2: 66, t: 8, rgb: ACCENT }, // torso, up under the head
  { x1: 50, y1: 66, x2: 38, y2: 86, t: T_LIMB, rgb: ACCENT }, // legs
  { x1: 50, y1: 66, x2: 62, y2: 86, t: T_LIMB, rgb: ACCENT },
]

// The mark is scaled by its true ink radius — the furthest any drawn pixel sits
// from the centre — rather than by a bounding box, whose corners are empty for
// a shape like this. Maskable icons are cropped to the centre 80% circle, so
// that radius has to stay inside 0.4; 0.375 leaves a margin. Recomputed from
// SHAPES, so the safe zone survives redrawing the figure.
const RADIUS = { any: 0.44, maskable: 0.375 }

// Signed distance to a capsule: negative inside, positive outside, crossing
// zero exactly on the edge. Sampling its sign gives the coverage that makes the
// edges and caps smooth.
function sdCapsule(px, py, s) {
  const dx = s.x2 - s.x1
  const dy = s.y2 - s.y1
  const len2 = dx * dx + dy * dy
  // Project onto the segment, clamped to it; zero-length degrades to a circle.
  const h = len2 === 0 ? 0 : Math.min(1, Math.max(0, ((px - s.x1) * dx + (py - s.y1) * dy) / len2))
  return Math.hypot(px - s.x1 - dx * h, py - s.y1 - dy * h) - s.t / 2
}

// Centre of the mark's extent, and the furthest ink from it.
function geometry() {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const s of SHAPES) {
    x0 = Math.min(x0, s.x1 - s.t / 2, s.x2 - s.t / 2)
    y0 = Math.min(y0, s.y1 - s.t / 2, s.y2 - s.t / 2)
    x1 = Math.max(x1, s.x1 + s.t / 2, s.x2 + s.t / 2)
    y1 = Math.max(y1, s.y1 + s.t / 2, s.y2 + s.t / 2)
  }
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  let radius = 0
  for (const s of SHAPES) {
    const a = Math.hypot(s.x1 - cx, s.y1 - cy) + s.t / 2
    const b = Math.hypot(s.x2 - cx, s.y2 - cy) + s.t / 2
    radius = Math.max(radius, a, b)
  }
  return { cx, cy, radius }
}

const SAMPLES = 4 // per axis, so 16 coverage samples per pixel

function render(size, maskable) {
  const buf = Buffer.alloc(size * size * 4)
  const { cx, cy, radius } = geometry()
  const scale = (RADIUS[maskable ? 'maskable' : 'any'] * size) / radius
  // design (cx,cy) -> the icon's centre
  const toDesignX = (p) => (p - (size / 2 - cx * scale)) / scale
  const toDesignY = (p) => (p - (size / 2 - cy * scale)) / scale

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = INK[0]
      let g = INK[1]
      let b = INK[2]
      for (const s of SHAPES) {
        let hits = 0
        for (let sy = 0; sy < SAMPLES; sy++) {
          for (let sx = 0; sx < SAMPLES; sx++) {
            const dx = toDesignX(px + (sx + 0.5) / SAMPLES)
            const dy = toDesignY(py + (sy + 0.5) / SAMPLES)
            if (sdCapsule(dx, dy, s) <= 0) hits++
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
