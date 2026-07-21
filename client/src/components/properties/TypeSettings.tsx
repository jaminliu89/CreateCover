import React, { useState } from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react'
import LayerControls from './LayerControls'

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
