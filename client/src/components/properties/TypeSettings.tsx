import React, { useState } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react'
import LayerControls from './LayerControls'
import { TEXT_PRESETS, applyTextPreset, getCurrentPresetId } from '../../utils/textPresets'
import { estimateConvertedSize } from '../../utils/textToImage'
import { showToast } from '../../store/useToastStore'

interface Props {
  element: any
}

const TypeSettings: React.FC<Props> = ({ element }) => {
  const updateElement = useEditorStore(state => state.updateElement)
  const [localSize, setLocalSize] = useState(element.fontSize)

  const handleChange = (key: string, value: any) => {
    updateElement(element.id, { [key]: value })
  }

  const handleChangeAndSave = (key: string, value: any) => {
    handleChange(key, value)
    useEditorStore.getState().saveHistory()
  }

  const handleSliderMouseUp = () => {
    handleChangeAndSave('fontSize', localSize)
  }

  const colors = [
    '#000000', '#333333', '#666666', '#ffffff',
    '#FF5E3A', '#FF9900', '#FFD700', '#FF3366',
    '#FF0000', '#00CC66', '#0099FF', '#9933FF',
    '#FF69B4', '#00CED1', '#FF6347', '#40E0D0',
  ]

  const fonts = [
    { name: '苹方', value: 'PingFang SC' },
    { name: '思源黑体', value: 'Source Han Sans CN' },
    { name: '微软雅黑', value: 'Microsoft YaHei' },
    { name: 'Impact', value: 'Impact' },
    { name: 'Arial Black', value: 'Arial Black' },
    { name: 'Georgia', value: 'Georgia' },
  ]

  return (
    <div className="space-y-5">
      {/* 图层控制 */}
      <LayerControls elementId={element.id} />

      {/* 文字预设（P1-1 2026-07-25）— 12 个常见场景一键套用 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>文字预设</span>
          <span className="text-[10px] text-gray-400 font-normal">12 种场景</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TEXT_PRESETS.map(preset => {
            const active = getCurrentPresetId(element) === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => {
                  const patch = applyTextPreset(preset.id)
                  if (Object.keys(patch).length > 0) {
                    updateElement(element.id, patch)
                    setLocalSize(preset.fontSize)  // 同步字号 slider
                    useEditorStore.getState().saveHistory()
                  }
                }}
                title={`${preset.name} · ${preset.description}`}
                className={`py-1.5 px-1.5 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-base leading-none">{preset.icon}</span>
                <span className="text-[10px] font-medium leading-none">{preset.name}</span>
                <span className={`text-[9px] leading-none tabular-nums ${active ? 'text-white/80' : 'text-gray-400'}`}>
                  {preset.fontSize}px
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 字号 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>字号</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600">{localSize}px</span>
        </label>
        <input
          type="range"
          min={12}
          max={120}
          value={localSize}
          onChange={(e) => setLocalSize(Number(e.target.value))}
          onMouseUp={handleSliderMouseUp}
          onTouchEnd={handleSliderMouseUp}
          className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* 字体 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">字体</label>
        <div className="grid grid-cols-2 gap-2">
          {fonts.map(font => (
            <button
              key={font.value}
              onClick={() => handleChangeAndSave('fontFamily', font.value)}
              className={`py-2 px-3 rounded-lg text-xs text-left transition-all ${
                element.fontFamily.includes(font.value)
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* 快速样式按钮 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">样式</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleChangeAndSave('fontWeight', element.fontWeight === 700 ? 400 : 700)}
            className={`py-2.5 rounded-xl text-sm transition-all ${
              element.fontWeight >= 700 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bold size={16} className="mx-auto" />
          </button>
          <button
            onClick={() => handleChangeAndSave('italic', !element.italic)}
            className={`py-2.5 rounded-xl text-sm transition-all ${
              element.italic ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Italic size={16} className="mx-auto" />
          </button>
          <button
            onClick={() => handleChangeAndSave('underline', !element.underline)}
            className={`py-2.5 rounded-xl text-sm transition-all ${
              element.underline ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Underline size={16} className="mx-auto" />
          </button>
        </div>
      </div>

      {/* 文字排版（P0-2/3 2026-07-25）— 行高/字间距/横排竖排切换 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">排版</label>

        {/* 行高 slider */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500">行高</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600 tabular-nums">
              {(element.lineHeight ?? 1.2).toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={0.8}
            max={2.5}
            step={0.1}
            value={element.lineHeight ?? 1.2}
            onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 字间距 slider */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-500">字间距</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600 tabular-nums">
              {element.letterSpacing ?? 0}px
            </span>
          </div>
          <input
            type="range"
            min={-5}
            max={30}
            step={1}
            value={element.letterSpacing ?? 0}
            onChange={(e) => handleChange('letterSpacing', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 横排/竖排切换 */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleChangeAndSave('writingMode', 'horizontal-tb')}
            className={`py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
              (element.writingMode ?? 'horizontal-tb') === 'horizontal-tb'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm leading-none">A→</span>
            <span>横排</span>
          </button>
          <button
            onClick={() => handleChangeAndSave('writingMode', 'vertical-rl')}
            className={`py-1.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
              element.writingMode === 'vertical-rl'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm leading-none">A↓</span>
            <span>竖排</span>
          </button>
        </div>
      </div>

      {/* 对齐方式 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">对齐方式</label>
        <div className="grid grid-cols-3 gap-2">
          {(['left', 'center', 'right'] as const).map((align, index) => (
            <button
              key={align}
              onClick={() => handleChangeAndSave('textAlign', align)}
              className={`py-2 rounded-xl transition-all ${
                element.textAlign === align ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index === 0 && <AlignLeft size={16} className="mx-auto" />}
              {index === 1 && <AlignCenter size={16} className="mx-auto" />}
              {index === 2 && <AlignRight size={16} className="mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色设置 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">文字颜色</label>
        <div className="grid grid-cols-8 gap-1.5">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleChangeAndSave('color', color)}
              className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${
                element.color === color ? 'ring-2 ring-orange-500 ring-offset-1 shadow-md' : ''
              }`}
              style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
            />
          ))}
        </div>
      </div>

      {/* 渐变文字（P1-2 2026-07-25）— 开关 + from/to 颜色 + 角度 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700">渐变文字</label>
          <button
            onClick={() => {
              if (element.colorGradient) {
                handleChangeAndSave('colorGradient', undefined as any)
              } else {
                handleChangeAndSave('colorGradient', { from: '#FF5E3A', to: '#FF3366', angle: 90 })
              }
            }}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              element.colorGradient ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                element.colorGradient ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {element.colorGradient && (
          <div className="space-y-2.5 pl-1">
            {/* 渐变预览条 */}
            <div
              className="h-6 rounded-md"
              style={{
                backgroundImage: `linear-gradient(${element.colorGradient.angle}deg, ${element.colorGradient.from}, ${element.colorGradient.to})`,
              }}
            />
            {/* from 颜色 */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-8">起</span>
              <div className="flex gap-1 flex-1">
                {colors.slice(0, 8).map(c => (
                  <button
                    key={c}
                    onClick={() => handleChangeAndSave('colorGradient', { ...element.colorGradient!, from: c })}
                    className={`w-5 h-5 rounded transition-all hover:scale-110 ${
                      element.colorGradient?.from === c ? 'ring-2 ring-orange-500 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                  />
                ))}
              </div>
            </div>
            {/* to 颜色 */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-8">终</span>
              <div className="flex gap-1 flex-1">
                {colors.slice(8).map(c => (
                  <button
                    key={c}
                    onClick={() => handleChangeAndSave('colorGradient', { ...element.colorGradient!, to: c })}
                    className={`w-5 h-5 rounded transition-all hover:scale-110 ${
                      element.colorGradient?.to === c ? 'ring-2 ring-orange-500 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                  />
                ))}
              </div>
            </div>
            {/* 角度 slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500">角度</span>
                <span className="text-[10px] text-gray-400 tabular-nums">{element.colorGradient.angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={15}
                value={element.colorGradient.angle}
                onChange={(e) => handleChange('colorGradient', { ...element.colorGradient!, angle: Number(e.target.value) })}
                onMouseUp={() => useEditorStore.getState().saveHistory()}
                className="w-full accent-orange-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* P2-2 文字转图片: 把文字用 Canvas2D 渲染为 PNG, 适合需要固定视觉的场景 */}
        <button
          onClick={() => {
            const state = useEditorStore.getState()
            const sizeKB = estimateConvertedSize(element)
            const ok = window.confirm(
              `🖼️ 转图片\n\n将把当前文字元素用 Canvas2D 渲染为 PNG 图片(约 ${sizeKB} KB)。\n\n转换后:\n✅ 字体兼容 100% (所见即所得)\n❌ 不可再编辑文字内容/字号/字重\n\n是否继续？`
            )
            if (!ok) return
            const success = state.convertTextToImage(element.id)
            if (success) {
              showToast('🖼️ 已转为图片 (不可再编辑,刷新会丢失,建议立即导出)', { type: 'warning', duration: 5000 })
            } else {
              showToast('❌ 转图片失败', { type: 'error', duration: 3000 })
            }
          }}
          className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-md transition-all text-xs font-medium flex items-center justify-center gap-2"
          title="把文字渲染为 PNG 图片, 避免字体兼容问题"
        >
          <span>🖼️</span>
          <span>转图片（约 {estimateConvertedSize(element)} KB）</span>
        </button>
      </div>

      {/* 描边开关 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <label className="text-sm font-medium text-gray-700">文字描边</label>
        <button
          onClick={() => handleChangeAndSave('stroke', !element.stroke)}
          className={`relative w-12 h-6 rounded-full transition-colors ${element.stroke ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${element.stroke ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {element.stroke && (
        <div className="pl-3 border-l-2 border-orange-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">描边宽度</span>
            <input
              type="range"
              min={1}
              max={8}
              value={element.strokeWidth}
              onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
              onMouseUp={() => useEditorStore.getState().saveHistory()}
              className="w-24 accent-orange-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">描边颜色</span>
            <div className="flex gap-1">
              {['#ffffff', '#000000', '#FFD700', '#FF5E3A'].map(color => (
                <button
                  key={color}
                  onClick={() => handleChangeAndSave('strokeColor', color)}
                  className={`w-6 h-6 rounded transition-all hover:scale-110 ${element.strokeColor === color ? 'ring-2 ring-orange-500 ring-offset-1' : ''}`}
                  style={{ backgroundColor: color, border: '1px solid #e5e7eb' }}
                />
              ))}
            </div>
          </div>
          {/* P1-8 字符级描边: 开启后每个字符按 index%5 循环 5 色调色板,实现彩虹标题 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-600">字符级描边</span>
              <span className="text-[10px] text-gray-400 ml-1.5">彩虹循环</span>
            </div>
            <button
              onClick={() => handleChangeAndSave('strokeColorPerChar', !element.strokeColorPerChar)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                element.strokeColorPerChar ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                element.strokeColorPerChar ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          {/* P2-6 文字特效: glow 外发光 / threeD 3D 立体 / emboss 雕印 */}
          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="text-[10px] font-medium text-gray-500 mb-1">文字特效</div>
            {([
              { key: 'glow' as const, label: '✨ 外发光', desc: '霓虹效果' },
              { key: 'threeD' as const, label: '🧊 3D 立体', desc: '复古海报' },
              { key: 'emboss' as const, label: '🗿 雕印', desc: '凹凸质感' },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-[10px] text-gray-400 ml-1.5">{desc}</span>
                </div>
                <button
                  onClick={() => {
                    const effects = { ...(element.effects || {}) }
                    effects[key] = !effects[key]
                    handleChangeAndSave('effects', effects)
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    element.effects?.[key] ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    element.effects?.[key] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 阴影开关 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <label className="text-sm font-medium text-gray-700">文字阴影</label>
        <button
          onClick={() => handleChangeAndSave('shadow', !element.shadow)}
          className={`relative w-12 h-6 rounded-full transition-colors ${element.shadow ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${element.shadow ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>
    </div>
  )
}

export default TypeSettings
