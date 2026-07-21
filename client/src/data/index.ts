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
