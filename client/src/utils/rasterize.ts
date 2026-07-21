import type { TextElement, ShapeElement, ImageElement } from '../data'

// 画布像素尺寸（与 Canvas.tsx RATIO_SIZES 保持一致）
const RATIO_SIZES: Record<string, { width: number; height: number }> = {
  '3:4': { width: 480, height: 640 },
  '1:1': { width: 540, height: 540 },
  '9:16': { width: 405, height: 720 },
  '16:9': { width: 720, height: 405 },
}

const SCALE = 2 // 高清输出（2x 像素密度）

/**
 * 将文字元素栅格化为图片元素
 * - 支持多行（\n 换行）
 * - 支持 fontStyle/weight/family/color/textAlign
 * - 支持 bg 背景框、shadow 阴影、stroke 描边、underline 下划线
 * - 支持 rotation 旋转、opacity 透明度
 * - 保留 flipH/flipV/locked/groupId
 */
export function rasterizeTextElement(el: TextElement, ratio: string): ImageElement {
  const size = RATIO_SIZES[ratio] || RATIO_SIZES['3:4']
  const elWidthPx = (el as any).width ? ((el as any).width / 100) * size.width : 0
  const fontSize = el.fontSize
  const lines = el.content.split('\n')
  const lineHeight = fontSize * 1.3
  const textHeight = lines.length * lineHeight

  // 用 measureCanvas 精确测量每行宽度（fallback 估算）
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')!
  measureCtx.font = `${el.italic ? 'italic ' : ''}${el.fontWeight} ${fontSize}px ${el.fontFamily}`
  const lineWidths = lines.map(line => {
    const w = measureCtx.measureText(line).width
    return w > 0 ? w : estimateTextWidth(line, fontSize)
  })
  const maxLineWidth = Math.max(...lineWidths, elWidthPx || 0)

  // Canvas 尺寸（含 padding 给描边/阴影/背景框留空间）
  const pad = Math.max(fontSize * 0.4, (el.strokeWidth || 0) * 2, (el.bgPadding || 0) + 4) + 6
  const w = Math.ceil(maxLineWidth + pad * 2)
  const h = Math.ceil(textHeight + pad * 2)

  const canvas = document.createElement('canvas')
  canvas.width = w * SCALE
  canvas.height = h * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const cx = w / 2
  const cy = h / 2

  // 旋转
  if (el.rotation) {
    ctx.translate(cx, cy)
    ctx.rotate((el.rotation * Math.PI) / 180)
    ctx.translate(-cx, -cy)
  }

  ctx.globalAlpha = el.opacity
  ctx.font = `${el.italic ? 'italic ' : ''}${el.fontWeight} ${fontSize}px ${el.fontFamily}`
  ctx.textBaseline = 'middle'

  // 背景框
  if (el.bg) {
    const bgW = maxLineWidth + (el.bgPadding || 0) * 2
    const bgH = textHeight + (el.bgPadding || 0) * 2
    let bgX = cx - bgW / 2
    const bgY = cy - bgH / 2
    if (el.textAlign === 'left') bgX = cx - maxLineWidth / 2 - (el.bgPadding || 0)
    else if (el.textAlign === 'right') bgX = cx + maxLineWidth / 2 - bgW + (el.bgPadding || 0)
    ctx.fillStyle = el.bgColor
    roundRect(ctx, bgX, bgY, bgW, bgH, 8)
    ctx.fill()
  }

  // 文字行
  const startY = cy - textHeight / 2 + lineHeight / 2
  lines.forEach((line, i) => {
    const lineW = lineWidths[i]
    let x = cx
    if (el.textAlign === 'left') x = cx - maxLineWidth / 2
    else if (el.textAlign === 'right') x = cx + maxLineWidth / 2 - lineW
    const y = startY + i * lineHeight
    ctx.textAlign = el.textAlign as CanvasTextAlign

    // 阴影
    if (el.shadow) {
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillStyle = el.color
      ctx.fillText(line, x, y)
      ctx.restore()
    }

    // 描边
    if (el.stroke && el.strokeWidth) {
      ctx.strokeStyle = el.strokeColor || '#000000'
      ctx.lineWidth = el.strokeWidth
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeText(line, x, y)
    }

    // 填充
    ctx.fillStyle = el.color
    ctx.fillText(line, x, y)

    // 下划线
    if (el.underline) {
      ctx.fillRect(x, y + fontSize * 0.4, lineW, Math.max(1, fontSize * 0.06))
    }
  })

  return {
    id: el.id,
    type: 'image',
    src: canvas.toDataURL('image/png'),
    x: el.x,
    y: el.y,
    width: (el as any).width ?? 50,
    rotation: 0, // 旋转已烘焙进图片
    radius: 0,
    border: 0,
    borderColor: '#000000',
    shadow: false,
    filter: 'none',
    useCutout: false,
    opacity: 1,
    flipH: el.flipH,
    flipV: el.flipV,
    locked: el.locked,
    groupId: el.groupId,
  }
}

