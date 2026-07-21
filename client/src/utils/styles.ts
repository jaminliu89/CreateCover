// 5 大设计风格预设 + 设计师 Prompt 决策树
// 纯本地规则引擎，无 LLM 依赖

import type { Element } from '../data'
import { COMPOSITIONS, fibonacciFontScale } from './composition'

export interface DesignStyle {
  id: string
  name: string
  desc: string
  emoji: string
  fontFamily: string  // 字体
  fontWeight: number  // 主标题字重
  fontSizeScale: number  // 字号缩放系数
  letterSpacing: number  // 字符间距 px
  textTransform: 'none' | 'uppercase'
  contrastMode?: 'high' | 'medium' | 'low'  // 主副标题对比强度
  colorPalette: { bg: string; text?: string; primaryText?: string; secondary?: string; secondaryText?: string; accent: string }  // 默认配色
  layout?: 'thirds' | 'golden' | 'spiral' | 'centered'  // 推荐排版
  shadow?: 'none' | 'soft' | 'hard'  // 阴影风格
  borderRadius?: number  // 圆角 px
  textAlign?: 'left' | 'center' | 'right'
  // 设计师 Prompt（决策树解释）
  prompt?: string
  // 新 8 大风格的扩展字段（老 5 大风格不使用）
  radius?: number
  shadowStyle?: 'none' | 'soft' | 'hard'
  compositionType?: 'thirds' | 'golden' | 'spiral' | 'centered'
  designerPrompt?: string
}

