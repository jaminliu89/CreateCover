import { useEffect } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { showToast, showConfirm } from '../store/useToastStore'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

interface ShortcutOptions {
  onSave?: () => void
}

/** 把 File 读成 base64 并创建图片元素添加到画布（导出供 Canvas 拖拽复用） */
export function addImageFromFile(file: File) {
  if (file.size > MAX_IMAGE_SIZE) {
    showToast('图片不能超过 10MB', { type: 'error' })
    return
  }
      const reader = new FileReader()
      reader.onload = (ev) => {
        useEditorStore.getState().addElement({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'image',
          src: ev.target?.result as string,
          x: 50, y: 50,
          width: 80,  // 默认 80% 让图片立刻是画面主角（可继续拖角到 10000%）
      rotation: 0, radius: 0,
      border: 0, borderColor: '#000000',
      shadow: false, filter: 'none',
      useCutout: false, opacity: 1,
    } as any)
    showToast('图片已添加到画布')
  }
  reader.readAsDataURL(file)
}

export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const { onSave } = options

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // 输入框/文本域/可编辑区域内不响应快捷键
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // 但 Ctrl+S 仍然拦截
        if (!((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's')) return
      }

      const store = useEditorStore.getState()
      const { selectedId, multiSelectedIds, editingElementId, undo, redo, deleteElement, duplicateElement, nudgeElement, saveHistory, setOpacityForSelection, selectAll, invertSelection } = store
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      // 数字键 0-9 调透明度（Figma 风格）：1=10%, 5=50%, 0=100%
      // 编辑态（正在编辑文字）不响应
      if (!mod && !editingElementId && (selectedId || multiSelectedIds.length > 0) && /^[0-9]$/.test(e.key)) {
        e.preventDefault()
        const num = parseInt(e.key, 10)
        // Shift 修饰：5→50% 不变；0→0%；9→90%
        // 普通：0→100%（与 Figma 一致，0 表示完整可见）
        const opacity = num === 0 ? 1 : num / 10
        setOpacityForSelection(opacity)
        return
      }

      // Ctrl+Z 撤销 / Ctrl+Shift+Z 或 Ctrl+Y 重做
      if (mod && key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((mod && key === 'y') || (mod && e.shiftKey && key === 'z')) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl+S 保存
      if (mod && key === 's') {
        e.preventDefault()
        onSave?.()
        return
      }

      // Ctrl+D 复制选中元素
      if (mod && key === 'd' && selectedId) {
        e.preventDefault()
        duplicateElement(selectedId)
        return
      }

      // Ctrl+Shift+L 锁定/解锁选中元素（加 Shift 防误触 —— L 单独太容易按到）
      if (mod && e.shiftKey && key === 'l' && selectedId) {
        e.preventDefault()
        store.toggleLock(selectedId)
        return
      }

      // Ctrl+G 编组选中元素（多选 ≥2 时）
      if (mod && !e.shiftKey && key === 'g') {
        const ids = store.multiSelectedIds.length >= 2 ? store.multiSelectedIds : (store.selectedId ? [store.selectedId] : [])
        if (ids.length >= 2) {
          e.preventDefault()
          store.groupElements(ids)
          showToast(`📦 已编组（${ids.length} 个元素）`)
          return
        }
      }
      // Ctrl+Shift+G 取消编组
      if (mod && e.shiftKey && key === 'g') {
        e.preventDefault()
        store.ungroupSelected()
        showToast('已取消编组')
        return
      }

      // Ctrl/Cmd + 0  画布视口重置 100%
      if (mod && e.key === '0') {
        e.preventDefault()
        store.setViewportZoom(1)
        return
      }
      // Ctrl/Cmd + = / +  画布放大
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        const cur = useEditorStore.getState().viewportZoom
        store.setViewportZoom(Math.min(4, cur + 0.1))
        return
      }
      // Ctrl/Cmd + -  画布缩小
      if (mod && e.key === '-') {
        e.preventDefault()
        const cur = useEditorStore.getState().viewportZoom
        store.setViewportZoom(Math.max(0.2, cur - 0.1))
        return
      }

      // Delete / Backspace 删除选中元素（加 confirm 防误触）
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        const target: any = store.elements.find(x => x.id === selectedId)
        const label = target?.type === 'text' ? (target.content?.slice(0, 12) || '文字')
                    : target?.type === 'image' ? '图片'
                    : target?.type === 'shape' ? '形状'
                    : '元素'
        const needConfirm = target && target.type !== 'background-like' && (
          target.type === 'text' ? (target.content?.length ?? 0) > 0
          : target.type === 'image' || target.type === 'shape'
        )
        if (needConfirm) {
          showConfirm({
            title: '删除元素',
            message: `确定删除这个「${label}」元素？`,
            confirmText: '删除',
            cancelText: '取消',
            danger: true,
          }).then(ok => { if (ok) deleteElement(selectedId) })
        } else {
          // 背景或空文字：直接删
          deleteElement(selectedId)
        }
        return
      }

      // Cmd/Ctrl + ]  上移一层 (Figma 风格)
      // Cmd/Ctrl + [  下移一层
      // Cmd/Ctrl + Shift + ]  置顶
      // Cmd/Ctrl + Shift + [  置底
      if (mod && (e.key === ']' || e.key === '[') && selectedId) {
        e.preventDefault()
        const { moveLayerUp, moveLayerDown, moveLayerToTop, moveLayerToBottom } = store
        if (e.key === ']') {
          if (e.shiftKey) moveLayerToTop(selectedId)
          else moveLayerUp(selectedId)
        } else {
          if (e.shiftKey) moveLayerToBottom(selectedId)
          else moveLayerDown(selectedId)
        }
        return
      }

      // Cmd/Ctrl + A 全选（非背景元素）
      if (mod && key === 'a' && !e.shiftKey) {
        e.preventDefault()
        selectAll()
        return
      }
      // Cmd/Ctrl + Shift + A 反选
      if (mod && e.shiftKey && key === 'a') {
        e.preventDefault()
        invertSelection()
        return
      }
      // Esc 取消选择
      if (e.key === 'Escape') {
        e.preventDefault()
        store.clearMultiSelect()
        return
      }

      // 方向键微调（Shift = 大步进）
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 2 : 0.5
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        nudgeElement(selectedId, dx, dy)
        // 方向键结束后保存历史（节流：keyup 时保存）
        const onKeyUp = () => {
          saveHistory()
          window.removeEventListener('keyup', onKeyUp)
        }
        window.addEventListener('keyup', onKeyUp)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave])

  // Ctrl+V 粘贴截图
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault()
          const file = items[i].getAsFile()
          if (file) addImageFromFile(file)
          break
        }
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])
}
