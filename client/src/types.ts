export type Ratio = '3:4' | '1:1' | '9:16' | '16:9'

export interface Project {
  id: string
  name: string
  ratio: Ratio
  elements: Element[]
  thumbnail?: string
  createdAt: number
  updatedAt: number
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
  flipH?: boolean
  flipV?: boolean
  locked?: boolean
  groupId?: string
  // 文字排版扩展
  letterSpacing?: number
  lineHeight?: number
  writingMode?: 'horizontal-tb' | 'vertical-rl'
  // 渐变文字：存在时优先于 color
  colorGradient?: { from: string; to: string; angle: number }
  // 字符级描边：每字符循环调色板
  strokeColorPerChar?: boolean
  // 文字特效：text-shadow 多层组合
  effects?: { glow?: boolean; threeD?: boolean; emboss?: boolean }
}

export interface ImageElement {
  id: string
  type: 'image'
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
  src: string
  originalWidth: number
  originalHeight: number
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

export interface Template {
  id: string
  name: string
  ratio: Ratio
  category: string
  thumbnail: string
  elements: Element[]
}

export interface Title {
  id: string
  content: string
  category: string
  ctrScore: number
}

export interface TitleGenerateRequest {
  keyword: string
  count?: number
}

export interface TitleGenerateResponse {
  titles: Array<{
    content: string
    score: number
    tags: string[]
    advice: string
  }>
}

export interface CutoutRequest {
  image: string
}

export interface CutoutResponse {
  success: boolean
  cutoutUrl: string
  processingTime: number
}

export const RATIO_SIZES: Record<Ratio, { width: number; height: number }> = {
  '3:4': { width: 900, height: 1200 },
  '1:1': { width: 1080, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '16:9': { width: 1920, height: 1080 },
}