/**
 * 将形状元素栅格化为图片元素
 * 支持 rect / circle / tag / line（overlay 背景层不允许栅格化）
 */
export function rasterizeShapeElement(el: ShapeElement, ratio: string): ImageElement | null {
  // overlay 背景层不允许栅格化
  if (el.shape === 'overlay') return null

  const size = RATIO_SIZES[ratio] || RATIO_SIZES['3:4']
  const elWidthPx = Math.max(1, (el.width / 100) * size.width)
  const elHeightPx = Math.max(1, (el.height / 100) * size.height)
  const borderW = el.border || 0

  const pad = borderW + 4
  const w = Math.ceil(elWidthPx + pad * 2)
  const h = Math.ceil(elHeightPx + pad * 2)

  const canvas = document.createElement('canvas')
  canvas.width = w * SCALE
  canvas.height = h * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  const cx = w / 2
  const cy = h / 2

  if (el.rotation) {
    ctx.translate(cx, cy)
    ctx.rotate((el.rotation * Math.PI) / 180)
    ctx.translate(-cx, -cy)
  }

  ctx.globalAlpha = el.opacity
  ctx.fillStyle = el.color

  const x = pad
  const y = pad
  const sw = elWidthPx
  const sh = elHeightPx

  if (el.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(x + sw / 2, y + sh / 2, Math.min(sw, sh) / 2, 0, Math.PI * 2)
    ctx.fill()
  } else if (el.shape === 'tag') {
    const r = Math.min(sw, sh) / 2
    roundRect(ctx, x, y, sw, sh, r)
    ctx.fill()
  } else if (el.shape === 'line') {
    const lineH = Math.max(1, borderW || 2)
    ctx.fillRect(x, y + sh / 2 - lineH / 2, sw, lineH)
  } else {
    // rect
    if (el.radius && el.radius > 0) {
      const r = Math.min(el.radius, Math.min(sw, sh) / 2)
      roundRect(ctx, x, y, sw, sh, r)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, sw, sh)
    }
  }

  // 边框
  if (borderW > 0) {
    ctx.strokeStyle = el.borderColor || '#000000'
    ctx.lineWidth = borderW
    if (el.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(x + sw / 2, y + sh / 2, Math.min(sw, sh) / 2 - borderW / 2, 0, Math.PI * 2)
      ctx.stroke()
    } else if (el.shape === 'tag') {
      roundRect(ctx, x + borderW / 2, y + borderW / 2, sw - borderW, sh - borderW, Math.min(sw, sh) / 2 - borderW / 2)
      ctx.stroke()
    } else if (el.shape !== 'line') {
      ctx.strokeRect(x + borderW / 2, y + borderW / 2, sw - borderW, sh - borderW)
    }
  }

  return {
    id: el.id,
    type: 'image',
    src: canvas.toDataURL('image/png'),
    x: el.x,
    y: el.y,
    width: (el as any).width ?? 50,
    rotation: 0,
    radius: 0,
    border: 0,
    borderColor: '#000000',
    shadow: false,
    filter: 'none',
    useCutout: false,
    opacity: 1,
    flipH: el.flipH,
    flipV: el.flipV,
    locked: el.locked,
    groupId: el.groupId,
  }
}

/**
 * 判断元素是否可栅格化
 * - 文字：✓
 * - 形状（非 overlay）：✓
 * - 图片：✗（已经是图片）
 * - 背景层（overlay）：✗
 */
export function canRasterize(el: { type: string; shape?: string }): boolean {
  if (el.type === 'text') return true
  if (el.type === 'shape' && el.shape !== 'overlay') return true
  return false
}

// ---- 内部工具 ----

/** CJK 字符宽度粗略估算（measureText 不可用时的 fallback） */
function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0
  for (const ch of text) {
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(ch)) {
      width += fontSize
    } else if (ch === ' ') {
      width += fontSize * 0.3
    } else {
      width += fontSize * 0.55
    }
  }
  return width
}

/** 兼容旧浏览器的 roundRect */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}
