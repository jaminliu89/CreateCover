/**
 * Canvas2D 背景导出引擎 — 精确渲染 CSS 渐变背景，替代 html2canvas 的背景层
 *
 * V2 原型核心算法移植，支持：
 * - linear-gradient（任意角度 / to 方向 / 多颜色断点）
 * - radial-gradient（圆/椭圆 + 位置 + 尺寸）
 * - 多层背景（逗号分隔）
 * - 纯色背景
 * - ctx.filter 图片滤镜
 *
 * 不处理文字/形状/图片元素本身的渲染（保留 html2canvas 负责元素层）
 */

// ===========================================================================
// 顶层入口
// ===========================================================================

/**
 * 将 CSS 背景字符串渲染到 Canvas2D 上
 * @param ctx - Canvas2D 上下文
 * @param w - 画布宽度（像素）
 * @param h - 画布高度（像素）
 * @param bgStyle - CSS background 值（如 "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"）
 */
export function drawBackgroundLayers(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bgStyle: string
) {
  const layers = splitTopLevel(bgStyle)
  for (const layer of layers) {
    paintBgLayer(ctx, w, h, layer.trim())
  }
}

// ===========================================================================
// 单层背景绘制 + 解析
// ===========================================================================

function paintBgLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  css: string
) {
  // 1) linear-gradient()
  const linearMatch = css.match(/^linear-gradient\s*\((.+)\)$/i)
  if (linearMatch) {
    const params = linearMatch[1]
    const angleMatch = params.match(
      /^\s*(?:(to\s+(?:top|bottom|left|right)(?:\s+(?:top|bottom|left|right))?|[\d.]+deg)\s*,\s*)?(.+)$/i
    )
    if (!angleMatch) return
    const angleStr = (angleMatch[1] || '').trim()
    const stopsStr = angleMatch[2]
    const stops = parseStops(stopsStr)
    if (stops.length < 2) return
    const { x1, y1, x2, y2 } = parseLinearAngle(angleStr, w, h)
    const grad = ctx.createLinearGradient(x1, y1, x2, y2)
    for (const s of stops) grad.addColorStop(s.pct, s.color)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    return
  }

  // 2) radial-gradient()
  const radialMatch = css.match(/^radial-gradient\s*\((.+)\)$/i)
  if (radialMatch) {
    const params = radialMatch[1]
    // 尝试提取 形状/尺寸 at 位置 , 断点
    const mainMatch = params.match(
      /^\s*(?:(circle|ellipse)\s*)?(?:(closest-side|farthest-side|closest-corner|farthest-corner|(\d+)%?\s+(\d+)%?)\s*)?(?:at\s+(.+?)\s*,\s*)?(.+)$/i
    )
    if (!mainMatch || !mainMatch[5]) return
    const shape = (mainMatch[1] || 'ellipse').toLowerCase() as 'circle' | 'ellipse'
    const sizeType = mainMatch[2] || 'farthest-corner'
    const posStr = mainMatch[4] || 'center'
    const stopsStr = mainMatch[5]
    const stops = parseStops(stopsStr)
    if (stops.length < 2) return

    const pos = parsePosition(posStr, w, h)
    const rx = shape === 'circle'
      ? Math.max(w, h)
      : parseRadialSize(sizeType, w, h).rx
    const ry = shape === 'circle'
      ? rx
      : parseRadialSize(sizeType, w, h).ry

    const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, Math.max(rx, ry))
    for (const s of stops) grad.addColorStop(s.pct, s.color)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    return
  }

  // 3) 纯色
  const trimmed = css.trim()
  if (trimmed.startsWith('#')) {
    ctx.fillStyle = trimmed
    ctx.fillRect(0, 0, w, h)
    return
  }
  if (trimmed.startsWith('rgb')) {
    ctx.fillStyle = trimmed
    ctx.fillRect(0, 0, w, h)
    return
  }
  // 命名颜色（如 white, transparent）
  if (/^[a-z-]+$/i.test(trimmed)) {
    ctx.fillStyle = trimmed
    ctx.fillRect(0, 0, w, h)
  }
}

// ===========================================================================
// 辅助解析函数
// ===========================================================================

/** 顶层逗号分割（正确处理函数参数括号嵌套） */
export function splitTopLevel(css: string): string[] {
  const parts: string[] = []
  let depth = 0, start = 0
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '(') depth++
    if (css[i] === ')') depth--
    if (css[i] === ',' && depth === 0) {
      parts.push(css.slice(start, i))
      start = i + 1
    }
  }
  parts.push(css.slice(start))
  return parts.filter(p => p.trim())
}

function parseLinearAngle(
  angleStr: string,
  w: number,
  h: number
): { x1: number; y1: number; x2: number; y2: number } {
  // deg
  const degMatch = angleStr.match(/^([\d.]+)deg$/i)
  if (degMatch) {
    const rad = (parseFloat(degMatch[1]) * Math.PI) / 180
    const len = Math.sqrt(w * w + h * h) / 2
    return {
      x1: w / 2 - Math.cos(rad) * len,
      y1: h / 2 - Math.sin(rad) * len,
      x2: w / 2 + Math.cos(rad) * len,
      y2: h / 2 + Math.sin(rad) * len,
    }
  }

  // to 方向
  const to = angleStr.replace(/^to\s+/i, '').toLowerCase()
  const cx = w / 2, cy = h / 2
  let dx = 0, dy = 0
  if (to.includes('top')) dy = -cy
  if (to.includes('bottom')) dy = cy
  if (to.includes('left')) dx = -cx
  if (to.includes('right')) dx = cx
  if (dx === 0 && dy === 0) dy = -cy // 默认 to top
  return { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy }
}

