/**
 * 导出格式扩展（D-1 2026-07-25）
 * SVG 矢量导出 + WebP 轻量导出，与 exportBgEngine.ts 的 Canvas2D 背景引擎互补
 *
 * SVG 价值:
 * - 保留文字为矢量 text 节点（字体/字号可二次编辑）
 * - 设计师给客户预览 / 二次排版
 * - 放大不模糊，不受像素分辨率限制
 *
 * WebP 价值:
 * - 比 PNG 平均小 30%
 * - Web 标准格式，支持透明
 */

import { RATIO_SIZES, type Ratio } from './canvasConstants'

// ===========================================================================
// SVG 序列化
// ===========================================================================

/** 单个元素转 SVG 节点字符串 */
function serializeElement(el: any, canvasW: number, canvasH: number): string {
  if (!el) return ''
  switch (el.type) {
    case 'shape': return serializeShape(el, canvasW, canvasH)
    case 'text': return serializeText(el, canvasW, canvasH)
    case 'image': return serializeImage(el, canvasW, canvasH)
    default: return ''
  }
}

/** 形状元素（背景层 / 装饰形状）→ <rect> + 圆角 + 描边 */
function serializeShape(el: any, w: number, h: number): string {
  const px = (v: number) => v * w / 100
  const py = (v: number) => v * h / 100
  const x = px(el.x)
  const y = py(el.y)
  const width = px(el.width || 100)
  const height = py(el.height || 100)
  const rx = el.radius || 0
  const fill = el.color || '#000000'
  const stroke = el.borderColor || 'none'
  const strokeW = el.border || 0
  const opacity = el.opacity ?? 1

  const fillAttr = `fill="${fill}"`
  if (el.type === 'shape' && el.shape === 'overlay') {
    // 全屏 overlay：填满画布
    return `<rect x="0" y="0" width="100%" height="100%" ${fillAttr} rx="${rx}" stroke="${stroke}" stroke-width="${strokeW}" opacity="${opacity}" />`
  }

  const transform = buildTransform(el, x + width/2, y + height/2)
  const gOpen = transform ? `<g transform="${transform}">` : ''
  const gClose = transform ? '</g>' : ''

  return `${gOpen}<rect x="${x}" y="${y}" width="${width}" height="${height}" ${fillAttr} rx="${rx}" stroke="${stroke}" stroke-width="${strokeW}" opacity="${opacity}" />${gClose}`
}

