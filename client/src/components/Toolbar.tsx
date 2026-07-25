import React, { useState, useRef } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { showToast } from '../store/useToastStore'
import TitleGenerator from './TitleGenerator'
import { useMagicGenerate } from './MagicGenerate'
import ProjectManager from './ProjectManager'
import { Type, Image, Square, Sparkles, Download, Undo2, Redo2, Save, FolderOpen, Package, Upload, Zap, Check, Maximize2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { exportTemplate, downloadJSON, importTemplateFile } from '../utils/templateIO'
import { composeEnhancedExport } from '../utils/exportBgEngine'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

const Toolbar: React.FC = () => {
  const addElement = useEditorStore(state => state.addElement)
  const { undo, redo, canUndo, canRedo, ratio, currentProjectName, dirty } = useEditorStore()
  const [showTitleGenerator, setShowTitleGenerator] = useState(false)
  const { generate: magicGenerate } = useMagicGenerate()
  const [projectModal, setProjectModal] = useState<'save' | 'open' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportModal, setExportModal] = useState(false)
  // 打包模板：用户输入名字的 inline modal
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  // P1-3 等比缩放字号: 4 选 1 选目标比例的 inline modal
  const [showAdaptModal, setShowAdaptModal] = useState(false)
  const handleConfirmName = () => {
    const state = useEditorStore.getState()
    const name = nameInput.trim() || `模板 ${new Date().toLocaleDateString()}`
    const tpl = exportTemplate(name, state.ratio, state.elements)
    downloadJSON(tpl)
    showToast(`📦 已打包模板「${name}」！\n文件名：${name}-${Date.now()}.cccover.json`, { type: 'success', duration: 4000 })
    setNameModalOpen(false)
    setNameInput('')
  }

  // 添加文字元素
  const handleAddText = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      content: '双击编辑文字',
      x: 50,
      y: 50,
      fontSize: 36,
      fontWeight: 700 as const,
      fontFamily: 'PingFang SC',
      color: '#000000',
      textAlign: 'center' as const,
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
    }
    addElement(newElement)
  }

  // 添加形状元素
  const handleAddShape = () => {
    const newElement = {
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
    }
    addElement(newElement)
  }

  // 图片上传（含类型/大小校验）
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast('仅支持 PNG / JPG / WebP / GIF 图片')
        e.target.value = ''
        return
      }
      if (file.size > MAX_IMAGE_SIZE) {
        showToast('图片不能超过 10MB')
        e.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new window.Image()
        img.onload = () => {
          const newElement = {
            id: `image-${Date.now()}`,
            type: 'image' as const,
            src: event.target?.result as string,
            x: 50,
            y: 50,
            width: 80,  // 默认 80% 让图片立刻是画面主角（可继续拖角到 10000%）
            rotation: 0,
            radius: 0,
            border: 0,
            borderColor: '#000000',
            shadow: false,
            filter: 'none',
            useCutout: false,
            opacity: 1,
          }
          addElement(newElement)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  // 打包当前画布为模板
  const handlePackageTemplate = () => {
    const state = useEditorStore.getState()
    if (state.elements.length === 0) {
      showToast('⚠️ 画布是空的，无法打包', { type: 'warning' })
      return
    }
    setNameInput(`模板 ${new Date().toLocaleDateString()}`)
    setNameModalOpen(true)
  }

  // 导入模板（支持 JSON / PSD / AI / PDF / afdesign / png / jpg）
  const importInputRef = useRef<HTMLInputElement>(null)
  const handleImportTemplate = () => {
    importInputRef.current?.click()
  }
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const state = useEditorStore.getState()

    // 1. JSON 模板（自家格式）
    if (ext === 'json') {
      const tpl = await importTemplateFile(file)
      if (tpl) {
        state.loadProject(null, tpl.name, tpl.ratio, tpl.elements)
        showToast(`✅ 已导入模板「${tpl.name}」！\n元素：${tpl.elements.length} 个`, { type: 'success', duration: 4000 })
      } else {
        showToast('❌ JSON 模板解析失败，请检查文件格式', { type: 'error' })
      }
    }
    // 2. 设计软件格式（PSD/AI/PDF/afdesign）— MVP：转图片占位，提示用户后续支持
    else if (['psd', 'ai', 'pdf', 'afdesign', 'svg', 'eps'].includes(ext)) {
      showToast(
        `📐 检测到 ${ext.toUpperCase()} 格式。\n\nMVP 阶段：建议先用设计软件导出为 PNG/JPG 透明图片，\n再通过「图片」按钮上传到画布。\n\n完整 PSD 解析（每图层为单独图层）需集成 ag-psd 库（~500KB），将在下个版本加入。`,
        { type: 'info', duration: 6000 }
      )
    }
    // 3. 图片格式（PNG/JPG/WEBP/GIF）— 加载为画布背景
    else if (ALLOWED_TYPES.includes(file.type) || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const src = ev.target?.result as string
        // 创建图片元素
        state.addElement({
          id: `img-${Date.now()}`,
          type: 'image',
          src,
          x: 50, y: 50,
          width: 100, height: 0,  // 默认 100% 铺满画板（用户可缩小或拖角继续放大到 10000%）
          rotation: 0,
          radius: 0,
          border: 0, borderColor: '#000000',
          shadow: false,
          filter: 'none',
          useCutout: false,
          opacity: 1,
        } as any)
        showToast(
          `🖼️ 已添加图片「${file.name}」！\n\n💡 在选中态：拖角可无限放大（覆盖整个画板）；\n滚轮可缩放；拖顶部旋转手柄，双击回正。`,
          { type: 'success', duration: 5000 }
        )
      }
      reader.readAsDataURL(file)
    } else {
      showToast(
        `❌ 不支持的文件格式：.${ext}\n\n支持：JSON 模板 / PSD / AI / PDF / afdesign / PNG / JPG / WEBP / GIF`,
        { type: 'error', duration: 5000 }
      )
    }

    // 重置 input
    e.target.value = ''
  }

  // 标准导出（html2canvas）
  const handleExport = async () => {
    setExportLoading(true)
    showToast('📸 标准导出中...', { type: 'info', duration: 1500 })
    setExportModal(false)
    try {
      const canvasElement = document.getElementById('cover-canvas') as HTMLElement
      if (!canvasElement) { showToast('❌ 未找到画布元素', { type: 'error' }); return }

      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
        logging: false, imageTimeout: 20000,
        width: canvasElement.offsetWidth, height: canvasElement.offsetHeight,
        onclone: (_, clonedCanvas) => {
          clonedCanvas.style.boxShadow = 'none'
          clonedCanvas.style.overflow = 'hidden'
        },
      })
      const link = document.createElement('a')
      link.download = `封面_${ratio}_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('✅ 导出成功！', { type: 'success' })
    } catch (error: any) {
      console.error('导出失败:', error)
      showToast(`❌ 导出失败：${error?.message || '未知错误'}`, { type: 'error', duration: 5000 })
    } finally { setExportLoading(false) }
  }

  // 增强导出（Canvas2D 背景引擎 + html2canvas 元素层）
  const handleEnhancedExport = async () => {
    setExportLoading(true)
    showToast('💎 增强导出中...', { type: 'info', duration: 2000 })
    setExportModal(false)
    try {
      const canvasEl = document.getElementById('cover-canvas') as HTMLElement
      if (!canvasEl) { showToast('❌ 未找到画布元素', { type: 'error' }); return }

      const bgEl = canvasEl.querySelector('[data-element-id]') as HTMLElement
      const bgStyle = bgEl ? getComputedStyle(bgEl).background : undefined

      const RATIO_SIZES: Record<string, { width: number; height: number }> = {
        '3:4': { width: 480, height: 640 }, '1:1': { width: 540, height: 540 },
        '9:16': { width: 405, height: 720 }, '16:9': { width: 720, height: 405 },
      }
      const sz = RATIO_SIZES[ratio] || { width: 480, height: 640 }

      const dataUrl = await composeEnhancedExport(canvasEl, sz.width, sz.height, bgStyle, 2)

      const link = document.createElement('a')
      link.download = `封面_${ratio}_增强_${Date.now()}.png`
      link.href = dataUrl
      link.click()
      showToast('✅ 增强导出成功！', { type: 'success' })
    } catch (error: any) {
      console.error('增强导出失败:', error)
      showToast('💎 增强导出不可用，降级到标准模式', { type: 'warning', duration: 3000 })
      handleExport()
      return
    } finally { setExportLoading(false) }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-6 shadow-sm">
      {/* Logo区域 - 英文版 CoverForge Pro（参考图风格） */}
      <div className="flex items-center gap-3 pr-2">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0 ring-1 ring-red-600/10">
          <Zap size={22} className="text-white" fill="white" strokeWidth={1.5} />
        </div>
        <div className="leading-tight">
          <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">
            <span className="text-gray-900">CoverForge</span>
            <span className="text-red-600"> Pro</span>
          </h1>
          <p className="text-[10px] text-gray-400 mt-0.5 font-semibold tracking-[0.15em] uppercase">100+ Templates & Formulas</p>
        </div>
      </div>

      <div className="w-px h-10 bg-gray-200" />

      {/* 项目操作 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setProjectModal('open')}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all group"
          title="打开项目"
        >
          <FolderOpen size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">项目</span>
        </button>
        <button
          onClick={() => setProjectModal('save')}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-all group relative"
          title="保存项目 (Ctrl+S)"
        >
          <Save size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">保存</span>
          {dirty && <div className="absolute top-1.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />}
        </button>
      </div>

      <div className="w-px h-10 bg-gray-200" />

      {/* 当前项目名 */}
      <div className="text-sm text-gray-500 max-w-[140px] truncate" title={currentProjectName}>
        {currentProjectName}{dirty ? ' •' : ''}
      </div>

      <div className="w-px h-10 bg-gray-200" />

      {/* 基础工具按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddText}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-all group"
          title="添加文字"
        >
          <Type size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">文字</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-all group"
          title="添加图片"
        >
          <Image size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">图片</span>
        </button>
        <button
          onClick={handleAddShape}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-700 hover:text-purple-500 hover:bg-purple-50 transition-all group"
          title="添加形状"
        >
          <Square size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">形状</span>
        </button>
      </div>

      <div className="flex-1" />

      {/* 撤销/重做 */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="重做 (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>
      </div>

      <div className="w-px h-8 bg-gray-200" />

      {/* 右侧功能按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => magicGenerate()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all group shadow-md shadow-orange-500/20"
          title="随机匹配模板 + 爆款标题公式（真·一键，无需输入）"
        >
          <Zap size={18} className="group-hover:rotate-12 transition-transform" fill="white" />
          <span className="font-semibold">一键智能生成</span>
        </button>

        <button
          onClick={() => setShowTitleGenerator(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-orange-300 hover:text-orange-600 hover:shadow-md transition-all group"
        >
          <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="font-medium">热词</span>
        </button>

        <button
          onClick={() => setExportModal(true)}
          disabled={exportLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 hover:shadow-lg transition-all"
        >
          <Download size={18} />
          <span className="font-medium">{exportLoading ? '导出中...' : '导出封面'}</span>
        </button>

        {exportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setExportModal(false)}>
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw]"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Download size={20} className="text-orange-500" />
                导出封面
              </h3>

              <div className="space-y-3">
                <button
                  onClick={handleExport}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 bg-gray-50 hover:bg-orange-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Download size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">📦 标准模式</div>
                      <div className="text-xs text-gray-500 mt-0.5">html2canvas 渲染，兼容性最好</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleEnhancedExport}
                  className="w-full p-4 rounded-xl border-2 border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                      <Check size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-orange-800">💎 增强模式（推荐）</div>
                      <div className="text-xs text-orange-600 mt-0.5">Canvas2D 渐变引擎，颜色更准确</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setExportModal(false)}
                className="mt-4 w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handlePackageTemplate}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:shadow-lg transition-all"
          title="把当前画布打包为 .cccover.json 模板文件"
        >
          <Package size={18} />
          <span className="font-medium">打包模板</span>
        </button>

        <button
          onClick={handleImportTemplate}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 hover:shadow-lg transition-all"
          title="从 .cccover.json / .psd / .ai / .pdf / .afdesign 导入模板"
        >
          <Upload size={18} />
          <span className="font-medium">导入模板</span>
        </button>

        {/* P1-3 等比缩放字号：弹 4 选 1 选目标比例,按短边比例缩放所有文字字号 */}
        <button
          onClick={() => setShowAdaptModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 hover:shadow-lg transition-all"
          title="按目标比例短边缩放所有文字字号（仅改 fontSize，字重/字间距/行高不变）"
        >
          <Maximize2 size={18} />
          <span className="font-medium">等比缩放</span>
        </button>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 隐藏的模板导入 input */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json,.psd,.ai,.pdf,.afdesign,.svg,.eps,.png,.jpg,.jpeg,.webp,.gif"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* AI 标题生成弹窗（"热词"浏览/筛选） */}
      {showTitleGenerator && (
        <TitleGenerator onClose={() => setShowTitleGenerator(false)} />
      )}

      {/* 项目管理弹窗 */}
      {projectModal && (
        <ProjectManager mode={projectModal} onClose={() => setProjectModal(null)} />
      )}

      {/* P1-3 等比缩放：选目标比例 4 选 1 modal */}
      {showAdaptModal && (() => {
        const ratios: Array<'1:1' | '3:4' | '9:16' | '16:9'> = ['1:1', '3:4', '9:16', '16:9']
        const ratioInfo: Record<string, { short: number; emoji: string; label: string }> = {
          '1:1': { short: 540, emoji: '⬜', label: '短边 540（最大字号）' },
          '3:4': { short: 480, emoji: '🟦', label: '短边 480' },
          '9:16': { short: 405, emoji: '📱', label: '短边 405' },
          '16:9': { short: 405, emoji: '🎬', label: '短边 405' },
        }
        const currentRatio = useEditorStore.getState().ratio
        return (
          <div
            className="fixed inset-0 z-[9997] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowAdaptModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">📐 等比缩放字号</h3>
                <p className="text-sm text-gray-500 mt-1">
                  当前比例 <span className="font-semibold text-orange-600">{currentRatio}</span>
                  ，选目标比例后,按"短边比例"缩放所有文字字号。
                  <br />
                  <span className="text-xs text-gray-400">仅改 fontSize,字重/字间距/行高/位置不变。</span>
                </p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {ratios.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      const state = useEditorStore.getState()
                      if (r === currentRatio) {
                        showToast('⚠️ 目标比例与当前比例相同,无需缩放', { type: 'info', duration: 2000 })
                        setShowAdaptModal(false)
                        return
                      }
                      const oldS = ratioInfo[currentRatio].short
                      const newS = ratioInfo[r].short
                      const scale = (newS / oldS).toFixed(2)
                      const ok = window.confirm(
                        `将按 ${scale}x 缩放所有文字字号 (${oldS}→${newS} 短边)。\n\n此操作会修改所有文字元素,是否继续？`
                      )
                      if (ok) {
                        state.adaptFontSizeToRatio(currentRatio, r)
                        showToast(`✅ 已按 ${scale}x 缩放所有字号`, { type: 'success', duration: 2000 })
                      }
                      setShowAdaptModal(false)
                    }}
                    className={`p-3 rounded-xl text-left transition-all ${
                      r === currentRatio
                        ? 'bg-orange-50 border-2 border-orange-300'
                        : 'bg-gray-50 hover:bg-violet-50 border-2 border-transparent hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ratioInfo[r].emoji}</span>
                      <span className="font-bold text-gray-900">{r}</span>
                      {r === currentRatio && <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded">当前</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{ratioInfo[r].label}</div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowAdaptModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Toast 提示 - 全局 useToastStore 在 App.tsx 统一挂载 */}

      {/* 打包模板：用户输入名字的 inline modal */}
      {nameModalOpen && (
        <div
          className="fixed inset-0 z-[9997] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setNameModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-3">
              <h3 className="text-lg font-bold text-gray-900">📦 打包模板</h3>
              <p className="text-sm text-gray-500 mt-1">为当前画布起个名字，保存为 .cccover.json 文件</p>
            </div>
            <div className="px-6 pb-4">
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmName()
                  if (e.key === 'Escape') setNameModalOpen(false)
                }}
                placeholder="输入模板名称..."
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
              />
            </div>
            <div className="px-6 pb-5 flex justify-end gap-2">
              <button
                onClick={() => setNameModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                取消
              </button>
              <button
                onClick={handleConfirmName}
                className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 rounded-lg font-medium"
              >
                打包并下载
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Toolbar
