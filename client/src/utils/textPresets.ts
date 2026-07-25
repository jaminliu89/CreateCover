import type { TextElement } from '../data'

/**
 * 文字排版预设（P1-1 2026-07-25）
 * 12 个常见文字场景的"一键套用"预设，每个预设含字号/字重/字间距/行高/字体族
 * 应用方式: 点预设按钮 → 批量改当前选中文字元素的 5 个字段
 *
 * 设计原则:
 * - 基于黄金比例 (1/φ ≈ 0.382) 派生相邻字号梯度
 * - 覆盖从大标题(96px)到注释(14px)的完整层级
 * - 字体族以系统默认栈(无网络依赖)+ 中文友好为优先
 */

export interface TextPreset {
  id: string
  name: string           // 中文名（按钮显示）
  icon: string           // emoji 图标
  fontSize: number
  fontWeight: 300 | 400 | 500 | 600 | 700 | 800 | 900
  letterSpacing: number  // px
  lineHeight: number     // 倍数
  fontFamily: string     // CSS font-family
  description: string    // 用途说明（tooltip）
}

// 12 个预设：覆盖标题/副标题/正文/装饰/标签/注释 6 大场景
export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'hero-title',
    name: '主标题',
    icon: '🔥',
    fontSize: 96,
    fontWeight: 900,
    letterSpacing: -2,
    lineHeight: 1.0,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '封面主标题，900 字重 + 紧凑字距',
  },
  {
    id: 'section-title',
    name: '小标题',
    icon: '✨',
    fontSize: 56,
    fontWeight: 700,
    letterSpacing: -1,
    lineHeight: 1.1,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '章节小标题，700 字重 + 略紧凑',
  },
  {
    id: 'slogan',
    name: '口号',
    icon: '📢',
    fontSize: 48,
    fontWeight: 800,
    letterSpacing: -1,
    lineHeight: 1.0,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '品牌口号，超粗体 + 紧凑',
  },
  {
    id: 'subtitle',
    name: '副标',
    icon: '📝',
    fontSize: 32,
    fontWeight: 500,
    letterSpacing: 1,
    lineHeight: 1.3,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '副标题，中等字重 + 略舒展',
  },
  {
    id: 'poem',
    name: '金句',
    icon: '🌸',
    fontSize: 40,
    fontWeight: 300,
    letterSpacing: 4,
    lineHeight: 1.5,
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    description: '诗意短句，细体 + 大字距',
  },
  {
    id: 'body',
    name: '正文',
    icon: '📄',
    fontSize: 24,
    fontWeight: 400,
    letterSpacing: 0.5,
    lineHeight: 1.6,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '正文说明，常规字重 + 1.6 行高',
  },
  {
    id: 'quote',
    name: '引用',
    icon: '💬',
    fontSize: 28,
    fontWeight: 400,
    letterSpacing: 1.5,
    lineHeight: 1.5,
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    description: '引用文字，细体衬线 + 舒展',
  },
  {
    id: 'tag',
    name: '标签',
    icon: '🏷️',
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 2,
    lineHeight: 1.0,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '小标签，600 字重 + 大字距',
  },
  {
    id: 'price',
    name: '报价',
    icon: '💰',
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: -0.5,
    lineHeight: 1.0,
    fontFamily: '"Helvetica Neue", system-ui, sans-serif',
    description: '价格数字，超粗体无衬线',
  },
  {
    id: 'brand',
    name: '品牌',
    icon: '⭐',
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 0,
    lineHeight: 1.1,
    fontFamily: '"Helvetica Neue", system-ui, sans-serif',
    description: '品牌名，800 字重',
  },
  {
    id: 'note',
    name: '注释',
    icon: '📌',
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: 0.3,
    lineHeight: 1.4,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '注释说明，最小字号',
  },
  {
    id: 'warning',
    name: '警示',
    icon: '⚠️',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 1,
    lineHeight: 1.2,
    fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    description: '警示文字，700 字重',
  },
]

/**
 * 应用预设到 TextElement — 返回 patch (不直接修改,让 caller 调 updateElement)
 * 只覆盖 5 个排版字段,保留用户的内容/颜色/位置等
 */
export function applyTextPreset(presetId: string): Partial<TextElement> {
  const preset = TEXT_PRESETS.find(p => p.id === presetId)
  if (!preset) return {}
  return {
    fontSize: preset.fontSize,
    fontWeight: preset.fontWeight,
    letterSpacing: preset.letterSpacing,
    lineHeight: preset.lineHeight,
    fontFamily: preset.fontFamily,
  }
}

/**
 * 找出当前文字元素"最接近"的预设（用于 UI 高亮当前激活的预设）
 * 匹配规则: 5 个字段全部相等才算"匹配"
 */
export function getCurrentPresetId(element: TextElement): string | null {
  for (const p of TEXT_PRESETS) {
    if (
      element.fontSize === p.fontSize &&
      element.fontWeight === p.fontWeight &&
      (element.letterSpacing ?? 0) === p.letterSpacing &&
      (element.lineHeight ?? 1.2) === p.lineHeight &&
      element.fontFamily === p.fontFamily
    ) {
      return p.id
    }
  }
  return null
}