// 5 大风格预设
export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'bauhaus',
    name: '包豪斯',
    desc: '几何简洁 + 原色 + 无衬线粗体',
    emoji: '🔴',
    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
    fontWeight: 900,
    fontSizeScale: 1.3,
    letterSpacing: -1,
    textTransform: 'none',
    contrastMode: 'high',
    colorPalette: {
      bg: '#F5F0E8',  // 暖白
      text: '#1A1A1A',  // 纯黑
      secondary: '#D62828',  // 包豪斯红
      accent: '#003049',  // 深蓝
    },
    layout: 'thirds',
    shadow: 'hard',
    borderRadius: 0,
    textAlign: 'left',
    prompt: `风格：包豪斯（1919-1933，德国）。
设计原则：形式追随功能（Form follows function）、少即是多、原色几何、无装饰主义。
字体：粗体无衬线（Helvetica/Inter 900 字重）。
排版：左对齐或三分构图，大字号（48-72px）紧凑排列，letter-spacing 负值（-1px）收紧。
配色：原色（红黄蓝）+ 黑白灰，背景暖白 #F5F0E8。
细节：无圆角（0px），硬阴影（4px 4px 0px #000），对比度极高。
代表：Mies van der Rohe "Less is more"、Bayer 海报。`,
  },
  {
    id: 'italian',
    name: '意大利国际风格',
    desc: '优雅衬线 + 大留白 + 高级灰',
    emoji: '⚜️',
    fontFamily: '"Playfair Display", "Times New Roman", serif',
    fontWeight: 700,
    fontSizeScale: 1.15,
    letterSpacing: 0.5,
    textTransform: 'none',
    contrastMode: 'medium',
    colorPalette: {
      bg: '#FAFAF7',  // 米白
      text: '#2C2C2C',  // 高级灰
      secondary: '#8B7355',  // 暖棕
      accent: '#C9A961',  // 金
    },
    layout: 'golden',
    shadow: 'soft',
    borderRadius: 4,
    textAlign: 'center',
    prompt: `风格：意大利国际风格（Italian International Style，1960s）。
设计原则：优雅、克制、文化品味、永恒感。
字体：衬线（Playfair Display / Didot / Bodoni 700 字重），传递文艺气质。
排版：黄金比例布局，主标题在 0.618 分割线，letter-spacing 正值（+0.5px）舒展。
配色：高级灰 + 米白 + 金色点缀（#C9A961），背景 #FAFAF7。
细节：小圆角（4px），柔和阴影（0 4px 20px rgba(0,0,0,0.08)），中心对齐。
代表：Vogue Italia 杂志、Giorgio Armani 包装。`,
  },
  {
    id: 'neumorphism',
    name: '新拟物风',
    desc: '柔和阴影 + 同色系 + 立体感',
    emoji: '☁️',
    fontFamily: '"SF Pro Display", "Inter", sans-serif',
    fontWeight: 600,
    fontSizeScale: 1.1,
    letterSpacing: 0,
    textTransform: 'none',
    contrastMode: 'low',
    colorPalette: {
      bg: '#E0E5EC',  // 浅蓝灰
      text: '#4A5568',  // 暗灰
      secondary: '#718096',  // 中灰
      accent: '#4299E1',  // 蓝
    },
    layout: 'centered',
    shadow: 'soft',
    borderRadius: 16,
    textAlign: 'center',
    prompt: `风格：新拟物风（Neumorphism / Soft UI，2020+）。
设计原则：触感、柔和、立体感、模拟物理材质。
字体：现代无衬线（SF Pro / Inter 500-600 字重），不喧宾夺主。
排版：居中堆叠，柔和圆角（16px），letter-spacing 默认。
配色：单色系（浅蓝灰 #E0E5EC 背景 + 暗灰文字 + 蓝色点缀）。
细节：双向阴影（左上浅阴影 + 右下深阴影）模拟凸起/凹陷感，柔和无对比。
代表：Apple iOS Big Sur 设计语言、Cathode Mac 应用。`,
  },
  {
    id: 'swiss',
    name: '瑞士国际主义',
    desc: '网格严谨 + Helvetica + 红黑',
    emoji: '🇨🇭',
    fontFamily: '"Helvetica Neue", "Arial", sans-serif',
    fontWeight: 700,
    fontSizeScale: 1.2,
    letterSpacing: -0.5,
    textTransform: 'none',
    contrastMode: 'high',
    colorPalette: {
      bg: '#FFFFFF',  // 纯白
      text: '#000000',  // 纯黑
      secondary: '#666666',  // 灰
      accent: '#E30613',  // 瑞士红
    },
    layout: 'thirds',
    shadow: 'none',
    borderRadius: 0,
    textAlign: 'left',
    prompt: `风格：瑞士国际主义（Swiss Style / International Typographic Style，1950s）。
设计原则：网格系统、客观性、可读性、理性主义。
字体：Helvetica / Akzidenz-Grotesk 700 字重，无装饰。
排版：严格三分构图或网格对齐，左对齐为主，letter-spacing 微负。
配色：黑白为主，瑞士红 #E30613 作为唯一强调色。
细节：无圆角、无阴影，纯净几何。
代表：Müller-Brockmann 海报、Helvetica 字体的视觉典范。`,
  },
  {
    id: 'japanese',
    name: '日式极简',
    desc: '大量留白 + 细体衬线 + 米白',
    emoji: '🎋',
    fontFamily: '"Noto Serif JP", "Source Han Serif", serif',
    fontWeight: 400,
    fontSizeScale: 1.0,
    letterSpacing: 1.5,
    textTransform: 'none',
    contrastMode: 'low',
    colorPalette: {
      bg: '#F4F1EC',  // 和纸米
      text: '#2D2A26',  // 墨黑
      secondary: '#A89B8C',  // 灰茶
      accent: '#B83A4B',  // 朱红
    },
    layout: 'golden',
    shadow: 'none',
    borderRadius: 0,
    textAlign: 'left',
    prompt: `风格：日式极简（Japanese Minimalism）。
设计原则：侘寂、留白、不均整、不对称、自然。
字体：明朝体 / 细体衬线（Noto Serif JP 400 字重），letter-spacing 大（+1.5px）呼吸感。
排版：黄金比例布局，左对齐为主，大量留白（内容只占 40%）。
配色：和纸米 #F4F1EC + 墨黑文字 + 朱红 #B83A4B 点缀。
细节：无圆角、无阴影，元素之间留 30%+ 空白。
代表：无印良品（MUJI）海报、原研哉设计。`,
  },
  {
    // 6. 孟菲斯（80 年代反叛设计，几何+撞色）
    id: 'memphis',
    name: '孟菲斯',
    desc: '几何撞色 + 反叛童趣 + 高饱和',
    emoji: '🎨',
    fontFamily: '"Comic Sans MS", "Marker Felt", sans-serif',
    fontWeight: 700,
    fontSizeScale: 1.05,
    letterSpacing: 0,
    textTransform: 'none',
    colorPalette: {
      bg: '#FFD93D',           // 明黄
      primaryText: '#1a1a1a',  // 墨黑
      secondaryText: '#FF3366',// 桃红
      accent: '#00C2FF',       // 电蓝
    },
    radius: 0,
    shadowStyle: 'hard',
    compositionType: 'spiral',
    designerPrompt: `孟菲斯设计（Memphis Design，1980 年代米兰）。
字体：粗体 Comic Sans / 童趣手写风，800-900 字重。
配色：高饱和度撞色（明黄 + 桃红 + 电蓝 + 墨黑），无中间色。
元素：圆点、波浪线、锯齿、几何方块随意堆叠，毫不规整。
细节：故意打破网格，反叛传统。
代表：Ettore Sottsass、Sottsass Associati。`,
  },
  {
    // 7. 极简瑞士（同包豪斯但更严格网格）
    id: 'swiss-strict',
    name: '极简瑞士',
    desc: '严格网格 + Helvetica + 极简留白',
    emoji: '🇨🇭',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 700,
    fontSizeScale: 1.0,
    letterSpacing: -0.5,
    textTransform: 'none',
    colorPalette: {
      bg: '#FAFAFA',           // 米白
      primaryText: '#1a1a1a',  // 墨黑
      secondaryText: '#666666',
      accent: '#DC2626',       // 单一红
    },
    radius: 0,
    shadowStyle: 'none',
    compositionType: 'thirds',
    designerPrompt: `极简瑞士风格（Swiss Minimalism，1980+）。
字体：Helvetica 极重字重（700-900），紧字距 -0.5px。
配色：米白底 + 墨黑文字 + 单一红色 #DC2626 点缀，无第二种强调色。
元素：严格网格，元素紧贴 38.2% 黄金分割线，巨大留白。
细节：无圆角、无阴影、绝对对齐、字号反差大。
代表：Josef Müller-Brockmann、Helmut Schmid。`,
  },
  {
    // 8. 后现代（80-90 年代，奢华镀金+粉彩）
    id: 'postmodern',
    name: '后现代',
    desc: '奢华镀金 + 粉彩 + 古典复兴',
    emoji: '👑',
    fontFamily: '"Playfair Display", "Times New Roman", serif',
    fontWeight: 700,
    fontSizeScale: 1.1,
    letterSpacing: 0,
    textTransform: 'none',
    colorPalette: {
      bg: '#FFE4E1',           // 樱花粉
      primaryText: '#1a1a1a',  // 墨黑
      secondaryText: '#9370DB',// 紫罗兰
      accent: '#D4AF37',       // 镀金
    },
    radius: 4,
    shadowStyle: 'soft',
    compositionType: 'centered',
    designerPrompt: `后现代设计（Postmodernism，1985-1995）。
字体：Playfair Display 衬线粗体，700 字重，古典复兴风。
配色：粉彩底（樱花粉/薰衣草紫）+ 墨黑文字 + 镀金 #D4AF37 点缀，奢华繁复。
元素：柱式装饰、对称构图、几何花纹，古典元素 + 现代配色混搭。
细节：圆角 4-8px，柔和阴影，装饰大于内容。
代表：Memphis Milano × 80 年代意大利设计。`,
  },
]

