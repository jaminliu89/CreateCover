import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Copy, Clipboard, Trash2, Lock, Unlock, Group, Ungroup,
  ImageDown, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
} from 'lucide-react'
import { useEditorStore, isBackgroundElement } from '../store/useEditorStore'
import { showToast } from '../store/useToastStore'
import type { Element } from '../data'

export interface ContextMenuState {
  x: number
  y: number
  targetId: string | null
}

interface Props {
  state: ContextMenuState | null
  onClose: () => void
}

interface MenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  disabled?: boolean
  danger?: boolean
  separator?: boolean
}

function MenuRow({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  if (item.separator) {
    return <div className="my-1 border-t border-gray-100" />
  }
  return (
    <button
      onClick={() => {
        if (item.disabled) return
        item.action()
        onClose()
      }}
      disabled={item.disabled}
      className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors ${
        item.disabled
          ? 'opacity-40 cursor-not-allowed'
          : item.danger
            ? 'hover:bg-red-50 text-red-600'
            : 'hover:bg-orange-50 text-gray-700'
      }`}
    >
      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
      <span className="flex-1 text-xs font-medium">{item.label}</span>
      {item.shortcut && (
        <span className="text-[10px] text-gray-400 font-mono">{item.shortcut}</span>
      )}
    </button>
  )
}

/**
 * 画布右键菜单 — 替代浏览器默认菜单，提供 Figma/PS 风格的元素操作入口
 * - 右键元素：先选中 + 展示该元素可执行的所有操作
 * - 右键空白：只展示「粘贴」等画布级操作
 * - 点击外部 / Esc / 滚动时自动关闭
 */
export default function ContextMenu({ state, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPos, setAdjustedPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!state) return
    const menu = menuRef.current
    if (!menu) return
    const rect = menu.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let x = state.x
    let y = state.y
    if (x + rect.width > vw - 8) x = vw - rect.width - 8
    if (y + rect.height > vh - 8) y = vh - rect.height - 8
    if (x < 8) x = 8
    if (y < 8) y = 8
    setAdjustedPos({ x, y })
  }, [state])

  useEffect(() => {
    if (!state) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleScroll = () => onClose()
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [state, onClose])

  if (!state) return null

  const store = useEditorStore.getState()
  const { selectedId, multiSelectedIds, elements } = store

  // 决定操作目标
  const targetIds = new Set(
    multiSelectedIds.length > 0
      ? multiSelectedIds
      : (selectedId ? [selectedId] : (state.targetId ? [state.targetId] : []))
  )
  const targetElements: Element[] = elements.filter(el => targetIds.has(el.id))
  const isMulti = targetElements.length > 1
  const hasNonBgTarget = targetElements.some(el => !isBackgroundElement(el))
  const hasRasterizable = targetElements.some(el =>
    el.type === 'text' || (el.type === 'shape' && (el as any).shape !== 'overlay')
  )
  const hasGroup = targetElements.some(el => el.groupId)
  const canGroup = targetElements.length >= 2 && hasNonBgTarget
  const allLocked = targetElements.some(el => el.locked && true) && targetElements.every(el => el.locked)

  const items: MenuItem[] = []

  // ── 空白画布菜单 ──
  if (targetElements.length === 0) {
    items.push({
      label: '粘贴',
      icon: <Clipboard size={14} />,
      shortcut: '⌘V',
      action: () => showToast('💡 暂未实现跨应用粘贴，可点击模板套用'),
      disabled: true,
    })
    items.push({ label: '', separator: true, action: () => {} })
    items.push({
      label: '选中全部',
      icon: <Copy size={14} />,
      shortcut: '⌘A',
      action: () => {
        store.selectAll()
        onClose()
      },
    })
    return createPortal(
      <div
        ref={menuRef}
        style={{ position: 'fixed', top: adjustedPos.y, left: adjustedPos.x, zIndex: 9999 }}
        className="bg-white rounded-xl shadow-2xl border border-gray-200 py-1 min-w-[200px] text-sm text-gray-700"
      >
        {items.map((item, i) => (
          <MenuRow key={i} item={item} onClose={onClose} />
        ))}
      </div>,
      document.body
    )
  }

  // ── 元素菜单 ──
  if (hasNonBgTarget) {
    items.push({
      label: isMulti ? `复制选中（${targetElements.length}）` : '复制选中',
      icon: <Copy size={14} />,
      shortcut: '⌘D',
      action: () => {
        const nonBg = targetElements.filter(el => !isBackgroundElement(el))
        nonBg.forEach(el => store.duplicateElement(el.id))
        showToast(`📋 已复制 ${nonBg.length} 个元素`)
      },
    })
  }

  items.push({ label: '', separator: true, action: () => {} })

  if (hasNonBgTarget) {
    items.push({
      label: allLocked ? '解锁选中' : '锁定选中',
      icon: allLocked ? <Unlock size={14} /> : <Lock size={14} />,
      shortcut: '⌘⇧L',
      action: () => {
        const nonBg = targetElements.filter(el => !isBackgroundElement(el))
        nonBg.forEach(el => store.toggleLock(el.id))
        showToast(allLocked ? '🔓 已解锁' : '🔒 已锁定')
      },
    })
  }

  if (canGroup) {
    items.push({
      label: '编组',
      icon: <Group size={14} />,
      shortcut: '⌘G',
      action: () => {
        const ids = targetElements.filter(el => !isBackgroundElement(el)).map(el => el.id)
        const gid = store.groupElements(ids)
        if (gid) showToast(`📦 已编组（${ids.length} 个元素）`)
      },
    })
  }
  if (hasGroup) {
    items.push({
      label: '取消编组',
      icon: <Ungroup size={14} />,
      shortcut: '⌘⇧G',
      action: () => {
        store.ungroupSelected()
        showToast('已取消编组')
      },
    })
  }

  if (hasRasterizable && hasNonBgTarget) {
    const rasterCount = targetElements.filter(e =>
      e.type === 'text' || (e.type === 'shape' && (e as any).shape !== 'overlay')
    ).length
    items.push({
      label: isMulti ? `栅格化（${rasterCount}）` : '栅格化',
      icon: <ImageDown size={14} />,
      action: () => {
        store.rasterizeSelected()
        showToast(`🖼️ 已栅格化 ${rasterCount} 个元素`)
      },
    })
  }

  items.push({ label: '', separator: true, action: () => {} })

  if (hasNonBgTarget) {
    items.push({
      label: '置于顶层',
      icon: <ChevronsUp size={14} />,
      action: () => {
        targetElements.forEach(el => {
          if (!isBackgroundElement(el)) store.moveLayerToTop(el.id)
        })
        showToast('⬆️ 已置于顶层')
      },
    })
    items.push({
      label: '上移一层',
      icon: <ChevronUp size={14} />,
      action: () => {
        targetElements.forEach(el => {
          if (!isBackgroundElement(el)) store.moveLayerUp(el.id)
        })
        showToast('⬆️ 已上移一层')
      },
    })
    items.push({
      label: '下移一层',
      icon: <ChevronDown size={14} />,
      action: () => {
        targetElements.forEach(el => {
          if (!isBackgroundElement(el)) store.moveLayerDown(el.id)
        })
        showToast('⬇️ 已下移一层')
      },
    })
    items.push({
      label: '置于底层',
      icon: <ChevronsDown size={14} />,
      action: () => {
        targetElements.forEach(el => {
          if (!isBackgroundElement(el)) store.moveLayerToBottom(el.id)
        })
        showToast('⬇️ 已置于底层')
      },
    })
  }

  items.push({ label: '', separator: true, action: () => {} })

  if (hasNonBgTarget) {
    items.push({
      label: isMulti ? `删除选中（${targetElements.length}）` : '删除',
      icon: <Trash2 size={14} />,
      shortcut: 'Del',
      action: () => {
        const nonBg = targetElements.filter(el => !isBackgroundElement(el))
        nonBg.forEach(el => store.deleteElement(el.id))
        showToast(`🗑️ 已删除 ${nonBg.length} 个元素`)
      },
      danger: true,
    })
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: adjustedPos.y, left: adjustedPos.x, zIndex: 9999 }}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 py-1 min-w-[200px] text-sm text-gray-700"
    >
      {items.map((item, i) => (
        <MenuRow key={i} item={item} onClose={onClose} />
      ))}
    </div>,
    document.body
  )
}
