import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useEditorStore, isBackgroundElement } from '../store/useEditorStore'
import { addImageFromFile } from '../hooks/useKeyboardShortcuts'
import ContextMenu, { type ContextMenuState } from './ContextMenu'
import { FloatingTextToolbar } from './FloatingTextToolbar'
import { GuideOverlay } from './GuideOverlay'

const RATIO_SIZES: Record<string, { width: number; height: number }> = {
  '3:4': { width: 480, height: 640 },
  '1:1': { width: 540, height: 540 },
  '9:16': { width: 405, height: 720 },
  '16:9': { width: 720, height: 405 },
}

const Canvas: React.FC = () => {
  const elements = useEditorStore(state => state.elements)
  const selectedId = useEditorStore(state => state.selectedId)
  const multiSelectedIds = useEditorStore(state => state.multiSelectedIds)
  const editingElementId = useEditorStore(state => state.editingElementId)
  const setSelected = useEditorStore(state => state.setSelected)
  const setEditingElement = useEditorStore(state => state.setEditingElement)
  const toggleMultiSelect = useEditorStore(state => state.toggleMultiSelect)
  const selectMany = useEditorStore(state => state.selectMany)
  const clearMultiSelect = useEditorStore(state => state.clearMultiSelect)
  const ratio = useEditorStore(state => state.ratio)
  const updateElement = useEditorStore(state => state.updateElement)
  const viewportZoom = useEditorStore(state => state.viewportZoom)
  const setViewportZoom = useEditorStore(state => state.setViewportZoom)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [editContent, setEditContent] = useState('')
  // 文字编辑：保存进入编辑前的原值，Esc 时还原（P0-5 2026-07-25）
  const editOriginalContentRef = useRef('')
  // 文字元素外层 wrapper ref 集合（P0-1 2026-07-25），用于 FloatingTextToolbar 计算位置
  const textElementRefs = useRef<Map<string, HTMLElement>>(new Map())
  // 右键菜单状态（null = 关闭）
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  // 对齐辅助线（Figma 风格）：拖动时显示
  const [snapGuides, setSnapGuides] = useState<{ vertical: number[]; horizontal: number[]; dx: number | null; dy: number | null }>({
    vertical: [], horizontal: [], dx: null, dy: null,
  })
  // 缩放/旋转句柄 ref（拖动手柄时不触发重渲染）
  const handleRef = useRef<{
    mode: 'resize' | 'rotate' | null
    corner?: 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r' | 't' | 'b'
    startMouseX: number
    startMouseY: number
    startWidth: number  // 元素 width% 起始
    startHeight: number
    startFontSize: number
    startRotation: number
    startAngle: number  // 旋转开始时鼠标与中心连线的角度
    elX: number
    elY: number
    pendingRotate?: boolean  // 旋转手柄防误触：用户必须移动 ≥5px 才激活
  }>({
    mode: null, startMouseX: 0, startMouseY: 0,
    startWidth: 0, startHeight: 0, startFontSize: 0,
    startRotation: 0, startAngle: 0, elX: 0, elY: 0,
  })

  // 拖动用 ref（不触发 React 重渲染）
  const dragRef = useRef<{
    active: boolean
    id: string | null
    startX: number
    startY: number
    elemStartX: number
    elemStartY: number
    el: HTMLElement | null
    multi?: { id: string; elemStartX: number; elemStartY: number }[]  // 多选批量拖动
  }>({ active: false, id: null, startX: 0, startY: 0, elemStartX: 0, elemStartY: 0, el: null })

  // 滚轮缩放：debounce 200ms 后才 saveHistory（避免每次滚都入栈）
  const wheelDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 计算对齐辅助线：当前元素 (cx, cy) 接近画布/其他元素的哪个位置？
  // 阈值 2.5%（画布宽度的 2.5%）。返回吸附后的位置 + 辅助线 + 距离气泡
  const computeSnap = useCallback((cx: number, cy: number, selfId: string) => {
    const THRESHOLD = 2.5
    // 候选点：画布中线 + 四边
    const verticalCandidates: number[] = [0, 50, 100]
    const horizontalCandidates: number[] = [0, 50, 100]
    // 直接从 store 读最新元素列表（不依赖闭包，避免拖拽时每帧重建）
    const allElems = useEditorStore.getState().elements
    for (const el of allElems) {
      if (el.id === selfId) continue
      if (isBackgroundElement(el)) continue
      verticalCandidates.push(el.x)
      horizontalCandidates.push(el.y)
    }
    // 找最近的吸附点
    let snapX = cx, snapY = cy
    let bestDx = THRESHOLD + 1, bestDy = THRESHOLD + 1
    let vGuide: number | null = null, hGuide: number | null = null
    for (const v of verticalCandidates) {
      const dv = v - cx
      if (Math.abs(dv) < Math.abs(bestDx)) {
        bestDx = dv
        if (Math.abs(dv) <= THRESHOLD) {
          snapX = v
          vGuide = v
        }
      }
    }
    for (const h of horizontalCandidates) {
      const dh = h - cy
      if (Math.abs(dh) < Math.abs(bestDy)) {
        bestDy = dh
        if (Math.abs(dh) <= THRESHOLD) {
          snapY = h
          hGuide = h
        }
      }
    }
    return {
      x: snapX,
      y: snapY,
      guides: {
        vertical: vGuide !== null ? [vGuide] : [],
        horizontal: hGuide !== null ? [hGuide] : [],
        dx: vGuide !== null ? bestDx * (RATIO_SIZES[ratio]?.width || 405) / 100 : null,
        dy: hGuide !== null ? bestDy * (RATIO_SIZES[ratio]?.height || 720) / 100 : null,
      },
    }
  }, [ratio])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const h = handleRef.current
    const d = dragRef.current

    if (d.active) console.log(`[DIAG] mousemove dragActive=${d.active} hMode=${h.mode} id=${d.id}`)

    if (h.mode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      // 直接从 store 读最新值，避免 useCallback 闭包过期
      const store = useEditorStore.getState()
      const el = store.elements.find(x => x.id === store.selectedId)
      if (!el) return
      // 元素中心点屏幕坐标
      const cx = rect.left + (el.x / 100) * rect.width
      const cy = rect.top + (el.y / 100) * rect.height

      if (h.mode === 'rotate') {
        if (el.locked) return
        const curAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI
        const deltaAngle = curAngle - h.startAngle
        const newRotation = h.startRotation + deltaAngle
        store.updateElement(store.selectedId!, { rotation: Math.round(newRotation) } as any)
        return
      }

      if (h.mode === 'resize' && h.corner) {
        if (el.locked) return
        const dx = ((e.clientX - h.startMouseX) / rect.width) * 100 * 2
        const dy = ((e.clientY - h.startMouseY) / rect.height) * 100 * 2
        if (el.type === 'text') {
          let scale = 1
          if (h.corner === 'br') scale = 1 + (dx + dy) / 2 / 10
          else if (h.corner === 'tl') scale = 1 + (-dx - dy) / 2 / 10
          else if (h.corner === 'tr') scale = 1 + (dx - dy) / 2 / 10
          else if (h.corner === 'bl') scale = 1 + (-dx + dy) / 2 / 10
          else if (h.corner === 'r' || h.corner === 'l') scale = 1 + dx / 10 * (h.corner === 'l' ? -1 : 1)
          else if (h.corner === 'b' || h.corner === 't') scale = 1 + dy / 10 * (h.corner === 't' ? -1 : 1)
          scale = Math.max(0.3, Math.min(5, scale))
          const newFontSize = Math.max(8, Math.round(h.startFontSize * scale))
          store.updateElement(store.selectedId!, { fontSize: newFontSize } as any)
        } else {
          let newW = h.startWidth, newH = h.startHeight
          if (h.corner === 'br') { newW = h.startWidth + dx; newH = h.startHeight + dy }
          else if (h.corner === 'tl') { newW = h.startWidth - dx; newH = h.startHeight - dy }
          else if (h.corner === 'tr') { newW = h.startWidth + dx; newH = h.startHeight - dy }
          else if (h.corner === 'bl') { newW = h.startWidth - dx; newH = h.startHeight + dy }
          else if (h.corner === 'r') { newW = h.startWidth + dx; newH = h.startHeight }
          else if (h.corner === 'l') { newW = h.startWidth - dx; newH = h.startHeight }
          else if (h.corner === 'b') { newW = h.startWidth; newH = h.startHeight + dy }
          else if (h.corner === 't') { newW = h.startWidth; newH = h.startHeight - dy }
          newW = Math.max(2, Math.min(10000, newW))
          newH = Math.max(2, Math.min(10000, newH))
          const newX = Math.max(0, Math.min(100, h.elX + dx / 2))
          const newY = Math.max(0, Math.min(100, h.elY + dy / 2))
          store.updateElement(store.selectedId!, { width: Math.round(newW), height: Math.round(newH), x: newX, y: newY } as any)
        }
        return
      }
    }

    // ── 元素拖动：直接更新 store ──
    if (!d.active || !d.id || !containerRef.current) return

    const size = RATIO_SIZES[ratio] || { width: 405, height: 720 }
    const deltaX = ((e.clientX - d.startX) / size.width) * 100
    const deltaY = ((e.clientY - d.startY) / size.height) * 100

    // 多选批量拖动
    if (d.multi && d.multi.length > 1) {
      const st = useEditorStore.getState()
      for (const m of d.multi) {
        const nx = Math.max(5, Math.min(95, m.elemStartX + deltaX))
        const ny = Math.max(5, Math.min(95, m.elemStartY + deltaY))
        st.updateElement(m.id, { x: nx, y: ny } as any)
      }
      return
    }

    let newX = Math.max(5, Math.min(95, d.elemStartX + deltaX))
    let newY = Math.max(5, Math.min(95, d.elemStartY + deltaY))

    const snap = computeSnap(newX, newY, d.id)
    newX = snap.x
    newY = snap.y
    setSnapGuides(snap.guides)

    useEditorStore.getState().updateElement(d.id, { x: Math.round(newX * 100) / 100, y: Math.round(newY * 100) / 100 } as any)
    console.log(`[DIAG] updatePos id=${d.id?.slice(0,12)} startX=${(d.startX??0).toFixed(0)} cx=${(e.clientX??0).toFixed(0)} deltaX=${deltaX.toFixed(2)} newX=${newX.toFixed(2)} elemStartX=${(d.elemStartX??0).toFixed(1)}`)
  }, [ratio, updateElement])

  // 滚轮行为（Figma/PS 行业惯例）：
  //   默认：缩放画布视口
  //   Ctrl/Cmd + 滚轮：缩放当前选中元素
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    if (e.ctrlKey || e.metaKey) {
      // 缩放元素
      if (!selectedId) return
      const el = elements.find(x => x.id === selectedId)
      if (!el || isBackgroundElement(el) || el.locked) return
      e.preventDefault()
      if (el.type === 'text') {
        const newFontSize = Math.max(8, Math.min(500, Math.round((el as any).fontSize * factor)))
        updateElement(selectedId, { fontSize: newFontSize } as any)
      } else {
        const w = (el as any).width ?? 50
        const h = (el as any).height ?? 50
        const newW = Math.max(2, Math.min(10000, w * factor))
        const newH = Math.max(2, Math.min(10000, h * factor))
        updateElement(selectedId, { width: newW, height: newH } as any)
      }
      if (wheelDebounceRef.current) clearTimeout(wheelDebounceRef.current)
      wheelDebounceRef.current = setTimeout(() => {
        useEditorStore.getState().saveHistory()
      }, 200)
    } else {
      // 缩放画布视口
      e.preventDefault()
      const next = Math.max(0.2, Math.min(4, viewportZoom * factor))
      setViewportZoom(next)
    }
  }, [selectedId, elements, updateElement, viewportZoom, setViewportZoom])

  const handleMouseUp = useCallback(() => {
    // 元素拖动结束
    if (dragRef.current.active) {
      // 多选批量拖动结束：清空 multi
      if (dragRef.current.multi && dragRef.current.multi.length > 1) {
        dragRef.current.multi = undefined
      }
      dragRef.current.active = false
      dragRef.current.id = null
      dragRef.current.el = null
      // 辅助线短暂停留（Figma 行为）— 800ms 后淡出清空
      setTimeout(() => setSnapGuides({ vertical: [], horizontal: [], dx: null, dy: null }), 800)
      useEditorStore.getState().saveHistory()
    }

    // 缩放/旋转结束
    if (handleRef.current.mode) {
      handleRef.current.mode = null
      useEditorStore.getState().saveHistory()
    }
  }, [selectMany, clearMultiSelect, updateElement])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // 点击画布空白处：清空多选（不再进入框选模式）
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    if (e.target !== e.currentTarget) return
    useEditorStore.getState().clearMultiSelect()
  }

  // 右键菜单 — 在元素上右键时触发
  const handleElementContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const store = useEditorStore.getState()
    // 若右键的元素不在当前选中集合中，则先选中它（Figma 行为）
    if (id !== store.selectedId && !store.multiSelectedIds.includes(id)) {
      store.setSelected(id)
    }
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: id })
  }

  // 画布空白处右键
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // 右键空白时不选中元素，只展示粘贴等画布级操作
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: null })
  }

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (e.button !== 0) return
    // Cmd/Ctrl 点击：切换多选，不进入拖动
    if (e.metaKey || e.ctrlKey) {
      toggleMultiSelect(id)
      return
    }
    const element = elements.find(el => el.id === id)
    if (!element) return
    console.log(`[DIAG] mousedown id=${id} type=${element.type} x=${element.x} y=${element.y} selId=${selectedId}`)
    console.log(`[DIAG] dragRef active=${dragRef.current.active} handleRef mode=${handleRef.current.mode}`)

    // 背景元素：只允许选中改颜色，**禁止拖动**（位置永远锁死在最底层）
    if (isBackgroundElement(element)) return

    // 锁定元素：禁止缩放/旋转（但仍可拖动位置 —— 用户硬性需求）
    // 选中 + 继续进入 dragRef 模式，handleMouseMove 里的 resize/rotate 入口已拦截
    if (element.locked) {
      setSelected(id)
      // 不 return，继续往下走让元素可拖动
    }

    const el = e.currentTarget as HTMLElement

    // 多选批量拖动：点击元素在已多选集合中 → 拖全部
    if (multiSelectedIds.length > 1 && multiSelectedIds.includes(id)) {
      dragRef.current = {
        active: true,
        id,
        startX: e.clientX,
        startY: e.clientY,
        elemStartX: 0,
        elemStartY: 0,
        el,
        multi: multiSelectedIds.map(mid => {
          const mel = elements.find(x => x.id === mid)
          return {
            id: mid,
            elemStartX: mel?.x ?? 50,
            elemStartY: mel?.y ?? 50,
          }
        }),
      }
      return
    }

    // 编组拖动：点击元素在某个 groupId 中 → 拖全组
    if (element.groupId) {
      const groupMembers = elements.filter(x => x.groupId === element.groupId)
      if (groupMembers.length > 1) {
        dragRef.current = {
          active: true,
          id,
          startX: e.clientX,
          startY: e.clientY,
          elemStartX: 0,
          elemStartY: 0,
          el,
          multi: groupMembers.map(m => ({
            id: m.id,
            elemStartX: m.x,
            elemStartY: m.y,
          })),
        }
        return
      }
    }

    // 单元素拖动（原有逻辑）
    setSelected(id)  // 立即选中，防止 handleMouseMove 中 selectedId 为 null 导致的意外行为
    dragRef.current = {
      active: true,
      id,
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: element.x,
      elemStartY: element.y,
      el,
    }
  }

  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    // Cmd/Ctrl 点击已经在 mousedown 处理了
    if (e.metaKey || e.ctrlKey) return
    // 已是选中态：再点击不取消（避免拖动后被取消）
    if (multiSelectedIds.includes(id) && multiSelectedIds.length > 1) return
    setSelected(id)
  }

  const handleDoubleClick = (e: React.MouseEvent, id: string, content: string) => {
    e.stopPropagation()
    // P0-5 Esc 还原：进入编辑前先把原值存到 ref，Esc 时拿这个值回退
    editOriginalContentRef.current = content
    setEditingElement(id)
    setEditContent(content)
  }

  const handleTextBlur = () => {
    if (editingElementId) {
      updateElement(editingElementId, { content: editContent })
      useEditorStore.getState().saveHistory()
      setEditingElement(null)
    }
  }

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    // Enter = 换行（textarea 默认行为，不阻止）
    // Shift+Enter = 保存并退出编辑
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleTextBlur()
    }
    if (e.key === 'Escape') {
      // P0-5 Esc 还原：把内容回退到进入编辑前的原值，**不保存当前编辑**
      // 行为对齐 Figma/Sketch：Esc = 放弃改动，Shift+Enter = 提交改动
      if (editingElementId) {
        setEditContent(editOriginalContentRef.current)
        updateElement(editingElementId, { content: editOriginalContentRef.current })
        useEditorStore.getState().saveHistory()
      }
      setEditingElement(null)
    }
  }

  // 选中态样式：单选橙色 outline，多选蓝色 outline
  const isInMulti = (id: string) => multiSelectedIds.includes(id) && multiSelectedIds.length > 1
  const isSingle = (id: string) => selectedId === id && !isInMulti(id)

  // 选中态视觉 — 用更粗的 3px 深色边框 + 半透明深色背景层
  // 解决白字浅色背景下选中看不清的问题（背景层兜底，亮/暗背景都能看清）
  const selectedStyle = (id: string) => {
    if (isSingle(id)) {
      return 'outline outline-[3px] outline-orange-500 outline-offset-2 rounded-lg shadow-[0_0_0_4px_rgba(255,138,80,0.3),0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-orange-300/40 bg-orange-500/5'
    }
    if (isInMulti(id)) {
      return 'outline outline-[3px] outline-blue-500 outline-offset-2 rounded-lg shadow-[0_0_0_4px_rgba(80,158,255,0.3),0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-blue-300/40 bg-blue-500/5'
    }
    return 'hover:outline hover:outline-2 hover:outline-orange-300 hover:outline-offset-2 hover:rounded-lg'
  }

  const renderTextElement = (element: any) => {
    const isEditing = editingElementId === element.id

    if (isEditing) {
      return (
        <textarea
          key={element.id}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          className="absolute resize-none outline-none bg-white/90 border-2 border-blue-400 rounded-lg px-2 py-1 z-50"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            fontFamily: element.fontFamily,
            color: element.color,
            textAlign: element.textAlign,
            fontStyle: element.italic ? 'italic' : 'normal',
            textDecoration: element.underline ? 'underline' : 'none',
            minWidth: '100px',
            minHeight: '40px',
            // 排版扩展：让编辑态和静态态视觉一致（用户改完能直接看到效果）
            lineHeight: element.lineHeight ?? 1.2,
            letterSpacing: `${element.letterSpacing ?? 0}px`,
            ...(element.writingMode === 'vertical-rl' ? { writingMode: 'vertical-rl' as const } : {}),
          }}
          autoFocus
        />
      )
    }

    return (
      <div
        key={element.id}
        ref={(el) => {
          // P0-1 浮动工具栏用: 收集文字 wrapper DOM 引用,工具栏按其 bbox 定位
          if (el) textElementRefs.current.set(element.id, el)
          else textElementRefs.current.delete(element.id)
        }}
        data-element-id={element.id}
        className={`absolute cursor-pointer select-none ${selectedStyle(element.id)}`}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scaleX(${element.flipH ? -1 : 1}) scaleY(${element.flipV ? -1 : 1})`,
          opacity: element.opacity,
          // 修 root cause: text 外层 div 必须显式 width，否则向右拖到 50% 后
          // available-width(contain - center) < max-content 时会被 shrink-to-fit 压扁，
          // 5 个 48px 字装不进 100px 容器 → wordBreak 强制每字一行 → 视觉上"竖排"
          width: 'max-content',
          maxWidth: '95%',
        }}
        onClick={(e) => handleElementClick(e, element.id)}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        onContextMenu={(e) => handleElementContextMenu(e, element.id)}
        onDoubleClick={(e) => handleDoubleClick(e, element.id, element.content)}
      >
        {element.locked && <LockBadge />}
        <div
          style={{
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            fontFamily: element.fontFamily,
            color: element.color,
            // P1-2 渐变文字: background + background-clip:text (存在时优先于 color)
            ...(element.colorGradient ? {
              backgroundImage: `linear-gradient(${element.colorGradient.angle}deg, ${element.colorGradient.from}, ${element.colorGradient.to})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            } : {}),
            textAlign: element.textAlign,
            fontStyle: element.italic ? 'italic' : 'normal',
            textDecoration: element.underline ? 'underline' : 'none',
            // P1-8 字符级描边: 开启时外层不设 stroke,由内层 span 各自设独立颜色
            // 字符级模式下 strokeWidth 0 fallback 2px（用户开字符级描边就是要看效果,0px 没意义）
            WebkitTextStroke: (element.stroke && !element.strokeColorPerChar) ? `${element.strokeWidth || 0}px ${element.strokeColor}` : 'none',
            // P2-6 文字特效: text-shadow 多层组合, 优先级 effects > 默认阴影
            textShadow: (() => {
              const fx = element.effects || {}
              const shadows: string[] = []
              if (fx.glow) {
                // 外发光（霓虹效果）— 用 currentColor 跟随文字色
                shadows.push(`0 0 8px ${element.color || '#FF5E3A'}`, `0 0 16px ${element.color || '#FF5E3A'}`)
              }
              if (fx.threeD) {
                // 3D 立体（复古海报）— 多层偏移暗色
                shadows.push('1px 1px 0 #ddd', '2px 2px 0 #ccc', '3px 3px 0 #bbb', '4px 4px 0 #aaa')
              }
              if (fx.emboss) {
                // 雕印（凹凸感）— 高光+暗影组合
                shadows.push('-1px -1px 1px rgba(255,255,255,0.7)', '1px 1px 1px rgba(0,0,0,0.5)')
              }
              // 默认阴影（element.shadow 控制）
              if (shadows.length === 0 && element.shadow) shadows.push('0 2px 8px rgba(0,0,0,0.5)')
              return shadows.length > 0 ? shadows.join(', ') : 'none'
            })(),
            backgroundColor: element.bg ? element.bgColor : 'transparent',
            padding: element.bg ? `${element.bgPadding}px ${element.bgPadding * 2}px` : 0,
            borderRadius: element.bg ? '8px' : 0,
            // pre-wrap 让 \n 换行生效（用户可在编辑态 Enter 换行）
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxWidth: '90vw',
            // P0-2/3 文字排版扩展：行高 / 字间距 / 横排/竖排（默认 horizontal-tb = 不写）
            lineHeight: element.lineHeight ?? 1.2,
            letterSpacing: `${element.letterSpacing ?? 0}px`,
            ...(element.writingMode === 'vertical-rl' ? { writingMode: 'vertical-rl' as const } : {}),
            pointerEvents: 'none',
          }}
        >
          {/* P1-8 字符级描边: 拆字符每个 span 独立 stroke 颜色（彩虹标题效果） */}
          {element.stroke && element.strokeColorPerChar ? (
            (() => {
              // 5 色调色板循环（按字符 index % 5 切换）
              const palette = ['#FF5E3A', '#FF9900', '#FFD700', '#FF3366', '#9B59FF']
              const chars = (element.content || '').split('')
              return chars.map((ch, i) => (
                <span
                  key={i}
                  style={{
                    // 字符级描边模式下 strokeWidth 0 fallback 2px,确保用户开启时能立即看到效果
                    WebkitTextStroke: `${element.strokeWidth || 2}px ${palette[i % palette.length]}`,
                  }}
                >
                  {ch === '\n' ? <br /> : ch}
                </span>
              ))
            })()
          ) : element.content}
        </div>
        {isSingle(element.id) && !isBackgroundElement(element) && element.type !== 'text' && (
          <TransformHandles element={element} handleRef={handleRef} />
        )}
      </div>
    )
  }

  const renderImageElement = (element: any) => {
    // 持久化丢失的 base64 图片（__IMAGE_LOST__ 占位）：渲染占位提示
    if (element.src === '__IMAGE_LOST__') {
      return (
        <div
          key={element.id}
          data-element-id={element.id}
          className={`absolute cursor-pointer ${selectedStyle(element.id)}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scaleX(${element.flipH ? -1 : 1}) scaleY(${element.flipV ? -1 : 1})`,
            opacity: element.opacity,
          }}
          onClick={(e) => handleElementClick(e, element.id)}
          onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        onContextMenu={(e) => handleElementContextMenu(e, element.id)}
        >
          {element.locked && <LockBadge />}
          <div
            style={{
              width: `${element.width}%`,
              minWidth: '80px',
              padding: '12px 16px',
              borderRadius: `${element.radius}px`,
              border: '2px dashed #d1d5db',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              fontSize: '12px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            🖼️ 图片已丢失<br />
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>请重新上传</span>
          </div>
        </div>
      )
    }
    return (
      <div
        key={element.id}
        data-element-id={element.id}
        className={`absolute cursor-pointer ${selectedStyle(element.id)}`}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scaleX(${element.flipH ? -1 : 1}) scaleY(${element.flipV ? -1 : 1})`,
          opacity: element.opacity,
          // 修 root cause: image 外层 div 必须显式 width，否则向右拖时
          // 外层被 shrink-to-fit 压扁，<img width: ${element.width}%> 跟着父容器变窄
          // → 视觉上"图片缩小"。和 shape 元素 (line 614) 保持一致
          width: `${element.width}%`,
        }}
        onClick={(e) => handleElementClick(e, element.id)}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        onContextMenu={(e) => handleElementContextMenu(e, element.id)}
      >
        {element.locked && <LockBadge />}
        <img
          src={element.src}
          alt=""
          style={{
            width: `${element.width}%`,
            borderRadius: `${element.radius}px`,
            border: element.border > 0 ? `${element.border}px solid ${element.borderColor}` : 'none',
            boxShadow: element.shadow ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
            filter: element.filter,
            display: 'block',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
        {isSingle(element.id) && !isBackgroundElement(element) && (
          <TransformHandles element={element} handleRef={handleRef} />
        )}
      </div>
    )
  }

  const renderShapeElement = (element: any) => {
    const getShapeStyle = () => {
      switch (element.shape) {
        case 'circle': return { borderRadius: '50%' }
        case 'tag': return { borderRadius: '9999px' }
        case 'line': return { height: `${element.height || 4}px` }
        default: return {}
      }
    }

    return (
      <div
        key={element.id}
        data-element-id={element.id}
        className={`absolute cursor-pointer ${selectedStyle(element.id)}`}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.width}%`,
          height: `${element.height}%`,
          backgroundColor: element.color,
          transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scaleX(${element.flipH ? -1 : 1}) scaleY(${element.flipV ? -1 : 1})`,
          opacity: element.opacity,
          ...getShapeStyle(),
        }}
        onClick={(e) => handleElementClick(e, element.id)}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        onContextMenu={(e) => handleElementContextMenu(e, element.id)}
      >
        {element.locked && <LockBadge />}
        {isSingle(element.id) && !isBackgroundElement(element) && (
          <TransformHandles element={element} handleRef={handleRef} />
        )}
      </div>
    )
  }

  const size = RATIO_SIZES[ratio] || { width: 405, height: 720 }

  return (
    <>
    <main
      ref={containerRef}
      className="flex-1 bg-gray-200 flex items-center justify-center overflow-hidden p-4 relative"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) addImageFromFile(file)
      }}
    >
      {/* 画布视口缩放（transform 在外层，cover-canvas 保持原尺寸供 html2canvas 导出） */}
      <div
        style={{
          transform: `scale(${viewportZoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
        }}
      >
      <div
        id="cover-canvas"  // 供 html2canvas 导出用 — getElementById 精确选择（替代不可靠的 querySelector）
        ref={canvasRef}
        className="bg-white shadow-2xl relative"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          overflow: 'visible',  // 允许元素放大超出画布边界（图片可放大到 10000%）
          cursor: 'default',
        }}
        onMouseDown={handleCanvasMouseDown}
        onContextMenu={handleCanvasContextMenu}
        onWheel={handleWheel}
      >
        {elements.map(element => {
          if (element.type === 'text') return renderTextElement(element)
          if (element.type === 'image') return renderImageElement(element)
          if (element.type === 'shape') return renderShapeElement(element)
          return null
        })}

        {/* 调试叠层：显示当前拖拽状态（生产环境可删） */}
        <div style={{
          position: 'absolute', bottom: 4, left: 4,
          background: 'rgba(0,0,0,0.8)', color: '#0f0',
          fontSize: 11, fontFamily: 'monospace',
          padding: '4px 8px', borderRadius: 4, zIndex: 99999,
          pointerEvents: 'none', whiteSpace: 'pre-wrap',
          maxWidth: 300,
        }}>
          {'drag:' + String(dragRef.current.active) + ' id:' + (dragRef.current.id?.slice(0,12)??'') + ' hM:' + (handleRef.current.mode ?? 'n')}
        </div>

        {elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-5xl mb-3">🎨</div>
            <p className="text-gray-500 text-lg font-medium mb-1">点击左侧模板开始创作</p>
            <p className="text-gray-400 text-sm">或点击工具栏添加元素</p>
          </div>
        )}

        {/* 对齐辅助线（Figma 风格：粉色实线 + 距离气泡） */}
        {snapGuides.vertical.map((v, i) => (
          <div
            key={`v-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${v}%`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: '#FF00B8',
              boxShadow: '0 0 0 0.5px rgba(255,0,184,0.3)',
              zIndex: 60,
            }}
          />
        ))}
        {snapGuides.horizontal.map((h, i) => (
          <div
            key={`h-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${h}%`,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: '#FF00B8',
              boxShadow: '0 0 0 0.5px rgba(255,0,184,0.3)',
              zIndex: 60,
            }}
          />
        ))}
        {snapGuides.dx !== null && (
          <div
            className="absolute pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white"
            style={{
              left: `${snapGuides.vertical[0]}%`,
              top: '8px',
              transform: 'translateX(-50%)',
              backgroundColor: '#FF00B8',
              zIndex: 61,
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(Math.abs(snapGuides.dx))}px
          </div>
        )}
        {snapGuides.dy !== null && (
          <div
            className="absolute pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white"
            style={{
              top: `${snapGuides.horizontal[0]}%`,
              left: '8px',
              transform: 'translateY(-50%)',
              backgroundColor: '#FF00B8',
              zIndex: 61,
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(Math.abs(snapGuides.dy))}px
          </div>
        )}
        {/* 构图参考线叠加层（D-2）：开关+类型控制在右上角，纯视觉不进导出 */}
        <GuideOverlay />
      </div>
      </div>{/* 画布视口缩放 wrapper 结束 */}

      {/* 画布视口缩放控件 — 浮在右下角（Figma 风格） */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 px-1.5 py-1 z-50">
        <button
          onClick={() => setViewportZoom(Math.max(0.2, viewportZoom - 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-base font-bold"
          title="缩小 (Ctrl+-)"
        >
          −
        </button>
        <button
          onClick={() => setViewportZoom(1)}
          className="min-w-[52px] h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors tabular-nums"
          title="点击重置 100%"
        >
          {Math.round(viewportZoom * 100)}%
        </button>
        <button
          onClick={() => setViewportZoom(Math.min(4, viewportZoom + 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-base font-bold"
          title="放大 (Ctrl++)"
        >
          +
        </button>
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <button
          onClick={() => {
            // 真·fit-to-window：算当前容器能容纳的最大缩放
            const cont = containerRef.current
            if (!cont) { setViewportZoom(1); return }
            const padding = 32  // 留 32px 边距
            const availW = cont.clientWidth - padding * 2
            const availH = cont.clientHeight - padding * 2
            const fitZ = Math.min(availW / size.width, availH / size.height, 4)
            setViewportZoom(Math.max(0.2, fitZ))
          }}
          className="px-2 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          title="适应窗口：按容器大小自动算最佳缩放"
        >
          适应
        </button>
      </div>
    </main>

      {/* P0-1 就地浮动工具栏：选中文字（非编辑态）时浮在元素正上方,1-click 调节字号/横排竖排 */}
      {!editingElementId && selectedId && (() => {
        const sel = elements.find(e => e.id === selectedId)
        if (!sel || sel.type !== 'text') return null
        return (
          <FloatingTextToolbar
            element={sel}
            onUpdate={(patch) => updateElement(selectedId, patch)}
            containerEl={textElementRefs.current.get(selectedId) || null}
          />
        )
      })()}

      {/* 右键菜单 — 通过 Portal 渲染到 body，避开任何 overflow/transform 限制 */}
      <ContextMenu state={contextMenu} onClose={() => setContextMenu(null)} />
    </>
  )
}

// 统一锁图标组件
const LockBadge: React.FC = () => (
  <div
    className="absolute z-10 -top-2 -right-2 w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] shadow-md pointer-events-none border-[1.5px] border-white"
    title="已锁定：拖拽/缩放/旋转不会改变元素"
  >
    🔒
  </div>
)

// 变换手柄：4 角缩放 + 顶部旋转 + 水平/垂直翻转
const TransformHandles: React.FC<{ element: any; handleRef: React.MutableRefObject<any> }> = ({ element, handleRef }) => {
  const updateElement = useEditorStore(s => s.updateElement)

  // 起始缩放
  const startResize = (e: React.MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r' | 't' | 'b') => {
    e.stopPropagation()
    e.preventDefault()
    handleRef.current = {
      mode: 'resize',
      corner,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startWidth: (element as any).width || 30,
      startHeight: (element as any).height || 30,
      startFontSize: (element as any).fontSize || 32,
      startRotation: (element as any).rotation || 0,
      startAngle: 0,
      elX: element.x, elY: element.y,
    }
  }

  // 旋转：去掉 onMouseDown 拦截，点击旋转手柄等同于点击元素（拖拽移动）
  // 用户通过属性面板的旋转滑块来旋转，不再通过拖拽手柄
  const startRotate = (e: React.MouseEvent) => {
    e.preventDefault()
    // 不做 stopPropagation，让事件冒泡到元素本体触发拖拽
    // 旋转功能由 PropertiesPanel 的旋转滑块提供
  }

  // 水平翻转（真·镜像 scaleX=-1，不动 rotation）
  const handleFlipH = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateElement(element.id, { flipH: !(element as any).flipH } as any)
    useEditorStore.getState().saveHistory()
  }
  // 垂直翻转（真·镜像 scaleY=-1，不动 rotation）
  const handleFlipV = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateElement(element.id, { flipV: !(element as any).flipV } as any)
    useEditorStore.getState().saveHistory()
  }

  const handleSize = 12
  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: handleSize, height: handleSize,
    backgroundColor: '#fff',
    border: '2px solid #3B7CFF',
    borderRadius: 2,
    zIndex: 70,
    pointerEvents: 'auto',
  }

  return (
    <>
      {/* 4 角缩放手柄 */}
      <div
        data-handle="tl"
        style={{ ...handleStyle, left: -handleSize/2, top: -handleSize/2, cursor: 'nwse-resize' }}
        onMouseDown={(e) => startResize(e, 'tl')}
      />
      <div
        data-handle="tr"
        style={{ ...handleStyle, right: -handleSize/2, top: -handleSize/2, cursor: 'nesw-resize' }}
        onMouseDown={(e) => startResize(e, 'tr')}
      />
      <div
        data-handle="bl"
        style={{ ...handleStyle, left: -handleSize/2, bottom: -handleSize/2, cursor: 'nesw-resize' }}
        onMouseDown={(e) => startResize(e, 'bl')}
      />
      <div
        data-handle="br"
        style={{ ...handleStyle, right: -handleSize/2, bottom: -handleSize/2, cursor: 'nwse-resize' }}
        onMouseDown={(e) => startResize(e, 'br')}
      />

      {/* 4 边中点缩放手柄（左右水平/上下垂直） */}
      <div
        data-handle="t"
        style={{ ...handleStyle, left: '50%', top: -handleSize/2, transform: 'translateX(-50%)', cursor: 'ns-resize' }}
        onMouseDown={(e) => startResize(e, 't')}
      />
      <div
        data-handle="b"
        style={{ ...handleStyle, left: '50%', bottom: -handleSize/2, transform: 'translateX(-50%)', cursor: 'ns-resize' }}
        onMouseDown={(e) => startResize(e, 'b')}
      />
      <div
        data-handle="l"
        style={{ ...handleStyle, left: -handleSize/2, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
        onMouseDown={(e) => startResize(e, 'l')}
      />
      <div
        data-handle="r"
        style={{ ...handleStyle, right: -handleSize/2, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
        onMouseDown={(e) => startResize(e, 'r')}
      />

      {/* 顶部旋转手柄（带连接线） */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -32,
          transform: 'translateX(-50%)',
          width: 1, height: 24,
          backgroundColor: '#3B7CFF',
          zIndex: 70,
          pointerEvents: 'none',
        }}
      />
      <div
        data-handle="rotate"
        style={{
          position: 'absolute',
          left: '50%',
          top: -44,
          transform: 'translateX(-50%)',
          width: 20, height: 20,
          backgroundColor: '#fff',
          border: '2px solid #3B7CFF',
          borderRadius: '50%',
          zIndex: 70,
          pointerEvents: 'auto',
          cursor: 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: '#3B7CFF', fontWeight: 700,
          userSelect: 'none',
        }}
        onMouseDown={startRotate}
        onDoubleClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          // 双击回正：rotation = 0
          updateElement(element.id, { rotation: 0 } as any)
          useEditorStore.getState().saveHistory()
        }}
        title="拖动旋转 / 双击回正"
      >
        ↻
      </div>

      {/* 右侧翻转按钮组（垂直堆叠） */}
      <div
        style={{
          position: 'absolute',
          right: -36,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          zIndex: 70,
        }}
      >
        <button
          data-handle="flipH"
          onClick={handleFlipH}
          onMouseDown={(e) => e.stopPropagation()}
          title="水平翻转"
          style={{
            width: 24, height: 24,
            backgroundColor: '#fff',
            border: '1.5px solid #3B7CFF',
            borderRadius: 4,
            color: '#3B7CFF',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⇋
        </button>
        <button
          data-handle="flipV"
          onClick={handleFlipV}
          onMouseDown={(e) => e.stopPropagation()}
          title="垂直翻转"
          style={{
            width: 24, height: 24,
            backgroundColor: '#fff',
            border: '1.5px solid #3B7CFF',
            borderRadius: 4,
            color: '#3B7CFF',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⥯
        </button>
      </div>
    </>
  )
}

export default Canvas
