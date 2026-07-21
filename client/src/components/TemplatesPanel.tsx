import React, { useState, useMemo } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { templates, templateColors } from '../data/templates'
import type { Template } from '../data'

const TemplatesPanel: React.FC = () => {
  const [activeRatio, setActiveRatio] = useState('3:4')
  const [activePlatform, setActivePlatform] = useState<'全部' | Template['platform']>('全部')
  const [activeCategory, setActiveCategory] = useState<'全部' | string>('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const { setRatio, setElements, setSelected } = useEditorStore()

  const ratios = ['3:4', '9:16', '1:1', '16:9']
  const platforms: Array<'全部' | Template['platform']> = ['全部', '小红书', '抖音', 'B站', '通用']

  // 过滤后的模板
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (t.ratio !== activeRatio) return false
      if (activePlatform !== '全部' && t.platform !== activePlatform) return false
      if (activeCategory !== '全部' && t.category !== activeCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const hay = `${t.name} ${t.category} ${t.subCategory || ''} ${t.layout}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [activeRatio, activePlatform, activeCategory, searchQuery])

  // 当前可用分类（按当前比例+平台过滤后的实际 category 列表）
  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    templates.filter(t => {
      if (t.ratio !== activeRatio) return false
      if (activePlatform !== '全部' && t.platform !== activePlatform) return false
      return true
    }).forEach(t => cats.add(t.category))
    return ['全部', ...Array.from(cats)]
  }, [activeRatio, activePlatform])

  // 按内容类型分组
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, Template[]> = {}
    filteredTemplates.forEach(t => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  }, [filteredTemplates])

  const applyTemplate = (template: Template) => {
    setRatio(template.ratio)
    setElements(template.elements.map(el => ({ ...el, id: `${el.id}-${Date.now()}` })))
    setSelected(null)
  }

  const getTemplateColor = (templateId: string) => {
    return templateColors[templateId] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }

  // 平台 emoji
  const platformEmoji: Record<string, string> = {
    '全部': '🌐',
    '小红书': '📕',
    '抖音': '🎵',
    'B站': '📺',
    '通用': '🎨',
  }

  // 分类 emoji
  const categoryEmoji: Record<string, string> = {
    '爆款标题': '🔥',
    '数字震撼': '💯',
    '悬念钩子': '❓',
    '教程': '📚',
    '种草': '💖',
    '知识': '🧠',
    '测评': '⚖️',
    '情感': '💗',
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 顶部：标题 + 搜索 */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📦 模板库
            <span className="text-xs font-normal text-gray-400">
              {filteredTemplates.length}/{templates.length}
            </span>
          </h2>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        </div>

        {/* 平台 Tab */}
        <div className="flex flex-wrap gap-1.5">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => { setActivePlatform(p); setActiveCategory('全部') }}
              className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                activePlatform === p
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {platformEmoji[p]} {p}
            </button>
          ))}
        </div>

        {/* 尺寸按钮 */}
        <div className="flex flex-wrap gap-1.5">
          {ratios.map(ratio => (
            <button
              key={ratio}
              onClick={() => setActiveRatio(ratio)}
              className={`px-3 py-1 text-xs rounded-md transition-all font-medium ${
                activeRatio === ratio
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* 分类筛选 chips */}
      {availableCategories.length > 2 && (
        <div className="px-4 py-2 border-b border-gray-100 flex flex-wrap gap-1.5">
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 text-[11px] rounded-full transition-all ${
                activeCategory === cat
                  ? 'bg-orange-100 text-orange-700 font-medium'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat !== '全部' && categoryEmoji[cat]} {cat}
            </button>
          ))}
        </div>
      )}

      {/* 模板列表 - 按分类分组 */}
      <div className="flex-1 overflow-auto p-3 bg-gray-50">
        {Object.keys(groupedTemplates).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm">该筛选条件下暂无模板</p>
          </div>
        ) : activeCategory !== '全部' ? (
          // 选中具体分类时，平铺展示
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                getColor={getTemplateColor}
                onApply={applyTemplate}
              />
            ))}
          </div>
        ) : (
          // 未选具体分类时，按分类分组
          Object.entries(groupedTemplates).map(([category, list]) => (
            <div key={category} className="mb-5">
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <span className="text-sm">{categoryEmoji[category] || '📌'}</span>
                <h3 className="text-xs font-bold text-gray-700">{category}</h3>
                <span className="text-[10px] text-gray-400">({list.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {list.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    getColor={getTemplateColor}
                    onApply={applyTemplate}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

// 单个模板卡片（提取出来复用）
const TemplateCard: React.FC<{
  template: Template
  getColor: (id: string) => string
  onApply: (t: Template) => void
}> = ({ template, getColor, onApply }) => {
  const mainText = (template.elements.find(el => el.type === 'text') as any)?.content || template.name
  return (
    <button
      onClick={() => onApply(template)}
      className="w-full bg-white rounded-xl border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all text-left group overflow-hidden"
      title={`${template.platform} · ${template.layout} · ${template.subCategory || ''}`}
    >
      {/* 缩略图预览 */}
      <div
        className="h-24 w-full flex items-center justify-center relative overflow-hidden"
        style={{ background: getColor(template.id) }}
      >
        <div className="text-white/90 text-base font-black text-center px-2 leading-tight line-clamp-2">
          {mainText.slice(0, 12)}
        </div>

        {/* hover 遮罩 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <span className="text-white text-sm font-bold bg-orange-500 px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            点击套用
          </span>
        </div>

        {/* 平台标签 */}
        <div className="absolute top-1 right-1 text-[9px] bg-black/30 text-white px-1.5 py-0.5 rounded">
          {template.platform}
        </div>
      </div>

      {/* 模板信息 */}
      <div className="p-2">
        <div className="font-bold text-gray-800 text-sm truncate">{template.name}</div>
        <div className="text-xs text-gray-400 truncate">
          {template.category} · {template.layout}
        </div>
      </div>
    </button>
  )
}

export default TemplatesPanel
