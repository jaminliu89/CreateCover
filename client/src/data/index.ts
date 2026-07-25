export interface Template {
  id: string
  name: string
  ratio: '3:4' | '1:1' | '9:16' | '16:9'
  category: string  // 内容类型：爆款标题/数字震撼/悬念钩子/教程/种草/...
  subCategory?: string  // 子类型：美妆/穿搭/美食/...
  platform: '小红书' | '抖音' | 'B站' | '通用'  // 目标平台
  layout: string  // 设计风格：包豪斯/意大利/新拟物/瑞士/日式极简
  bg?: string  // 背景色（用于快速预览）
  thumbnail: string
  elements: Element[]
}

export type Element = TextElement | ImageElement | ShapeElement

export interface TextElement {
  id: string
  type: 'text'
  content: string
  x: number
  y: number
  fontSize: number
  fontWeight: number
  fontFamily: string
  color: string
  textAlign: 'left' | 'center' | 'right'
  italic: boolean
  underline: boolean
  stroke: boolean
  strokeWidth?: number
  strokeColor?: string
  shadow: boolean
  bg: boolean
  bgColor: string
  bgPadding: number
  rotation: number
  opacity: number
  flipH?: boolean  // 水平镜像翻转
  flipV?: boolean  // 垂直镜像翻转
  locked?: boolean  // 锁定后不可拖拽/缩放/旋转
  groupId?: string  // 编组 ID（同组元素一起移动/删除）
  // 文字排版扩展（P0-2/3 需求 2026-07-25）：都是可选字段，老数据没设置时按默认值走
  letterSpacing?: number  // 字间距（px），默认 0
  lineHeight?: number  // 行高倍数，默认 1.2
  writingMode?: 'horizontal-tb' | 'vertical-rl'  // 横排/竖排，默认 'horizontal-tb'
  // 渐变文字（P1-2 2026-07-25）：存在时优先于 color 字段
  // 通过 background + background-clip: text 实现
  colorGradient?: { from: string; to: string; angle: number }  // angle: 0-360 度
  // 字符级描边（P1-8 2026-07-25）：开启后每个字符按 index%5 循环使用 palette 描边色
  // 适合"彩虹标题"等需要每个字不同描边的场景
  strokeColorPerChar?: boolean
}

export interface ImageElement {
  id: string
  type: 'image'
  src?: string  // base64 / url / '__IMAGE_LOST__' 占位
  x: number
  y: number
  width: number
  rotation: number
  radius: number
  border: number
  borderColor: string
  shadow: boolean
  filter: string
  useCutout: boolean
  opacity: number
  originalWidth?: number
  originalHeight?: number
  flipH?: boolean
  flipV?: boolean
  locked?: boolean
  groupId?: string
}

export interface ShapeElement {
  id: string
  type: 'shape'
  shape: 'rect' | 'circle' | 'tag' | 'line' | 'overlay'
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  opacity: number
  radius?: number
  border?: number
  borderColor?: string
  flipH?: boolean
  flipV?: boolean
  locked?: boolean
  groupId?: string
}

export * from './templates'
export * from './titles'
