// 一键美化 + 布局推荐（纯本地算法）
// 关键改进：考虑画板比例大小、主副标题设计感（紧凑/舒展区分）

import type { Element, TextElement } from '../data'
import { pickGoldenPoint } from './composition'

// 画板尺寸表（参考模板实际像素）
const CANVAS_SIZES: Record<string, { width: number; height: number }> = {
  '1:1': { width: 800, height: 800 },
  '3:4': { width: 750, height: 1000 },
  '9:16': { width: 720, height: 1280 },
  '16:9': { width: 1280, height: 720 },
}

// 根据画板大小计算推荐主标题字号（基准：竖屏 9:16 用 64px）
function baseFontSizeForRatio(ratio: string): number {
  const size = CANVAS_SIZES[ratio] || CANVAS_SIZES['9:16']
  // 短边为基准的 1/8（让主标题占短边的 12.5%，符合 1:8 比例美学）
  return Math.round(Math.min(size.width, size.height) / 8)
}

// 一键美化：识别主副标题、调整字号/对比度/阴影 + 排版到黄金比例
// 升级：考虑画板大小 + 主副标题设计感
export function beautifyElements(
  elements: Element[],
  bgColor: string,
  ratio: string = '9:16'
): { updates: Map<string, Partial<TextElement>>, mainId: string | null, subIds: string[] } {
  const textEls = elements.filter(el => el.type === 'text') as TextElement[]
  if (textEls.length === 0) return { updates: new Map(), mainId: null, subIds: [] }

  // 按字号排序找主标题
  const sortedBySize = [...textEls].sort((a, b) => b.fontSize - a.fontSize)
  const mainEl = sortedBySize[0]
  const subEls = sortedBySize.slice(1)

  const bgL = parseInt(bgColor.slice(1), 16)
  const isBgLight = ((bgL >> 16) + ((bgL >> 8) & 0xff) + (bgL & 0xff)) / 3 > 128

  const mainColor = isBgLight ? '#1a1a2e' : '#ffffff'
  const subColor = isBgLight ? 'rgba(26,26,46,0.7)' : 'rgba(255,255,255,0.8)'

  // 1. 主标题字号 = 画板推荐基准（按比例动态）
  const recommendedBase = baseFontSizeForRatio(ratio)
  // 用户原有字号和推荐基准的较大值（避免缩小用户已有的大字）
  const mainFontSize = Math.max(mainEl.fontSize, recommendedBase)

  // 2. 副标题字号按斐波那契（主标题的 0.382 ≈ 1/φ）
  const subFontSize = Math.round(mainFontSize * 0.382)
  // 3. 更次要文字按 0.236 (= 1/φ²)
  const minorFontSize = Math.round(mainFontSize * 0.236)

  const updates = new Map<string, Partial<TextElement>>()
  const mainId = mainEl.id
  const subIds = subEls.map(el => el.id)

  // 4. 主副标题设计感对比：
  //    - 主标题：紧凑字间距（-1px）、大字号、高字重、阴影、对齐 center
  //    - 副标题：舒展字间距（+0.5px）、中字号、中字重
  //    - 次要文字：默认字间距、小字号
  updates.set(mainId, {
    fontSize: mainFontSize,
    fontWeight: 800,
    color: mainColor,
    shadow: true,
    textAlign: 'center' as any,
    letterSpacing: -1,  // 紧凑现代
    x: 50,  // 默认居中
    y: ratio === '16:9' ? 50 : 42,
  } as any)

  subEls.forEach((el, i) => {
    const isSecondary = i === 0
    updates.set(el.id, {
      fontSize: isSecondary ? subFontSize : minorFontSize,
      fontWeight: isSecondary ? 600 : 400,
      color: subColor,
      shadow: false,
      textAlign: 'center' as any,
      letterSpacing: isSecondary ? 0.5 : 1,  // 副标题舒展 +0.5，次要更舒展 +1
      x: 50,
      // 副标题在主标题下方，按斐波那契间距分布
      y: (ratio === '16:9' ? 50 : 42) + (i + 1) * 10,
    } as any)
  })

  return { updates, mainId, subIds }
}

// 布局推荐：根据画布比例 + 现有文字数生成 3 个布局
export interface LayoutPreset {
  name: string
  desc: string
  apply: (elements: Element[]) => Element[]  // 返回重排后的 elements
}

