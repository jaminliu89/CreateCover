import React, { useState } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import { showToast } from '../../store/useToastStore'
import type { ImageElement } from '../../types'
import { Scissors, Wand2, RefreshCw } from 'lucide-react'
import LayerControls from './LayerControls'
import { cutoutImageLocal, CUTOUT_TOLERANCE_PRESETS } from '../../utils/cutout'

interface Props {
  element: ImageElement
}

const ImageSettings: React.FC<Props> = ({ element }) => {
  const updateElement = useEditorStore(state => state.updateElement)
  const [cutoutLoading, setCutoutLoading] = useState(false)
  const [cutoutSuccess, setCutoutSuccess] = useState(element.useCutout || false)
  const [cutoutError, setCutoutError] = useState<string | null>(null)
  const [cutoutTolerance] = useState<keyof typeof CUTOUT_TOLERANCE_PRESETS>('mid')

  const handleChange = (key: keyof ImageElement, value: any) => {
    updateElement(element.id, { [key]: value } as Partial<ImageElement>)
  }

  const handleChangeAndSave = (key: keyof ImageElement, value: any) => {
    handleChange(key, value)
    useEditorStore.getState().saveHistory()
  }

  // 一键抠图（本地算法，4 角取样 + 容差移除，0 网络成本）
  const handleCutout = async () => {
    if (!element.src) {
      setCutoutError('图片 src 为空')
      return
    }
    setCutoutLoading(true)
    setCutoutError(null)
    try {
      const newSrc = await cutoutImageLocal(element.src, { tolerance: cutoutTolerance })
      handleChangeAndSave('useCutout', true)
      handleChangeAndSave('src', newSrc)
      setCutoutSuccess(true)
      showToast('✂️ 抠图完成！背景已变透明', { type: 'success' })
    } catch (e: any) {
      setCutoutError(e?.message || '抠图失败')
      showToast(`❌ 抠图失败：${e?.message || '未知错误'}`, { type: 'error' })
    } finally {
      setCutoutLoading(false)
    }
  }

  // 智能美化（模拟）
  const handleEnhance = () => {
    // 模拟自动优化
    handleChangeAndSave('filter', 'contrast(110%) saturate(120%) brightness(105%)')
  }

  const filters = [
    { name: '原图', value: 'none' },
    { name: '黑白', value: 'grayscale(100%)' },
    { name: '复古', value: 'sepia(80%)' },
    { name: '高对比', value: 'contrast(150%)' },
    { name: '鲜艳', value: 'saturate(200%)' },
    { name: '暖调', value: 'sepia(30%) saturate(150%)' },
    { name: '冷调', value: 'hue-rotate(180deg) saturate(80%)' },
    { name: '模糊', value: 'blur(4px)' },
  ]

  return (
    <div className="space-y-5">
      {/* 图层控制 */}
      <LayerControls elementId={element.id} />

      {/* AI 快捷操作按钮 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCutout}
          disabled={cutoutLoading}
          className="flex flex-col items-center gap-2 py-4 px-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg transition-all disabled:opacity-60 group"
        >
          {cutoutLoading ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : cutoutSuccess ? (
            <div className="relative">
              <Scissors size={20} className="group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
            </div>
          ) : (
            <Scissors size={20} className="group-hover:scale-110 transition-transform" />
          )}
          <span className="text-sm font-medium">
            {cutoutLoading ? '处理中...' : cutoutSuccess ? '已抠图' : '一键抠图'}
          </span>
        </button>
        
        <button
          onClick={handleEnhance}
          className="flex flex-col items-center gap-2 py-4 px-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white hover:shadow-lg transition-all group"
        >
          <Wand2 size={20} className="group-hover:scale-110 transition-transform group-hover:rotate-12" />
          <span className="text-sm font-medium">智能美化</span>
        </button>
      </div>

      {/* 抠图失败提示 */}
      {cutoutError && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs text-red-600 leading-relaxed">{cutoutError}</p>
        </div>
      )}

      {/* 图片属性 */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>大小 (%)</span>
            <span className="font-medium text-gray-700">{element.width}%</span>
          </label>
          <input
            type="range"
            min="2"
            max="10000"
            value={Math.min(10000, element.width)}
            onChange={(e) => handleChange('width', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
            step="1"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>圆角 (px)</span>
            <span className="font-medium text-gray-700">{element.radius}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={element.radius}
            onChange={(e) => handleChange('radius', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>🖊️ 描边 (px)</span>
            <span className="font-medium text-gray-700">{element.border || 0}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={element.border}
            onChange={(e) => handleChange('border', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
          {/* 描边颜色选择（仅在描边宽度 > 0 时显示） */}
          {element.border > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={element.borderColor || '#000000'}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                title="描边颜色"
              />
              {/* 预设颜色 chips */}
              <div className="flex gap-1">
                {['#000000', '#FFFFFF', '#FF2442', '#FFD700', '#3B7CFF', '#00C896'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleChangeAndSave('borderColor', c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      element.borderColor === c ? 'border-orange-500 scale-110' : 'border-gray-200'
                    }`}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">滤镜效果</label>
          <div className="grid grid-cols-4 gap-2">
            {filters.map(filter => (
              <button
                key={filter.value}
                onClick={() => handleChangeAndSave('filter', filter.value)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  element.filter === filter.value 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>旋转 (°)</span>
            <span className="font-medium text-gray-700">{element.rotation}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={element.rotation}
            onChange={(e) => handleChange('rotation', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>透明度 (%)</span>
            <span className="font-medium text-gray-700">{Math.round(element.opacity * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={element.opacity}
            onChange={(e) => handleChange('opacity', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <label className="text-sm text-gray-600 font-medium">阴影效果</label>
          <button
            onClick={() => handleChangeAndSave('shadow', !element.shadow)}
            className={`w-12 h-6 rounded-full transition-all relative ${element.shadow ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${element.shadow ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageSettings
