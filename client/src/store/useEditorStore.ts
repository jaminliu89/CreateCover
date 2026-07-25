import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Element, TextElement, ShapeElement } from '../data'
import type { Ratio } from '../types'
import { rasterizeTextElement, rasterizeShapeElement, canRasterize } from '../utils/rasterize'
import { getShortSide } from '../utils/canvasConstants'
import { autoLayout as aiAutoLayout, summarizeAutoLayout } from '../utils/autoLayout'
import { convertTextElementToImage } from '../utils/textToImage'

// 背景元素检测：id 以 'bg' 开头 或 shape 是 overlay
// 背景元素锁定在数组最前，禁止上移/置顶（避免覆盖文字）
export const isBackgroundElement = (el: Element): boolean => {
  return (el.type === 'shape' && el.shape === 'overlay') || el.id.startsWith('bg-') || el.id === 'bg'
}

interface HistoryState {
  elements: Element[]
  ratio: Ratio
}

interface EditorState {
  elements: Element[]
  ratio: Ratio
  selectedId: string | null
  multiSelectedIds: string[]
  editingElementId: string | null
  history: HistoryState[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  currentProjectId: string | null
  currentProjectName: string
  dirty: boolean

  // 用户偏好
  forceNoStroke: boolean
  setForceNoStroke: (v: boolean) => void

  // 构图参考线（D-2 2026-07-25：纯视觉叠加，不参与导出/拖拽命中/历史）
  showGuides: boolean
  guideType: 'thirds' | 'golden' | 'center' | 'all'
  toggleGuides: () => void
  setGuideType: (t: 'thirds' | 'golden' | 'center' | 'all') => void

  // 用户自定义预设
  userPresets: { id: string; name: string; ratio: Ratio; elements: Element[]; createdAt: number; thumbnail: string }[]
  saveAsPreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void

  // 基础操作
  setRatio: (ratio: Ratio) => void
  adaptFontSizeToRatio: (oldRatio: Ratio, newRatio: Ratio) => void
  autoLayout: () => string  // P2-1 2026-07-25: 返回摘要给 caller 显示 toast
  convertTextToImage: (id: string) => boolean  // P2-2 2026-07-25: 返回是否成功
  addElement: (element: Element) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  deleteElement: (id: string) => void
  deleteMany: (ids: string[]) => void
  updateMany: (ids: string[], updates: Partial<Element>) => void
  duplicateElement: (id: string) => void
  nudgeElement: (id: string, dx: number, dy: number) => void
  setSelected: (id: string | null) => void
  setEditingElement: (id: string | null) => void
  setOpacityForSelection: (opacity: number) => void
  toggleMultiSelect: (id: string) => void
  selectMany: (ids: string[]) => void
  clearMultiSelect: () => void
  // 编组/取消编组
  groupElements: (ids: string[]) => string  // 返回 groupId
  ungroup: (groupId: string) => void
  ungroupSelected: () => void
  // 锁定/解锁元素
  toggleLock: (id: string) => void
  // 栅格化：将文字/形状元素转为图片元素（不可再编辑文字/形状属性）
  rasterizeElement: (id: string) => void
  // 批量栅格化（多选用）
  rasterizeSelected: () => void
  // 画布视口缩放（不影响元素本身，只影响画布显示大小）
  viewportZoom: number
  setViewportZoom: (z: number) => void
  // 全选：选画布内所有非背景元素
  selectAll: () => void
  // 反选：选当前未选中的元素
  invertSelection: () => void
  // 水平垂直对齐（多选用）
  alignElements: (ids: string[], type: 'left' | 'centerH' | 'right' | 'top' | 'centerV' | 'bottom') => void
  // 平均分布（多选用，≥3 元素）
  distributeElements: (ids: string[], axis: 'h' | 'v') => void
  setElements: (elements: Element[]) => void
  markDirty: () => void
  loadProject: (id: string | null, name: string, ratio: Ratio, elements: Element[]) => void

  // 图层操作
  moveLayerUp: (id: string) => void
  moveLayerDown: (id: string) => void
  moveLayerToTop: (id: string) => void
  moveLayerToBottom: (id: string) => void

  // 历史记录
  saveHistory: () => void
  undo: () => void
  redo: () => void
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      elements: [],
  ratio: '9:16',
  selectedId: null,
  multiSelectedIds: [],
  editingElementId: null,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  currentProjectId: null,
  currentProjectName: '未命名项目',
  dirty: false,

  setRatio: (ratio) => {
    set({ ratio, dirty: true })
    get().saveHistory()
  },

  /**
   * 等比缩放字号（P1-3 2026-07-25）
   * 当画布比例从 oldRatio 切到 newRatio 时,按"短边比例"缩放所有文字字号
   * 例: 9:16 (短边 405) → 16:9 (短边 405) = 1.0x 不变
   *     9:16 (短边 405) → 1:1 (短边 540) = 1.33x 所有文字字号
   * 保留: 字重/字间距/行高/字体/位置/颜色（只改 fontSize）
   */
  adaptFontSizeToRatio: (oldRatio, newRatio) => {
    if (oldRatio === newRatio) return
    const oldShort = getShortSide(oldRatio)
    const newShort = getShortSide(newRatio)
    const scale = newShort / oldShort
    set(state => ({
      elements: state.elements.map(el => {
        if (el.type !== 'text') return el
        return { ...el, fontSize: Math.round((el as any).fontSize * scale) }
      }),
      dirty: true,
    }))
    get().saveHistory()
  },

  /**
   * AI 自动排版（P2-1 2026-07-25）
   * 本地算法: 文字密度 + 比例 + 多元素层级 → 自动调整字号/字重/字间距/行高/位置
   * 保留: 内容/颜色/字体族/旋转/翻转 (用户内容不动)
   * 返回摘要字符串 "超大×1 / 主×1 / 副×1" 给 toast 显示
   */
  autoLayout: () => {
    const { elements, ratio } = get()
    const patches = aiAutoLayout(elements, ratio)
    if (patches.size === 0) return '无文字元素'
    set(state => ({
      elements: state.elements.map(el => {
        const patch = patches.get(el.id)
        return patch ? { ...el, ...patch } : el
      }) as Element[],
      dirty: true,
    }))
    get().saveHistory()
    return summarizeAutoLayout(elements)
  },

  /**
   * 文字转图片（P2-2 2026-07-25）
   * 把指定 id 的 TextElement 用 Canvas2D 渲染成 ImageElement
   * 保留: x/y/rotation/flip/opacity/locked
   * 丢失: 内容编辑/字号/字重/字间距/渐变/描边 (转图后固化)
   * 返回 true 成功 / false 失败
   */
  convertTextToImage: (id) => {
    const target = get().elements.find(el => el.id === id)
    if (!target || target.type !== 'text') return false
    const imageEl = convertTextElementToImage(target as TextElement)
    if (!imageEl) return false
    set(state => ({
      elements: state.elements.map(el => el.id === id ? imageEl : el) as Element[],
      selectedId: id,  // 保持选中(现在选中的是图片)
      dirty: true,
    }))
    get().saveHistory()
    return true
  },

  addElement: (element) => {
    set(state => ({ elements: [...state.elements, element], selectedId: element.id, dirty: true }))
    get().saveHistory()
  },

  updateElement: (id, updates) => {
    set(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, ...updates } as Element : el
      ),
      dirty: true,
    }))
  },

  deleteElement: (id) => {
    set(state => {
      const target = state.elements.find(el => el.id === id)
      // 背景元素永拒删除（位置永远锁死在最底）
      if (target && isBackgroundElement(target)) return state
      return {
        elements: state.elements.filter(el => el.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
        multiSelectedIds: state.multiSelectedIds.filter(x => x !== id),
        dirty: true,
      }
    })
    get().saveHistory()
  },

  // 批量删除（多选用）
  deleteMany: (ids: string[]) => {
    set(state => {
      // 过滤掉背景元素 id，背景永拒删
      const safeIds = ids.filter(id => {
        const el = state.elements.find(e => e.id === id)
        return el ? !isBackgroundElement(el) : false
      })
      const idSet = new Set(safeIds)
      return {
        elements: state.elements.filter(el => !idSet.has(el.id)),
        selectedId: state.selectedId && idSet.has(state.selectedId) ? null : state.selectedId,
        multiSelectedIds: [],
        dirty: true,
      }
    })
    get().saveHistory()
  },

  // 批量更新（多选后统一改色/透明度用）
  updateMany: (ids: string[], updates: Partial<Element>) => {
    set(state => {
      const idSet = new Set(ids)
      return {
        elements: state.elements.map(el => idSet.has(el.id) ? { ...el, ...updates } as Element : el),
        dirty: true,
      }
    })
  },

  duplicateElement: (id) => {
    const state = get()
    const source = state.elements.find(el => el.id === id)
    if (!source) return
    const copy: Element = {
      ...source,
      id: `${source.type}-${Date.now()}`,
      x: source.x + 3,
      y: source.y + 3,
    } as Element
    set(s => ({ elements: [...s.elements, copy], selectedId: copy.id, dirty: true }))
    get().saveHistory()
  },

  nudgeElement: (id, dx, dy) => {
    set(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } as Element : el
      ),
      dirty: true,
    }))
  },

  setSelected: (id) => {
    set({ selectedId: id, multiSelectedIds: id ? [id] : [], editingElementId: null })
  },

  // 设置/清除文字编辑态（双击进入，Esc/失焦退出）
  setEditingElement: (id) => {
    set({ editingElementId: id })
  },

  // 批量设置透明度（快捷键 0-9 调用）：单选/多选都支持
  setOpacityForSelection: (opacity) => {
    set(state => {
      const ids = state.multiSelectedIds.length > 0 ? state.multiSelectedIds : (state.selectedId ? [state.selectedId] : [])
      if (ids.length === 0) return state
      const idSet = new Set(ids)
      return {
        elements: state.elements.map(el => idSet.has(el.id) ? { ...el, opacity } as Element : el),
        dirty: true,
      }
    })
    get().saveHistory()
  },

  // 锁定/解锁元素（拖拽/缩放/旋转会被拦截）
  toggleLock: (id) => {
    set(state => ({
      elements: state.elements.map(el => el.id === id ? { ...el, locked: !el.locked } as Element : el),
      dirty: true,
    }))
    get().saveHistory()
  },

  // 栅格化单个元素：文字/形状 → 图片（保留位置/翻转/锁定/编组）
  rasterizeElement: (id) => {
    const state = get()
    const el = state.elements.find(x => x.id === id)
    if (!el || !canRasterize(el)) return

    let rasterized: Element | null = null
    if (el.type === 'text') {
      rasterized = rasterizeTextElement(el as TextElement, state.ratio)
    } else if (el.type === 'shape') {
      rasterized = rasterizeShapeElement(el as ShapeElement, state.ratio)
    }
    if (!rasterized) return

    set({
      elements: state.elements.map(x => x.id === id ? rasterized! : x),
      dirty: true,
    })
    get().saveHistory()
  },

  // 批量栅格化：对当前多选/单选的所有可栅格化元素执行栅格化
  rasterizeSelected: () => {
    const state = get()
    const targetIds = new Set(
      state.multiSelectedIds.length > 0
        ? state.multiSelectedIds
        : (state.selectedId ? [state.selectedId] : [])
    )
    if (targetIds.size === 0) return

    const rasterizedMap = new Map<string, Element>()
    for (const el of state.elements) {
      if (!targetIds.has(el.id) || !canRasterize(el)) continue
      let rasterized: Element | null = null
      if (el.type === 'text') {
        rasterized = rasterizeTextElement(el as TextElement, state.ratio)
      } else if (el.type === 'shape') {
        rasterized = rasterizeShapeElement(el as ShapeElement, state.ratio)
      }
      if (rasterized) rasterizedMap.set(el.id, rasterized)
    }
    if (rasterizedMap.size === 0) return

    set({
      elements: state.elements.map(x => rasterizedMap.get(x.id) || x),
      dirty: true,
    })
    get().saveHistory()
  },

  // 画布视口缩放（不影响元素本身大小，只改变画布视觉大小）
  viewportZoom: 1,
  setViewportZoom: (z) => set({ viewportZoom: Math.max(0.2, Math.min(4, z)) }),

  // 切换多选（Cmd/Ctrl+点击用）
  toggleMultiSelect: (id) => {
    set(state => {
      if (state.multiSelectedIds.includes(id)) {
        const newIds = state.multiSelectedIds.filter(x => x !== id)
        return { multiSelectedIds: newIds, selectedId: newIds[newIds.length - 1] || null }
      }
      return { multiSelectedIds: [...state.multiSelectedIds, id], selectedId: id }
    })
  },

  // 框选：替换多选集
  selectMany: (ids) => {
    set({ multiSelectedIds: ids, selectedId: ids[ids.length - 1] || null })
  },

  // 全选：选中所有非背景元素
  selectAll: () => {
    const state = get()
    const ids = state.elements
      .filter(el => !isBackgroundElement(el))
      .map(el => el.id)
    set({
      multiSelectedIds: ids,
      selectedId: ids[ids.length - 1] || null,
    })
  },

  // 反选：选当前未选中的元素（排除背景）
  invertSelection: () => {
    const state = get()
    const selected = new Set(state.multiSelectedIds)
    const ids = state.elements
      .filter(el => !isBackgroundElement(el) && !selected.has(el.id))
      .map(el => el.id)
    set({
      multiSelectedIds: ids,
      selectedId: ids[ids.length - 1] || null,
    })
  },

  // 清除多选
  clearMultiSelect: () => {
    set({ multiSelectedIds: [], selectedId: null })
  },

  // 将 ids 列表编为一组（生成新 groupId，给所有这些元素打上同一 groupId）
  groupElements: (ids) => {
    if (ids.length < 2) return ''
    const newGroupId = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const idSet = new Set(ids)
    set(state => ({
      elements: state.elements.map(el => idSet.has(el.id) ? { ...el, groupId: newGroupId } as Element : el),
      dirty: true,
    }))
    get().saveHistory()
    return newGroupId
  },

  // 按 groupId 取消编组（移除 groupId 字段）
  ungroup: (groupId) => {
    set(state => ({
      elements: state.elements.map(el => el.groupId === groupId ? { ...el, groupId: undefined } as Element : el),
      dirty: true,
    }))
    get().saveHistory()
  },

  // 取消当前选中的所有元素的编组
  ungroupSelected: () => {
    set(state => {
      const selectedIds = new Set(state.multiSelectedIds.length > 0 ? state.multiSelectedIds : (state.selectedId ? [state.selectedId] : []))
      if (selectedIds.size === 0) return state
      const groupIds = new Set<string>()
      state.elements.forEach(el => {
        if (selectedIds.has(el.id) && el.groupId) groupIds.add(el.groupId)
      })
      if (groupIds.size === 0) return state
      return {
        elements: state.elements.map(el => (el.groupId && groupIds.has(el.groupId)) ? { ...el, groupId: undefined } as Element : el),
        dirty: true,
      }
    })
    get().saveHistory()
  },

  // 计算元素的 AABB 边界（统一用估算像素再转百分比）
  // 返回 { centerX, centerY, halfW, halfH }（百分比）
  alignElements: (ids, type) => {
    const state = get()
    if (ids.length < 2) return
    const targets = state.elements.filter(el => ids.includes(el.id) && !isBackgroundElement(el))
    if (targets.length < 2) return
    // 画布像素尺寸（按比例）— 用于把文字 fontSize 转 % 边界
    const ratioMap: Record<string, [number, number]> = {
      '1:1': [720, 720], '3:4': [720, 960], '9:16': [720, 1280], '16:9': [1280, 720],
    }
    const [cw, ch] = ratioMap[state.ratio] || [720, 720]
    // 算每个元素的边界框（百分比）
    const bounds = targets.map(el => {
      const w = (el.type === 'text')
        ? Math.max(2, (el.content?.length || 0) * ((el as any).fontSize || 32) * 0.55 / cw * 100)
        : ((el as any).width ?? 20)
      const h = (el.type === 'text')
        ? (((el as any).fontSize || 32) * 1.2 / ch * 100)
        : ((el as any).height ?? 20)
      const cx = (el as any).x ?? 50
      const cy = (el as any).y ?? 50
      return {
        id: el.id,
        minX: cx - w / 2, maxX: cx + w / 2,
        minY: cy - h / 2, maxY: cy + h / 2,
        w, h,
      }
    })
    // 算目标边界（取最值/中间）
    let targetVal: number
    if (type === 'left') targetVal = Math.min(...bounds.map(b => b.minX))
    else if (type === 'right') targetVal = Math.max(...bounds.map(b => b.maxX))
    else if (type === 'centerH') targetVal = (Math.min(...bounds.map(b => b.minX)) + Math.max(...bounds.map(b => b.maxX))) / 2
    else if (type === 'top') targetVal = Math.min(...bounds.map(b => b.minY))
    else if (type === 'bottom') targetVal = Math.max(...bounds.map(b => b.maxY))
    else if (type === 'centerV') targetVal = (Math.min(...bounds.map(b => b.minY)) + Math.max(...bounds.map(b => b.maxY))) / 2
    else return

    // 应用更新
    const idToPos = new Map<string, { x?: number; y?: number }>()
    bounds.forEach(b => {
      if (type === 'left') idToPos.set(b.id, { x: targetVal + b.w / 2 })
      else if (type === 'right') idToPos.set(b.id, { x: targetVal - b.w / 2 })
      else if (type === 'centerH') idToPos.set(b.id, { x: targetVal })
      else if (type === 'top') idToPos.set(b.id, { y: targetVal + b.h / 2 })
      else if (type === 'bottom') idToPos.set(b.id, { y: targetVal - b.h / 2 })
      else if (type === 'centerV') idToPos.set(b.id, { y: targetVal })
    })
    set(state => ({
      elements: state.elements.map(el => {
        const pos = idToPos.get(el.id)
        return pos ? { ...el, ...pos } as Element : el
      }),
      dirty: true,
    }))
    get().saveHistory()
  },

  // 平均分布：水平/垂直等距（≥3 元素，按中心点等分首尾距离）
  distributeElements: (ids, axis) => {
    const state = get()
    if (ids.length < 3) return
    const targets = state.elements.filter(el => ids.includes(el.id) && !isBackgroundElement(el))
    if (targets.length < 3) return
    const items = targets.map(el => ({
      id: el.id,
      center: axis === 'h' ? ((el as any).x ?? 50) : ((el as any).y ?? 50),
    }))
    items.sort((a, b) => a.center - b.center)
    const first = items[0].center
    const last = items[items.length - 1].center
    const step = (last - first) / (items.length - 1)
    const idToPos = new Map<string, number>()
    items.forEach((item, i) => idToPos.set(item.id, first + i * step))
    set(state => ({
      elements: state.elements.map(el => {
        const v = idToPos.get(el.id)
        if (v === undefined) return el
        return axis === 'h' ? { ...el, x: v } as Element : { ...el, y: v } as Element
      }),
      dirty: true,
    }))
    get().saveHistory()
  },

  setElements: (elements) => {
    // 默认无描边规则：应用模板/批量加载时强制把 TextElement 的 stroke 设为 false
    // 用户可主动在 TypeSettings 勾选 stroke 重新加回去
    const finalElements = get().forceNoStroke
      ? elements.map(el =>
          el.type === 'text' ? { ...el, stroke: false } : el
        )
      : elements
    set({ elements: finalElements, selectedId: null, multiSelectedIds: [], dirty: true })
    get().saveHistory()
  },

  // 是否默认清除描边（持久化到 localStorage）
  forceNoStroke: true,
  setForceNoStroke: (v) => set({ forceNoStroke: v }),

  // 构图参考线（默认关闭，纯视觉，不进历史/不持久化）
  showGuides: false,
  guideType: 'thirds',
  toggleGuides: () => set(s => ({ showGuides: !s.showGuides })),
  setGuideType: (t) => set({ guideType: t }),

  // 用户自定义预设
  userPresets: [],
  saveAsPreset: (name: string) => {
    const state = get()
    const id = `preset-${Date.now()}`
    // 生成缩略图：找背景色 + 主标题色 → 渐变背景 + 文字预览
    const bgEl = state.elements.find(el => isBackgroundElement(el)) as any
    const bgColor = (bgEl?.color as string) || '#1a1a2e'
    const textEl = state.elements.find(el => el.type === 'text' && !(el as any).id?.startsWith('tag-') && !(el as any).id?.startsWith('label-')) as any
    const textColor = (textEl?.color as string) || '#ffffff'
    const mainText = (textEl?.content as string)?.slice(0, 8) || name.slice(0, 8)
    const preset = {
      id, name,
      ratio: state.ratio,
      elements: state.elements.map(el => ({ ...el, id: `${el.id}-${Date.now()}` })),  // 重新生成 id 避免冲突
      createdAt: Date.now(),
      thumbnail: JSON.stringify({ bg: bgColor, fg: textColor, main: mainText }),
    }
    set({ userPresets: [preset, ...state.userPresets] })
  },
  loadPreset: (id: string) => {
    const preset = get().userPresets.find(p => p.id === id)
    if (!preset) return
    get().loadProject(null, preset.name, preset.ratio, preset.elements)
  },
  deletePreset: (id: string) => {
    set(state => ({ userPresets: state.userPresets.filter(p => p.id !== id) }))
  },

  markDirty: () => {
    set({ dirty: true })
  },

  loadProject: (id, name, ratio, elements) => {
    set({
      elements,
      ratio,
      selectedId: null,
      multiSelectedIds: [],
      currentProjectId: id,
      currentProjectName: name,
      dirty: false,
      history: [{ elements: [...elements], ratio }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    })
  },

  // 图层上移
  moveLayerUp: (id) => {
    set(state => {
      const index = state.elements.findIndex(el => el.id === id)
      if (index === -1 || index === state.elements.length - 1) return state
      const target = state.elements[index]

      // 背景元素锁定：永拒
      if (isBackgroundElement(target)) return state

      // 普通元素：跨过连续的背景层（移到所有背景之后）
      let swapWithIdx = index + 1
      while (swapWithIdx < state.elements.length && isBackgroundElement(state.elements[swapWithIdx])) {
        swapWithIdx++
      }
      if (swapWithIdx >= state.elements.length) return state // 已到非背景区最顶
      const newElements = [...state.elements]
      const [current] = newElements.splice(index, 1)
      newElements.splice(swapWithIdx, 0, current)
      return { elements: newElements, dirty: true }
    })
    get().saveHistory()
  },

  // 移到最顶层
  moveLayerToTop: (id) => {
    set(state => {
      const element = state.elements.find(el => el.id === id)
      if (!element) return state
      if (isBackgroundElement(element)) return state
      // 移到所有非背景元素的末尾（背景始终在数组最前）
      const bgs = state.elements.filter(el => isBackgroundElement(el))
      const otherNonBgs = state.elements.filter(el => el.id !== id && !isBackgroundElement(el))
      return { elements: [...bgs, ...otherNonBgs, element], dirty: true }
    })
    get().saveHistory()
  },

  // 图层下移
  moveLayerDown: (id) => {
    set(state => {
      const index = state.elements.findIndex(el => el.id === id)
      if (index <= 0) return state
      // 背景元素永拒
      const target = state.elements[index]
      if (isBackgroundElement(target)) return state
      // 普通元素下移：不能跨过背景层（如果下方紧邻背景，就不能再下）
      if (isBackgroundElement(state.elements[index - 1])) return state
      const newElements = [...state.elements]
      ;[newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]]
      return { elements: newElements, dirty: true }
    })
    get().saveHistory()
  },

  // 移到最底层
  moveLayerToBottom: (id) => {
    set(state => {
      const element = state.elements.find(el => el.id === id)
      if (!element) return state
      // 背景元素已经在最底，重复操作无意义
      if (isBackgroundElement(element)) return state
      // 普通元素：移到所有背景层之后（不是 array[0]）
      const bgs = state.elements.filter(el => isBackgroundElement(el))
      const otherNonBgs = state.elements.filter(el => el.id !== id && !isBackgroundElement(el))
      // 顺序：背景 → 当前元素 → 其他非背景
      return { elements: [...bgs, element, ...otherNonBgs], dirty: true }
    })
    get().saveHistory()
  },

  // 保存历史（30步）
  saveHistory: () => {
    const state = get()
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push({ elements: [...state.elements], ratio: state.ratio })
    
    if (newHistory.length > 30) {
      newHistory.shift()
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    })
  },

  // 撤销
  undo: () => {
    const state = get()
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      const historyState = state.history[newIndex]
      // 撤销后保留选中态（如果选中的元素还在）
      const stillExists = historyState.elements.some(el => el.id === state.selectedId)
      set({
        elements: [...historyState.elements],
        ratio: historyState.ratio,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        selectedId: stillExists ? state.selectedId : null,
      })
    }
  },

  // 重做
  redo: () => {
    const state = get()
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1
      const historyState = state.history[newIndex]
      const stillExists = historyState.elements.some(el => el.id === state.selectedId)
      set({
        elements: [...historyState.elements],
        ratio: historyState.ratio,
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
        selectedId: stillExists ? state.selectedId : null,
      })
    }
  },
    }),
    {
      name: 'createcover-editor-state',
      storage: createJSONStorage(() => localStorage),
      // 只持久化关键字段（避免 localStorage 5MB 限制和脏数据）
      partialize: (state) => ({
        elements: state.elements.map(el => {
          // 图片元素的 base64 src 太大，刷新后会丢失，标记为占位
          if (el.type === 'image' && el.src && el.src.startsWith('data:')) {
            return { ...el, src: '__IMAGE_LOST__' }
          }
          return el
        }),
        ratio: state.ratio,
        currentProjectId: state.currentProjectId,
        currentProjectName: state.currentProjectName,
        forceNoStroke: state.forceNoStroke,
        // 用户预设也持久化（base64 仍会被过滤，刷新后图片占位）
        userPresets: state.userPresets.map(preset => ({
          ...preset,
          elements: preset.elements.map(el =>
            el.type === 'image' && el.src && el.src.startsWith('data:')
              ? { ...el, src: '__IMAGE_LOST__' }
              : el
          ),
        })),
      }),
      // hydrate 时标记 dirty 让用户知道有恢复内容
      onRehydrateStorage: () => (state) => {
        if (state && state.elements.length > 0) {
          state.dirty = false  // 恢复的内容算"已保存"
        }
      },
    }
  )
)
