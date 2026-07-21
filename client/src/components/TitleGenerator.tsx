import { useState, useMemo } from 'react'
import { X, Search, Sparkles } from 'lucide-react'
import { useEditorStore } from '../store/useEditorStore'
import { titleLibrary, categoryEmoji, type TitleItem } from '../data/titles'
import { showToast } from '../store/useToastStore'

interface Props {
  onClose: () => void
}

const TitleGenerator: React.FC<Props> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'ctr' | 'category'>('ctr')
  const addElement = useEditorStore(state => state.addElement)

  // 8 大分类
  const categories = useMemo(() => {
    return ['全部', ...Array.from(new Set(titleLibrary.map(t => t.category)))]
  }, [])

  // 过滤 + 排序
  const filteredTitles = useMemo(() => {
    let list = titleLibrary
    if (activeCategory !== '全部') list = list.filter(t => t.category === activeCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t => t.content.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'ctr') return b.ctr - a.ctr
      return a.category.localeCompare(b.category)
    })
  }, [activeCategory, searchQuery, sortBy])

  // 应用标题到画布（CTR 高的加描边 + 阴影，模拟原"爆款分"视觉）
  const applyTitle = (t: TitleItem) => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      content: t.content,
      x: 50,
      y: 50,
      fontSize: Math.min(56, Math.max(28, 72 - t.content.length)),
      fontWeight: 800 as const,
      fontFamily: 'PingFang SC',
      color: '#000000',
      textAlign: 'center' as const,
      italic: false,
      underline: false,
      stroke: t.ctr >= 90,
      strokeWidth: 2,
      strokeColor: '#ffffff',
      shadow: t.ctr >= 85,
      bg: false,
      bgColor: '#FF5E3A',
      bgPadding: 8,
      rotation: 0,
      opacity: 1,
    }
    addElement(newElement)
    showToast(`✅ 已应用标题「${t.content}」`, { type: 'success' })
    onClose()
  }

  // CTR 颜色
  const getCtrColor = (ctr: number) => {
    if (ctr >= 90) return 'bg-red-500 text-white'
    if (ctr >= 85) return 'bg-orange-500 text-white'
    if (ctr >= 80) return 'bg-yellow-500 text-white'
    return 'bg-gray-500 text-white'
  }

  const getCtrEmoji = (ctr: number) => {
    if (ctr >= 90) return '🔥'
    if (ctr >= 85) return '✨'
    if (ctr >= 80) return '✅'
    return '💡'
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 — 红色基调 */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-rose-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">🔥 热词库</h2>
                <p className="text-white/85 text-sm">120+ 预生成高 CTR 标题 · 0 网络成本 · 即点即用</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 搜索 + 排序 */}
          <div className="px-5 py-3 border-b border-gray-100 flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题或分类..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setSortBy('ctr')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  sortBy === 'ctr' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                按 CTR
              </button>
              <button
                onClick={() => setSortBy('category')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  sortBy === 'category' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                按分类
              </button>
            </div>
          </div>

          {/* 分类 chips */}
          <div className="px-5 py-2.5 border-b border-gray-100 flex flex-wrap gap-1.5">
            {categories.map(cat => {
              const count = cat === '全部' ? titleLibrary.length : titleLibrary.filter(t => t.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat !== '全部' && categoryEmoji[cat]} {cat}
                  <span className="ml-1 opacity-70">({count})</span>
                </button>
              )
            })}
          </div>

          {/* 标题网格 */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            {filteredTitles.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-sm">没有匹配的标题</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredTitles.map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTitle(t)}
                    className="text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-red-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm leading-snug flex items-center gap-1.5">
                          {t.emoji && <span className="text-base">{t.emoji}</span>}
                          <span className="line-clamp-2">{t.content}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-400">{categoryEmoji[t.category]} {t.category}</span>
                          {t.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-1 rounded-md text-[11px] font-bold ${getCtrColor(t.ctr)}`}>
                        {getCtrEmoji(t.ctr)} {t.ctr}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 底部统计 */}
          <div className="px-5 py-2.5 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between bg-white">
            <span>共 {filteredTitles.length} / {titleLibrary.length} 条标题</span>
            <span className="text-red-500 font-medium">💡 0 网络成本 · 0 token · 即点即用</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TitleGenerator
