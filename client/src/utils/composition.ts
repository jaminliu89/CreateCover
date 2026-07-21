// 4 种构图算法：黄金比例 / 斐波那契 / 三分构图 / 黄金螺线
// 纯前端数学，无 LLM 依赖

// 黄金比例 φ = (1 + √5) / 2
export const PHI = 1.618033988749

// 黄金分割点（短边/长边 = 1/φ）
export const GOLDEN_X = 1 / PHI  // 0.382
export const GOLDEN_X_INV = 1 - 1 / PHI  // 0.618

// 斐波那契数列（最多 10 项）
export function fibonacci(n: number = 8): number[] {
  const arr = [1, 1]
  for (let i = 2; i < n; i++) arr.push(arr[i - 1] + arr[i - 2])
  return arr
}

// === 三分构图 ===
export interface ThirdsPoint {
  x: number
  y: number
  name: 'tl' | 'tr' | 'bl' | 'br'
}

export const THIRDS_POINTS: ThirdsPoint[] = [
  { x: 33.33, y: 33.33, name: 'tl' },
  { x: 66.67, y: 33.33, name: 'tr' },
  { x: 33.33, y: 66.67, name: 'bl' },
  { x: 66.67, y: 66.67, name: 'br' },
]

export function pickThirdsPoint(
  role: 'main' | 'sub' | 'accent',
  accentIndex: number = 0
): ThirdsPoint {
  if (role === 'main') return THIRDS_POINTS[3]
  if (role === 'sub') return THIRDS_POINTS[0]
  return accentIndex % 2 === 0 ? THIRDS_POINTS[1] : THIRDS_POINTS[2]
}

// === 黄金比例定位 ===
export function pickGoldenPoint(
  role: 'main' | 'sub' | 'accent',
  orientation: 'portrait' | 'landscape' = 'portrait'
): { x: number; y: number } {
  if (orientation === 'portrait') {
    if (role === 'main') return { x: 50, y: GOLDEN_X_INV * 100 }
    if (role === 'sub') return { x: 50, y: GOLDEN_X * 100 + 5 }
    return { x: GOLDEN_X_INV * 100, y: GOLDEN_X * 100 }
  } else {
    if (role === 'main') return { x: GOLDEN_X * 100, y: 50 }
    if (role === 'sub') return { x: GOLDEN_X_INV * 100, y: 50 }
    return { x: 50, y: GOLDEN_X * 100 }
  }
}

// === 黄金螺线 ===
// b = ln(φ) / (π/2) ≈ 0.30635（每个 90° 螺线增长 φ 倍）
export interface SpiralPoint {
  x: number
  y: number
  angle: number
  scale: number
}

const SPIRAL_B = Math.log(PHI) / (Math.PI / 2)

export function goldenSpiralPoints(
  center: { x: number; y: number },
  maxRadius: number,
  count: number = 6
): SpiralPoint[] {
  const points: SpiralPoint[] = []
  for (let i = 0; i < count; i++) {
    const angleDeg = (i / count) * 360
    const angleRad = (angleDeg * Math.PI) / 180
    const r2 = maxRadius * (1 - Math.exp(-SPIRAL_B * angleRad)) / (1 - Math.exp(-SPIRAL_B * 2 * Math.PI))
    points.push({
      x: center.x + r2 * Math.cos(angleRad),
      y: center.y + r2 * Math.sin(angleRad),
      angle: angleDeg,
      scale: i / (count - 1),
    })
  }
  return points
}

// === 智能排版算法 ===
export interface Composition {
  name: string
  desc: string
  apply: (elements: any[], ratio: string) => Map<string, { x: number; y: number }>
}

export const COMPOSITIONS: Composition[] = [
  {
    name: '三分构图',
    desc: '经典摄影构图，元素分布在 4 个黄金交点',
    apply: (els) => {
      const map = new Map<string, { x: number; y: number }>()
      const textEls = els.filter(e => e.type === 'text').sort((a, b) => b.fontSize - a.fontSize)
      textEls.forEach((el, i) => {
        if (i === 0) map.set(el.id, { x: 66.67, y: 66.67 })
        else if (i === 1) map.set(el.id, { x: 33.33, y: 33.33 })
        else map.set(el.id, { x: 33.33, y: 66.67 })
      })
      return map
    },
  },
  {
    name: '黄金比例',
    desc: '主元素在 0.618 黄金分割线，平衡感最强',
    apply: (els, ratio) => {
      const map = new Map<string, { x: number; y: number }>()
      const isPortrait = ratio === '9:16' || ratio === '3:4'
      const textEls = els.filter(e => e.type === 'text').sort((a, b) => b.fontSize - a.fontSize)
      textEls.forEach((el, i) => {
        const pos = pickGoldenPoint(i === 0 ? 'main' : i === 1 ? 'sub' : 'accent', isPortrait ? 'portrait' : 'landscape')
        map.set(el.id, { x: pos.x, y: pos.y })
      })
      return map
    },
  },
  {
    name: '黄金螺线',
    desc: '按对数螺线分布，构图张力强',
    apply: (els) => {
      const map = new Map<string, { x: number; y: number }>()
      const textEls = els.filter(e => e.type === 'text').sort((a, b) => b.fontSize - a.fontSize)
      const points = goldenSpiralPoints({ x: 50, y: 50 }, 35, Math.max(3, textEls.length))
      textEls.forEach((el, i) => {
        const p = points[i % points.length]
        map.set(el.id, { x: p.x, y: p.y })
      })
      return map
    },
  },
  {
    name: '居中堆叠',
    desc: '经典对称构图，适合正式场合',
    apply: (els) => {
      const map = new Map<string, { x: number; y: number }>()
      const textEls = els.filter(e => e.type === 'text').sort((a, b) => b.fontSize - a.fontSize)
      textEls.forEach((el, i) => {
        const y = i === 0 ? 42 : 50 + (i - 1) * 12
        map.set(el.id, { x: 50, y: Math.max(10, Math.min(90, y)) })
      })
      return map
    },
  },
]

// === 字号按斐波那契缩放 ===
export function fibonacciFontScale(baseSize: number, total: number): number[] {
  if (total <= 0) return []
  const fibs = fibonacci(total + 1).slice(0, total)
  const maxFib = Math.max(...fibs)
  return fibs.map(f => Math.max(12, Math.round((baseSize * f) / maxFib)))
}
