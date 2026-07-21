import React from 'react'
import { useEditorStore } from '../../store/useEditorStore'

// 24款精选字体 - 中英文全覆盖
const fontFamilies = [
  // 中文黑体类
  { name: '苹方', value: 'PingFang SC, PingFang HK, sans-serif', category: '中文黑体' },
  { name: '思源黑体', value: 'Source Han Sans CN, Noto Sans SC, sans-serif', category: '中文黑体' },
  { name: '微软雅黑', value: 'Microsoft YaHei, SimHei, sans-serif', category: '中文黑体' },
  { name: '黑体', value: 'SimHei, sans-serif', category: '中文黑体' },
  { name: '鸿蒙黑体', value: 'HarmonyOS Sans, sans-serif', category: '中文黑体' },
  
  // 中文宋体类
  { name: '思源宋体', value: 'Source Han Serif CN, Noto Serif SC, serif', category: '中文宋体' },
  { name: '宋体', value: 'SimSun, Songti SC, serif', category: '中文宋体' },
  { name: '新宋体', value: 'NSimSun, serif', category: '中文宋体' },
  
  // 中文书法类
  { name: '楷体', value: 'KaiTi, STKaiti, cursive', category: '中文书法' },
  { name: '仿宋', value: 'FangSong, STFangsong, serif', category: '中文书法' },
  { name: '隶书', value: 'LiSu, STLiti, cursive', category: '中文书法' },
  { name: '幼圆', value: 'YouYuan, STYuanti, sans-serif', category: '中文书法' },
  
  // 英文粗体类（标题冲击）
  { name: 'Impact', value: 'Impact, sans-serif', category: '英文粗体' },
  { name: 'Arial Black', value: 'Arial Black, sans-serif', category: '英文粗体' },
  { name: 'Anton', value: 'Anton, sans-serif', category: '英文粗体' },
  { name: 'Bebas Neue', value: 'Bebas Neue, sans-serif', category: '英文粗体' },
  
  // 英文现代类
  { name: 'Roboto', value: 'Roboto, sans-serif', category: '英文现代' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: '英文现代' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif', category: '英文现代' },
  { name: 'Poppins', value: 'Poppins, sans-serif', category: '英文现代' },
  
  // 英文创意类
  { name: 'Oswald', value: 'Oswald, sans-serif', category: '英文创意' },
  { name: 'Pacifico', value: 'Pacifico, cursive', category: '英文创意' },
  { name: 'Lobster', value: 'Lobster, cursive', category: '英文创意' },
  { name: 'Playfair Display', value: 'Playfair Display, serif', category: '英文创意' },
]

interface Props {
  elementId: string
  currentFont: string
}

const FontSelector: React.FC<Props> = ({ elementId, currentFont }) => {
  const updateElement = useEditorStore(state => state.updateElement)

  const handleFontChange = (fontFamily: string) => {
    updateElement(elementId, { fontFamily })
    useEditorStore.getState().saveHistory()
  }

  const categories = [...new Set(fontFamilies.map(f => f.category))]

  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 mb-2 font-medium">字体</label>
      
      {/* 按分类展示 */}
      {categories.map(category => (
        <div key={category} className="mb-3">
          <div className="text-xs text-gray-400 mb-1.5 px-1">{category}</div>
          <div className="space-y-1">
            {fontFamilies.filter(f => f.category === category).map(font => (
              <button
                key={font.value}
                onClick={() => handleFontChange(font.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  currentFont === font.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FontSelector
