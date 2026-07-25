import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Minus, ArrowRight, ArrowDown } from 'lucide-react'
import type { TextElement } from '../data'
import { useEditorStore } from '../store/useEditorStore'

interface FloatingTextToolbarProps {
  element: TextElement
  onUpdate: (patch: Partial<TextElement>) => void
  containerEl: HTMLElement | null  // 文字元素外层 wrapper（用于计算工具条位置）
}

/**
 * 就地浮动工具栏（P0-1 2026-07-25）
 * 选中文字（非编辑态）时浮在元素正上方,提供 4 个高频操作:
 *   - 字号 +/- (每次 ±2px)
 *   - 横排 / 竖排 切换
 * 设计原则: 与 TypeSettings 互补不冲突——TypeSettings 是完整编辑,
 * 浮动工具栏是 1-click 快速调节,减少眼睛和鼠标的移动距离。
 */
export const FloatingTextToolbar: React.FC<FloatingTextToolbarProps> = ({ element, onUpdate, containerEl }) => {
  const [pos, setPos] = useState<{ left: number; top: number; visible: boolean }>({
    left: 0,
    top: 0,
    visible: false,
  })

  useEffect(() => {
    if (!containerEl) {
      setPos((p) => ({ ...p, visible: false }))
      return
    }
    const updatePos = () => {
      const rect = containerEl.getBoundingClientRect()
      setPos({
        left: rect.left + rect.width / 2,
        top: rect.top - 44, // 工具条高 36 + 8px 间距
        visible: rect.width > 0 && rect.height > 0,
      })
    }
    updatePos()
    // ResizeObserver 跟踪元素尺寸变化(用户拖动 handle 改变大小时也要跟随)
    const ro = new ResizeObserver(updatePos)
    ro.observe(containerEl)
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [containerEl])

  const adjustFontSize = (delta: number) => {
    // 从 store 实时读最新值,避免连点 -2 -2 时 React closure 过期导致只生效一次
    // (button click 1 commit 之前 click 2 已读到 render-1 的 element)
    const latest = useEditorStore.getState().elements.find(e => e.id === element.id) as TextElement | undefined
    const currentSize = latest?.fontSize ?? element.fontSize ?? 48
    const newSize = Math.max(8, Math.min(400, currentSize + delta))
    onUpdate({ fontSize: newSize })
  }

  const isVertical = element.writingMode === 'vertical-rl'

  // SSR/早期渲染保护: createPortal 在 document.body 不存在时直接返回 null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      data-floating-text-toolbar
      style={{
        position: 'fixed',
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: pos.visible ? 'flex' : 'none',
      }}
      // 阻止 mousedown 冒泡到画布,避免点工具条时画布 click 切换选中
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="items-center gap-0.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 p-1"
    >
      {/* 字号减小 */}
      <button
        onClick={() => adjustFontSize(-2)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
        title="字号减小 (-2px)"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* 当前字号(只读) */}
      <span className="px-2 text-xs font-semibold text-gray-700 min-w-[40px] text-center tabular-nums select-none">
        {element.fontSize || 48}
      </span>

      {/* 字号增大 */}
      <button
        onClick={() => adjustFontSize(2)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
        title="字号增大 (+2px)"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* 分隔条 */}
      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* 横排 */}
      <button
        onClick={() => onUpdate({ writingMode: 'horizontal-tb' })}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          !isVertical ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="横排"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* 竖排 */}
      <button
        onClick={() => onUpdate({ writingMode: 'vertical-rl' })}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          isVertical ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="竖排"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>,
    document.body
  )
}
