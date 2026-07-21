import React from 'react'
import { useEditorStore } from '../../store/useEditorStore'
import type { ShapeElement } from '../../types'
import LayerControls from './LayerControls'

interface Props {
  element: ShapeElement
}

const ShapeSettings: React.FC<Props> = ({ element }) => {
  const updateElement = useEditorStore(state => state.updateElement)

  const handleChange = (key: keyof ShapeElement, value: any) => {
    updateElement(element.id, { [key]: value } as Partial<ShapeElement>)
  }

  const handleChangeAndSave = (key: keyof ShapeElement, value: any) => {
    handleChange(key, value)
    useEditorStore.getState().saveHistory()
  }

  const shapes = [
    { name: '矩形', value: 'rect' },
    { name: '圆形', value: 'circle' },
    { name: '标签', value: 'tag' },
    { name: '线条', value: 'line' },
    { name: '遮罩', value: 'overlay' },
  ]

  return (
    <div className="space-y-5">
      <LayerControls elementId={element.id} />

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-2">形状类型</label>
          <div className="grid grid-cols-5 gap-1">
            {shapes.map(shape => (
              <button
                key={shape.value}
                onClick={() => handleChangeAndSave('shape', shape.value)}
                className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-all ${
                  element.shape === shape.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {shape.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>宽度 (%)</span>
            <span className="font-medium text-gray-700">{element.width}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={element.width}
            onChange={(e) => handleChange('width', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>高度 (%)</span>
            <span className="font-medium text-gray-700">{element.height}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={element.height}
            onChange={(e) => handleChange('height', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">填充颜色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={element.color}
              onChange={(e) => handleChangeAndSave('color', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={element.color}
              onChange={(e) => handleChangeAndSave('color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>圆角 (px)</span>
            <span className="font-medium text-gray-700">{element.radius || 0}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={element.radius || 0}
            onChange={(e) => handleChange('radius', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
            <span>边框 (px)</span>
            <span className="font-medium text-gray-700">{element.border || 0}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="30"
            value={element.border || 0}
            onChange={(e) => handleChange('border', Number(e.target.value))}
            onMouseUp={() => useEditorStore.getState().saveHistory()}
            className="w-full accent-orange-500"
          />
        </div>

        {(element.border || 0) > 0 && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">边框颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.borderColor || '#000000'}
                onChange={(e) => handleChangeAndSave('borderColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={element.borderColor || '#000000'}
                onChange={(e) => handleChangeAndSave('borderColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
        )}

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
      </div>
    </div>
  )
}

export default ShapeSettings
