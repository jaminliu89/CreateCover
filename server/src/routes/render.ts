import { Router, Request, Response } from 'express'
import sharp from 'sharp'

const router = Router()

// ---- 画布尺寸 ----------------------------------------------------------------

const RATIO_SIZES: Record<string, { w: number; h: number }> = {
  '3:4':  { w: 480, h: 640 },
  '1:1':  { w: 500, h: 500 },
  '9:16': { w: 405, h: 720 },
  '16:9': { w: 720, h: 405 },
}

// ---- SVG 生成 ----------------------------------------------------------------

interface RenderElement {
  type: 'text' | 'image' | 'shape'
  id: string
  x: number
  y: number
  rotation?: number
  opacity?: number
  // text
  content?: string
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  textAlign?: string
  stroke?: boolean
  strokeWidth?: number
  strokeColor?: string
  shadow?: boolean
  bg?: boolean
  bgColor?: string
  bgPadding?: number
  // image
  src?: string
  width?: number
  radius?: number
  border?: number
  borderColor?: string
  // shape
  shape?: string
  height?: number
}

interface RenderBody {
  elements: RenderElement[]
  ratio: string
  format?: 'png' | 'svg'
}

function buildSvg(elements: RenderElement[], ratio: string): string {
  const size = RATIO_SIZES[ratio] || RATIO_SIZES['9:16']
  const w = size.w
  const h = size.h

  let content = ''
  for (const el of elements) {
    const elX = (el.x / 100) * w
    const elY = (el.y / 100) * h
    const transform = `translate(${elX}, ${elY}) rotate(${el.rotation ?? 0})`
    const opacity = el.opacity !== undefined ? el.opacity : 1

    if (el.type === 'text') {
      const fs = el.fontSize ?? 36
      const fw = el.fontWeight ?? 700
      const ff = el.fontFamily ?? 'sans-serif'
      const color = el.color ?? '#FFFFFF'
      const align = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'
      const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'

      let textTag = ``
      textTag += `<text x="0" y="0" font-family="${ff}" font-size="${fs}" font-weight="${fw}" fill="${color}" text-anchor="${anchor}" dominant-baseline="central" opacity="${opacity}"`

      if (el.shadow) {
        textTag += ` filter="url(#shadow)"`
      }

      textTag += ` transform="${transform}"`

      if (el.stroke && el.strokeColor && el.strokeWidth) {
        textTag += ` stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" paint-order="stroke fill"`
      }

      textTag += `>${escapeXml(el.content ?? '')}</text>`

      // bg 色块
      if (el.bg) {
        const bgColor = el.bgColor ?? '#FF5E3A'
        const pd = el.bgPadding ?? 8
        const textLen = (el.content ?? '').length * fs * 0.55
        const bgW = textLen + pd * 2
        const bgH = fs + pd * 2
        content += `<rect x="${elX - bgW / 2}" y="${elY - bgH / 2}" width="${bgW}" height="${bgH}" rx="4" fill="${bgColor}" opacity="${opacity}"/>`
      }

      content += textTag
    } else if (el.type === 'image' && el.src) {
      const iw = (el.width ?? 50) / 100 * w
      const imgH = iw * 0.75 // assume 4:3 aspect

      content += `<image href="${el.src}" x="${-iw / 2}" y="${-imgH / 2}" width="${iw}" height="${imgH}" transform="${transform}" opacity="${opacity}"/>`
    } else if (el.type === 'shape') {
      if (el.shape === 'overlay') {
        content += `<rect x="0" y="${h / 2}" width="${w}" height="${h / 2}" fill="url(#overlayGrad)" opacity="${opacity}"/>`
      } else if (el.shape === 'rect') {
        const sw = (el.width ?? 80)
        const sh = (el.height ?? 80)
        content += `<rect x="${elX - sw / 2}" y="${elY - sh / 2}" width="${sw}" height="${sh}" fill="${el.color ?? '#000000'}" opacity="${opacity}"/>`
      } else if (el.shape === 'circle') {
        const r = (el.width ?? 80) / 2
        content += `<circle cx="${elX}" cy="${elY}" r="${r}" fill="${el.color ?? '#000000'}" opacity="${opacity}"/>`
      }
    }
  }

  const { defs, gradDef } = buildDefs()

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    ${defs}
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    ${gradDef}
  </defs>
  <rect width="${w}" height="${h}" fill="#000000"/>
  ${content}
</svg>`
}

function buildDefs(): { defs: string; gradDef: string } {
  const defs: string[] = []
  const gradDef = `<linearGradient id="overlayGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.85"/>
  </linearGradient>`

  return { defs: defs.join('\n'), gradDef }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ---- 路由 -------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const { elements, ratio, format } = req.body as RenderBody

    if (!elements || !Array.isArray(elements) || !ratio) {
      return res.status(400).json({ error: '缺少 elements 或 ratio' })
    }

    const svg = buildSvg(elements, ratio)

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml')
      return res.send(svg)
    }

    // 默认输出 PNG（2x 高清）
    const size = RATIO_SIZES[ratio] || RATIO_SIZES['9:16']
    const pngBuffer = await sharp(Buffer.from(svg))
      .resize(size.w * 2, size.h * 2)
      .png()
      .toBuffer()

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `attachment; filename="cover-${Date.now()}.png"`)
    res.send(pngBuffer)
  } catch (err: any) {
    console.error('render error:', err)
    res.status(500).json({ error: err.message || '渲染失败' })
  }
})

export default router