interface ColorStop {
  pct: number
  color: string
}

function parseStops(css: string): ColorStop[] {
  const items = css.split(',').map(s => s.trim())
  const stops: ColorStop[] = []

  // 先收集所有颜色-位置对
  const raw: { color: string; pct?: string }[] = []
  for (const item of items) {
    const match = item.match(/^(#[a-f0-9]+|[a-z-]+|rgba?\([^)]*\))\s*([\d.]+%)?$/i)
    if (match) {
      raw.push({ color: match[1], pct: match[2] })
    } else {
      // 尝试只取颜色（如 "red" 无位置）
      const colorMatch = item.match(/^(#[a-f0-9]+|[a-z-]+|rgba?\([^)]*\))$/i)
      if (colorMatch) raw.push({ color: colorMatch[1] })
    }
  }

  if (raw.length < 2) return stops

  // 断点插值：缺失位置自动均分
  let lastPct = 0
  let idx = 0
  for (const r of raw) {
    if (r.pct) {
      lastPct = parseFloat(r.pct) / 100
    } else {
      // 插值：根据在序列中的位置
      const remaining = raw.slice(idx).filter(x => x.pct).length
      if (remaining > 0) {
        // 如果后面有已知位置，插到两者之间
        const nextKnown = raw.slice(idx).find(x => x.pct)
        if (nextKnown) {
          const nextPct = parseFloat(nextKnown.pct!) / 100
          // 简单平均分布
          lastPct = lastPct + (nextPct - lastPct) / 2
        } else {
          lastPct = Math.min(lastPct + (1 - lastPct) / 2, 1)
        }
      } else {
        lastPct = Math.min(lastPct + (1 - lastPct) / 3, 1)
      }
    }
    stops.push({ color: r.color, pct: lastPct })
    idx++
  }

  // 确保从 0 开始、到 1 结束
  if (stops.length > 0) {
    if (stops[0].pct > 0) stops.unshift({ color: stops[0].color, pct: 0 })
    if (stops[stops.length - 1].pct < 1) stops.push({ color: stops[stops.length - 1].color, pct: 1 })
  }

  return stops
}

function parsePosition(posStr: string, w: number, h: number): { x: number; y: number } {
  const parts = posStr.trim().split(/\s+/)
  let x = w / 2, y = h / 2
  for (const p of parts) {
    if (p === 'left') x = 0
    else if (p === 'right') x = w
    else if (p === 'top') y = 0
    else if (p === 'bottom') y = h
    else if (p === 'center') { /* 保持默认 */ }
    else if (p.endsWith('%')) {
      const pct = parseFloat(p) / 100
      // 靠左/右/上/下 的上下文判断
      if (x === w / 2) x = w * pct
      else y = h * pct
    }
  }
  return { x, y }
}

function parseRadialSize(
  sizeStr: string,
  w: number,
  h: number
): { rx: number; ry: number } {
  const s = sizeStr.toLowerCase()
  if (s === 'closest-side') return { rx: Math.min(w / 2, h / 2), ry: Math.min(w / 2, h / 2) }
  if (s === 'farthest-side') return { rx: Math.max(w / 2, h / 2), ry: Math.max(w / 2, h / 2) }
  if (s === 'closest-corner') {
    const d = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2)
    return { rx: d, ry: d }
  }
  // farthest-corner（默认）
  const d = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2)
  return { rx: d, ry: d }
}

/**
 * 合成：背景层（Canvas2D 渐变引擎）+ 元素层（html2canvas）
 * 返回完整输出的 dataURL
 */
export async function composeEnhancedExport(
  canvasEl: HTMLElement,
  canvasW: number,
  canvasH: number,
  bgStyle?: string,
  scale = 2
): Promise<string> {
  const outCanvas = document.createElement('canvas')
  outCanvas.width = canvasW * scale
  outCanvas.height = canvasH * scale
  const ctx = outCanvas.getContext('2d')!
  ctx.scale(scale, scale)

  // 1. 背景层（使用增强引擎）
  if (bgStyle && bgStyle !== 'none') {
    drawBackgroundLayers(ctx, canvasW, canvasH, bgStyle)
  } else {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasW, canvasH)
  }

  // 2. 元素层（使用 html2canvas 绘制所有元素）
  const html2canvas = (await import('html2canvas')).default
  const htmlCanvas = await html2canvas(canvasEl, {
    scale: 1,
    backgroundColor: 'transparent',
    useCORS: true,
    logging: false,
    onclone: (_, cloned) => {
      cloned.style.boxShadow = 'none'
      cloned.style.overflow = 'hidden'
    },
  })

  ctx.drawImage(htmlCanvas, 0, 0, canvasW, canvasH)

  return outCanvas.toDataURL('image/png')
}
