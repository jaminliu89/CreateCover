import type { TextElement, ImageElement } from '../data'

/**
 * 文字转图片（P2-2 2026-07-25）
 * 把 TextElement 用 Canvas2D 渲染成 PNG dataURL,封装为 ImageElement
 * 用途:
 * 1. 避免字体兼容问题(导出 PNG/MDM 时所见即所得)
 * 2. 减少渲染开销(图片比 100 个字符 span 性能好)
 * 3. 防止字体版权问题(转图后只显示图片,字体本身不外泄)
 *
 * 缺点(转图后):
 * - 不可编辑文字内容
 * - 不可改字号/字重
 * - 文件大小增加(嵌入 base64)
 */

interface ConversionOptions {
  /** 输出图片的最大宽度(默认 1200,超过会等比缩放保持清晰) */
  maxWidth?: number
  /** 是否保留 2x 分辨率(默认 true,Retina 屏更清晰) */
  retina?: boolean
}

/** 在浏览器环境中执行(SSR/Node 环境跳过) */
function isBrowser(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined'
}

/**
 * 把单个 TextElement 渲染成 ImageElement
 * 返回新 ImageElement(原 element 不变,让 caller 决定怎么替换)
 */
export function convertTextElementToImage(
  element: TextElement,
  options: ConversionOptions = {}
): ImageElement | null {
  if (!isBrowser()) return null

  const { maxWidth = 1200, retina = true } = options
  const dpr = retina ? (window.devicePixelRatio || 1) : 1

  // 1. 创建临时 canvas 测量文字尺寸
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')
  if (!measureCtx) return null

  // 拼接所有排版样式到 font
  const fontSize = element.fontSize || 48
  const fontWeight = element.fontWeight || 400
  const fontStyle = element.italic ? 'italic' : 'normal'
  const fontFamily = element.fontFamily || 'sans-serif'
  const lineHeight = element.lineHeight || 1.2
  const letterSpacing = element.letterSpacing || 0
  measureCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`

  // 2. 测量文字宽高(按 \n 拆多行)
  const lines = (element.content || '').split('\n')
  const lineHeights = fontSize * lineHeight
  const measuredWidths = lines.map(line => {
    let w = 0
    for (const ch of line) {
      w += measureCtx.measureText(ch).width + letterSpacing
    }
    return Math.max(w - letterSpacing, fontSize)  // 去掉最后一字字距
  })
  const maxLineWidth = Math.max(...measuredWidths, fontSize)
  const totalHeight = lineHeights * lines.length

  // 3. 限制最大宽度(避免超高清巨大图片)
  let finalWidth = maxLineWidth
  let finalHeight = totalHeight
  if (finalWidth > maxWidth) {
    const scale = maxWidth / finalWidth
    finalWidth = maxWidth
    finalHeight = finalHeight * scale
  }

  // 4. 创建画布(dpr 倍率,Retina 清晰)
  const canvas = document.createElement('canvas')
  canvas.width = finalWidth * dpr
  canvas.height = finalHeight * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(dpr, dpr)

  // 5. 渲染文字(支持渐变)
  if (element.colorGradient) {
    const { from, to, angle } = element.colorGradient
    // 计算渐变起止点(基于 angle 度数,0 = 自下向上)
    const rad = (angle - 90) * Math.PI / 180
    const cx = finalWidth / 2
    const cy = finalHeight / 2
    const r = Math.max(finalWidth, finalHeight) / 2
    const x0 = cx - Math.cos(rad) * r
    const y0 = cy - Math.sin(rad) * r
    const x1 = cx + Math.cos(rad) * r
    const y1 = cy + Math.sin(rad) * r
    const grad = ctx.createLinearGradient(x0, y0, x1, y1)
    grad.addColorStop(0, from)
    grad.addColorStop(1, to)
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = element.color || '#000000'
  }

  // 6. 字符级描边(支持 perChar)
  if (element.stroke) {
    const strokeWidth = element.strokeColorPerChar ? (element.strokeWidth || 2) : (element.strokeWidth || 0)
    if (strokeWidth > 0) {
      ctx.lineWidth = strokeWidth
      ctx.lineJoin = 'round'
    }
  }

  // 7. 绘制每行文字(从顶到底)
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textBaseline = 'top'

  const palette = ['#FF5E3A', '#FF9900', '#FFD700', '#FF3366', '#9B59FF']
  lines.forEach((line, lineIdx) => {
    // 计算行水平位置(根据 textAlign)
    const lineWidth = measuredWidths[lineIdx]
    let startX = 0
    if (element.textAlign === 'center') startX = (finalWidth - lineWidth) / 2
    else if (element.textAlign === 'right') startX = finalWidth - lineWidth
    const startY = lineIdx * lineHeights

    // 逐字符绘制(支持字符级描边)
    if (element.stroke && element.strokeColorPerChar) {
      let xCursor = startX
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        ctx.strokeStyle = palette[i % palette.length]
        ctx.strokeText(ch, xCursor, startY)
        xCursor += ctx.measureText(ch).width + letterSpacing
      }
    } else if (element.stroke && (element.strokeWidth || 0) > 0) {
      // 整段描边
      ctx.strokeStyle = element.strokeColor || '#000000'
      ctx.strokeText(line, startX, startY)
    }
    // 填充
    ctx.fillText(line, startX, startY)
  })

  // 8. 转 dataURL
  const dataURL = canvas.toDataURL('image/png')

  // 9. 构造 ImageElement(保留原 element 的 x/y/rotation 等)
  // ImageElement 用 width% + 原图 aspect ratio 算高度,所以只需要 width
  const imageElement = {
    id: element.id,  // 保持 id 一致,这样可以原地替换
    type: 'image' as const,
    src: dataURL,
    x: element.x,
    y: element.y,
    width: 80,  // 默认画布占比 80%
    rotation: element.rotation || 0,
    radius: 0,
    border: 0,
    borderColor: '#000000',
    shadow: false,
    filter: 'none',
    useCutout: false,
    opacity: element.opacity ?? 1,
    originalWidth: Math.round(finalWidth),
    originalHeight: Math.round(finalHeight),
    flipH: element.flipH || false,
    flipV: element.flipV || false,
    locked: element.locked || false,
  } as ImageElement

  return imageElement
}

/** 估算转换后的图片大小(KB) — 用于 UI 提示"转图会增加 ~XX KB" */
export function estimateConvertedSize(element: TextElement): number {
  const lines = (element.content || '').split('\n')
  const totalChars = lines.reduce((sum, l) => sum + l.length, 0)
  // 粗略估计:每个字符 ~0.5KB(base64 编码后)
  return Math.round(totalChars * 0.5)
}