// 应用设计风格到 elements
export function applyDesignStyle(
  style: DesignStyle,
  elements: Element[],
  ratio: string
): Map<string, Partial<Element>> {
  const updates = new Map<string, Partial<Element>>()
  const textEls = elements.filter(e => e.type === 'text').sort((a, b) => b.fontSize - a.fontSize)

  // 1. 字号按斐波那契缩放
  const baseSize = textEls[0]?.fontSize || 48
  const newSizes = fibonacciFontScale(baseSize, textEls.length)
  textEls.forEach((el, i) => {
    updates.set(el.id, { fontSize: Math.round(newSizes[i] * style.fontSizeScale) } as any)
  })

  // 2. 排版（按 style.layout 选构图）
  const comp = COMPOSITIONS.find(c => c.name ===
    (style.layout === 'thirds' ? '三分构图'
     : style.layout === 'golden' ? '黄金比例'
     : style.layout === 'spiral' ? '黄金螺线'
     : '居中堆叠')) || COMPOSITIONS[0]
  const positions = comp.apply(elements, ratio)
  positions.forEach((pos, id) => {
    const existing = updates.get(id) || {}
    updates.set(id, { ...existing, x: pos.x, y: pos.y } as any)
  })

  // 3. 字体/字重/间距/对齐
  textEls.forEach((el, i) => {
    const existing = updates.get(el.id) || {}
    const isMain = i === 0
    updates.set(el.id, {
      ...existing,
      fontFamily: style.fontFamily as any,
      fontWeight: isMain ? style.fontWeight : Math.max(400, style.fontWeight - 200) as any,
      letterSpacing: style.letterSpacing as any,
      textAlign: style.textAlign as any,
      color: isMain ? style.colorPalette.text : style.colorPalette.secondary,
      shadow: style.shadow !== 'none',
    } as any)
  })

  // 4. 背景色
  const bgEl = elements.find(e => e.type === 'shape' && (e as any).shape === 'overlay') as any
  if (bgEl) {
    updates.set(bgEl.id, { color: style.colorPalette.bg } as any)
  }

  return updates
}

