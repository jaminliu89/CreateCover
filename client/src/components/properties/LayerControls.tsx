import React from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import { ChevronUp, ChevronDown, ArrowUpToLine, ArrowDownToLine, Copy, Trash2 } from 'lucide-react'

interface Props {
  elementId: string
}

const LayerControls: React.FC<Props> = ({ elementId }) => {
  const { elements, moveLayerUp, moveLayerDown, moveLayerToTop, moveLayerToBottom, deleteElement } = useEditorStore()

  const currentIndex = elements.findIndex(el => el.id === elementId)
  // 防御: 元素可能已被删除
  if (currentIndex === -1) return null

  const currentEl = elements[currentIndex]
  // 背景元素检测：shape=overlay 或 id 以 bg 开头
  const isBackground = currentEl.type === 'shape' && (currentEl as any).shape === 'overlay'
    || currentEl.id.startsWith('bg-') || currentEl.id === 'bg'

  // 数组 index 越大 = 数组越靠后 = 渲染越晚 = 视觉越在上
  const isBottom = currentIndex === 0
  // 找到下一个非背景元素索引
  const nextNonBgIndex = elements.findIndex((el, i) => i > currentIndex && !((el.type === 'shape' && (el as any).shape === 'overlay') || el.id.startsWith('bg-') || el.id === 'bg'))
  // 普通元素：是否已到非背景区最顶（再上也找不到非背景）
  const isAtNonBgTop = !isBackground && nextNonBgIndex === -1
  // 背景元素：紧贴第一个非背景时为边界（不能上移）
  const isAtBgBoundary = isBackground && nextNonBgIndex === currentIndex + 1
  // 普通元素：下方紧邻背景层时为底部边界（不能下移/置底，否则会落到背景之下）
  const isAtNonBgBottom = !isBackground && currentIndex > 0 &&
    ((elements[currentIndex - 1].type === 'shape' && (elements[currentIndex - 1] as any).shape === 'overlay')
     || elements[currentIndex - 1].id.startsWith('bg-')
     || elements[currentIndex - 1].id === 'bg')

  // 复制元素: 插入到当前选中元素的"上面一层"（即 currentIndex+1）
  const handleCopy = () => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: Math.min(95, element.x + 5),
      y: Math.min(95, element.y + 5),
    }
    useEditorStore.setState(state => {
      const newElements = [...state.elements]
      newElements.splice(currentIndex + 1, 0, newElement as any)
      return {
        elements: newElements,
        // 选中副本（更符合"复制"操作的心智）
        selectedId: newElement.id,
        dirty: true,
        history: [...state.history.slice(0, state.historyIndex + 1), { elements: newElements, ratio: state.ratio }],
        historyIndex: state.historyIndex + 1,
        canUndo: true,
        canRedo: false,
      }
    })
  }

  // 删除元素
  const handleDelete = () => {
    deleteElement(elementId)
  }

  // 通用操作: 操作后给个明显视觉反馈（点亮对应的图层条）
  const [highlightBar, setHighlightBar] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (highlightBar !== null) {
      const t = setTimeout(() => setHighlightBar(null), 400)
      return () => clearTimeout(t)
    }
  }, [highlightBar])

  const wrap = (fn: () => void) => () => {
    fn()
    setHighlightBar(currentIndex)
  }

  // 竖向堆叠的图层列表 — 顶在上, 底在下（符合用户心智）
  // elements[0] = 最底, elements[N-1] = 最顶 → 倒序显示
  const reversed = elements.map((el, idx) => ({ el, idx })).reverse()

  return (
    <div className="space-y-4 mb-6">
      {/* 图层位置显示 */}
      <div className="bg-gray-50 rounded-xl p-3">
        <div className="text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>📚 图层顺序</span>
          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold">
            第 {currentIndex + 1} 层 / 共 {elements.length} 层
          </span>
        </div>

        {/* 背景元素提示 */}
        {isBackground && (
          <div className="mb-2 px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-[10px] text-purple-700 flex items-center gap-1.5">
            <span>🔒</span>
            <span>背景层已锁定在底部，不会遮挡其他元素</span>
          </div>
        )}

        {/* 竖向图层条 — 顶在上底在下，符合用户对"上层/下层"的心智模型 */}
        <div className="flex flex-col gap-1 mb-3 p-1.5 bg-white rounded-lg">
          {reversed.map(({ el, idx }) => {
            const isCurrent = idx === currentIndex
            const isHi = highlightBar === idx
            const isBg = (el.type === 'shape' && (el as any).shape === 'overlay') || el.id.startsWith('bg-') || el.id === 'bg'
            // 越靠上 (idx 越大) → 越亮
            const tone = isCurrent
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-md ring-2 ring-orange-300'
              : isHi
                ? 'bg-gradient-to-r from-yellow-200 to-orange-200 scale-105'
                : isBg
                  ? 'bg-purple-50 text-purple-600'
                  : idx >= elements.length - 2
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
            return (
              <div
                key={idx}
                className={`h-5 px-2 rounded text-[10px] flex items-center justify-between transition-all ${tone}`}
                title={`第 ${idx + 1} 层${isBg ? '（背景层）' : ''}${isCurrent ? '（当前选中）' : ''}`}
              >
                <span className="flex items-center gap-1">
                  {isBg && <span>🔒</span>}
                  <span>第 {idx + 1} 层{isBg ? ' · 背景' : ''}</span>
                </span>
                {isCurrent && <span>● 当前</span>}
              </div>
            )
          })}
        </div>

        {/* 控制按钮 */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={wrap(() => moveLayerUp(elementId))}
            disabled={isAtBgBoundary || isAtNonBgTop}
            className="py-2 px-1 bg-white rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 group"
            title={isBackground ? '背景层已锁定，不能上移' : '上移一层 (⌘/Ctrl + ])'}
          >
            <ChevronUp size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px]">上移</span>
          </button>
          <button
            onClick={wrap(() => moveLayerDown(elementId))}
            disabled={isBottom || isAtNonBgBottom}
            className="py-2 px-1 bg-white rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 group"
            title={isAtNonBgBottom ? '下方已是背景层，不能再下移' : '下移一层 (⌘/Ctrl + [)'}
          >
            <ChevronDown size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px]">下移</span>
          </button>
          <button
            onClick={wrap(() => moveLayerToTop(elementId))}
            disabled={isAtBgBoundary || isAtNonBgTop}
            className="py-2 px-1 bg-white rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 group"
            title={isBackground ? '背景层已锁定，不能置顶' : '移到最顶层 (⌘/Ctrl + Shift + ])'}
          >
            <ArrowUpToLine size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px]">置顶</span>
          </button>
          <button
            onClick={wrap(() => moveLayerToBottom(elementId))}
            disabled={isBottom || isAtNonBgBottom}
            className="py-2 px-1 bg-white rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5 group"
            title={isAtNonBgBottom ? '下方已是背景层，不能置底' : '移到最底层 (⌘/Ctrl + Shift + [)'}
          >
            <ArrowDownToLine size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px]">置底</span>
          </button>
        </div>

        {/* 复制/删除 */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <button
            onClick={handleCopy}
            className="py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-1.5 group"
            title="复制元素"
          >
            <Copy size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">复制</span>
          </button>
          <button
            onClick={wrap(handleDelete)}
            disabled={isBackground}
            className="py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 group"
            title={isBackground ? '背景层已锁定，不能删除' : '删除元素'}
          >
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">删除</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LayerControls