export function recommendLayouts(ratio: string, elements: Element[]): LayoutPreset[] {
  const textEls = elements.filter(el => el.type === 'text') as TextElement[]
  const mainEl = textEls.sort((a, b) => b.fontSize - a.fontSize)[0]
  const subEl = textEls.filter(el => el.id !== mainEl?.id)[0]
  // 黄金比例定位（按画板方向）
  const isPortrait = ratio === '9:16' || ratio === '3:4'
  const mainPos = pickGoldenPoint('main', isPortrait ? 'portrait' : 'landscape')
  const subPos = pickGoldenPoint('sub', isPortrait ? 'portrait' : 'landscape')

  if (isPortrait) {
    return [
      {
        name: '黄金比例',
        desc: '主标题 0.618 分割线，平衡感最强',
        apply: (els) => els.map(el => {
          if (el.id === mainEl?.id) return { ...el, x: mainPos.x, y: mainPos.y, textAlign: 'center' } as any
          if (el.id === subEl?.id) return { ...el, x: subPos.x, y: subPos.y, textAlign: 'center' } as any
          return el
        }),
      },
      {
        name: '居中堆叠',
        desc: '经典对称构图',
        apply: (els) => els.map(el => {
          if (el.id === mainEl?.id) return { ...el, x: 50, y: 38, textAlign: 'center' } as any
          if (el.id === subEl?.id) return { ...el, x: 50, y: 52, textAlign: 'center' } as any
          return el
        }),
      },
      {
        name: '对角呼应',
        desc: '标题右下，副标左上',
        apply: (els) => els.map(el => {
          if (el.id === mainEl?.id) return { ...el, x: 66.67, y: 66.67, textAlign: 'right' } as any
          if (el.id === subEl?.id) return { ...el, x: 33.33, y: 33.33, textAlign: 'left' } as any
          return el
        }),
      },
    ]
  }
  if (ratio === '1:1') {
    return [
      {
        name: '黄金比例',
        desc: '主标 0.618，副标 0.382',
        apply: (els) => els.map(el => {
          if (el.id === mainEl?.id) return { ...el, x: 50, y: 50, textAlign: 'center' } as any
          if (el.id === subEl?.id) return { ...el, x: 50, y: 35, textAlign: 'center' } as any
          return el
        }),
      },
      {
        name: '水平横排',
        desc: '主副标题左右并排',
        apply: (els) => els.map(el => {
          if (el.id === mainEl?.id) return { ...el, x: 30, y: 50, textAlign: 'left' } as any
          if (el.id === subEl?.id) return { ...el, x: 70, y: 50, textAlign: 'right' } as any
          return el
        }),
      },
      {
        name: '对角线',
        desc: '动态非对称',
        apply: (els) => els.map(el => {
          if (el.id === mainEl?.id) return { ...el, x: 25, y: 30, textAlign: 'left' } as any
          if (el.id === subEl?.id) return { ...el, x: 75, y: 70, textAlign: 'right' } as any
          return el
        }),
      },
    ]
  }
  // 16:9 横屏
  return [
    {
      name: '黄金比例',
      desc: '左黄金点主标，右黄金点副标',
      apply: (els) => els.map(el => {
        if (el.id === mainEl?.id) return { ...el, x: 38.2, y: 50, textAlign: 'left' } as any
        if (el.id === subEl?.id) return { ...el, x: 61.8, y: 50, textAlign: 'right' } as any
        return el
      }),
    },
    {
      name: '居中横幅',
      desc: '横屏主副上下',
      apply: (els) => els.map(el => {
        if (el.id === mainEl?.id) return { ...el, x: 50, y: 42, textAlign: 'center' } as any
        if (el.id === subEl?.id) return { ...el, x: 50, y: 60, textAlign: 'center' } as any
        return el
      }),
    },
    {
      name: '右下角锚定',
      desc: '适合 B 站封面',
      apply: (els) => els.map(el => {
        if (el.id === mainEl?.id) return { ...el, x: 75, y: 70, textAlign: 'right' } as any
        if (el.id === subEl?.id) return { ...el, x: 75, y: 85, textAlign: 'right' } as any
        return el
      }),
    },
  ]
}