// 设计师决策树 Prompt（生成"为什么这样设计"的解释）
export function explainDesignChoice(style: DesignStyle, elements: Element[]): string {
  const textCount = elements.filter(e => e.type === 'text').length
  return `🎨 风格：**${style.name}**（${style.desc}）

📐 **排版决策**：
- 采用「${COMPOSITIONS.find(c => c.name === (style.layout === 'thirds' ? '三分构图' : style.layout === 'golden' ? '黄金比例' : style.layout === 'spiral' ? '黄金螺线' : '居中堆叠'))?.name || '三分构图'}」—— ${style.layout === 'thirds' ? '元素放在 4 个视觉交点，符合 F-pattern 扫视习惯' : style.layout === 'golden' ? '主元素在 0.618 黄金分割线，符合 Dieter Rams"少，却更好"' : style.layout === 'spiral' ? '对数螺线分布，构图张力强，引导视线螺旋深入' : '对称居中，传递稳重正式感'}
- 主副标题按**斐波那契数列**缩放（${textCount > 1 ? `${textCount} 项：${fibonacciFontScale(64, textCount).join(' → ')}` : '1 项'}），符合自然视觉节奏
- 字符间距 ${style.letterSpacing}px（${style.letterSpacing > 0 ? '舒展呼吸' : style.letterSpacing < 0 ? '紧凑现代' : '默认'}）

🎨 **配色决策**：
- 背景 ${style.colorPalette.bg}（${style.id === 'bauhaus' ? '包豪斯原色背景' : style.id === 'italian' ? '意大利米白' : style.id === 'neumorphism' ? '新拟物浅蓝灰' : style.id === 'swiss' ? '瑞士纯白' : '日式和纸米'}）
- 主文字 ${style.colorPalette.text} + 强调色 ${style.colorPalette.accent}，对比度 ${style.contrastMode === 'high' ? '极高（视觉冲击）' : style.contrastMode === 'medium' ? '中等（优雅克制）' : '柔和（触感体验）'}

🔤 **字体决策**：
- ${style.fontFamily}
- 字重 ${style.fontWeight}（${style.fontWeight >= 800 ? '极粗（力量感）' : style.fontWeight >= 600 ? '粗（稳健）' : '细（优雅）'}）

💡 **设计师 Prompt 原文**：
${style.prompt}`
}

// 选风格（基于用户偏好或随机）
export function pickStyleForElement(elements: Element[]): DesignStyle {
  // 简化：基于元素数选风格
  const textCount = elements.filter(e => e.type === 'text').length
  if (textCount <= 1) return DESIGN_STYLES[0]  // 少文字 → 包豪斯（强对比）
  if (textCount === 2) return DESIGN_STYLES[1]  // 2 文字 → 意大利（优雅）
  if (textCount >= 4) return DESIGN_STYLES[2]  // 多文字 → 新拟物（柔和）
  return DESIGN_STYLES[3]  // 默认瑞士
}
