import React, { useState } from 'react'
import TitleGenerator from './TitleGenerator'
import TypeSettings from './properties/TypeSettings'
import ImageSettings from './properties/ImageSettings'
import ShapeSettings from './properties/ShapeSettings'
import { Sparkles, Palette, Wand2, Layers, Download, Type, Square, Trash2, Copy, Image as ImageIcon, X, Check, Compass, Save, FolderOpen, Scissors, Group, Ungroup, ImageDown } from 'lucide-react'
import { useEditorStore } from '../store/useEditorStore'
import { showToast, showConfirm } from '../store/useToastStore'
import html2canvas from 'html2canvas'
import { generateColorSchemes, type ColorScheme } from '../utils/color'
import { beautifyElements, recommendLayouts, type LayoutPreset } from '../utils/beautify'
import { DESIGN_STYLES, applyDesignStyle, explainDesignChoice, type DesignStyle } from '../utils/styles'
import { COMPOSITIONS, type Composition } from '../utils/composition'
import { cutoutImageLocal, CUTOUT_TOLERANCE_PRESETS } from '../utils/cutout'

const PRESET_COLORS = [
  '#1a1a2e', '#ffffff', '#000000', '#f5f5f5', '#FF5E3A', '#e94560',
  '#667eea', '#43e97b', '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe',
  '#f093fb', '#fab1a0', '#74b9ff', '#00b894', '#ffeaa7', '#dfe6e9',
]