/** 文字元素 → <text> 节点 */
function serializeText(el: any, w: number, h: number): string {
  const px = (v: number) => (v / 100) * w
  const py = (v: number) => (v / 100) * h
  const x = px(el.x)
  const y = py(el.y)
  const fontSize = el.fontSize || 48
  const fontWeight = el.fontWeight || 400
  const fontFamily = (el.fontFamily || 'PingFang SC').replace(/"/g, "'")
  const fill = el.colorGradient ? `url(#grad-${el.id})` : (el.color || '#000000')
  // SVG 用 dominant-baseline="central" 模拟 translate(-50%, -50%)
  const rotation = el.rotation || 0
  const flipH = el.flipH ? -1 : 1
  const flipV = el.flipV ? -1 : 1
  const opacity = el.opacity ?? 1
  const letterSpacing = el.letterSpacing || 0

  // 渐变定义
  const gradDef = el.colorGradient ? createGradientDef(el.id, el.colorGradient, w, h) : ''

  // 分行（文字内容含 \n 换行）
  const lines = (el.content || '').split('\n')
  const lineHeight = el.lineHeight || 1.2
  const lineH = fontSize * lineHeight

  // 旋转 + 翻转
  const transforms: string[] = []
  if (rotation !== 0 || flipH !== 1 || flipV !== 1) {
    const tx = `translate(${x}, ${y})`
    const rot = rotation !== 0 ? ` rotate(${rotation})` : ''
    const scale = flipH !== 1 || flipV !== 1 ? ` scale(${flipH}, ${flipV})` : ''
    transforms.push(`<g transform="${tx}${rot}${scale}">`)
  }
  // 偏移为 0（transform 已经包含 x,y 偏移时,text 内部用 0,0 居中）
  const textX = transforms.length > 0 ? 0 : x
  const textY = transforms.length > 0 ? 0 : y

  // 逐行渲染 tspan
  const tspans = lines.map((ln: string, i: number) => {
    const dy = i === 0 ? 0 : lineH
    return `<tspan x="${transforms.length > 0 ? 0 : x}" dy="${dy}">${escapeXML(ln)}</tspan>`
  }).join('\n')

  // 描边（字符级不映射 SVG 5 色调色板，简化统一描边）
  const strokeAttr = el.stroke && !el.strokeColorPerChar
    ? ` stroke="${el.strokeColor || '#000000'}" stroke-width="${el.strokeWidth || 0}" stroke-linejoin="round"`
    : ''

  // 特效（SVG 用 filter 模拟 text-shadow）
  const filterId = el.effects?.glow ? ` filter="url(#glow-${el.id})"` : ''
  const glowFilter = el.effects?.glow ? createGlowFilter(el.id) : ''

  const closeTags = transforms.length > 0 ? '</g>' : ''
  const gOpen = transforms.length > 0 ? transforms[0] : ''

  return `${gradDef}${glowFilter}${gOpen}<text x="${textX}" y="${textY}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="${fontFamily}" fill="${fill}" text-anchor="middle" dominant-baseline="central" opacity="${opacity}" letter-spacing="${letterSpacing}"${strokeAttr}${filterId}>${tspans}</text>${closeTags}`
}

/** 图片元素 → <image> 节点 */
function serializeImage(el: any, w: number, h: number): string {
  const px = (v: number) => (v / 100) * w
  const py = (v: number) => (v / 100) * h

  // 宽度用百分比（el.width 是画布占比百分比）
  const width = px(el.width || 50)
  // 高度按原图比例推导（ImageElement 只有 width 字段，高度 = width * aspectRatio）
  const aspect = el.originalWidth && el.originalHeight
    ? el.originalHeight / el.originalWidth
    : 1
  const height = width * aspect

  // x,y 是元素中心点，需要转成左上角坐标
  const x = px(el.x) - width / 2
  const y = py(el.y) - height / 2

  const opacity = el.opacity ?? 1
  const rotation = el.rotation || 0
  const flipH = el.flipH ? -1 : 1
  const flipV = el.flipV ? -1 : 1

  // 丢失的图片
  const href = el.src && el.src !== '__IMAGE_LOST__' ? el.src : ''

  // 旋转 + 翻转：围绕中心点
  const cx = x + width / 2
  const cy = y + height / 2
  const hasTransform = rotation !== 0 || flipH !== 1 || flipV !== 1
  const gOpen = hasTransform
    ? `<g transform="translate(${cx},${cy}) rotate(${rotation}) scale(${flipH},${flipV})">`
    : ''
  const gClose = hasTransform ? '</g>' : ''
  // transform 包裹时，image 从中心偏移半宽高
  const imgX = hasTransform ? -width / 2 : x
  const imgY = hasTransform ? -height / 2 : y

  return `${gOpen}<image href="${href}" x="${imgX}" y="${imgY}" width="${width}" height="${height}" opacity="${opacity}" preserveAspectRatio="xMidYMid slice" />${gClose}`
}

// ===========================================================================
// SVG 辅助
// ===========================================================================

function buildTransform(el: any, cx: number, cy: number): string {
  const rot = el.rotation || 0
  const flipH = el.flipH ? -1 : 1
  const flipV = el.flipV ? -1 : 1
  if (rot === 0 && flipH === 1 && flipV === 1) return ''
  return `translate(${cx},${cy}) rotate(${rot}) scale(${flipH},${flipV}) translate(${-cx},${-cy})`
}

function createGradientDef(id: string, grad: { from: string; to: string; angle: number }, w: number, h: number): string {
  const rad = grad.angle * Math.PI / 180
  const cx = w / 2, cy = h / 2
  const r = Math.max(w, h) / 2
  const x1 = cx - Math.cos(rad) * r
  const y1 = cy - Math.sin(rad) * r
  const x2 = cx + Math.cos(rad) * r
  const y2 = cy + Math.sin(rad) * r
  return `<defs><linearGradient id="grad-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${grad.from}"/><stop offset="100%" stop-color="${grad.to}"/></linearGradient></defs>`
}

function createGlowFilter(id: string): string {
  return `<defs><filter id="glow-${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
}

/** XML 转义（防止 content 含 <>& 破坏 SVG） */
function escapeXML(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ===========================================================================
// 导出入口
// ===========================================================================

/**
 * 导出为 SVG 文件下载
 * @param elements  画布 elements 数组
 * @param ratio     比例 ('9:16' / '1:1' / '3:4' / '16:9')
 * @param filename  文件名
 */
export function downloadSVG(elements: any[], ratio: string, filename?: string) {
  const sz = RATIO_SIZES[ratio as Ratio] || { width: 405, height: 720 }
  const w = sz.width
  const h = sz.height

  // 收集所有元素（确保背景在底层）
  const allEls = [...elements]

  // 构建 SVG 字符串，text 转 tspan
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
  svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}px" height="${h}px">\n`

  // 白色背景
  svg += `  <rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff" />\n`

  // 遍历所有元素（背景优先渲染）
  allEls.forEach(el => {
    const node = serializeElement(el, w, h)
    if (node) {
      // 缩进
      svg += node.split('\n').map((ln: string) => `  ${ln}`).join('\n') + '\n'
    }
  })

  svg += `</svg>`

  // 下载
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `封面_${ratio}_${Date.now()}.svg`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 导出为 WebP 文件下载
 * @param dataUrl  PNG dataURL（由 html2canvas 生成）
 * @param filename 文件名
 */
export async function downloadWebPFromCanvas(canvasEl: HTMLElement, scale = 2, filename?: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default

  const canvas = await html2canvas(canvasEl, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 20000,
    width: canvasEl.offsetWidth,
    height: canvasEl.offsetHeight,
    onclone: (_, cloned) => {
      cloned.style.boxShadow = 'none'
      cloned.style.overflow = 'hidden'
    },
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('WebP 编码失败')); return }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename || `封面_${Date.now()}.webp`
        link.click()
        URL.revokeObjectURL(url)
        resolve()
      },
      'image/webp',
      0.9 // 质量 90%
    )
  })
}
