import type { TextElement } from '../data'
import { getShortSide } from './canvasConstants'

/**
 * AI 自动排版（P2-1 2026-07-25）
 * 基于"文字密度 + 画布比例 + 多元素层级"本地算法,自动推荐字号/字重/字间距/行高/位置
 * **不依赖 LLM**,0 网络成本 0 延迟,纯数学推导
 *
 * 核心算法:
 * 1. 文字密度 = 有效字符数 / 画布短边 → 决定字号档位
 * 2. 元素层级 = 按字号排序(已有) → 主/副/装饰 三档
 * 3. 位置 = 黄金分割 0.382/0.618 (主/副) 或 居中堆叠 (单元素)
 * 4. 比例适配 = 各比例短边系数,避免 9:16 时主标题过大
 * 5. 字重/字间距 = 字号档位决定 (大标题紧,正文松)
 */

export type LayoutTier = 'hero' | 'main' | 'sub' | 'body' | 'note'  // 5 个字号档位

interface TextAnalysis {
  charCount: number          // 有效字符数(中文 1.5, 英文 1.0, emoji 0.5)
  hasEmoji: boolean          // 是否含 emoji
  hasPunctuation: boolean    // 是否含标点
  hasLongWord: boolean       // 是否含 ≥10 字母的英文长词
}

/** 文字分析:统计有效字符数和特征 */
export function analyzeText(text: string): TextAnalysis {
  const cleaned = (text || '').trim()
  let charCount = 0
  let hasEmoji = false
  let hasPunctuation = false
  let hasLongWord = false

  // 检测 emoji(简化:匹配常见 emoji 范围)
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
  for (const ch of cleaned) {
    if (emojiRegex.test(ch)) {
      charCount += 0.5
      hasEmoji = true
    } else if (/[\u4e00-\u9fff]/.test(ch)) {
      // 中文字符 1.5 权重
      charCount += 1.5
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      charCount += 1.0
    } else if (/[,.!?;:]/.test(ch)) {
      hasPunctuation = true
    }
  }
  // 检测长英文词
  const words = cleaned.match(/[a-zA-Z]{10,}/g)
  hasLongWord = !!words && words.length > 0

  return { charCount, hasEmoji, hasPunctuation, hasLongWord }
}

/** 根据"文字密度"决定字号档位
 * 密度 = charCount / 短边,密度越大字号越小(文字越长越要缩小)
 */
function getFontSizeByTier(tier: LayoutTier, ratioShort: number): number {
  // 基础字号表(对应画布短边 540,1:1)
  const sizeMap: Record<LayoutTier, number> = {
    hero: 140,   // 超大标题(1-3 字,如"炸!")
    main: 90,    // 主标题(4-8 字)
    sub: 50,     // 副标(9-15 字)
    body: 32,    // 正文(16-30 字)
    note: 20,    // 注释(30+ 字)
  }
  // 比例系数: 9:16 短边 405 < 1:1 短边 540,9:16 主标题要小 0.75x
  const ratioFactor = ratioShort / 540
  const size = sizeMap[tier] * ratioFactor
  return Math.round(size)
}

/** 字号档位 → 字重 / 字间距 / 行高 推荐表 */
interface LayoutSpec {
  fontSize: number
  fontWeight: 400 | 500 | 600 | 700 | 800 | 900
  letterSpacing: number
  lineHeight: number
}

function getLayoutSpec(tier: LayoutTier, ratioShort: number): LayoutSpec {
  const fontSize = getFontSizeByTier(tier, ratioShort)
  const specMap: Record<LayoutTier, Omit<LayoutSpec, 'fontSize'>> = {
    hero: { fontWeight: 900, letterSpacing: -2, lineHeight: 1.0 },
    main: { fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 },
    sub: { fontWeight: 600, letterSpacing: 0, lineHeight: 1.2 },
    body: { fontWeight: 400, letterSpacing: 0.5, lineHeight: 1.5 },
    note: { fontWeight: 400, letterSpacing: 0.3, lineHeight: 1.4 },
  }
  return { fontSize, ...specMap[tier] }
}

/** 根据 charCount 决定 tier */
function getTier(charCount: number): LayoutTier {
  if (charCount <= 4) return 'hero'
  if (charCount <= 10) return 'main'
  if (charCount <= 20) return 'sub'
  if (charCount <= 40) return 'body'
  return 'note'
}

/** 多元素层级位置分配(黄金分割 + 均匀分布) */
function getPositionForIndex(idx: number, total: number): { x: number; y: number } {
  if (total === 1) return { x: 50, y: 50 }
  if (total === 2) {
    // 黄金分割: 主标题 0.382, 副标 0.618
    return idx === 0 ? { x: 50, y: 38 } : { x: 50, y: 62 }
  }
  if (total === 3) {
    // 主/副/装饰 三段式
    const yMap = [32, 50, 70]
    return { x: 50, y: yMap[idx] }
  }
  // 4+ 元素: 均匀分布 y 从 20% 到 80%
  const startY = 20
  const endY = 80
  const step = (endY - startY) / (total - 1)
  return { x: 50, y: Math.round(startY + step * idx) }
}

/** 给单个 text 元素生成 AI 排版 patch */
function patchForTextElement(el: TextElement, idx: number, total: number, ratio: string): Partial<TextElement> {
  const analysis = analyzeText(el.content || '')
  const tier = getTier(analysis.charCount)
  const ratioShort = getShortSide(ratio as any)
  const spec = getLayoutSpec(tier, ratioShort)
  const pos = getPositionForIndex(idx, total)

  return {
    fontSize: spec.fontSize,
    fontWeight: spec.fontWeight,
    letterSpacing: spec.letterSpacing,
    lineHeight: spec.lineHeight,
    x: pos.x,
    y: pos.y,
  }
}

/**
 * 主函数:对 elements 中所有文字元素应用 AI 排版
 * 返回 Map<id, patch> 供 caller 调 updateElement
 * 保留: 内容/颜色/字体族/旋转/翻转 (这些是用户内容,不动)
 */
export function autoLayout(elements: any[], ratio: string): Map<string, Partial<TextElement>> {
  const textElements = elements.filter(el => el.type === 'text')
  const patches = new Map<string, Partial<TextElement>>()

  textElements.forEach((el, idx) => {
    const patch = patchForTextElement(el, idx, textElements.length, ratio)
    patches.set(el.id, patch)
  })

  return patches
}

/** 报告 AI 排版结果摘要(用于 toast 显示) */
export function summarizeAutoLayout(elements: any[]): string {
  const textElements = elements.filter(el => el.type === 'text')
  const tiers = textElements.map(el => getTier(analyzeText(el.content || '').charCount))
  const tierCount: Record<string, number> = {}
  tiers.forEach(t => { tierCount[t] = (tierCount[t] || 0) + 1 })
  const parts = Object.entries(tierCount).map(([tier, n]) => {
    const names: Record<string, string> = { hero: '超大', main: '主', sub: '副', body: '正', note: '注' }
    return `${names[tier]}×${n}`
  })
  return parts.join(' / ') || '无文字'
}