const PropertiesPanel: React.FC = () => {
  const { elements, selectedId, multiSelectedIds, ratio, addElement, updateElement, deleteMany, duplicateElement, setElements, userPresets, alignElements, distributeElements, selectAll, invertSelection, clearMultiSelect } = useEditorStore()
  const selectedElement = elements.find(el => el.id === selectedId)
  const bgElement = elements.find(el => el.type === 'shape' && (el as any).shape === 'overlay') as any
  const bgColor = bgElement?.color || '#ffffff'
  const isMulti = multiSelectedIds.length > 1
  const [showTitleGenerator, setShowTitleGenerator] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [showPresetLibrary, setShowPresetLibrary] = useState(false)
  const [showCompositionPicker, setShowCompositionPicker] = useState(false)
  const [showStyleExplainer, setShowStyleExplainer] = useState<DesignStyle | null>(null)
  // 一键抠图状态
  const [cutoutOpen, setCutoutOpen] = useState(false)
  const [cutoutTolerance, setCutoutTolerance] = useState<keyof typeof CUTOUT_TOLERANCE_PRESETS>('mid')
  const [cutoutRunning, setCutoutRunning] = useState(false)
  const [cutoutProgress, setCutoutProgress] = useState('')

  // 一键美化：直接应用
  const handleBeautify = () => {
    const { updates } = beautifyElements(elements, bgColor)
    if (updates.size === 0) {
      showToast('画布上还没有文字')
      return
    }
    updates.forEach((patch, id) => updateElement(id, patch as any))
    useEditorStore.getState().saveHistory()
    showToast(`✨ 已美化 ${updates.size} 个文字`)
  }

  // 清除所有描边（一键批量）
  const handleRemoveAllStrokes = () => {
    const textEls = elements.filter(el => el.type === 'text')
    if (textEls.length === 0) {
      showToast('画布上还没有文字')
      return
    }
    textEls.forEach(el => updateElement(el.id, { stroke: false } as any))
    useEditorStore.getState().saveHistory()
    showToast(`🧽 已清除 ${textEls.length} 个文字的描边`)
  }

  // 重置画布（清空 + 清 localStorage）
  const handleReset = async () => {
    if (!await showConfirm({ title: '🗑️ 清空画布', message: '此操作将清空所有元素并清空本地存储的进度，不可撤销。\n\n确定要继续吗？', confirmText: '清空画布', danger: true })) return
    setElements([])
    useEditorStore.persist.clearStorage()
    showToast('🗑️ 画布已清空')
  }

  // 智能配色：选方案后应用
  const applyColorScheme = (scheme: ColorScheme) => {
    // 1. 改背景色
    if (bgElement) {
      updateElement(bgElement.id, { color: scheme.bg } as any)
    }
    // 2. 改文字色（按字号大小：最大=主标题，其余=副标题）
    const textEls = elements
      .filter(el => el.type === 'text')
      .sort((a, b) => (b as any).fontSize - (a as any).fontSize)
    textEls.forEach((el, i) => {
      updateElement(el.id, { color: i === 0 ? scheme.primaryText : scheme.secondaryText } as any)
    })
    useEditorStore.getState().saveHistory()
    setShowColorPicker(false)
    showToast(`🎨 已应用「${scheme.name}」`)
  }

  // 布局推荐：选布局后重排元素
  const applyLayout = (layout: LayoutPreset) => {
    const newElements = layout.apply(elements)
    setElements(newElements)
    useEditorStore.getState().saveHistory()
    setShowLayoutPicker(false)
    showToast(`📐 已应用「${layout.name}」`)
  }

  // 一键抠图：纯本地算法（4 角取样 + 容差移除），不依赖外部 API
  const handleCutout = async () => {
    if (!selectedElement || selectedElement.type !== 'image') return
    const src = (selectedElement as any).src
    if (!src || (typeof src === 'string' && src.startsWith('__IMAGE_LOST__'))) {
      showToast('⚠️ 图片已丢失，请重新上传', { type: 'warning' })
      return
    }
    setCutoutRunning(true)
    setCutoutProgress('准备中...')
    try {
      const newSrc = await cutoutImageLocal(src, {
        tolerance: cutoutTolerance,
        onProgress: (msg) => setCutoutProgress(msg),
      })
      updateElement(selectedElement.id, { src: newSrc } as any)
      useEditorStore.getState().saveHistory()
      showToast('✂️ 一键抠图完成！背景已变透明', { type: 'success' })
      setCutoutOpen(false)
    } catch (e: any) {
      showToast(`❌ 抠图失败：${e?.message || '未知错误'}`, { type: 'error' })
    } finally {
      setCutoutRunning(false)
      setCutoutProgress('')
    }
  }

  // 应用设计风格
  const applyStyle = (style: DesignStyle) => {
    const updates = applyDesignStyle(style, elements, ratio)
    if (updates.size === 0) {
      showToast('画布上还没有内容')
      return
    }
    updates.forEach((patch, id) => updateElement(id, patch))
    useEditorStore.getState().saveHistory()
    setShowStylePicker(false)
    showToast(`${style.emoji} 已应用「${style.name}」`)
  }

  // 应用构图算法
  const applyComposition = (comp: Composition) => {
    const positions = comp.apply(elements, ratio)
    if (positions.size === 0) {
      showToast('画布上还没有文字')
      return
    }
    positions.forEach((pos, id) => updateElement(id, pos))
    useEditorStore.getState().saveHistory()
    setShowCompositionPicker(false)
    showToast(`📐 已应用「${comp.name}」`)
  }

  // 保存为预设
  const handleSavePreset = () => {
    if (elements.length === 0) {
      showToast('画布是空的，无法保存')
      return
    }
    const name = prompt('请输入预设名称：', `我的设计 ${new Date().toLocaleDateString()}`)
    if (!name) return
    useEditorStore.getState().saveAsPreset(name)
    showToast(`💾 已保存预设「${name}」`)
  }

  const handleChangeBgColor = (color: string) => {
    if (bgElement) {
      updateElement(bgElement.id, { color } as any)
    } else {
      addElement({
        id: 'bg-auto',
        type: 'shape',
        shape: 'overlay',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        color,
        rotation: 0,
        opacity: 1,
      } as any)
    }
  }

  const handleBatchDelete = async () => {
    if (multiSelectedIds.length === 0) return
    if (await showConfirm({ title: '批量删除', message: `确认删除选中的 ${multiSelectedIds.length} 个元素？`, confirmText: '删除', danger: true })) {
      deleteMany(multiSelectedIds)
      showToast(`🗑️ 已删除 ${multiSelectedIds.length} 个元素`)
    }
  }

  const handleBatchDuplicate = () => {
    multiSelectedIds.forEach(id => duplicateElement(id))
  }

  const handleExport = async () => {
    setExportLoading(true)
    showToast('📸 正在导出，请稍候...', { type: 'info', duration: 1500 })

    try {
      // 用 id 精确选择（替代 querySelector 不可靠的 class 选择）
      const canvasElement = document.getElementById('cover-canvas') as HTMLElement
      if (!canvasElement) {
        showToast('❌ 未找到画布元素', { type: 'error' })
        return
      }

      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 20000,
      })

      const link = document.createElement('a')
      link.download = `封面_${ratio}_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('✅ 导出成功！', { type: 'success' })
    } catch (error: any) {
      console.error('导出失败:', error)
      showToast(`❌ 导出失败：${error?.message || '未知错误'}`, { type: 'error', duration: 5000 })
    } finally {
      setExportLoading(false)
    }
  }

  const handleAddPlaceholderImage = () => {
    const newElement = {
      id: `image-${Date.now()}`,
      type: 'image' as const,
      src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPtWb5Zu95Zu+54mHPC90ZXh0Pjwvc3ZnPg==',
      x: 50,
      y: 50,
      width: 50,
      rotation: 0,
      radius: 8,
      border: 0,
      borderColor: '#000000',
      shadow: false,
      filter: 'none',
      useCutout: false,
      opacity: 1,
    }
    addElement(newElement)
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-orange-50 to-white">
        <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          AI 智能工具箱
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setShowTitleGenerator(true)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all group"
            title="生成爆款标题"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Type size={16} className="text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">爆款标题</span>
          </button>

          <button
            onClick={() => setShowColorPicker(true)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Palette size={16} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">智能配色</span>
          </button>

          <button
            onClick={handleBeautify}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Wand2 size={16} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">一键美化</span>
          </button>

          <button
            onClick={() => setShowLayoutPicker(true)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Layers size={16} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">布局推荐</span>
          </button>

          <button
            onClick={() => setShowCompositionPicker(true)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all group"
            title="黄金比例/三分构图/黄金螺线/居中堆叠"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Compass size={16} className="text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">黄金构图</span>
          </button>

          <button
            onClick={() => setShowStylePicker(true)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group"
            title="包豪斯/意大利/新拟物/瑞士/日式"
          >
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Sparkles size={16} className="text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">设计风格</span>
          </button>

          {/* 一键抠图：仅当选中图片时可用 */}
          <button
            onClick={() => {
              if (!selectedElement || selectedElement.type !== 'image') {
                showToast('⚠️ 请先选中一张图片', { type: 'warning' })
                return
              }
              setCutoutOpen(true)
            }}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all group ${
              selectedElement?.type === 'image'
                ? 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-md'
                : 'bg-gray-50 border-gray-200 opacity-50'
            }`}
            title="一键抠图（本地算法 / 4 角取样 + 容差移除）"
          >
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200 transition-colors">
              <Scissors size={16} className="text-rose-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">一键抠图</span>
          </button>
        </div>

        {/* 画布快捷操作 */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleSavePreset}
            className="py-2 px-2 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center gap-1"
            title="把当前画布另存为预设"
          >
            <Save size={12} /> 另存预设
          </button>
          <button
            onClick={() => setShowPresetLibrary(true)}
            className="py-2 px-2 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition-all flex items-center justify-center gap-1"
            title="查看已保存的预设"
          >
            <FolderOpen size={12} /> 我的预设 ({userPresets.length})
          </button>
          <button
            onClick={handleRemoveAllStrokes}
            className="py-2 px-2 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-all flex items-center justify-center gap-1"
            title="一键清除所有文字的描边"
          >
            🧽 清除描边
          </button>
          <button
            onClick={handleReset}
            className="py-2 px-2 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all flex items-center justify-center gap-1"
            title="清空画布并清除本地缓存"
          >
            🗑️ 重置画布
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* 画布背景色（始终显示，可快速改色） */}
        <div className="mb-4 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              🎨 画布背景
            </div>
            <span className="text-[10px] text-gray-400">{bgElement ? '已设置' : '点击添加'}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => handleChangeBgColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => handleChangeBgColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 font-mono"
              placeholder="#ffffff"
            />
          </div>
          <div className="grid grid-cols-9 gap-1">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => handleChangeBgColor(c)}
                className="w-full aspect-square rounded border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: c,
                  borderColor: bgColor === c ? '#3B7CFF' : 'transparent',
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* 多选模式：批量操作 */}
        {isMulti ? (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
                ☑️ 已选 {multiSelectedIds.length} 个元素
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1 flex items-center justify-between">
                <span>批量透明度</span>
                <span className={`font-medium ${(() => {
                  const selected = elements.filter(el => multiSelectedIds.includes(el.id))
                  if (selected.length < 2) return 'text-gray-700'
                  const opacities = selected.map(el => (el as any).opacity as number)
                  const min = Math.min(...opacities), max = Math.max(...opacities)
                  return Math.abs(max - min) > 0.01 ? 'text-amber-600' : 'text-gray-700'
                })()}`}>
                  {(() => {
                    const selected = elements.filter(el => multiSelectedIds.includes(el.id))
                    if (selected.length === 0) return '100%'
                    const opacities = selected.map(el => (el as any).opacity as number)
                    const min = Math.min(...opacities), max = Math.max(...opacities)
                    if (Math.abs(max - min) > 0.01) {
                      return `混合（${Math.round(min * 100)}-${Math.round(max * 100)}%）`
                    }
                    return `${Math.round(max * 100)}%`
                  })()}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={(() => {
                  const first = elements.find(el => el.id === multiSelectedIds[0])
                  return (first as any)?.opacity ?? 1
                })()}
                onChange={(e) => {
                  const opacity = Number(e.target.value)
                  multiSelectedIds.forEach(id => updateElement(id, { opacity }))
                }}
                onMouseUp={() => useEditorStore.getState().saveHistory()}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBatchDuplicate}
                className="py-2 bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"
              >
                <Copy size={14} />
                复制全部
              </button>
              <button
                onClick={handleBatchDelete}
                className="py-2 bg-white rounded-lg border border-red-200 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"
              >
                <Trash2 size={14} />
                删除全部
              </button>
            </div>

            {/* 编组 / 取消编组 — 多选 2+ 时可用 */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => {
                  const ids = multiSelectedIds.length > 1 ? multiSelectedIds : (selectedId ? [selectedId] : [])
                  const groupId = useEditorStore.getState().groupElements(ids)
                  if (groupId) showToast(`📦 已编组（${ids.length} 个元素）`)
                }}
                disabled={(() => {
                  const ids = multiSelectedIds.length > 1 ? multiSelectedIds : (selectedId ? [selectedId] : [])
                  if (ids.length < 2) return true
                  // 若所有选中元素已在同一组，禁用
                  const groups = new Set(elements.filter(el => ids.includes(el.id)).map(el => el.groupId).filter(Boolean))
                  return groups.size === 1
                })()}
                className="py-2 bg-white rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-100 transition-all flex items-center justify-center gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Group size={14} />
                编组
              </button>
              <button
                onClick={() => {
                  useEditorStore.getState().ungroupSelected()
                  showToast('已取消编组')
                }}
                disabled={(() => {
                  const ids = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedId ? [selectedId] : [])
                  if (ids.length === 0) return true
                  return !elements.some(el => ids.includes(el.id) && el.groupId)
                })()}
                className="py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Ungroup size={14} />
                取消编组
              </button>
            </div>

            {/* 全选 / 反选 / 取消选择 — 跨选择入口（无论选中与否都可用） */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <button
                onClick={() => {
                  const count = elements.filter(el => !(el.id.startsWith('bg-') || (el as any).shape === 'overlay')).length
                  if (count === 0) {
                    showToast('⚠️ 画布是空的', { type: 'warning' })
                    return
                  }
                  selectAll()
                  showToast(`✅ 已全选 ${count} 个元素`, { type: 'success' })
                }}
                className="py-1.5 bg-white rounded-md border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all text-[10px] font-medium"
                title="Cmd/Ctrl + A — 全选所有非背景元素"
              >
                全选
              </button>
              <button
                onClick={() => {
                  invertSelection()
                  showToast('🔄 已反选', { type: 'info' })
                }}
                disabled={multiSelectedIds.length === 0}
                className="py-1.5 bg-white rounded-md border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all text-[10px] font-medium disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-blue-600"
                title="Cmd/Ctrl + Shift + A — 反选"
              >
                反选
              </button>
              <button
                onClick={() => {
                  clearMultiSelect()
                  showToast('已取消选择', { type: 'info' })
                }}
                disabled={multiSelectedIds.length === 0}
                className="py-1.5 bg-white rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all text-[10px] font-medium disabled:opacity-40"
                title="Esc — 取消选择"
              >
                取消
              </button>
            </div>

            {/* 水平 / 垂直对齐（Figma 风） */}
            <div className="mt-3 pt-3 border-t border-blue-200 space-y-2.5">
              {/* 水平对齐 */}
              <div>
                <div className="text-[10px] font-bold text-blue-700 mb-1 uppercase tracking-wide">水平对齐</div>
                <div className="grid grid-cols-4 gap-1">
                  {([
                    { type: 'left',     label: '左对齐',  icon: '⬅' },
                    { type: 'centerH',  label: '居中',    icon: '↔' },
                    { type: 'right',    label: '右对齐',  icon: '➡' },
                    { type: 'distribute-h', label: '等距', icon: '⊞' },
                  ] as const).map(item => (
                    <button
                      key={item.type}
                      onClick={() => {
                        if (item.type === 'distribute-h') {
                          if (multiSelectedIds.length < 3) {
                            showToast('⚠️ 等距分布至少需要 3 个元素', { type: 'warning' })
                            return
                          }
                          distributeElements(multiSelectedIds, 'h')
                          showToast('已等距分布（水平）', { type: 'success' })
                        } else {
                          alignElements(multiSelectedIds, item.type as any)
                          showToast(`已${item.label}`, { type: 'success' })
                        }
                      }}
                      className="py-1.5 bg-white rounded-md border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all flex flex-col items-center text-[10px] font-medium"
                      title={item.label}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      <span className="mt-0.5">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* 垂直对齐 */}
              <div>
                <div className="text-[10px] font-bold text-blue-700 mb-1 uppercase tracking-wide">垂直对齐</div>
                <div className="grid grid-cols-4 gap-1">
                  {([
                    { type: 'top',     label: '上对齐', icon: '⬆' },
                    { type: 'centerV', label: '居中',   icon: '↕' },
                    { type: 'bottom',  label: '下对齐', icon: '⬇' },
                    { type: 'distribute-v', label: '等距', icon: '⊟' },
                  ] as const).map(item => (
                    <button
                      key={item.type}
                      onClick={() => {
                        if (item.type === 'distribute-v') {
                          if (multiSelectedIds.length < 3) {
                            showToast('⚠️ 等距分布至少需要 3 个元素', { type: 'warning' })
                            return
                          }
                          distributeElements(multiSelectedIds, 'v')
                          showToast('已等距分布（垂直）', { type: 'success' })
                        } else {
                          alignElements(multiSelectedIds, item.type as any)
                          showToast(`已${item.label}`, { type: 'success' })
                        }
                      }}
                      className="py-1.5 bg-white rounded-md border border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all flex flex-col items-center text-[10px] font-medium"
                      title={item.label}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      <span className="mt-0.5">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-blue-600 mt-2 text-center leading-relaxed">
              💡 <kbd className="px-1 bg-white rounded border">⌘A</kbd> 全选 · <kbd className="px-1 bg-white rounded border">Esc</kbd> 取消 · <kbd className="px-1 bg-white rounded border">0-9</kbd> 透明度<br/>
              📦 画布空白处按住左键 = 框选
            </p>
          </div>
        ) : selectedElement ? (
          <div>
            <div className="mb-4 pb-3 border-b border-gray-100">
              <div className="text-base font-bold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedElement.type === 'text' && <>📝 文字元素</>}
                  {selectedElement.type === 'image' && <>🖼️ 图片元素</>}
                  {selectedElement.type === 'shape' && <>⬜ 形状元素</>}
                </div>
                {/* 锁定开关 */}
                <button
                  onClick={() => useEditorStore.getState().toggleLock(selectedElement.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all ${
                    selectedElement.locked
                      ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={selectedElement.locked ? '已锁定：尺寸/旋转/缩放被拦截（仍可拖动位置）\n快捷键 Cmd+Shift+L 切换' : '锁定后尺寸/旋转/缩放不会改变（仍可拖动位置）\n快捷键 Cmd+Shift+L'}
                >
                  {selectedElement.locked ? '🔒 已锁定' : '🔓 锁定元素'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                调整元素属性和位置{selectedElement.locked && ' · 锁定状态下不可拖拽/缩放'}
              </p>
            </div>

            {selectedElement.type === 'text' && <TypeSettings element={selectedElement} />}
            {selectedElement.type === 'image' && <ImageSettings element={selectedElement as any} />}
            {selectedElement.type === 'shape' && <ShapeSettings element={selectedElement as any} />}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="text-5xl mb-4">👆</div>
            <p className="text-gray-600 text-base font-medium mb-1">点击画布中的任意元素</p>
            <p className="text-gray-400 text-sm mb-6">即可编辑其属性和图层</p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  addElement({
                    id: `text-${Date.now()}`,
                    type: 'text' as const,
                    content: '双击编辑文字',
                    x: 50,
                    y: 50,
                    fontSize: 36,
                    fontWeight: 700,
                    fontFamily: 'PingFang SC',
                    color: '#000000',
                    textAlign: 'center',
                    italic: false,
                    underline: false,
                    stroke: false,
                    strokeWidth: 2,
                    strokeColor: '#ffffff',
                    shadow: false,
                    bg: false,
                    bgColor: '#FF5E3A',
                    bgPadding: 8,
                    rotation: 0,
                    opacity: 1,
                  })
                }}
                className="flex flex-col items-center gap-2 py-4 px-2 bg-gray-100 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <Type size={20} />
                <span className="text-xs font-medium">文字</span>
              </button>
              <button
                onClick={handleAddPlaceholderImage}
                className="flex flex-col items-center gap-2 py-4 px-2 bg-gray-100 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <ImageIcon size={20} />
                <span className="text-xs font-medium">图片</span>
              </button>
              <button
                onClick={() => {
                  addElement({
                    id: `shape-${Date.now()}`,
                    type: 'shape' as const,
                    shape: 'rect' as const,
                    x: 50,
                    y: 50,
                    width: 40,
                    height: 40,
                    color: '#FF5E3A',
                    rotation: 0,
                    opacity: 1,
                    radius: 0,
                    border: 0,
                    borderColor: '#000000',
                  })
                }}
                className="flex flex-col items-center gap-2 py-4 px-2 bg-gray-100 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all"
              >
                <Square size={20} />
                <span className="text-xs font-medium">形状</span>
              </button>
            </div>
          </div>
        )}

        {/* 栅格化 — 文字/形状 → 图片（单选/多选都可用） */}
        {(() => {
          const ids = multiSelectedIds.length > 0 ? multiSelectedIds : (selectedId ? [selectedId] : [])
          if (ids.length === 0) return null
          const hasRasterizable = elements.some(el => {
            if (!ids.includes(el.id)) return false
            if (el.type === 'text') return true
            if (el.type === 'shape' && (el as any).shape !== 'overlay') return true
            return false
          })
          if (!hasRasterizable) return null
          const rasterCount = elements.filter(el => {
            if (!ids.includes(el.id)) return false
            return el.type === 'text' || (el.type === 'shape' && (el as any).shape !== 'overlay')
          }).length
          return (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs text-amber-700 mb-2 flex items-center gap-1.5 font-medium">
                <ImageDown size={14} />
                栅格化 — 将文字/形状转为图片
              </div>
              <button
                onClick={() => {
                  useEditorStore.getState().rasterizeSelected()
                  showToast(`🖼️ 已栅格化 ${rasterCount} 个元素`)
                }}
                className="w-full py-2 bg-white rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 text-xs font-medium"
                title="将文字/形状转为图片（不可再编辑文字内容/形状属性，但可缩放/旋转/翻转）"
              >
                <ImageDown size={14} />
                栅格化{ids.length > 1 ? `（${rasterCount}）` : ''}
              </button>
            </div>
          )
        })()}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold text-base hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
        >
          <Download size={20} />
          {exportLoading ? '导出中...' : '导出高清封面 (2x)'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">支持 PNG 格式，高清无码</p>
      </div>

      {showTitleGenerator && (
        <TitleGenerator onClose={() => setShowTitleGenerator(false)} />
      )}

      {/* 智能配色弹窗 */}
      {showColorPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowColorPicker(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-gray-800">智能配色方案</h3>
                <span className="text-xs text-gray-500">基于当前背景色智能生成</span>
              </div>
              <button onClick={() => setShowColorPicker(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-3">
              {generateColorSchemes(bgColor).map((scheme, i) => (
                <button
                  key={i}
                  onClick={() => applyColorScheme(scheme)}
                  className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-xl shadow-inner flex-shrink-0"
                      style={{ backgroundColor: scheme.bg }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: scheme.primaryText }}>
                        Aa
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{scheme.name}</span>
                        <span className="text-xs text-gray-500">{scheme.desc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: scheme.bg }} title={`背景 ${scheme.bg}`} />
                        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: scheme.primaryText }} title={`主文字 ${scheme.primaryText}`} />
                        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: scheme.accent }} title={`强调色 ${scheme.accent}`} />
                        <span className="text-[10px] text-gray-400 ml-2 font-mono">
                          {scheme.bg} · {scheme.primaryText} · {scheme.accent}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check size={20} className="text-blue-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 布局推荐弹窗 */}
      {showLayoutPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLayoutPicker(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-green-500" />
                <h3 className="text-lg font-bold text-gray-800">布局推荐</h3>
                <span className="text-xs text-gray-500">根据画布比例 {ratio} 智能推荐</span>
              </div>
              <button onClick={() => setShowLayoutPicker(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-3">
              {recommendLayouts(ratio, elements).map((layout, i) => (
                <button
                  key={i}
                  onClick={() => applyLayout(layout)}
                  className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col gap-2">
                    {/* 布局缩略：4:5 画布 */}
                    <div className="w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex flex-col items-center justify-center p-3 gap-1.5">
                      {i === 0 && (
                        <>
                          <div className="w-3/4 h-1.5 bg-gray-700 rounded" />
                          <div className="w-1/2 h-1 bg-gray-400 rounded" />
                          <div className="flex-1" />
                          <div className="w-1/3 h-1 bg-gray-400 rounded" />
                        </>
                      )}
                      {i === 1 && (
                        <>
                          <div className="flex-1" />
                          <div className="w-3/4 h-2 bg-gray-800 rounded" />
                          <div className="w-1/2 h-1.5 bg-gray-500 rounded" />
                          <div className="flex-1" />
                        </>
                      )}
                      {i === 2 && (
                        <>
                          <div className="w-2/3 h-1.5 bg-gray-700 rounded self-end" />
                          <div className="flex-1" />
                          <div className="w-2/3 h-1.5 bg-gray-700 rounded self-start" />
                        </>
                      )}
                    </div>
                    <div className="font-bold text-sm text-gray-800">{layout.name}</div>
                    <div className="text-xs text-gray-500">{layout.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 - 全局 useToastStore 在 App.tsx 统一挂载 */}

      {/* 一键抠图弹窗 */}
      {cutoutOpen && selectedElement?.type === 'image' && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !cutoutRunning && setCutoutOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Scissors size={20} className="text-rose-500" />
                <h3 className="text-lg font-bold text-gray-800">✂️ 一键抠图</h3>
              </div>
              <button
                onClick={() => setCutoutOpen(false)}
                disabled={cutoutRunning}
                className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 leading-relaxed">
                🪄 <b>纯本地算法</b>：4 角采样背景色 + 容差移除。<br/>
                适合<b>纯色 / 简单渐变背景</b>的产品图、人物照。<br/>
                <span className="text-xs text-gray-400">复杂背景效果一般，重要图建议用专业工具。</span>
              </div>

              {/* 容差 slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
                  <span>容差（背景移除强度）</span>
                  <span className="font-bold text-rose-600">{CUTOUT_TOLERANCE_PRESETS[cutoutTolerance].hard}-{CUTOUT_TOLERANCE_PRESETS[cutoutTolerance].feather}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={CUTOUT_TOLERANCE_PRESETS[cutoutTolerance].hard}
                  onChange={(e) => {
                    const h = Number(e.target.value)
                    // 找到最接近的 preset
                    const keys = Object.keys(CUTOUT_TOLERANCE_PRESETS) as (keyof typeof CUTOUT_TOLERANCE_PRESETS)[]
                    const closest = keys.reduce((a, b) =>
                      Math.abs(CUTOUT_TOLERANCE_PRESETS[b].hard - h) < Math.abs(CUTOUT_TOLERANCE_PRESETS[a].hard - h) ? b : a
                    )
                    setCutoutTolerance(closest)
                  }}
                  disabled={cutoutRunning}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>严格（仅同色）</span>
                  <span>推荐 35</span>
                  <span>宽松（连渐变）</span>
                </div>
              </div>

              {/* 预设按钮 */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '严格', val: 'low' as const },
                  { label: '推荐', val: 'mid' as const },
                  { label: '宽松', val: 'high' as const },
                  { label: '激进', val: 'ultra' as const },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => setCutoutTolerance(p.val)}
                    disabled={cutoutRunning}
                    className={`py-1.5 text-xs rounded-md transition-colors font-medium ${
                      cutoutTolerance === p.val
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.label} {p.val}
                  </button>
                ))}
              </div>

              {/* 进度 */}
              {cutoutRunning && (
                <div className="px-3 py-2 bg-rose-50 rounded-lg text-xs text-rose-600 font-medium">
                  ⏳ {cutoutProgress}
                </div>
              )}
            </div>
            <div className="px-6 pb-5 flex justify-end gap-2">
              <button
                onClick={() => setCutoutOpen(false)}
                disabled={cutoutRunning}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleCutout}
                disabled={cutoutRunning}
                className="px-4 py-2 text-sm text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 rounded-lg disabled:opacity-50 font-medium flex items-center gap-1.5"
              >
                {cutoutRunning ? '⏳ 处理中...' : '✂️ 一键抠图'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 黄金构图选择 */}
      {showCompositionPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCompositionPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={20} className="text-indigo-500" />
                <h3 className="text-lg font-bold text-gray-800">黄金构图算法</h3>
                <span className="text-xs text-gray-500">4 种数学构图 / 纯本地</span>
              </div>
              <button onClick={() => setShowCompositionPicker(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {COMPOSITIONS.map((comp, i) => (
                <button
                  key={i}
                  onClick={() => applyComposition(comp)}
                  className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-20 flex-shrink-0 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                      {i === 0 ? '⊞' : i === 1 ? 'φ' : i === 2 ? '◎' : '⊡'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{comp.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{comp.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 设计风格选择 */}
      {showStylePicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowStylePicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold text-gray-800">设计风格预设</h3>
                <span className="text-xs text-gray-500">5 大风格 / 设计师 Prompt</span>
              </div>
              <button onClick={() => setShowStylePicker(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-3">
              {DESIGN_STYLES.map((style, i) => (
                <div key={i} className="p-4 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-xl flex-shrink-0 flex flex-col items-center justify-center"
                      style={{ backgroundColor: style.colorPalette.bg, color: style.colorPalette.text }}
                    >
                      <span className="text-2xl">{style.emoji}</span>
                      <span className="text-[9px] font-bold mt-0.5">Aa</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{style.name}</span>
                        <span className="text-xs text-gray-500">{style.desc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: style.colorPalette.bg }} title="bg" />
                        <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: style.colorPalette.text }} title="text" />
                        <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: style.colorPalette.accent }} title="accent" />
                        <span className="text-[10px] text-gray-400 ml-2 font-mono">{style.fontFamily.split(',')[0]}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => applyStyle(style)}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600"
                      >
                        应用
                      </button>
                      <button
                        onClick={() => setShowStyleExplainer(style)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50"
                      >
                        Prompt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 设计师 Prompt 解释 */}
      {showStyleExplainer && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowStyleExplainer(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">设计师 Prompt</h3>
              <button onClick={() => setShowStyleExplainer(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {explainDesignChoice(showStyleExplainer, elements)}
              </pre>
              <button
                onClick={() => { applyStyle(showStyleExplainer); setShowStyleExplainer(null) }}
                className="mt-4 w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600"
              >
                应用「{showStyleExplainer.name}」风格
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 我的预设库 */}
      {showPresetLibrary && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPresetLibrary(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen size={20} className="text-sky-500" />
                <h3 className="text-lg font-bold text-gray-800">我的预设</h3>
                <span className="text-xs text-gray-500">{userPresets.length} 个 / 本地保存</span>
              </div>
              <button onClick={() => setShowPresetLibrary(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {userPresets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">还没有预设</p>
                  <p className="text-xs mt-1">点左下「另存预设」把你的设计保存到这里</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {userPresets.map(preset => {
                    // 解析缩略图数据（{bg, fg, main}），回退到默认渐变
                    let thumbBg = 'linear-gradient(135deg, #1a1a2e 0%, #667eea 100%)'
                    let thumbFg = '#ffffff'
                    let mainText = preset.name.slice(0, 8)
                    try {
                      if (preset.thumbnail) {
                        const t = JSON.parse(preset.thumbnail)
                        if (t.bg) thumbBg = `linear-gradient(135deg, ${t.bg} 0%, ${t.fg || t.bg} 100%)`
                        if (t.fg) thumbFg = t.fg
                        if (t.main) mainText = t.main
                      }
                    } catch {}
                    return (
                      <div key={preset.id} className="rounded-xl border border-gray-200 hover:border-sky-400 hover:shadow-md transition-all group overflow-hidden">
                        {/* 缩略图：渐变背景 + 主标题文字 */}
                        <div
                          className="aspect-video w-full flex items-center justify-center relative"
                          style={{ background: thumbBg }}
                        >
                          <div
                            className="text-base font-black text-center px-2 leading-tight"
                            style={{ color: thumbFg }}
                          >
                            {mainText}
                          </div>
                          <div className="absolute top-1 right-1 text-[9px] bg-black/40 text-white px-1.5 py-0.5 rounded">
                            {preset.ratio}
                          </div>
                          <div className="absolute bottom-1 left-1 text-[9px] bg-black/40 text-white px-1.5 py-0.5 rounded">
                            {preset.elements.length} 元素
                          </div>
                        </div>
                        <div className="p-2.5">
                          <div className="font-bold text-sm text-gray-800 truncate">{preset.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(preset.createdAt).toLocaleString()}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => { useEditorStore.getState().loadPreset(preset.id); setShowPresetLibrary(false); showToast(`✅ 已加载「${preset.name}」`, { type: 'success' }) }}
                              className="flex-1 py-1.5 bg-sky-500 text-white text-xs font-medium rounded hover:bg-sky-600"
                            >
                              加载
                            </button>
                            <button
                              onClick={async () => {
                                if (await showConfirm({ title: '删除预设', message: `确认删除预设「${preset.name}」？此操作不可撤销。`, confirmText: '删除', danger: true })) {
                                  useEditorStore.getState().deletePreset(preset.id)
                                  showToast('🗑️ 已删除')
                                }
                              }}
                              className="px-2.5 py-1.5 bg-white border border-red-200 text-red-600 text-xs rounded hover:bg-red-50"
                            >
                              删
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default PropertiesPanel
