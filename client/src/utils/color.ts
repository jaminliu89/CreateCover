// 颜色工具：HSL 转换 / 亮度 / 对比度 / 配色方案
// 纯本地算法，无 LLM 依赖

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

// hex → RGB
export function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '').match(/[a-f0-9]{2}/gi)
  if (!m || m.length < 3) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) }
}

// RGB → hex
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// RGB → HSL
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

// HSL → RGB
export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl))
}

// WCAG 亮度（0-1）
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const norm = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b)
}

// 对比度 1-21
export function contrast(c1: string, c2: string): number {
  const l1 = luminance(c1), l2 = luminance(c2)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

// 给定背景色，返回对比度 ≥ 4.5 的文字色（黑或白）
export function pickReadableText(bg: string): string {
  return contrast(bg, '#ffffff') >= contrast(bg, '#000000') ? '#ffffff' : '#000000'
}

// 给定背景色，返回次要文字色（半透明灰）
export function pickSecondaryText(bg: string): string {
  const text = pickReadableText(bg)
  // 次要文字：主文字色 + 60% 透明度（在白底或深底上都能融）
  return text === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
}

// 智能配色方案（4 套）
export interface ColorScheme {
  name: string
  bg: string
  primaryText: string  // 主标题
  secondaryText: string  // 副标题
  accent: string  // 强调色（emoji / 边框）
  desc: string
}

export function generateColorSchemes(bg: string): ColorScheme[] {
  const hsl = rgbToHsl(hexToRgb(bg))
  const isLight = hsl.l > 50
  const hue = hsl.h

  // 1. 当前色（保持）— 调整文字对比
  // 2. 类比配色：hue ±30
  // 3. 互补配色：hue + 180
  // 4. 三色：hue + 120
  // 5. 高对比反差：黑白极简

  const schemes: ColorScheme[] = [
    {
      name: '保持当前',
      bg,
      primaryText: pickReadableText(bg),
      secondaryText: pickSecondaryText(bg),
      accent: hslToHex({ h: hue, s: 80, l: isLight ? 40 : 60 }),
      desc: '基于当前色微调',
    },
    {
      name: '类比配色',
      bg: hslToHex({ h: hue, s: Math.max(20, hsl.s - 20), l: isLight ? 92 : 12 }),
      primaryText: pickReadableText(hslToHex({ h: hue, s: Math.max(20, hsl.s - 20), l: isLight ? 92 : 12 })),
      secondaryText: 'rgba(128,128,128,0.9)',
      accent: hslToHex({ h: (hue + 30) % 360, s: 75, l: 50 }),
      desc: '同色系渐变',
    },
    {
      name: '互补撞色',
      bg: hslToHex({ h: hue, s: Math.min(80, hsl.s + 20), l: isLight ? 88 : 14 }),
      primaryText: pickReadableText(hslToHex({ h: hue, s: Math.min(80, hsl.s + 20), l: isLight ? 88 : 14 })),
      secondaryText: 'rgba(128,128,128,0.9)',
      accent: hslToHex({ h: (hue + 180) % 360, s: 85, l: 50 }),
      desc: '强对比视觉冲击',
    },
    {
      name: '三色活力',
      bg: hslToHex({ h: hue, s: hsl.s * 0.4, l: isLight ? 95 : 10 }),
      primaryText: pickReadableText(hslToHex({ h: hue, s: hsl.s * 0.4, l: isLight ? 95 : 10 })),
      secondaryText: 'rgba(128,128,128,0.9)',
      accent: hslToHex({ h: (hue + 120) % 360, s: 70, l: 55 }),
      desc: '三点配色活泼',
    },
    {
      name: '极简黑白',
      bg: '#ffffff',
      primaryText: '#000000',
      secondaryText: 'rgba(0,0,0,0.6)',
      accent: '#FF5E3A',
      desc: '永不过时',
    },
    {
      // 6. 莫兰迪色（低饱和度，柔和高级）
      name: '莫兰迪',
      bg: hslToHex({ h: hue, s: Math.min(hsl.s * 0.35, 25), l: isLight ? 92 : 15 }),
      primaryText: pickReadableText(hslToHex({ h: hue, s: Math.min(hsl.s * 0.35, 25), l: isLight ? 92 : 15 })),
      secondaryText: 'rgba(128,128,128,0.9)',
      accent: hslToHex({ h: (hue + 60) % 360, s: 35, l: 55 }),
      desc: '低饱和度高级感',
    },
    {
      // 7. 日落黄昏（暖色调，氛围感）
      name: '日落黄昏',
      bg: hslToHex({ h: 20, s: 70, l: isLight ? 90 : 15 }),  // 固定暖色 hue=20
      primaryText: pickReadableText(hslToHex({ h: 20, s: 70, l: isLight ? 90 : 15 })),
      secondaryText: 'rgba(128,128,128,0.9)',
      accent: hslToHex({ h: 320, s: 80, l: 55 }),  // 紫色点缀
      desc: '暖橙到粉紫渐变',
    },
    {
      // 8. 森林自然（绿色调，沉静）
      name: '森林自然',
      bg: hslToHex({ h: 130, s: 30, l: isLight ? 92 : 12 }),  // 固定绿色 hue=130
      primaryText: pickReadableText(hslToHex({ h: 130, s: 30, l: isLight ? 92 : 12 })),
      secondaryText: 'rgba(128,128,128,0.9)',
      accent: hslToHex({ h: 30, s: 75, l: 50 }),  // 橙黄点缀
      desc: '沉静自然色',
    },
  ]
  return schemes
}

// 提取图片主色（从 url 取 canvas 像素，简单平均）
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 50
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, size, size)
      try {
        const data = ctx.getImageData(0, 0, size, size).data
        let r = 0, g = 0, b = 0, n = 0
        for (let i = 0; i < data.length; i += 4) {
          // 跳过近白色/近黑色背景
          const a = data[i + 3]
          if (a < 200) continue
          const R = data[i], G = data[i + 1], B = data[i + 2]
          if (R > 240 && G > 240 && B > 240) continue
          if (R < 15 && G < 15 && B < 15) continue
          r += R; g += G; b += B; n++
        }
        if (n === 0) return resolve('#ffffff')
        resolve(rgbToHex({ r: r / n, g: g / n, b: b / n }))
      } catch {
        resolve('#ffffff')
      }
    }
    img.onerror = () => resolve('#ffffff')
    img.src = imageUrl
  })
}
