import type { Template, TextElement, ShapeElement, Element } from './index'

// ============================================================
// 工具函数 - 简化模板元素定义
// ============================================================

const text = (overrides: Partial<TextElement> & { id: string; content: string; x: number; y: number; fontSize: number; color: string; fontWeight?: number }): TextElement => ({
  type: 'text',
  fontFamily: 'PingFang SC',
  textAlign: 'center',
  italic: false,
  underline: false,
  stroke: false,
  strokeWidth: 0,
  strokeColor: '#000000',
  shadow: false,
  bg: false,
  bgColor: '#FF5E3A',
  bgPadding: 0,
  rotation: 0,
  opacity: 1,
  fontWeight: 700,
  ...overrides,
} as TextElement)

const shape = (overrides: Partial<ShapeElement> & { id: string; x: number; y: number; width: number; height: number; color: string; shape: ShapeElement['shape'] }): ShapeElement => ({
  type: 'shape',
  rotation: 0,
  opacity: 1,
  ...overrides,
} as ShapeElement)

const tpl = (cfg: {
  id: string
  name: string
  ratio: Template['ratio']
  category: string
  subCategory?: string
  platform: Template['platform']
  layout: string
  bg: string
  thumbnail: string
  elements: Element[]
}): Template => ({
  id: cfg.id,
  name: cfg.name,
  ratio: cfg.ratio,
  category: cfg.category,
  subCategory: cfg.subCategory,
  platform: cfg.platform,
  layout: cfg.layout,
  thumbnail: cfg.thumbnail,
  bg: cfg.bg,
  elements: cfg.elements,
})

// ============================================================
// 设计系统常量（用于程序化生成模板）
// ============================================================

// 4 平台调色板（每平台 8-10 套配色，体现各平台调性）
const PLATFORM_PALETTES: Record<string, Array<{ bg: string; primary: string; secondary: string; accent: string; name: string }>> = {
  '小红书': [
    { bg: '#FF2442', primary: '#FFFFFF', secondary: '#FFE0E0', accent: '#FFD700', name: '小红红' },
    { bg: '#FFE0E5', primary: '#FF2442', secondary: '#666', accent: '#FF6B6B', name: '甜酷粉' },
    { bg: '#2C2C2C', primary: '#FF6B9D', secondary: '#FFD0DD', accent: '#FFD700', name: '夜甜' },
    { bg: '#FFF0F5', primary: '#FF1493', secondary: '#666', accent: '#FF69B4', name: '樱花粉' },
    { bg: '#F5E6D3', primary: '#8B4513', secondary: '#A0826D', accent: '#D2691E', name: '焦糖' },
    { bg: '#FFE4B5', primary: '#FF4500', secondary: '#FFF8DC', accent: '#FF6347', name: '暖橙' },
    { bg: '#E6E6FA', primary: '#9370DB', secondary: '#FFF', accent: '#DDA0DD', name: '薰衣草' },
    { bg: '#000000', primary: '#FFB6C1', secondary: '#888', accent: '#FFD700', name: '酷黑粉' },
    { bg: '#FAF0E6', primary: '#CD853F', secondary: '#8B7355', accent: '#DEB887', name: '亚麻' },
    { bg: '#FFE4E1', primary: '#DC143C', secondary: '#666', accent: '#FF69B4', name: '蜜桃' },
  ],
  '抖音': [
    { bg: '#1a1a2e', primary: '#FF5E3A', secondary: '#FFFFFF', accent: '#FFD700', name: '深夜红' },
    { bg: '#000000', primary: '#FF0050', secondary: '#FFFFFF', accent: '#00F0FF', name: '抖音红' },
    { bg: '#FF0050', primary: '#FFFFFF', secondary: '#FFE0E0', accent: '#FFD700', name: '爆款红' },
    { bg: '#16213E', primary: '#E94560', secondary: '#FFF', accent: '#FFD700', name: '蓝红撞' },
    { bg: '#0F3460', primary: '#FFD700', secondary: '#FFF', accent: '#E94560', name: '深蓝' },
    { bg: '#533483', primary: '#FFD700', secondary: '#FFF', accent: '#FF5E3A', name: '紫金' },
    { bg: '#FFFFFF', primary: '#000000', secondary: '#666', accent: '#FF0050', name: '极简白' },
    { bg: '#FF6B6B', primary: '#FFFFFF', secondary: '#FFE0E0', accent: '#FFD700', name: '活力橙' },
    { bg: '#000000', primary: '#FFE600', secondary: '#FFF', accent: '#FF0050', name: '黄黑' },
    { bg: '#2C3E50', primary: '#F39C12', secondary: '#ECF0F1', accent: '#E74C3C', name: '商务蓝' },
  ],
  'B站': [
    { bg: '#00A1D6', primary: '#FFFFFF', secondary: '#E0F7FF', accent: '#FB7299', name: 'B站蓝' },
    { bg: '#1a1a1a', primary: '#00A1D6', secondary: '#FFF', accent: '#FB7299', name: '深色B' },
    { bg: '#FB7299', primary: '#FFFFFF', secondary: '#FFE0E0', accent: '#00A1D6', name: 'B站粉' },
    { bg: '#F25D8E', primary: '#FFFFFF', secondary: '#FFE0E0', accent: '#FFD700', name: '二次元' },
    { bg: '#2C3E50', primary: '#00A1D6', secondary: '#FFF', accent: '#FB7299', name: '知识蓝' },
    { bg: '#000000', primary: '#00A1D6', secondary: '#FFF', accent: '#FFD700', name: '暗夜蓝' },
    { bg: '#FAFAFA', primary: '#00A1D6', secondary: '#666', accent: '#FB7299', name: '清新' },
    { bg: '#3F3F3F', primary: '#FFFFFF', secondary: '#CCC', accent: '#00A1D6', name: '硬核灰' },
    { bg: '#FFEAA7', primary: '#2C3E50', secondary: '#666', accent: '#FB7299', name: '温暖' },
    { bg: '#0F0F0F', primary: '#FB7299', secondary: '#999', accent: '#00A1D6', name: '暗黑粉' },
  ],
  '通用': [
    { bg: '#FAFAFA', primary: '#1a1a1a', secondary: '#666', accent: '#3B7CFF', name: '极简白' },
    { bg: '#0A0A0A', primary: '#FFFFFF', secondary: '#999', accent: '#3B7CFF', name: '暗夜黑' },
    { bg: '#3B7CFF', primary: '#FFFFFF', secondary: '#E0E8FF', accent: '#FFD700', name: '品牌蓝' },
    { bg: '#F5F5F7', primary: '#1a1a1a', secondary: '#666', accent: '#FF3B30', name: '苹果风' },
    { bg: '#F0F0F0', primary: '#1a1a1a', secondary: '#666', accent: '#007AFF', name: '商务' },
    { bg: '#1A1A1A', primary: '#FFD700', secondary: '#CCC', accent: '#FF3B30', name: '黑金' },
  ],
}

// 内容池（8 个内容类型 × 平台特色词汇）
const CONTENT_POOLS: Record<string, string[]> = {
  '爆款标题': [
    '天花板', '不踩雷', '巨好用', '氛围感', '高级感', '出片神器', '99%人不知道',
    '震撼发布', '深度揭秘', '学到了', '建议收藏', '千万别', '原来如此', '居然',
    '没想到', '一探究竟', '硬核', '全程高能', '完整版', '终极指南', '无限回购',
    '0踩雷', '巨出片', '天花板级别', '纯欲天花板', 'VLOG', 'OOTD', '出片', '种草',
    '氛围感拉满', '仪式感', '宝藏分享', '不允许你不知道', '被问爆了', '亲测有效',
  ],
  '数字震撼': [
    '99%', '10倍', '3天', '5个技巧', '100万', '3分钟', '10小时', '5000字',
    '全网最全', '第1名', '30天', '0基础', '7天速成', '0成本', '50倍', '5倍',
    '2小时', '10个', '99%的人', '3步搞定', '100%', '99.9%', '365天', '5星级',
    '10w+', '100+', '365天', '30天', '24h', '48h', '72h', '7天', '21天',
  ],
  '悬念钩子': [
    '你敢信', '这都能', '为什么', '我哭了', '震惊！', '没想到', '居然是',
    '原来如此', '但是', '结果', '后来', '结局', '真相', '秘密', '反差感',
    '意料之外', '情理之中', '细思极恐', '终于知道', '原来真相是', '结果反转',
    '万万没想到', '最后一条', '结局哭了',
  ],
  '教程': [
    '保姆级', '从入门到精通', '零基础', '完整版', '手把手', '超详细',
    '看完就会', '一学就会', '不踩坑', '避坑', '速成', '5分钟学会',
    '3步搞定', '10分钟', '全流程', '全套', '一站式', '保姆教程',
    '从0到1', '小白必看', '新手入门', '系统学习', '手把手教你',
  ],
  '种草': [
    '无限回购', '必入', '巨好用', '真心推荐', '我买了', '已入手',
    '种草', '安利', '私藏', '超爱', '上头', '离不开', '必囤',
    '下饭', '治愈', '氛围感', '仪式感', '出片', 'OOTD', '巨出片',
    '私心推荐', '闭眼入', '不买后悔',
  ],
  '知识': [
    '深度解析', '硬核科普', '一文读懂', '底层逻辑', '思维模型',
    '复盘', '深度好文', '方法论', '框架', '系统', '原理', '本质',
    '核心', '真相', '深度', '拆解', '深度思考', '独立思考',
    '认知升级', '思维跃迁', '认知差', '信息差',
  ],
  '测评': [
    '真实测评', '实测', '对比', '横评', '亲测', '深度测评',
    '全网对比', '优缺点', '避雷', '拔草', '种草', '真心话',
    '大实话', '不吹不黑', '理性分析', '客观评价', '实测分享',
    '使用感受', '真实体验', '一个月体验',
  ],
  '情感': [
    '我哭了', '破防了', '泪目', '治愈', '共情', '扎心', '戳中',
    '人间真实', '成年人的崩溃', '破防瞬间', '人间清醒', '温暖',
    '深夜emo', '想哭', '心酸', '回忆杀', '治愈系', '温暖向',
    '终于懂了', '瞬间破防', '笑着笑着就哭了',
  ],
}

// 子类型映射
const SUB_CATEGORIES: Record<string, Record<string, string[]>> = {
  '小红书': {
    '爆款标题': ['种草', '日常', '氛围感'],
    '数字震撼': ['效果', '数量', '时间'],
    '种草': ['美妆', '穿搭', '美食', '家居', '数码'],
    '教程': ['美妆教程', '穿搭教程', '美食教程'],
    '情感': ['情绪', '治愈', '回忆'],
  },
  '抖音': {
    '爆款标题': ['热点', '话题', '现象'],
    '数字震撼': ['数据', '时长', '次数'],
    '悬念钩子': ['剧情', '反差', '揭秘'],
    '教程': ['技巧', '技能', '速成'],
  },
  'B站': {
    '知识': ['科普', '深度', '硬核'],
    '测评': ['数码', '产品', '游戏'],
    '数字震撼': ['数据', '时长', '规模'],
  },
  '通用': {
    '爆款标题': ['通用', '商务'],
    '知识': ['通用', '文化'],
  },
}

// 5 大设计风格（来自 utils/styles.ts 的灵魂）
const DESIGN_STYLES = [
  { name: '包豪斯', fontWeight: 900, fontFamily: 'Impact', letterSpacing: -1, shadow: true },
  { name: '意大利', fontWeight: 700, fontFamily: 'Georgia', letterSpacing: 0.5, shadow: true },
  { name: '新拟物', fontWeight: 600, fontFamily: 'PingFang SC', letterSpacing: 0, shadow: true },
  { name: '瑞士', fontWeight: 700, fontFamily: 'Helvetica', letterSpacing: -0.5, shadow: false },
  { name: '日式极简', fontWeight: 400, fontFamily: 'STKaiti', letterSpacing: 1.5, shadow: false },
]

// 4 种构图
const COMPOSITIONS = {
  thirds: { mainX: 50, mainY: 38, subX: 50, subY: 65, fontSizeMain: 56, fontSizeSub: 24 },
  golden: { mainX: 50, mainY: 38.2, subX: 50, subY: 61.8, fontSizeMain: 60, fontSizeSub: 26 },
  center: { mainX: 50, mainY: 50, subX: 50, subY: 70, fontSizeMain: 64, fontSizeSub: 22 },
  spiral: { mainX: 75, mainY: 25, subX: 25, subY: 75, fontSizeMain: 52, fontSizeSub: 22 },
}

// 8 种骨架（决定元素排布）
type SkeletonBuilder = (
  palette: typeof PLATFORM_PALETTES['小红书'][0],
  main: string,
  sub: string,
  comp: typeof COMPOSITIONS['thirds'],
  style: typeof DESIGN_STYLES[0]
) => Element[]

const SKELETONS: Record<string, SkeletonBuilder> = {
  // 1. emoji 顶部 + 主标题 + 副标题
  'emoji-top': (p, main, sub, c, s) => {
    const emojis = ['🔥', '✨', '💥', '⚡', '💎', '🌟', '📌', '🎯', '💯', '🚀', '⭐', '🎉', '💪', '👀', '🎁', '🔔']
    return [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
      text({ id: 'emoji', content: emojis[Math.floor(main.length * 7) % emojis.length], x: 50, y: 18, fontSize: 64, fontWeight: 400, color: p.primary }),
      text({ id: 'main', content: main, x: c.mainX, y: 50, fontSize: c.fontSizeMain, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
      text({ id: 'sub', content: sub, x: c.subX, y: c.subY, fontSize: c.fontSizeSub, fontWeight: 500, color: p.secondary }),
    ]
  },
  // 2. 居中大字
  'center-text': (p, main, sub, c, s) => [
    shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
    text({ id: 'main', content: main, x: 50, y: 50, fontSize: c.fontSizeMain + 8, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
    text({ id: 'sub', content: sub, x: 50, y: 70, fontSize: c.fontSizeSub, fontWeight: 500, color: p.accent }),
  ],
  // 3. 巨大数字 + 副标题
  'big-num': (p, main, sub, _c, s) => [
    shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
    text({ id: 'big', content: main, x: 50, y: 42, fontSize: 110, fontWeight: 900, fontFamily: 'Impact', color: p.primary, shadow: s.shadow } as any),
    text({ id: 'sub', content: sub, x: 50, y: 70, fontSize: 28, fontWeight: 700, color: p.accent }),
  ],
  // 4. 角落标签 + 主标题
  'corner-tag': (p, main, sub, c, s) => {
    const tags = ['📌 推荐', '✨ 精选', '🔥 热门', '💎 必看', '⭐ 高分', '🎯 重点', '👀 关注']
    return [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
      text({ id: 'tag', content: tags[main.length % tags.length], x: 50, y: 22, fontSize: 22, fontWeight: 700, color: p.accent }),
      text({ id: 'main', content: main, x: c.mainX, y: 50, fontSize: c.fontSizeMain, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
      text({ id: 'sub', content: sub, x: c.subX, y: 72, fontSize: c.fontSizeSub, fontWeight: 500, color: p.secondary }),
    ]
  },
  // 5. 上下分割（上半大标题 + 下半描述）
  'split-v': (p, main, sub, c, s) => [
    shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
    shape({ id: 'accent', shape: 'rect', x: 50, y: 48, width: 60, height: 1, color: p.accent }),
    text({ id: 'main', content: main, x: 50, y: 32, fontSize: c.fontSizeMain, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
    text({ id: 'sub', content: sub, x: 50, y: 62, fontSize: c.fontSizeSub + 4, fontWeight: 400, color: p.secondary, italic: true } as any),
  ],
  // 6. 左右分割
  'split-h': (p, main, sub, c, s) => [
    shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
    text({ id: 'main', content: main, x: 30, y: 50, fontSize: c.fontSizeMain - 4, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
    shape({ id: 'divider', shape: 'line', x: 50, y: 50, width: 1, height: 40, color: p.accent }),
    text({ id: 'sub', content: sub, x: 72, y: 50, fontSize: c.fontSizeSub, fontWeight: 500, color: p.secondary, textAlign: 'left' } as any),
  ],
  // 7. 边框框选
  'border-frame': (p, main, sub, c, s) => [
    shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
    shape({ id: 'frame-tl', shape: 'rect', x: 15, y: 20, width: 1, height: 8, color: p.accent }),
    shape({ id: 'frame-tr', shape: 'rect', x: 85, y: 20, width: 1, height: 8, color: p.accent }),
    shape({ id: 'frame-bl', shape: 'rect', x: 15, y: 80, width: 1, height: 8, color: p.accent }),
    shape({ id: 'frame-br', shape: 'rect', x: 85, y: 80, width: 1, height: 8, color: p.accent }),
    text({ id: 'main', content: main, x: 50, y: 50, fontSize: c.fontSizeMain, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
    text({ id: 'sub', content: sub, x: 50, y: 68, fontSize: c.fontSizeSub, fontWeight: 400, color: p.secondary, letterSpacing: 2 } as any),
  ],
  // 8. 杂志风（编号 + 大字）
  'magazine': (p, main, sub, c, s) => [
    shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: p.bg }),
    text({ id: 'no', content: `№ ${(main.length * 7 % 99) + 1}`, x: 12, y: 15, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: p.accent }),
    text({ id: 'main', content: main, x: 50, y: 50, fontSize: c.fontSizeMain, fontWeight: s.fontWeight, fontFamily: s.fontFamily, color: p.primary, shadow: s.shadow, letterSpacing: s.letterSpacing } as any),
    text({ id: 'line', shape: 'line', x: 50, y: 65, width: 30, height: 1, color: p.accent } as any),
    text({ id: 'sub', content: sub, x: 50, y: 75, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: p.secondary, letterSpacing: 1.5 } as any),
  ],
}

// 副标题池
const SUB_POOL: string[] = [
  '深度解析', '一文读懂', '保姆教程', '建议收藏', '亲测有效', '必看',
  '学到了吗', '完整版', '终极指南', '实用干货', '不踩坑', '巨好用',
  '氛围感', '高级感', '出片', '种草', '无限回购', '0踩雷',
  '震撼发布', '硬核科普', '深度好文', '方法论', '拆解', '测评',
  '亲测推荐', '真实体验', '扎心', '治愈', '共情', '我哭了',
]

// ============================================================
// 生成器：从 meta 数据构建模板
// ============================================================
function buildTemplate(meta: {
  id: string
  name: string
  platform: Template['platform']
  ratio: Template['ratio']
  contentType: string
  subCategory?: string
  skeleton: string
  styleIdx: number
  compIdx: number
  paletteIdx: number
  contentIdx: number
}): Template {
  const palette = PLATFORM_PALETTES[meta.platform][meta.paletteIdx % PLATFORM_PALETTES[meta.platform].length]
  const contentPool = CONTENT_POOLS[meta.contentType] || CONTENT_POOLS['爆款标题']
  const main = contentPool[meta.contentIdx % contentPool.length]
  const sub = SUB_POOL[(meta.contentIdx + 3) % SUB_POOL.length]
  const style = DESIGN_STYLES[meta.styleIdx % DESIGN_STYLES.length]
  const comp = COMPOSITIONS[Object.keys(COMPOSITIONS)[meta.compIdx % 4] as keyof typeof COMPOSITIONS]
  const skeletonFn = SKELETONS[meta.skeleton] || SKELETONS['center-text']
  const elements = skeletonFn(palette, main, sub, comp, style)

  return tpl({
    id: meta.id,
    name: meta.name,
    ratio: meta.ratio,
    category: meta.contentType,
    subCategory: meta.subCategory,
    platform: meta.platform,
    layout: style.name,
    bg: palette.bg,
    thumbnail: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.accent} 100%)`,
    elements,
  })
}

// ============================================================
// 200 套模板：手写精品 47 套 + 程序化生成 153 套
// ============================================================

// === 手写精品 47 套（保留并升级 platform 字段）===
const HANDCRAFTED: Template[] = [
  // ========== 抖音 (12 个) ==========
  tpl({
    id: 'douyin-hot-1', name: '大字冲击', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '包豪斯',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'emoji', content: '🔥', x: 50, y: 20, fontSize: 72, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '一句话搞定', x: 50, y: 42, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#FF5E3A', stroke: true, strokeWidth: 4, strokeColor: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '副标题补充说明亮点', x: 50, y: 62, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'douyin-hot-2', name: '黑白冲击', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '瑞士',
    bg: '#000000', thumbnail: 'linear-gradient(135deg, #2d3436 0%, #d63031 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#000000' }),
      text({ id: 'main', content: '震撼发布', x: 50, y: 45, fontSize: 68, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'douyin-tips-1', name: '3个技巧', ratio: '9:16', category: '教程', platform: '抖音', layout: '瑞士',
    bg: '#667eea', thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#667eea' }),
      text({ id: 'title', content: '✅ 必学技巧', x: 50, y: 22, fontSize: 32, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'tip1', content: '① 第一个技巧', x: 50, y: 38, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'tip2', content: '② 第二个技巧', x: 50, y: 50, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'tip3', content: '③ 第三个技巧', x: 50, y: 62, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-question-1', name: '灵魂拷问', ratio: '9:16', category: '悬念钩子', platform: '抖音', layout: '包豪斯',
    bg: '#f39c12', thumbnail: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#f39c12' }),
      text({ id: 'q', content: '❓', x: 50, y: 25, fontSize: 80, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '为什么你总是', x: 50, y: 50, fontSize: 42, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '做不到这一点？', x: 50, y: 70, fontSize: 42, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'douyin-number-1', name: '数字爆点', ratio: '9:16', category: '数字震撼', platform: '抖音', layout: '包豪斯',
    bg: '#e74c3c', thumbnail: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#e74c3c' }),
      text({ id: 'big', content: '99%', x: 50, y: 38, fontSize: 120, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff' }),
      text({ id: 'sub', content: '的人都不知道', x: 50, y: 65, fontSize: 36, fontWeight: 700, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'douyin-secret-1', name: '秘密揭秘', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '意大利',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'tag', content: '🔒 独家揭秘', x: 50, y: 25, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'main', content: '行业内幕', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '看了你就懂了', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'douyin-warning-1', name: '警示提醒', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '包豪斯',
    bg: '#d63031', thumbnail: 'linear-gradient(135deg, #d63031 0%, #2d3436 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#d63031' }),
      text({ id: 'warn', content: '⚠️', x: 50, y: 22, fontSize: 72, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '千万别这样', x: 50, y: 50, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', stroke: true, strokeWidth: 2, strokeColor: '#000000' }),
      text({ id: 'sub', content: '否则后果严重', x: 50, y: 70, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-festival-1', name: '节日氛围', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '新拟物',
    bg: '#e17055', thumbnail: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#e17055' }),
      text({ id: 'emoji', content: '🎉', x: 50, y: 25, fontSize: 80, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '新年快乐', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'HAPPY NEW YEAR', x: 50, y: 72, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-tutorial-1', name: '教程合集', ratio: '9:16', category: '教程', platform: '抖音', layout: '包豪斯',
    bg: '#0984e3', thumbnail: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#0984e3' }),
      text({ id: 'tag', content: '📚 零基础教程', x: 50, y: 22, fontSize: 24, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'main', content: '一学就会', x: 50, y: 48, fontSize: 60, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '5分钟搞定', x: 50, y: 70, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'douyin-vs-1', name: '对比测评', ratio: '9:16', category: '测评', platform: '抖音', layout: '瑞士',
    bg: '#2d3436', thumbnail: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2d3436' }),
      text({ id: 'left', content: 'VS', x: 50, y: 30, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffeaa7' }),
      text({ id: 'a', content: '方案 A', x: 25, y: 55, fontSize: 32, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'b', content: '方案 B', x: 75, y: 55, fontSize: 32, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'sub', content: '哪个更好？', x: 50, y: 78, fontSize: 24, fontWeight: 500, color: '#fab1a0' }),
    ]
  }),
  tpl({
    id: 'douyin-challenge-1', name: '挑战话题', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '新拟物',
    bg: '#fd79a8', thumbnail: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fd79a8' }),
      text({ id: 'hashtag', content: '#挑战赛', x: 50, y: 25, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '7天挑战', x: 50, y: 50, fontSize: 60, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '你敢来吗？', x: 50, y: 72, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-story-1', name: '故事开篇', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '意大利',
    bg: '#34495e', thumbnail: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#34495e' }),
      text({ id: 'chapter', content: 'CHAPTER 01', x: 50, y: 25, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: '#ffeaa7' }),
      text({ id: 'main', content: '那年夏天', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '我从这里开始', x: 50, y: 70, fontSize: 22, fontWeight: 400, fontFamily: 'PingFang SC', color: '#dfe6e9' }),
    ]
  }),

  // ========== 小红书 (10 个) ==========
  tpl({
    id: 'xhs-pure', name: '纯欲风', ratio: '3:4', category: '种草', subCategory: '美妆', platform: '小红书', layout: '意大利',
    bg: '#ff9a9e', thumbnail: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ff9a9e' }),
      text({ id: 'main', content: '纯欲天花板', x: 50, y: 45, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '氛围感拍照技巧分享', x: 50, y: 62, fontSize: 20, fontWeight: 500, color: '#fad7de', italic: true }),
    ]
  }),
  tpl({
    id: 'xhs-daily', name: '日常VLOG', ratio: '3:4', category: '爆款标题', platform: '小红书', layout: '新拟物',
    bg: '#a18cd1', thumbnail: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#a18cd1' }),
      text({ id: 'tag', content: '✨ VLOG ✨', x: 50, y: 28, fontSize: 24, fontWeight: 500, color: '#ffd700' }),
      text({ id: 'main', content: '记录美好日常', x: 50, y: 50, fontSize: 40, fontWeight: 700, color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'xhs-recipe-1', name: '美食菜谱', ratio: '3:4', category: '种草', subCategory: '美食', platform: '小红书', layout: '新拟物',
    bg: '#ff7675', thumbnail: 'linear-gradient(135deg, #ff7675 0%, #fab1a0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ff7675' }),
      text({ id: 'emoji', content: '🍰', x: 50, y: 22, fontSize: 72, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '懒人食谱', x: 50, y: 48, fontSize: 52, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '10分钟搞定', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xhs-outfit-1', name: '穿搭分享', ratio: '3:4', category: '种草', subCategory: '穿搭', platform: '小红书', layout: '意大利',
    bg: '#fab1a0', thumbnail: 'linear-gradient(135deg, #fab1a0 0%, #ffeaa7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fab1a0' }),
      text({ id: 'tag', content: '👗 OOTD', x: 50, y: 25, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '今天穿什么', x: 50, y: 50, fontSize: 44, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '秋季穿搭灵感', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'xhs-travel-1', name: '旅行打卡', ratio: '3:4', category: '爆款标题', subCategory: '日常', platform: '小红书', layout: '新拟物',
    bg: '#74b9ff', thumbnail: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#74b9ff' }),
      text({ id: 'pin', content: '📍', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '云南大理', x: 50, y: 48, fontSize: 52, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '5天4晚攻略', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xhs-skincare-1', name: '护肤种草', ratio: '3:4', category: '种草', subCategory: '美妆', platform: '小红书', layout: '新拟物',
    bg: '#fd79a8', thumbnail: 'linear-gradient(135deg, #fd79a8 0%, #fab1a0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fd79a8' }),
      text({ id: 'tag', content: '✨ 空瓶记', x: 50, y: 25, fontSize: 24, fontWeight: 500, color: '#ffeaa7' }),
      text({ id: 'main', content: '无限回购', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '亲测好物', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'xhs-fitness-1', name: '健身打卡', ratio: '3:4', category: '教程', subCategory: '美妆教程', platform: '小红书', layout: '瑞士',
    bg: '#00b894', thumbnail: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00b894' }),
      text({ id: 'icon', content: '💪', x: 50, y: 25, fontSize: 60, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '30天挑战', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '马甲线养成', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xhs-mood-1', name: '情绪文案', ratio: '3:4', category: '情感', subCategory: '情绪', platform: '小红书', layout: '意大利',
    bg: '#a29bfe', thumbnail: 'linear-gradient(135deg, #a29bfe 0%, #dfe6e9 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#a29bfe' }),
      text({ id: 'q', content: '“', x: 35, y: 30, fontSize: 80, fontWeight: 400, fontFamily: 'Georgia', color: '#ffeaa7' }),
      text({ id: 'main', content: '愿你眼里有光', x: 50, y: 50, fontSize: 32, fontWeight: 500, color: '#ffffff' }),
      text({ id: 'sub', content: '心中有爱', x: 50, y: 68, fontSize: 32, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xhs-study-1', name: '学习日常', ratio: '3:4', category: '教程', subCategory: '穿搭教程', platform: '小红书', layout: '日式极简',
    bg: '#ffeaa7', thumbnail: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ffeaa7' }),
      text({ id: 'icon', content: '📖', x: 50, y: 25, fontSize: 60, fontWeight: 400, color: '#2d3436' }),
      text({ id: 'main', content: '自律即自由', x: 50, y: 50, fontSize: 44, fontWeight: 700, color: '#2d3436' }),
      text({ id: 'sub', content: 'Study With Me', x: 50, y: 72, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#636e72', italic: true }),
    ]
  }),
  tpl({
    id: 'xhs-pm-1', name: '好物测评', ratio: '3:4', category: '测评', subCategory: '种草', platform: '小红书', layout: '新拟物',
    bg: '#fab1a0', thumbnail: 'linear-gradient(135deg, #fab1a0 0%, #ff7675 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fab1a0' }),
      text({ id: 'tag', content: '⭐ 真香预警', x: 50, y: 22, fontSize: 24, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '好物分享', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '亲测推荐', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),

  // ========== 公众号 / 通用 (6 个) ==========
  tpl({
    id: 'common-simple', name: '简约商务', ratio: '1:1', category: '知识', subCategory: '通用', platform: '通用', layout: '瑞士',
    bg: '#2c3e50', thumbnail: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2c3e50' }),
      text({ id: 'main', content: '品牌力量', x: 50, y: 45, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'BRAND POWER', x: 50, y: 62, fontSize: 18, fontWeight: 400, fontFamily: 'Arial', color: '#3498db' }),
    ]
  }),
  tpl({
    id: 'common-article-1', name: '深度好文', ratio: '1:1', category: '知识', subCategory: '通用', platform: '通用', layout: '瑞士',
    bg: '#ecf0f1', thumbnail: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ecf0f1' }),
      shape({ id: 'accent', shape: 'rect', x: 12, y: 30, width: 4, height: 40, color: '#e74c3c' }),
      text({ id: 'main', content: '深度思考', x: 50, y: 38, fontSize: 42, fontWeight: 900, color: '#2c3e50' }),
      text({ id: 'sub', content: '在这个喧嚣的时代', x: 50, y: 62, fontSize: 20, fontWeight: 400, color: '#7f8c8d' }),
    ]
  }),
  tpl({
    id: 'common-news-1', name: '行业资讯', ratio: '1:1', category: '知识', platform: '通用', layout: '包豪斯',
    bg: '#34495e', thumbnail: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#34495e' }),
      text({ id: 'tag', content: '📰 行业洞察', x: 50, y: 25, fontSize: 22, fontWeight: 700, color: '#f39c12' }),
      text({ id: 'main', content: '2026趋势', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'AI 时代的变革', x: 50, y: 72, fontSize: 20, fontWeight: 500, color: '#ecf0f1' }),
    ]
  }),
  tpl({
    id: 'common-interview-1', name: '人物访谈', ratio: '1:1', category: '知识', platform: '通用', layout: '意大利',
    bg: '#1e272e', thumbnail: 'linear-gradient(135deg, #1e272e 0%, #485460 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1e272e' }),
      text({ id: 'label', content: 'INTERVIEW', x: 50, y: 25, fontSize: 18, fontWeight: 400, fontFamily: 'Arial', color: '#ffa502' }),
      text({ id: 'main', content: '对话大咖', x: 50, y: 48, fontSize: 44, fontWeight: 700, color: '#ffffff' }),
      shape({ id: 'line', shape: 'line', x: 50, y: 60, width: 20, height: 2, color: '#ffa502' }),
      text({ id: 'sub', content: '第 12 期', x: 50, y: 72, fontSize: 20, fontWeight: 400, color: '#d2dae2' }),
    ]
  }),
  tpl({
    id: 'common-classic-1', name: '国学经典', ratio: '1:1', category: '知识', subCategory: '文化', platform: '通用', layout: '日式极简',
    bg: '#c0392b', thumbnail: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#c0392b' }),
      text({ id: 'main', content: '君子以文', x: 50, y: 42, fontSize: 52, fontWeight: 900, fontFamily: 'STKaiti', color: '#ffffff' }),
      text({ id: 'sub', content: '会友 以友辅仁', x: 50, y: 64, fontSize: 24, fontWeight: 500, fontFamily: 'STKaiti', color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'common-tech-1', name: '科技前沿', ratio: '1:1', category: '知识', subCategory: '通用', platform: '通用', layout: '包豪斯',
    bg: '#0c2461', thumbnail: 'linear-gradient(135deg, #0c2461 0%, #1e3799 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#0c2461' }),
      text({ id: 'icon', content: '🤖', x: 50, y: 25, fontSize: 60, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: 'AGI 时代', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '智能改变生活', x: 50, y: 72, fontSize: 20, fontWeight: 500, color: '#60a3bc' }),
    ]
  }),

  // ========== B站 (5 个) ==========
  tpl({
    id: 'bili-tech', name: '科技测评', ratio: '16:9', category: '测评', subCategory: '数码', platform: 'B站', layout: '包豪斯',
    bg: '#00c6fb', thumbnail: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00c6fb' }),
      text({ id: 'main', content: '新品首发测评', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'bili-game-1', name: '游戏实况', ratio: '16:9', category: '爆款标题', subCategory: '游戏', platform: 'B站', layout: '包豪斯',
    bg: '#2d3436', thumbnail: 'linear-gradient(135deg, #2d3436 0%, #6c5ce7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2d3436' }),
      text({ id: 'tag', content: '🎮 GAMEPLAY', x: 50, y: 25, fontSize: 24, fontWeight: 700, fontFamily: 'Impact', color: '#fdcb6e' }),
      text({ id: 'main', content: '高光时刻', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'EP. 128', x: 50, y: 75, fontSize: 20, fontWeight: 400, fontFamily: 'Arial', color: '#74b9ff' }),
    ]
  }),
  tpl({
    id: 'bili-anime-1', name: '动漫解说', ratio: '16:9', category: '爆款标题', platform: 'B站', layout: '包豪斯',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'tag', content: '🗾 ANIME', x: 50, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#ffeaa7' }),
      text({ id: 'main', content: '神作推荐', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '2026 必看', x: 50, y: 75, fontSize: 20, fontWeight: 500, color: '#fab1a0' }),
    ]
  }),
  tpl({
    id: 'bili-knowledge-1', name: '知识科普', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '包豪斯',
    bg: '#00b894', thumbnail: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00b894' }),
      text({ id: 'tag', content: '🧠 硬核科普', x: 50, y: 25, fontSize: 24, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '一分钟读懂', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '复杂概念简单化', x: 50, y: 75, fontSize: 20, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'bili-vlog-1', name: '生活记录', ratio: '16:9', category: '爆款标题', platform: 'B站', layout: '意大利',
    bg: '#fab1a0', thumbnail: 'linear-gradient(135deg, #fab1a0 0%, #ffeaa7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fab1a0' }),
      text({ id: 'tag', content: '🌅 DAILY VLOG', x: 50, y: 25, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#ffffff' }),
      text({ id: 'main', content: '我的日常', x: 50, y: 50, fontSize: 56, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '慢生活分享', x: 50, y: 75, fontSize: 20, fontWeight: 400, color: '#ffffff' }),
    ]
  }),

  // ========== 日签 / 文案 (4 个) ==========
  tpl({
    id: 'morning-quote', name: '早安日签', ratio: '9:16', category: '情感', subCategory: '治愈', platform: '通用', layout: '日式极简',
    bg: '#89f7fe', thumbnail: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#89f7fe' }),
      text({ id: 'emoji', content: '☀️', x: 50, y: 30, fontSize: 64, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'greeting', content: '早安', x: 50, y: 50, fontSize: 48, fontWeight: 300, color: '#2d3436' }),
      text({ id: 'quote', content: '今天也是美好的一天', x: 50, y: 70, fontSize: 22, fontWeight: 400, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'night-quote-1', name: '晚安日签', ratio: '9:16', category: '情感', subCategory: '治愈', platform: '通用', layout: '日式极简',
    bg: '#2c3e50', thumbnail: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2c3e50' }),
      text({ id: 'moon', content: '🌙', x: 50, y: 30, fontSize: 64, fontWeight: 400, color: '#ffeaa7' }),
      text({ id: 'main', content: '晚安', x: 50, y: 50, fontSize: 48, fontWeight: 300, color: '#ffffff' }),
      text({ id: 'sub', content: '愿你有个好梦', x: 50, y: 70, fontSize: 22, fontWeight: 400, color: '#dfe6e9' }),
    ]
  }),
  tpl({
    id: 'quote-daily-1', name: '每日一言', ratio: '9:16', category: '情感', platform: '通用', layout: '日式极简',
    bg: '#f5f5f5', thumbnail: 'linear-gradient(135deg, #f5f5f5 0%, #d4d4d4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#f5f5f5' }),
      text({ id: 'date', content: '2026.07.21', x: 50, y: 25, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: '#95a5a6' }),
      text({ id: 'main', content: '心怀热爱\n奔赴山海', x: 50, y: 50, fontSize: 44, fontWeight: 700, color: '#2c3e50' }),
      text({ id: 'sub', content: '—— 致每一个努力的人', x: 50, y: 80, fontSize: 18, fontWeight: 400, fontFamily: 'STKaiti', color: '#7f8c8d' }),
    ]
  }),
  tpl({
    id: 'story-dark', name: '深色故事', ratio: '9:16', category: '情感', platform: '通用', layout: '意大利',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'main', content: 'YOUR STORY', x: 50, y: 45, fontSize: 42, fontWeight: 300, fontFamily: 'Georgia', color: '#ffffff', italic: true, shadow: true }),
      shape({ id: 'line', shape: 'line', x: 50, y: 58, width: 40, height: 2, color: '#ffd700' }),
      text({ id: 'sub', content: '每个人都是自己故事的主角', x: 50, y: 68, fontSize: 18, fontWeight: 400, color: '#a0a0a0' }),
    ]
  }),

  // ========== 直播 (3 个) ==========
  tpl({
    id: 'live-hot', name: '直播预告', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '包豪斯',
    bg: '#e74c3c', thumbnail: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#e74c3c' }),
      text({ id: 'tag', content: '🔴 LIVE', x: 50, y: 25, fontSize: 28, fontWeight: 700, fontFamily: 'Impact', color: '#ffd700' }),
      text({ id: 'main', content: '今晚 8 点', x: 50, y: 50, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '我们不见不散', x: 50, y: 72, fontSize: 24, fontWeight: 700, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'live-flash-1', name: '闪购秒杀', ratio: '9:16', category: '数字震撼', platform: '抖音', layout: '包豪斯',
    bg: '#ff4757', thumbnail: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ff4757' }),
      text({ id: 'tag', content: '⚡ 限时秒杀', x: 50, y: 22, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'price', content: '¥99', x: 50, y: 48, fontSize: 96, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '原价 ¥299', x: 50, y: 75, fontSize: 22, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'live-teach-1', name: '直播教学', ratio: '9:16', category: '教程', platform: '抖音', layout: '包豪斯',
    bg: '#3742fa', thumbnail: 'linear-gradient(135deg, #3742fa 0%, #5f27cd 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#3742fa' }),
      text({ id: 'tag', content: '🎓 LIVE CLASS', x: 50, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#ffeaa7' }),
      text({ id: 'main', content: '在线教学', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '现在报名', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#ffffff' }),
    ]
  }),

  // ========== 电商 (4 个) ==========
  tpl({
    id: 'product-show', name: '产品展示', ratio: '3:4', category: '种草', subCategory: '家居', platform: '小红书', layout: '新拟物',
    bg: '#43e97b', thumbnail: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#43e97b' }),
      text({ id: 'tag', content: '🔥 NEW ARRIVAL', x: 50, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#ffffff' }),
      text({ id: 'main', content: '新品上市', x: 50, y: 48, fontSize: 48, fontWeight: 900, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '限时特惠 立即抢购', x: 50, y: 68, fontSize: 20, fontWeight: 500, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'sale-1', name: '超值特惠', ratio: '1:1', category: '数字震撼', platform: '通用', layout: '包豪斯',
    bg: '#ee5a6f', thumbnail: 'linear-gradient(135deg, #ee5a6f 0%, #f29263 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ee5a6f' }),
      text({ id: 'tag', content: '🎁 SUPER SALE', x: 50, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#ffeaa7' }),
      text({ id: 'main', content: '全场5折', x: 50, y: 55, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'review-1', name: '用户好评', ratio: '3:4', category: '测评', subCategory: '产品', platform: '小红书', layout: '新拟物',
    bg: '#fa8072', thumbnail: 'linear-gradient(135deg, #fa8072 0%, #ffa07a 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fa8072' }),
      text({ id: 'stars', content: '⭐⭐⭐⭐⭐', x: 50, y: 25, fontSize: 36, fontWeight: 400, color: '#ffeaa7' }),
      text({ id: 'main', content: '真实好评', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '10000+ 用户的选择', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'membership-1', name: '会员招募', ratio: '1:1', category: '知识', platform: '通用', layout: '意大利',
    bg: '#1e1e1e', thumbnail: 'linear-gradient(135deg, #1e1e1e 0%, #434343 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1e1e1e' }),
      text({ id: 'tag', content: '👑 VIP', x: 50, y: 25, fontSize: 32, fontWeight: 700, fontFamily: 'Impact', color: '#d4af37' }),
      text({ id: 'main', content: '尊享会员', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '专享特权', x: 50, y: 72, fontSize: 22, fontWeight: 400, color: '#d4af37' }),
    ]
  }),

  // ========== 通用/极简 (3 个) ==========
  tpl({
    id: 'minimal-white-1', name: '极简白', ratio: '1:1', category: '知识', subCategory: '通用', platform: '通用', layout: '日式极简',
    bg: '#fafafa', thumbnail: 'linear-gradient(135deg, #fafafa 0%, #e0e0e0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fafafa' }),
      shape({ id: 'line', shape: 'line', x: 50, y: 40, width: 30, height: 1, color: '#000000' }),
      text({ id: 'main', content: 'LESS IS MORE', x: 50, y: 55, fontSize: 28, fontWeight: 300, fontFamily: 'Georgia', color: '#000000' }),
      text({ id: 'sub', content: '少即是多', x: 50, y: 70, fontSize: 18, fontWeight: 400, fontFamily: 'STKaiti', color: '#666666' }),
    ]
  }),
  tpl({
    id: 'gradient-neon-1', name: '霓虹渐变', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '包豪斯',
    bg: '#5856d6', thumbnail: 'linear-gradient(135deg, #5856d6 0%, #ff2d55 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#5856d6' }),
      text({ id: 'main', content: 'NEON', x: 50, y: 45, fontSize: 72, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'VIBES', x: 50, y: 65, fontSize: 36, fontWeight: 300, fontFamily: 'Georgia', color: '#ffeaa7', italic: true }),
    ]
  }),
  tpl({
    id: 'xhs-magazine-1', name: '杂志封面', ratio: '3:4', category: '爆款标题', subCategory: '种草', platform: '小红书', layout: '意大利',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'issue', content: 'ISSUE 07', x: 50, y: 18, fontSize: 16, fontWeight: 400, fontFamily: 'Georgia', color: '#d4af37', letterSpacing: 3 } as any),
      text({ id: 'main', content: 'FASHION\n& LIFE', x: 50, y: 50, fontSize: 52, fontWeight: 700, fontFamily: 'Georgia', color: '#ffffff', shadow: true } as any),
      shape({ id: 'line', shape: 'line', x: 50, y: 72, width: 40, height: 1, color: '#d4af37' }),
      text({ id: 'sub', content: '2026 SPRING', x: 50, y: 80, fontSize: 14, fontWeight: 400, fontFamily: 'Georgia', color: '#d4af37', letterSpacing: 2 } as any),
    ]
  }),
]

// ============================================================
// 程序化生成 153 套：覆盖 4 平台 × 4 比例 × 8 内容类型 × 5 设计风格
// ============================================================
const PLATFORMS: Template['platform'][] = ['小红书', '抖音', 'B站', '通用']
const RATIOS: Template['ratio'][] = ['3:4', '9:16', '1:1', '16:9']
const CONTENT_TYPES = Object.keys(CONTENT_POOLS)
const SKELETON_KEYS = Object.keys(SKELETONS)

const PROGRAMMATIC_META: Array<{
  id: string
  name: string
  platform: Template['platform']
  ratio: Template['ratio']
  contentType: string
  subCategory?: string
  skeleton: string
  styleIdx: number
  compIdx: number
  paletteIdx: number
  contentIdx: number
}> = []

// 生成策略：每平台 × 每比例 × 每内容类型 × N 套（不同 skeleton/style/comp/palette/content 组合）
let progIdx = 0
PLATFORMS.forEach(platform => {
  // 各平台适合的比例
  const platformRatios: Record<string, Template['ratio'][]> = {
    '小红书': ['3:4', '1:1', '9:16'],
    '抖音': ['9:16', '3:4'],
    'B站': ['16:9', '9:16', '1:1'],
    '通用': ['1:1', '3:4', '16:9', '9:16'],
  }
  const ratios = platformRatios[platform] || RATIOS
  // 4 平台都覆盖全 8 内容类型（让总数 = 200：手写 47 + 程序化 153）
  const platformContents = CONTENT_TYPES
  const subs = SUB_CATEGORIES[platform] || {}

  ratios.forEach(ratio => {
    platformContents.forEach(contentType => {
      // 每组合 2 套（不同 skeleton/style/comp/palette）
      for (let i = 0; i < 2; i++) {
        const base = progIdx * 17  // 17 是为了用 progIdx 生成稳定的"伪随机"参数
        const subArr = subs[contentType]
        const subCategory = subArr ? subArr[(progIdx + i) % subArr.length] : undefined
        PROGRAMMATIC_META.push({
          id: `${platform.toLowerCase()}-${ratio.replace(':', 'x')}-${contentType}-${progIdx}`,
          name: `${contentType}·${['精选', '爆款', '热门', '推荐', '实用', '创意', '高级', '质感', '氛围', '高级感'][progIdx % 10]}`,
          platform,
          ratio,
          contentType,
          subCategory,
          skeleton: SKELETON_KEYS[(base + i) % SKELETON_KEYS.length],
          styleIdx: (base + i * 3) % DESIGN_STYLES.length,
          compIdx: (base + i * 5) % 4,
          paletteIdx: (base + i) % PLATFORM_PALETTES[platform].length,
          contentIdx: (base * 2 + i) % CONTENT_POOLS[contentType].length,
        })
        progIdx++
      }
    })
  })
})

// 生成模板对象
// 限制程序化为 153 套（手写 47 + 程序化 153 = 200 套）
const PROGRAMMATIC: Template[] = PROGRAMMATIC_META.slice(0, 153).map(buildTemplate)

// ============================================================
// 瑞士国际风格 + 斐波那契大师排版 — 20 套（追加，不动现有 200 套）
//
// 瑞士国际风格 (Swiss Style / International Typographic Style) 关键特征：
// - 大量留白 (negative space)
// - 严格网格系统
// - 极简单色（黑/白/红）
// - 无衬线（Helvetica / Univers / Akzidenz-Grotesk 风格）
// - 字号按黄金比例 [13, 21, 34, 55, 89] 斐波那契数列
// - 元素位置按黄金分割 0.382 / 0.618
// - 全大写排版
// - 几何元素（圆/方/线）
// ============================================================

// 斐波那契字号（瑞士排版标准）
const F = { 13: 13, 21: 21, 34: 34, 55: 55, 89: 89, 144: 144 }
const SWISS_RED = '#DC2626'
const SWISS_BLACK = '#0A0A0A'
const SWISS_WHITE = '#FAFAFA'
const SWISS_GRAY = '#999999'

const SWISS_TEMPLATES: Template[] = [
  // ========== 瑞士国际风格 12 套 ==========
  // 1. 经典"国际大师" - 黑底 + 大留白 + Helvetica 风大字
  tpl({
    id: 'swiss-01', name: '国际大师', ratio: '1:1', category: '知识', subCategory: '文化', platform: '通用', layout: '瑞士',
    bg: SWISS_BLACK, thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_BLACK }),
      // 红色色块（左下角）
      shape({ id: 'block', shape: 'rect', x: 12, y: 88, width: 16, height: 4, color: SWISS_RED }),
      // 编号（左上）
      text({ id: 'no', content: '№ 01', x: 12, y: 12, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
      // 主标题（居中 89px）
      text({ id: 'main', content: 'DESIGN', x: 50, y: 45, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -2 } as any),
      // 副标题（55px）
      text({ id: 'sub', content: 'is a system', x: 50, y: 60, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, italic: true } as any),
      // 底部注脚
      text({ id: 'foot', content: '2026 / COLLECTION', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 3 } as any),
    ]
  }),
  // 2. 网格系统 - 9 宫格 + 中心大字
  tpl({
    id: 'swiss-02', name: '网格系统', ratio: '3:4', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 网格线（4 横 + 4 竖）
      shape({ id: 'h1', shape: 'line', x: 50, y: 16.67, width: 100, height: 0.2, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'h2', shape: 'line', x: 50, y: 33.33, width: 100, height: 0.2, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'h3', shape: 'line', x: 50, y: 66.67, width: 100, height: 0.2, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'h4', shape: 'line', x: 50, y: 83.33, width: 100, height: 0.2, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'v1', shape: 'line', x: 16.67, y: 50, width: 0.2, height: 100, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'v2', shape: 'line', x: 33.33, y: 50, width: 0.2, height: 100, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'v3', shape: 'line', x: 66.67, y: 50, width: 0.2, height: 100, color: SWISS_GRAY, opacity: 0.3 } as any),
      shape({ id: 'v4', shape: 'line', x: 83.33, y: 50, width: 0.2, height: 100, color: SWISS_GRAY, opacity: 0.3 } as any),
      // 编号
      text({ id: 'no', content: '01 / 09', x: 12, y: 8, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY } as any),
      // 主标题
      text({ id: 'main', content: 'GRID', x: 50, y: 50, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -2 } as any),
      // 红色色块
      shape({ id: 'accent', shape: 'rect', x: 88, y: 92, width: 6, height: 3, color: SWISS_RED }),
    ]
  }),
  // 3. 极简红 - 红色背景 + 白字
  tpl({
    id: 'swiss-03', name: '极简红', ratio: '9:16', category: '爆款标题', platform: '抖音', layout: '瑞士',
    bg: SWISS_RED, thumbnail: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_RED }),
      // 顶部细黑线
      shape({ id: 'top-line', shape: 'line', x: 50, y: 12, width: 80, height: 0.5, color: SWISS_WHITE }),
      // 编号
      text({ id: 'no', content: 'ED. 2026', x: 12, y: 8, fontSize: F[13], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 3 } as any),
      // 主标题 - 89px 全大写
      text({ id: 'main', content: 'LESS', x: 50, y: 38.2, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -3 } as any),
      text({ id: 'main2', content: 'IS MORE', x: 50, y: 55, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -3 } as any),
      // 副标题
      text({ id: 'sub', content: 'Mies van der Rohe', x: 50, y: 75, fontSize: F[21], fontWeight: 400, fontFamily: 'Georgia', color: SWISS_WHITE, italic: true } as any),
      // 底部
      shape({ id: 'bot-line', shape: 'line', x: 50, y: 88, width: 80, height: 0.5, color: SWISS_WHITE }),
      text({ id: 'foot', content: 'SWISS DESIGN', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 4 } as any),
    ]
  }),
  // 4. 4 段字号递进（13/21/34/55 斐波那契）
  tpl({
    id: 'swiss-04', name: '字号递进', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 4 行字号从大到小（黄金比例 0.618 起始）
      text({ id: 't1', content: 'TYPE', x: 12, y: 30, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -3 } as any),
      text({ id: 't2', content: 'Set in', x: 12, y: 50, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_RED } as any),
      text({ id: 't3', content: 'Helvetica', x: 12, y: 65, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK, italic: true } as any),
      text({ id: 't4', content: '1957 · MAX HUBER', x: 12, y: 88, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
    ]
  }),
  // 5. 留白 - 居中 1 个大问号
  tpl({
    id: 'swiss-05', name: '极简留白', ratio: '3:4', category: '知识', subCategory: '文化', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 中心大"?"
      text({ id: 'q', content: '?', x: 50, y: 45, fontSize: F[144], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 顶部编号
      text({ id: 'top', content: 'WHAT IS', x: 50, y: 18, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 5 } as any),
      // 底部问句
      text({ id: 'ask', content: 'good design?', x: 50, y: 75, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 红色方块
      shape({ id: 'dot', shape: 'rect', x: 50, y: 88, width: 4, height: 4, color: SWISS_RED }),
    ]
  }),
  // 6. 几何 - 黑底 + 圆 + 方 + Helv
  tpl({
    id: 'swiss-06', name: '几何构成', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_BLACK, thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_BLACK }),
      // 红色圆形
      shape({ id: 'circle', shape: 'circle', x: 25, y: 30, width: 25, height: 25, color: SWISS_RED }),
      // 白色方块（黄金比例 0.618）
      shape({ id: 'square', shape: 'rect', x: 75, y: 70, width: 18, height: 18, color: SWISS_WHITE }),
      // 黑色小圆
      shape({ id: 'small', shape: 'circle', x: 75, y: 30, width: 8, height: 8, color: SWISS_BLACK }),
      // 文字
      text({ id: 'main', content: 'FORM', x: 50, y: 88, fontSize: F[34], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 8 } as any),
    ]
  }),
  // 7. 大 H + 红色边线
  tpl({
    id: 'swiss-07', name: '字母 H', ratio: '9:16', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 红色粗边框（仅右边）
      shape({ id: 'border', shape: 'rect', x: 92, y: 50, width: 0.6, height: 70, color: SWISS_RED }),
      // 编号
      text({ id: 'no', content: 'H', x: 12, y: 12, fontSize: F[21], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_RED } as any),
      // 巨型 H 字符
      text({ id: 'h', content: 'H', x: 50, y: 50, fontSize: 200, fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 底部说明
      text({ id: 'desc', content: 'Helvetica', x: 12, y: 90, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'sub', content: 'was designed by Max Miedinger', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY } as any),
    ]
  }),
  // 8. 上下二分 - 上半大字 + 下半小字
  tpl({
    id: 'swiss-08', name: '上下二分', ratio: '3:4', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 上下分界线（黄金 0.382）
      shape({ id: 'divider', shape: 'line', x: 50, y: 38.2, width: 100, height: 0.5, color: SWISS_BLACK }),
      // 上半大字
      text({ id: 'top', content: 'TYPO-', x: 12, y: 25, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -1 } as any),
      text({ id: 'top2', content: 'GRAPHY', x: 12, y: 33, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -1 } as any),
      // 下半小字（左对齐，3 行）
      text({ id: 'l1', content: 'is the craft of endowing', x: 12, y: 50, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'l2', content: 'human language with a', x: 12, y: 56, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'l3', content: 'durable visual form.', x: 12, y: 62, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 红色小方块
      shape({ id: 'dot', shape: 'rect', x: 12, y: 92, width: 2, height: 2, color: SWISS_RED }),
      text({ id: 'foot', content: '— Robert Bringhurst', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, italic: true } as any),
    ]
  }),
  // 9. 红色色块 + 反白字
  tpl({
    id: 'swiss-09', name: '红块反白', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 大红色方块（黄金比例）
      shape({ id: 'block', shape: 'rect', x: 50, y: 50, width: 80, height: 80, color: SWISS_RED }),
      // 反白字
      text({ id: 'main', content: 'NEW', x: 50, y: 40, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -2 } as any),
      text({ id: 'sub', content: 'edition 2026', x: 50, y: 55, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 4 } as any),
      // 顶部小字
      text({ id: 'top', content: 'LIMITED', x: 12, y: 8, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 4 } as any),
    ]
  }),
  // 10. 目录/编号 风格
  tpl({
    id: 'swiss-10', name: '目录编号', ratio: '9:16', category: '知识', subCategory: '文化', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 编号（黄金比例 0.382 起始）
      text({ id: 'n1', content: '01', x: 12, y: 18, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -2 } as any),
      // 标题
      text({ id: 't1', content: '第一章', x: 12, y: 32, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 't1s', content: '网格的力量', x: 12, y: 38, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY } as any),
      // 分隔线
      shape({ id: 'line1', shape: 'line', x: 12, y: 50, width: 70, height: 0.3, color: SWISS_BLACK }),
      // 编号 2
      text({ id: 'n2', content: '02', x: 12, y: 58, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -2 } as any),
      text({ id: 't2', content: '第二章', x: 12, y: 72, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 't2s', content: '字体的对话', x: 12, y: 78, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY } as any),
      // 底部
      shape({ id: 'line2', shape: 'line', x: 12, y: 90, width: 70, height: 0.3, color: SWISS_BLACK }),
      text({ id: 'foot', content: 'Müller-Brockmann', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
    ]
  }),
  // 11. 杂志/侧栏版
  tpl({
    id: 'swiss-11', name: '杂志侧栏', ratio: '3:4', category: '知识', subCategory: '文化', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 顶部细线
      shape({ id: 'top-line', shape: 'line', x: 50, y: 12, width: 88, height: 0.3, color: SWISS_BLACK }),
      // 顶部卷期
      text({ id: 'vol', content: 'VOL. 026 / 2026', x: 12, y: 9, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 3 } as any),
      text({ id: 'date', content: 'SPRING', x: 88, y: 9, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: 3 } as any),
      // 主标题（左侧大）
      text({ id: 'main', content: 'NEW', x: 25, y: 28, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -2 } as any),
      text({ id: 'main2', content: 'TYPE', x: 25, y: 38, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -2 } as any),
      // 分隔竖线
      shape({ id: 'divider', shape: 'line', x: 60, y: 35, width: 0.3, height: 35, color: SWISS_BLACK }),
      // 右侧小字说明
      text({ id: 'r1', content: '从 Helvetica 到', x: 65, y: 28, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'r2', content: 'Inter 的字体演化', x: 65, y: 32, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'r3', content: '瑞士排版的', x: 65, y: 38, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'r4', content: '历史与影响', x: 65, y: 42, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 中部红色大数字
      text({ id: 'big-num', content: '60', x: 50, y: 65, fontSize: F[144], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -4 } as any),
      // 底部
      text({ id: 'foot', content: 'YEARS OF SWISS DESIGN', x: 50, y: 90, fontSize: F[21], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 4 } as any),
    ]
  }),
  // 12. 宣言 - 黑底 + 全大写 + 红色强调
  tpl({
    id: 'swiss-12', name: '宣言海报', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_BLACK, thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_BLACK }),
      // 红色色条
      shape({ id: 'red-bar', shape: 'rect', x: 12, y: 25, width: 2, height: 50, color: SWISS_RED }),
      // 主标题 - 3 行全大写
      text({ id: 'm1', content: 'FORM', x: 18, y: 28, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -1 } as any),
      text({ id: 'm2', content: 'FOLLOWS', x: 18, y: 42, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -1 } as any),
      text({ id: 'm3', content: 'FUNCTION', x: 18, y: 56, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -1 } as any),
      // 底部
      shape({ id: 'line', shape: 'line', x: 18, y: 75, width: 60, height: 0.3, color: SWISS_WHITE }),
      text({ id: 'author', content: 'Louis Sullivan', x: 18, y: 82, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
      text({ id: 'date', content: '1896', x: 18, y: 90, fontSize: F[21], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_WHITE } as any),
    ]
  }),

  // ========== 斐波那契大师排版 8 套 ==========
  // 13. 经典 5 段斐波那契
  tpl({
    id: 'fib-01', name: '斐波 5 段', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 89px 主
      text({ id: 't1', content: 'φ', x: 12, y: 22, fontSize: F[144], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -4 } as any),
      // 55px
      text({ id: 't2', content: '1.6180339887', x: 12, y: 45, fontSize: F[55], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -1 } as any),
      // 34px
      text({ id: 't3', content: '黄金比例', x: 12, y: 60, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 21px
      text({ id: 't4', content: 'GOLDEN RATIO', x: 12, y: 70, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 3 } as any),
      // 13px
      text({ id: 't5', content: 'A / B = (A+B) / A', x: 12, y: 90, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
    ]
  }),
  // 14. 3:4 斐波
  tpl({
    id: 'fib-02', name: '斐波 3:4', ratio: '3:4', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 89px 主体（黄金 0.382）
      text({ id: 't1', content: '1', x: 12, y: 30, fontSize: F[144], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -4 } as any),
      text({ id: 't1s', content: '1', x: 50, y: 30, fontSize: F[89], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_RED } as any),
      text({ id: 't1ss', content: '2', x: 70, y: 30, fontSize: F[55], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 't1sss', content: '3', x: 84, y: 30, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 副标题（黄金 0.618）
      text({ id: 'sub', content: '5 / 8 / 13 / 21', x: 12, y: 50, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 4 } as any),
      // 大段说明
      text({ id: 'l1', content: '斐波那契数列', x: 12, y: 60, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'l2', content: '源自 12 世纪的数学之美', x: 12, y: 67, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY } as any),
      // 红色粗线
      shape({ id: 'line', shape: 'rect', x: 12, y: 80, width: 30, height: 1, color: SWISS_RED }),
      text({ id: 'foot', content: 'Leonardo Fibonacci', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
    ]
  }),
  // 15. 纯黄金比例排版
  tpl({
    id: 'fib-03', name: '黄金排版', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_BLACK, thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_BLACK }),
      // 黄金分割线
      shape({ id: 'h', shape: 'line', x: 50, y: 38.2, width: 80, height: 0.3, color: SWISS_WHITE, opacity: 0.3 } as any),
      shape({ id: 'v', shape: 'line', x: 38.2, y: 50, width: 0.3, height: 80, color: SWISS_WHITE, opacity: 0.3 } as any),
      // 数字 0.618（89px 红色，中心）
      text({ id: 'phi', content: '0.618', x: 50, y: 50, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -3 } as any),
      // 文字
      text({ id: 'top', content: 'φ', x: 50, y: 30, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 5 } as any),
      text({ id: 'bot', content: 'THE DIVINE PROPORTION', x: 50, y: 70, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 4 } as any),
    ]
  }),
  // 16. 9:16 竖向斐波
  tpl({
    id: 'fib-04', name: '斐波竖版', ratio: '9:16', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 4 个斐波数字（大→小竖排）
      text({ id: 'n1', content: '144', x: 12, y: 25, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -2 } as any),
      text({ id: 'n2', content: '89', x: 12, y: 38, fontSize: F[55], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'n3', content: '55', x: 12, y: 50, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      text({ id: 'n4', content: '34', x: 12, y: 60, fontSize: F[21], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 装饰红线
      shape({ id: 'line', shape: 'rect', x: 50, y: 38.2, width: 30, height: 1, color: SWISS_RED }),
      // 副标题
      text({ id: 'sub', content: 'Fibonacci', x: 12, y: 70, fontSize: F[21], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 3 } as any),
      text({ id: 'sub2', content: 'Sequence', x: 12, y: 75, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
      // 底部
      text({ id: 'foot', content: '完美比例', x: 12, y: 95, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: 3 } as any),
    ]
  }),
  // 17. 黄金螺线 + 排版
  tpl({
    id: 'fib-05', name: '黄金螺线', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 黄金螺线（用多个圆弧近似）
      shape({ id: 'sp1', shape: 'circle', x: 50, y: 50, width: 60, height: 60, color: SWISS_RED, opacity: 0.1 } as any),
      shape({ id: 'sp2', shape: 'circle', x: 50, y: 50, width: 40, height: 40, color: SWISS_RED, opacity: 0.2 } as any),
      shape({ id: 'sp3', shape: 'circle', x: 50, y: 50, width: 25, height: 25, color: SWISS_RED, opacity: 0.4 } as any),
      shape({ id: 'sp4', shape: 'circle', x: 50, y: 50, width: 15, height: 15, color: SWISS_RED, opacity: 0.7 } as any),
      shape({ id: 'sp5', shape: 'circle', x: 50, y: 50, width: 8, height: 8, color: SWISS_RED } as any),
      // 文字
      text({ id: 'phi', content: 'φ', x: 50, y: 50, fontSize: F[34], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 0 } as any),
      // 底部
      text({ id: 'foot', content: 'GOLDEN SPIRAL', x: 12, y: 92, fontSize: F[13], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 4 } as any),
    ]
  }),
  // 18. 黄金分割版
  tpl({
    id: 'fib-06', name: '黄金分割', ratio: '3:4', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_BLACK, thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #DC2626 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_BLACK }),
      // 黄金分割矩形（左侧 0.382 = 红色块）
      shape({ id: 'block', shape: 'rect', x: 19.1, y: 50, width: 38.2, height: 100, color: SWISS_RED }),
      // 大字（右侧 0.618 区域）
      text({ id: 'main', content: '0.618', x: 69.1, y: 50, fontSize: F[55], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: -1 } as any),
      // 副字
      text({ id: 'sub', content: 'GOLDEN', x: 69.1, y: 60, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 3 } as any),
      text({ id: 'sub2', content: 'RATIO', x: 69.1, y: 65, fontSize: F[21], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 3 } as any),
      // 顶部数字
      text({ id: 'top', content: 'A = 0.382', x: 19.1, y: 8, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_WHITE, letterSpacing: 2 } as any),
      text({ id: 'top2', content: 'B = 0.618', x: 69.1, y: 8, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 2 } as any),
    ]
  }),
  // 19. 多元素斐波
  tpl({
    id: 'fib-07', name: '斐波多元素', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #FAFAFA 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 5 个圆按斐波直径递减
      shape({ id: 'c1', shape: 'circle', x: 20, y: 80, width: 40, height: 40, color: SWISS_RED, opacity: 0.9 } as any),
      shape({ id: 'c2', shape: 'circle', x: 40, y: 80, width: 25, height: 25, color: SWISS_RED, opacity: 0.7 } as any),
      shape({ id: 'c3', shape: 'circle', x: 55, y: 80, width: 15, height: 15, color: SWISS_RED, opacity: 0.5 } as any),
      shape({ id: 'c4', shape: 'circle', x: 65, y: 80, width: 9, height: 9, color: SWISS_RED, opacity: 0.3 } as any),
      shape({ id: 'c5', shape: 'circle', x: 72, y: 80, width: 5, height: 5, color: SWISS_RED } as any),
      // 顶部文字
      text({ id: 'top', content: 'FIBONACCI', x: 12, y: 12, fontSize: F[21], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 4 } as any),
      // 中部
      text({ id: 'main', content: '89', x: 12, y: 35, fontSize: F[89], fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: -3 } as any),
      text({ id: 'sub', content: '个元素', x: 50, y: 40, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_RED } as any),
      text({ id: 'desc', content: '以黄金比例递减的视觉', x: 12, y: 55, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY } as any),
    ]
  }),
  // 20. 巨型数字 + 小字
  tpl({
    id: 'fib-08', name: '巨型数字', ratio: '1:1', category: '知识', subCategory: '设计', platform: '通用', layout: '瑞士',
    bg: SWISS_WHITE, thumbnail: 'linear-gradient(135deg, #DC2626 0%, #0A0A0A 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: SWISS_WHITE }),
      // 巨型 144
      text({ id: 'big', content: '144', x: 12, y: 50, fontSize: 220, fontWeight: 900, fontFamily: 'Helvetica', color: SWISS_RED, letterSpacing: -6 } as any),
      // 副标题
      text({ id: 'sub', content: '× 233', x: 12, y: 70, fontSize: F[34], fontWeight: 700, fontFamily: 'Helvetica', color: SWISS_BLACK } as any),
      // 顶部
      text({ id: 'top', content: 'FIBONACCI SEQUENCE', x: 12, y: 10, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_GRAY, letterSpacing: 4 } as any),
      // 底部
      shape({ id: 'line', shape: 'rect', x: 12, y: 85, width: 20, height: 1, color: SWISS_RED }),
      text({ id: 'foot', content: 'F(n) = F(n-1) + F(n-2)', x: 12, y: 92, fontSize: F[13], fontWeight: 400, fontFamily: 'Helvetica', color: SWISS_BLACK, letterSpacing: 2 } as any),
    ]
  }),
]

// ============================================================
// 80 套追加（小红书 25 + 抖音 20 + B 站 20 + 通用 15）
// ============================================================
const EXTENDED_TEMPLATES: Template[] = [
  // ========== 小红书 25 套 ==========
  tpl({
    id: 'xhs-beauty-1', name: '妆容教程', ratio: '3:4', category: '种草', subCategory: '美妆', platform: '小红书', layout: '新拟物',
    bg: '#FFE4E1', thumbnail: 'linear-gradient(135deg, #FFE4E1 0%, #FFB6C1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFE4E1' }),
      text({ id: 'emoji', content: '💄', x: 50, y: 20, fontSize: 64, fontWeight: 400, color: '#FF1493' }),
      text({ id: 'main', content: '新手化妆', x: 50, y: 45, fontSize: 48, fontWeight: 800, color: '#8B0000', fontFamily: 'PingFang SC', shadow: true } as any),
      text({ id: 'sub', content: '保姆级教程', x: 50, y: 65, fontSize: 24, fontWeight: 500, color: '#FF69B4' }),
      text({ id: 'tag', content: '✨ 5 分钟搞定', x: 50, y: 85, fontSize: 18, fontWeight: 600, color: '#FFFFFF', bg: true, bgColor: '#FF1493', bgPadding: 8 } as any),
    ]
  }),
  tpl({
    id: 'xhs-beauty-2', name: '口红试色', ratio: '3:4', category: '种草', subCategory: '美妆', platform: '小红书', layout: '意大利',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #DC143C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'icon', content: '💋', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FF1493' }),
      text({ id: 'main', content: '显白口红', x: 50, y: 50, fontSize: 52, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Georgia', shadow: true } as any),
      text({ id: 'sub', content: '黄皮必入', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'xhs-beauty-3', name: '护肤步骤', ratio: '3:4', category: '种草', subCategory: '美妆', platform: '小红书', layout: '瑞士',
    bg: '#F0F8FF', thumbnail: 'linear-gradient(135deg, #F0F8FF 0%, #B0E0E6 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#F0F8FF' }),
      text({ id: 'tag', content: '01', x: 12, y: 15, fontSize: 18, fontWeight: 700, fontFamily: 'Helvetica', color: '#4682B4' } as any),
      text({ id: 'main', content: '夜间护肤', x: 50, y: 40, fontSize: 52, fontWeight: 800, color: '#1a1a1a', fontFamily: 'Helvetica', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '5 步养出少女肌', x: 50, y: 60, fontSize: 22, fontWeight: 500, color: '#4682B4' }),
      text({ id: 'step1', content: '① 卸妆', x: 30, y: 78, fontSize: 16, fontWeight: 600, color: '#1a1a1a' }),
      text({ id: 'step2', content: '② 洁面', x: 70, y: 78, fontSize: 16, fontWeight: 600, color: '#1a1a1a' }),
    ]
  }),
  tpl({
    id: 'xhs-beauty-4', name: '面膜合集', ratio: '1:1', category: '种草', subCategory: '美妆', platform: '小红书', layout: '新拟物',
    bg: '#FFE0F0', thumbnail: 'linear-gradient(135deg, #FFE0F0 0%, #FFC0CB 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFE0F0' }),
      text({ id: 'icon', content: '🧖', x: 50, y: 28, fontSize: 60, fontWeight: 400, color: '#FF1493' }),
      text({ id: 'main', content: '面膜合集', x: 50, y: 55, fontSize: 48, fontWeight: 800, color: '#8B0000', shadow: true } as any),
      text({ id: 'sub', content: '20 款亲测', x: 50, y: 75, fontSize: 20, fontWeight: 500, color: '#FF69B4' }),
    ]
  }),
  tpl({
    id: 'xhs-beauty-5', name: '眼影盘', ratio: '3:4', category: '种草', subCategory: '美妆', platform: '小红书', layout: '包豪斯',
    bg: '#FFD700', thumbnail: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFD700' }),
      shape({ id: 'block', shape: 'rect', x: 50, y: 50, width: 80, height: 1, color: '#1a1a1a' }),
      text({ id: 'main', content: '大地色', x: 50, y: 38, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#1a1a1a', letterSpacing: -2 } as any),
      text({ id: 'sub', content: '百搭眼影盘', x: 50, y: 62, fontSize: 22, fontWeight: 700, color: '#8B0000' }),
      text({ id: 'tag', content: 'EYESHADOW', x: 50, y: 88, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 4 } as any),
    ]
  }),
  tpl({
    id: 'xhs-outfit-winter-1', name: '秋冬穿搭', ratio: '3:4', category: '种草', subCategory: '穿搭', platform: '小红书', layout: '意大利',
    bg: '#8B4513', thumbnail: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#8B4513' }),
      text({ id: 'icon', content: '🧥', x: 50, y: 20, fontSize: 60, fontWeight: 400, color: '#FFE4B5' }),
      text({ id: 'main', content: '秋冬穿搭', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Georgia', shadow: true } as any),
      text({ id: 'sub', content: '5 套高级感', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFE4B5' }),
    ]
  }),
  tpl({
    id: 'xhs-outfit-2', name: '小个子', ratio: '3:4', category: '种草', subCategory: '穿搭', platform: '小红书', layout: '新拟物',
    bg: '#FFC0CB', thumbnail: 'linear-gradient(135deg, #FFC0CB 0%, #FF69B4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFC0CB' }),
      text({ id: 'tag', content: '小个子必看', x: 50, y: 22, fontSize: 22, fontWeight: 700, color: '#8B0000' }),
      text({ id: 'main', content: '显高 10cm', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '视觉增高术', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#8B0000' }),
    ]
  }),
  tpl({
    id: 'xhs-outfit-3', name: '基础款', ratio: '3:4', category: '种草', subCategory: '穿搭', platform: '小红书', layout: '瑞士',
    bg: '#F5F5DC', thumbnail: 'linear-gradient(135deg, #F5F5DC 0%, #D2B48C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#F5F5DC' }),
      text({ id: 'no', content: 'A/W', x: 12, y: 10, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#8B4513', letterSpacing: 3 } as any),
      text({ id: 'main', content: '基础款', x: 50, y: 45, fontSize: 52, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '30 件不重样', x: 50, y: 65, fontSize: 22, fontWeight: 400, fontFamily: 'Helvetica', color: '#8B4513' }),
    ]
  }),
  tpl({
    id: 'xhs-outfit-4', name: '约会穿搭', ratio: '3:4', category: '种草', subCategory: '穿搭', platform: '小红书', layout: '新拟物',
    bg: '#FFE4E1', thumbnail: 'linear-gradient(135deg, #FFE4E1 0%, #FFB6C1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFE4E1' }),
      text({ id: 'heart', content: '💕', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FF1493' }),
      text({ id: 'main', content: '约会穿搭', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#8B0000', shadow: true } as any),
      text({ id: 'sub', content: '3 套不出错', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FF69B4' }),
    ]
  }),
  tpl({
    id: 'xhs-outfit-5', name: '高级感', ratio: '3:4', category: '种草', subCategory: '穿搭', platform: '小红书', layout: '意大利',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #666 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'main', content: '高级感', x: 50, y: 40, fontSize: 60, fontWeight: 700, fontFamily: 'Georgia', color: '#D4AF37', letterSpacing: 4 } as any),
      shape({ id: 'divider', shape: 'line', x: 50, y: 55, width: 30, height: 1, color: '#D4AF37' } as any),
      text({ id: 'sub', content: 'HIGHER LEVEL', x: 50, y: 65, fontSize: 16, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFFFFF', letterSpacing: 5 } as any),
    ]
  }),
  tpl({
    id: 'xhs-food-1', name: '家常菜', ratio: '3:4', category: '种草', subCategory: '美食', platform: '小红书', layout: '新拟物',
    bg: '#FF6347', thumbnail: 'linear-gradient(135deg, #FF6347 0%, #FFA500 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF6347' }),
      text({ id: 'icon', content: '🍳', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '懒人家常菜', x: 50, y: 50, fontSize: 40, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '10 分钟搞定', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFE4B5' }),
    ]
  }),
  tpl({
    id: 'xhs-food-2', name: '甜品', ratio: '3:4', category: '种草', subCategory: '美食', platform: '小红书', layout: '新拟物',
    bg: '#FFB6C1', thumbnail: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFB6C1' }),
      text({ id: 'icon', content: '🍰', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#8B0000' }),
      text({ id: 'main', content: '低糖甜品', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#8B0000', shadow: true } as any),
      text({ id: 'sub', content: '吃了不胖', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#8B0000' }),
    ]
  }),
  tpl({
    id: 'xhs-food-3', name: '减脂餐', ratio: '3:4', category: '种草', subCategory: '美食', platform: '小红书', layout: '瑞士',
    bg: '#90EE90', thumbnail: 'linear-gradient(135deg, #90EE90 0%, #228B22 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#90EE90' }),
      text({ id: 'tag', content: 'EAT CLEAN', x: 50, y: 18, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 5 } as any),
      text({ id: 'main', content: '减脂餐', x: 50, y: 45, fontSize: 52, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '一周不重样', x: 50, y: 68, fontSize: 20, fontWeight: 400, fontFamily: 'Helvetica', color: '#228B22' }),
    ]
  }),
  tpl({
    id: 'xhs-food-4', name: '咖啡指南', ratio: '3:4', category: '种草', subCategory: '美食', platform: '小红书', layout: '意大利',
    bg: '#8B4513', thumbnail: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#8B4513' }),
      text({ id: 'icon', content: '☕', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFE4B5' }),
      text({ id: 'main', content: '咖啡指南', x: 50, y: 50, fontSize: 48, fontWeight: 700, fontFamily: 'Georgia', color: '#FFE4B5', shadow: true } as any),
      text({ id: 'sub', content: '从入门到精通', x: 50, y: 72, fontSize: 20, fontWeight: 500, color: '#FFFFFF' }),
    ]
  }),
  tpl({
    id: 'xhs-food-5', name: '夜宵', ratio: '3:4', category: '种草', subCategory: '美食', platform: '小红书', layout: '新拟物',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #FF6347 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'icon', content: '🌙', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: '深夜夜宵', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '20 家探店', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'xhs-travel-japan-1', name: '日本攻略', ratio: '3:4', category: '种草', subCategory: '旅行', platform: '小红书', layout: '日式极简',
    bg: '#FFB7C5', thumbnail: 'linear-gradient(135deg, #FFB7C5 0%, #FFC0CB 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFB7C5' }),
      text({ id: 'icon', content: '🗾', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#8B0000' }),
      text({ id: 'main', content: '京都樱花', x: 50, y: 50, fontSize: 48, fontWeight: 700, fontFamily: 'STKaiti', color: '#8B0000', letterSpacing: 4 } as any),
      text({ id: 'sub', content: '7 日漫游', x: 50, y: 72, fontSize: 22, fontWeight: 400, fontFamily: 'STKaiti', color: '#8B0000' }),
    ]
  }),
  tpl({
    id: 'xhs-travel-2', name: '三亚攻略', ratio: '3:4', category: '种草', subCategory: '旅行', platform: '小红书', layout: '新拟物',
    bg: '#00CED1', thumbnail: 'linear-gradient(135deg, #00CED1 0%, #20B2AA 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00CED1' }),
      text({ id: 'icon', content: '🏖️', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '三亚攻略', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '5 天 4 晚', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'xhs-travel-3', name: '川西', ratio: '3:4', category: '种草', subCategory: '旅行', platform: '小红书', layout: '新拟物',
    bg: '#228B22', thumbnail: 'linear-gradient(135deg, #228B22 0%, #6B8E23 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#228B22' }),
      text({ id: 'icon', content: '🏔️', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '川西秘境', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '稻城亚丁', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'xhs-travel-4', name: '欧洲游', ratio: '3:4', category: '种草', subCategory: '旅行', platform: '小红书', layout: '意大利',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #4169E1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'main', content: '欧洲', x: 50, y: 38, fontSize: 60, fontWeight: 700, fontFamily: 'Georgia', color: '#FFD700', letterSpacing: 4 } as any),
      text({ id: 'sub', content: 'Paris · Roma', x: 50, y: 55, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#FFFFFF', italic: true } as any),
      shape({ id: 'divider', shape: 'line', x: 50, y: 65, width: 30, height: 1, color: '#FFD700' } as any),
      text({ id: 'tag', content: '15 日深度', x: 50, y: 75, fontSize: 18, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFFFFF', letterSpacing: 3 } as any),
    ]
  }),
  tpl({
    id: 'xhs-travel-5', name: '城市漫步', ratio: '3:4', category: '种草', subCategory: '旅行', platform: '小红书', layout: '新拟物',
    bg: '#708090', thumbnail: 'linear-gradient(135deg, #708090 0%, #2F4F4F 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#708090' }),
      text({ id: 'icon', content: '🚶', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: 'City Walk', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '城市漫步指南', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'xhs-home-1', name: '客厅布置', ratio: '3:4', category: '种草', subCategory: '家居', platform: '小红书', layout: '新拟物',
    bg: '#F5DEB3', thumbnail: 'linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#F5DEB3' }),
      text({ id: 'icon', content: '🛋️', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#8B4513' }),
      text({ id: 'main', content: '客厅改造', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#8B4513', shadow: true } as any),
      text({ id: 'sub', content: '5000 元搞定', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#A0522D' }),
    ]
  }),
  tpl({
    id: 'xhs-home-2', name: '卧室', ratio: '3:4', category: '种草', subCategory: '家居', platform: '小红书', layout: '新拟物',
    bg: '#E6E6FA', thumbnail: 'linear-gradient(135deg, #E6E6FA 0%, #D8BFD8 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#E6E6FA' }),
      text({ id: 'icon', content: '🛏️', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#9370DB' }),
      text({ id: 'main', content: '卧室装修', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#4B0082', shadow: true } as any),
      text({ id: 'sub', content: '治愈系空间', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#9370DB' }),
    ]
  }),
  tpl({
    id: 'xhs-home-3', name: '厨房', ratio: '3:4', category: '种草', subCategory: '家居', platform: '小红书', layout: '瑞士',
    bg: '#F0F0F0', thumbnail: 'linear-gradient(135deg, #F0F0F0 0%, #C0C0C0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#F0F0F0' }),
      text({ id: 'tag', content: 'KITCHEN', x: 50, y: 15, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#666', letterSpacing: 4 } as any),
      text({ id: 'main', content: '厨房收纳', x: 50, y: 45, fontSize: 48, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '断舍离 30 件', x: 50, y: 65, fontSize: 22, fontWeight: 400, fontFamily: 'Helvetica', color: '#666' }),
    ]
  }),
  tpl({
    id: 'xhs-home-4', name: '北欧风', ratio: '3:4', category: '种草', subCategory: '家居', platform: '小红书', layout: '日式极简',
    bg: '#FFFFFF', thumbnail: 'linear-gradient(135deg, #FFFFFF 0%, #D3D3D3 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFFFFF' }),
      text({ id: 'main', content: 'NORDIC', x: 50, y: 38, fontSize: 52, fontWeight: 400, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 8 } as any),
      shape({ id: 'divider', shape: 'line', x: 50, y: 55, width: 20, height: 1, color: '#1a1a1a' } as any),
      text({ id: 'sub', content: '极简北欧风', x: 50, y: 68, fontSize: 20, fontWeight: 400, fontFamily: 'PingFang SC', color: '#666' }),
    ]
  }),
  tpl({
    id: 'xhs-home-5', name: '出租屋', ratio: '3:4', category: '种草', subCategory: '家居', platform: '小红书', layout: '新拟物',
    bg: '#FFE4B5', thumbnail: 'linear-gradient(135deg, #FFE4B5 0%, #FFA500 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFE4B5' }),
      text({ id: 'icon', content: '🏠', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#8B4513' }),
      text({ id: 'main', content: '出租屋改造', x: 50, y: 50, fontSize: 42, fontWeight: 800, color: '#8B4513', shadow: true } as any),
      text({ id: 'sub', content: '1000 元大变身', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#A0522D' }),
    ]
  }),

  // ========== 抖音 20 套 ==========
  tpl({
    id: 'douyin-cook-1', name: '爆款菜谱', ratio: '9:16', category: '教程', platform: '抖音', layout: '包豪斯',
    bg: '#FF4500', thumbnail: 'linear-gradient(135deg, #FF4500 0%, #FF6347 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF4500' }),
      text({ id: 'icon', content: '🍜', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '5 分钟', x: 50, y: 42, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', stroke: true, strokeWidth: 2, strokeColor: '#1a1a1a', shadow: true } as any),
      text({ id: 'sub', content: '学会这道菜', x: 50, y: 65, fontSize: 32, fontWeight: 700, color: '#FFD700' }),
      text({ id: 'tag', content: '零失败', x: 50, y: 88, fontSize: 20, fontWeight: 600, color: '#FFFFFF', bg: true, bgColor: '#1a1a1a', bgPadding: 6 } as any),
    ]
  }),
  tpl({
    id: 'douyin-cook-2', name: '减脂餐', ratio: '9:16', category: '种草', platform: '抖音', layout: '新拟物',
    bg: '#32CD32', thumbnail: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#32CD32' }),
      text({ id: 'icon', content: '🥗', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '一周减脂餐', x: 50, y: 50, fontSize: 44, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '7 天不重样', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'douyin-cook-3', name: '甜品', ratio: '9:16', category: '种草', platform: '抖音', layout: '新拟物',
    bg: '#FFB6C1', thumbnail: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFB6C1' }),
      text({ id: 'icon', content: '🍮', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#8B0000' }),
      text({ id: 'main', content: '免烤箱甜品', x: 50, y: 50, fontSize: 44, fontWeight: 800, color: '#8B0000', shadow: true } as any),
      text({ id: 'sub', content: '新手友好', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#8B0000' }),
    ]
  }),
  tpl({
    id: 'douyin-cook-4', name: '早餐', ratio: '9:16', category: '教程', platform: '抖音', layout: '新拟物',
    bg: '#FFD700', thumbnail: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFD700' }),
      text({ id: 'icon', content: '🥞', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#8B4513' }),
      text({ id: 'main', content: '元气早餐', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#8B4513', shadow: true } as any),
      text({ id: 'sub', content: '5 分钟搞定', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#A0522D' }),
    ]
  }),
  tpl({
    id: 'douyin-cook-5', name: '饮品', ratio: '9:16', category: '种草', platform: '抖音', layout: '新拟物',
    bg: '#FF6347', thumbnail: 'linear-gradient(135deg, #FF6347 0%, #DC143C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF6347' }),
      text({ id: 'icon', content: '🥤', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '夏日饮品', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '在家做', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'douyin-fitness-1', name: '瘦肚子', ratio: '9:16', category: '教程', platform: '抖音', layout: '包豪斯',
    bg: '#FF1493', thumbnail: 'linear-gradient(135deg, #FF1493 0%, #C71585 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF1493' }),
      text({ id: 'icon', content: '💪', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '7 天', x: 50, y: 42, fontSize: 80, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', stroke: true, strokeWidth: 3, strokeColor: '#1a1a1a', shadow: true } as any),
      text({ id: 'sub', content: '瘦肚子', x: 50, y: 68, fontSize: 36, fontWeight: 700, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'douyin-fitness-2', name: '马甲线', ratio: '9:16', category: '教程', platform: '抖音', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #FF1493 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'tag', content: '🔥 30 天挑战', x: 50, y: 20, fontSize: 22, fontWeight: 700, color: '#FF1493' }),
      text({ id: 'main', content: '马甲线', x: 50, y: 50, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '7 个动作', x: 50, y: 75, fontSize: 24, fontWeight: 700, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'douyin-fitness-3', name: '瘦腿', ratio: '9:16', category: '教程', platform: '抖音', layout: '新拟物',
    bg: '#FF69B4', thumbnail: 'linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF69B4' }),
      text({ id: 'icon', content: '🦵', x: 50, y: 18, fontSize: 56, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '瘦腿', x: 50, y: 50, fontSize: 56, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '睡前 5 分钟', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#FFFFFF' }),
    ]
  }),
  tpl({
    id: 'douyin-fitness-4', name: '瑜伽', ratio: '9:16', category: '教程', platform: '抖音', layout: '新拟物',
    bg: '#9370DB', thumbnail: 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#9370DB' }),
      text({ id: 'icon', content: '🧘', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '睡前瑜伽', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '改善睡眠', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#E6E6FA' }),
    ]
  }),
  tpl({
    id: 'douyin-fitness-5', name: '增肌', ratio: '9:16', category: '教程', platform: '抖音', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #DC143C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'main', content: '增肌', x: 50, y: 38, fontSize: 72, fontWeight: 900, fontFamily: 'Impact', color: '#DC143C', letterSpacing: -2, shadow: true } as any),
      text({ id: 'sub', content: '从瘦子到型男', x: 50, y: 62, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }),
      text({ id: 'tag', content: '6 个月计划', x: 50, y: 88, fontSize: 18, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFD700', letterSpacing: 3 } as any),
    ]
  }),
  tpl({
    id: 'douyin-fun-1', name: '反转剧情', ratio: '9:16', category: '悬念钩子', platform: '抖音', layout: '包豪斯',
    bg: '#FFD700', thumbnail: 'linear-gradient(135deg, #FFD700 0%, #FF6347 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFD700' }),
      text({ id: 'tag', content: '万万没想到', x: 50, y: 22, fontSize: 28, fontWeight: 700, color: '#1a1a1a' }),
      text({ id: 'main', content: '结局是', x: 50, y: 50, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#1a1a1a', letterSpacing: -2 } as any),
      text({ id: 'sub', content: '你绝对猜不到', x: 50, y: 75, fontSize: 24, fontWeight: 700, color: '#DC143C' }),
    ]
  }),
  tpl({
    id: 'douyin-fun-2', name: '段子', ratio: '9:16', category: '情感', platform: '抖音', layout: '新拟物',
    bg: '#FF6B6B', thumbnail: 'linear-gradient(135deg, #FF6B6B 0%, #FF1493 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF6B6B' }),
      text({ id: 'icon', content: '😂', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '笑到肚子疼', x: 50, y: 50, fontSize: 44, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '10 个段子', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#FFE4E1' }),
    ]
  }),
  tpl({
    id: 'douyin-fun-3', name: '生活吐槽', ratio: '9:16', category: '情感', platform: '抖音', layout: '意大利',
    bg: '#FFEFD5', thumbnail: 'linear-gradient(135deg, #FFEFD5 0%, #FFB6C1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFEFD5' }),
      text({ id: 'q', content: '我', x: 50, y: 30, fontSize: 80, fontWeight: 700, fontFamily: 'PingFang SC', color: '#DC143C' } as any),
      text({ id: 'main', content: 'emo 了', x: 50, y: 65, fontSize: 64, fontWeight: 700, fontFamily: 'PingFang SC', color: '#1a1a1a' } as any),
      text({ id: 'sub', content: '你也有吗', x: 50, y: 88, fontSize: 20, fontWeight: 400, color: '#666' }),
    ]
  }),
  tpl({
    id: 'douyin-fun-4', name: '宠物', ratio: '9:16', category: '种草', platform: '抖音', layout: '新拟物',
    bg: '#FFA500', thumbnail: 'linear-gradient(135deg, #FFA500 0%, #FF6347 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFA500' }),
      text({ id: 'icon', content: '🐱', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '萌宠日常', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '看一次笑一次', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'douyin-fun-5', name: '情侣日常', ratio: '9:16', category: '情感', platform: '抖音', layout: '新拟物',
    bg: '#FFB6C1', thumbnail: 'linear-gradient(135deg, #FFB6C1 0%, #FF1493 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFB6C1' }),
      text({ id: 'icon', content: '💑', x: 50, y: 18, fontSize: 60, fontWeight: 400, color: '#8B0000' }),
      text({ id: 'main', content: '情侣日常', x: 50, y: 50, fontSize: 48, fontWeight: 800, color: '#8B0000', shadow: true } as any),
      text({ id: 'sub', content: '甜到掉牙', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#8B0000' }),
    ]
  }),
  tpl({
    id: 'douyin-know-1', name: '冷知识', ratio: '9:16', category: '知识', platform: '抖音', layout: '包豪斯',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'tag', content: '🧠 你不知道', x: 50, y: 20, fontSize: 22, fontWeight: 700, color: '#FFD700' }),
      text({ id: 'main', content: '10 个冷知识', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '看完长见识', x: 50, y: 75, fontSize: 22, fontWeight: 700, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'douyin-know-2', name: '科普', ratio: '9:16', category: '知识', platform: '抖音', layout: '瑞士',
    bg: '#FFFFFF', thumbnail: 'linear-gradient(135deg, #FFFFFF 0%, #00A1D6 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFFFFF' }),
      text({ id: 'tag', content: 'EDU.', x: 12, y: 10, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 3 } as any),
      text({ id: 'main', content: '硬核科普', x: 50, y: 45, fontSize: 52, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '1 分钟读懂', x: 50, y: 65, fontSize: 20, fontWeight: 400, fontFamily: 'Helvetica', color: '#00A1D6' }),
    ]
  }),
  tpl({
    id: 'douyin-know-3', name: '历史', ratio: '9:16', category: '知识', platform: '抖音', layout: '意大利',
    bg: '#8B4513', thumbnail: 'linear-gradient(135deg, #8B4513 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#8B4513' }),
      text({ id: 'main', content: '历史冷知识', x: 50, y: 50, fontSize: 44, fontWeight: 700, fontFamily: 'Georgia', color: '#FFD700', shadow: true } as any),
      text({ id: 'sub', content: '颠覆你的认知', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'douyin-know-4', name: '心理学', ratio: '9:16', category: '知识', platform: '抖音', layout: '新拟物',
    bg: '#9370DB', thumbnail: 'linear-gradient(135deg, #9370DB 0%, #4B0082 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#9370DB' }),
      text({ id: 'icon', content: '🧠', x: 50, y: 18, fontSize: 56, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '读心术', x: 50, y: 50, fontSize: 56, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '10 个心理学效应', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#E6E6FA' }),
    ]
  }),
  tpl({
    id: 'douyin-know-5', name: '财经', ratio: '9:16', category: '知识', platform: '抖音', layout: '瑞士',
    bg: '#0A0A0A', thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#0A0A0A' }),
      text({ id: 'tag', content: 'FINANCE', x: 12, y: 10, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFD700', letterSpacing: 4 } as any),
      text({ id: 'main', content: '财富自由', x: 50, y: 45, fontSize: 44, fontWeight: 900, fontFamily: 'Helvetica', color: '#FFFFFF', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '5 个核心认知', x: 50, y: 68, fontSize: 20, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFD700' }),
    ]
  }),

  // ========== B 站 20 套 ==========
  tpl({
    id: 'bili-tech-1', name: '手机评测', ratio: '16:9', category: '测评', subCategory: '数码', platform: 'B站', layout: '包豪斯',
    bg: '#00A1D6', thumbnail: 'linear-gradient(135deg, #00A1D6 0%, #005F8C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00A1D6' }),
      text({ id: 'tag', content: '📱 REVIEW', x: 50, y: 25, fontSize: 24, fontWeight: 700, fontFamily: 'Impact', color: '#FFFFFF' }),
      text({ id: 'main', content: '2026 旗舰', x: 50, y: 55, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '5 大横评', x: 50, y: 80, fontSize: 22, fontWeight: 700, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-tech-2', name: '笔记本电脑', ratio: '16:9', category: '测评', subCategory: '数码', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #00A1D6 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'tag', content: '💻 LAPTOP', x: 12, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#00A1D6' }),
      text({ id: 'main', content: '程序员笔记本', x: 50, y: 55, fontSize: 40, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '选购指南 2026', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-tech-3', name: '耳机', ratio: '16:9', category: '测评', subCategory: '数码', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #FB7299 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'tag', content: '🎧 AUDIO', x: 12, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#FB7299' }),
      text({ id: 'main', content: '降噪耳机', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '10 款横评', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-tech-4', name: '相机', ratio: '16:9', category: '测评', subCategory: '数码', platform: 'B站', layout: '意大利',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #D4AF37 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'icon', content: '📷', x: 50, y: 20, fontSize: 56, fontWeight: 400, color: '#D4AF37' }),
      text({ id: 'main', content: '微单相机', x: 50, y: 55, fontSize: 48, fontWeight: 700, fontFamily: 'Georgia', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '新手入门指南', x: 50, y: 82, fontSize: 22, fontWeight: 500, color: '#D4AF37' }),
    ]
  }),
  tpl({
    id: 'bili-tech-5', name: '智能家居', ratio: '16:9', category: '测评', subCategory: '数码', platform: 'B站', layout: '包豪斯',
    bg: '#2C3E50', thumbnail: 'linear-gradient(135deg, #2C3E50 0%, #00A1D6 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2C3E50' }),
      text({ id: 'tag', content: '🏠 SMART HOME', x: 12, y: 25, fontSize: 18, fontWeight: 700, fontFamily: 'Impact', color: '#00A1D6' }),
      text({ id: 'main', content: '全屋智能', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '5000 元方案', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-know-1', name: '科学原理', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'tag', content: '🔬 SCIENCE', x: 12, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#FFD700' }),
      text({ id: 'main', content: '硬核科普', x: 50, y: 55, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '10 个科学原理', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-know-2', name: '宇宙奥秘', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '包豪斯',
    bg: '#000000', thumbnail: 'linear-gradient(135deg, #000000 0%, #4169E1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#000000' }),
      text({ id: 'icon', content: '🌌', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: '宇宙奥秘', x: 50, y: 58, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '从大爆炸到今天', x: 50, y: 82, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-know-3', name: '生物', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '包豪斯',
    bg: '#228B22', thumbnail: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#228B22' }),
      text({ id: 'tag', content: '🧬 BIOLOGY', x: 12, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#FFFFFF' }),
      text({ id: 'main', content: '生命科学', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: 'DNA 到细胞', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-know-4', name: '数学之美', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '瑞士',
    bg: '#FFFFFF', thumbnail: 'linear-gradient(135deg, #FFFFFF 0%, #FFA500 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFFFFF' }),
      text({ id: 'no', content: 'π = 3.14159', x: 12, y: 15, fontSize: 16, fontWeight: 400, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 2 } as any),
      text({ id: 'main', content: '数学之美', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '从公式到宇宙', x: 50, y: 75, fontSize: 22, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFA500' }),
    ]
  }),
  tpl({
    id: 'bili-know-5', name: '哲学', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '意大利',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #9370DB 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'main', content: '哲学入门', x: 50, y: 50, fontSize: 52, fontWeight: 700, fontFamily: 'Georgia', color: '#FFFFFF', shadow: true, italic: true } as any),
      shape({ id: 'divider', shape: 'line', x: 50, y: 62, width: 30, height: 1, color: '#9370DB' } as any),
      text({ id: 'sub', content: '10 个核心问题', x: 50, y: 75, fontSize: 20, fontWeight: 400, fontFamily: 'Helvetica', color: '#E6E6FA', letterSpacing: 2 } as any),
    ]
  }),
  tpl({
    id: 'bili-anime-new-1', name: '新番导视', ratio: '16:9', category: '爆款标题', platform: 'B站', layout: '包豪斯',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'tag', content: '🗾 4 月新番', x: 50, y: 25, fontSize: 24, fontWeight: 700, fontFamily: 'Impact', color: '#FFD700' }),
      text({ id: 'main', content: '10 部神作', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '不容错过', x: 50, y: 80, fontSize: 22, fontWeight: 700, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-anime-2', name: '动漫解说', ratio: '16:9', category: '爆款标题', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #FF6B6B 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'icon', content: '⚔️', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FF6B6B' }),
      text({ id: 'main', content: '热血神作', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '全程高能', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-anime-3', name: 'COS 分享', ratio: '16:9', category: '种草', platform: 'B站', layout: '新拟物',
    bg: '#FF69B4', thumbnail: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF69B4' }),
      text({ id: 'icon', content: '👗', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: 'COS 正片', x: 50, y: 55, fontSize: 52, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '出片分享', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFE4E1' }),
    ]
  }),
  tpl({
    id: 'bili-anime-4', name: 'MAD', ratio: '16:9', category: '爆款标题', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #00FFFF 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'tag', content: '🎬 AMV', x: 12, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#00FFFF' }),
      text({ id: 'main', content: '神级剪辑', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '4 分钟燃爆', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#00FFFF' }),
    ]
  }),
  tpl({
    id: 'bili-anime-5', name: '游戏实况', ratio: '16:9', category: '爆款标题', platform: 'B站', layout: '包豪斯',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #00A1D6 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'tag', content: '🎮 GAMEPLAY', x: 12, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#FFD700' }),
      text({ id: 'main', content: '极限操作', x: 50, y: 55, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '全程高燃', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-doc-1', name: '自然纪录', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '意大利',
    bg: '#228B22', thumbnail: 'linear-gradient(135deg, #228B22 0%, #8B4513 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#228B22' }),
      text({ id: 'icon', content: '🦁', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: '我们的星球', x: 50, y: 55, fontSize: 44, fontWeight: 700, fontFamily: 'Georgia', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: 'BBC 出品', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'bili-doc-2', name: '历史', ratio: '16:9', category: '知识', subCategory: '科普', platform: 'B站', layout: '意大利',
    bg: '#8B4513', thumbnail: 'linear-gradient(135deg, #8B4513 0%, #1a1a1a 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#8B4513' }),
      text({ id: 'main', content: '历史那些事', x: 50, y: 50, fontSize: 48, fontWeight: 700, fontFamily: 'Georgia', color: '#FFD700', shadow: true } as any),
      shape({ id: 'divider', shape: 'line', x: 50, y: 62, width: 30, height: 1, color: '#FFD700' } as any),
      text({ id: 'sub', content: '颠覆你的认知', x: 50, y: 75, fontSize: 20, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'bili-doc-3', name: '美食纪录', ratio: '16:9', category: '种草', platform: 'B站', layout: '新拟物',
    bg: '#FF6347', thumbnail: 'linear-gradient(135deg, #FF6347 0%, #FFEFD5 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF6347' }),
      text({ id: 'icon', content: '🍜', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '风味人间', x: 50, y: 55, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '美食纪录片', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFEFD5' }),
    ]
  }),
  tpl({
    id: 'bili-doc-4', name: '人物传记', ratio: '16:9', category: '知识', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #D4AF37 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'tag', content: 'PROFILE', x: 12, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#D4AF37' }),
      text({ id: 'main', content: '传奇人物', x: 50, y: 55, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '改变世界的人', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#D4AF37' }),
    ]
  }),
  tpl({
    id: 'bili-doc-5', name: '战争史', ratio: '16:9', category: '知识', platform: 'B站', layout: '包豪斯',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #DC143C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'icon', content: '⚔️', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#DC143C' }),
      text({ id: 'main', content: '战争史话', x: 50, y: 55, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '深度还原', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#DC143C' }),
    ]
  }),

  // ========== 通用 15 套 ==========
  tpl({
    id: 'festival-1', name: '春节', ratio: '1:1', category: '爆款标题', platform: '通用', layout: '新拟物',
    bg: '#DC143C', thumbnail: 'linear-gradient(135deg, #DC143C 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#DC143C' }),
      text({ id: 'icon', content: '🧧', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: '新年快乐', x: 50, y: 55, fontSize: 48, fontWeight: 800, color: '#FFD700', shadow: true } as any),
      text({ id: 'sub', content: '2026 大吉', x: 50, y: 80, fontSize: 24, fontWeight: 500, color: '#FFFFFF' }),
    ]
  }),
  tpl({
    id: 'festival-2', name: '中秋', ratio: '1:1', category: '情感', platform: '通用', layout: '日式极简',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'icon', content: '🌕', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: '中秋团圆', x: 50, y: 55, fontSize: 44, fontWeight: 700, fontFamily: 'STKaiti', color: '#FFD700', letterSpacing: 4 } as any),
      text({ id: 'sub', content: '月满人团圆', x: 50, y: 80, fontSize: 22, fontWeight: 400, fontFamily: 'STKaiti', color: '#FFFFFF' }),
    ]
  }),
  tpl({
    id: 'festival-3', name: '圣诞', ratio: '1:1', category: '爆款标题', platform: '通用', layout: '新拟物',
    bg: '#228B22', thumbnail: 'linear-gradient(135deg, #228B22 0%, #DC143C 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#228B22' }),
      text({ id: 'icon', content: '🎄', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: 'Merry Xmas', x: 50, y: 55, fontSize: 40, fontWeight: 800, fontFamily: 'Georgia', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '2026 快乐', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'festival-4', name: '情人节', ratio: '1:1', category: '情感', platform: '通用', layout: '意大利',
    bg: '#FF1493', thumbnail: 'linear-gradient(135deg, #FF1493 0%, #FFB6C1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF1493' }),
      text({ id: 'icon', content: '💝', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: 'VALENTINE', x: 50, y: 55, fontSize: 36, fontWeight: 800, fontFamily: 'Georgia', color: '#FFFFFF', letterSpacing: 4, shadow: true } as any),
      text({ id: 'sub', content: '爱你每一天', x: 50, y: 80, fontSize: 22, fontWeight: 500, color: '#FFE4E1' }),
    ]
  }),
  tpl({
    id: 'festival-5', name: '双 11', ratio: '1:1', category: '数字震撼', platform: '通用', layout: '包豪斯',
    bg: '#FF6347', thumbnail: 'linear-gradient(135deg, #FF6347 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF6347' }),
      text({ id: 'icon', content: '🛒', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '双 11', x: 50, y: 50, fontSize: 72, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', letterSpacing: -2, shadow: true } as any),
      text({ id: 'sub', content: '5 折封顶', x: 50, y: 78, fontSize: 24, fontWeight: 700, color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'motiv-1', name: '早起打卡', ratio: '1:1', category: '情感', platform: '通用', layout: '日式极简',
    bg: '#FFEFD5', thumbnail: 'linear-gradient(135deg, #FFEFD5 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFEFD5' }),
      text({ id: 'icon', content: '☀️', x: 50, y: 25, fontSize: 56, fontWeight: 400, color: '#FF8C00' }),
      text({ id: 'main', content: '早安', x: 50, y: 58, fontSize: 48, fontWeight: 300, fontFamily: 'PingFang SC', color: '#1a1a1a' } as any),
      text({ id: 'sub', content: 'Day 30 / 100', x: 50, y: 80, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: '#666', letterSpacing: 3 } as any),
    ]
  }),
  tpl({
    id: 'motiv-2', name: '坚持', ratio: '1:1', category: '情感', platform: '通用', layout: '日式极简',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #FFFFFF 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'main', content: '自律即自由', x: 50, y: 45, fontSize: 40, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFFFFF', letterSpacing: 4 } as any),
      shape({ id: 'line', shape: 'line', x: 50, y: 58, width: 30, height: 1, color: '#FFFFFF' } as any),
      text({ id: 'sub', content: 'SELF-DISCIPLINE', x: 50, y: 70, fontSize: 16, fontWeight: 400, fontFamily: 'Helvetica', color: '#999', letterSpacing: 6 } as any),
    ]
  }),
  tpl({
    id: 'motiv-3', name: '勇气', ratio: '1:1', category: '情感', platform: '通用', layout: '新拟物',
    bg: '#FF6347', thumbnail: 'linear-gradient(135deg, #FF6347 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF6347' }),
      text({ id: 'icon', content: '💪', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#FFFFFF' }),
      text({ id: 'main', content: '勇往直前', x: 50, y: 55, fontSize: 48, fontWeight: 800, color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: 'BE BRAVE', x: 50, y: 80, fontSize: 18, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFD700', letterSpacing: 5 } as any),
    ]
  }),
  tpl({
    id: 'motiv-4', name: '梦想', ratio: '1:1', category: '情感', platform: '通用', layout: '意大利',
    bg: '#9370DB', thumbnail: 'linear-gradient(135deg, #9370DB 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#9370DB' }),
      text({ id: 'icon', content: '✨', x: 50, y: 22, fontSize: 56, fontWeight: 400, color: '#FFD700' }),
      text({ id: 'main', content: '心怀热爱', x: 50, y: 50, fontSize: 44, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFFFFF', shadow: true } as any),
      text({ id: 'sub', content: '奔赴山海', x: 50, y: 75, fontSize: 24, fontWeight: 400, fontFamily: 'PingFang SC', color: '#FFD700' }),
    ]
  }),
  tpl({
    id: 'motiv-5', name: '感恩', ratio: '1:1', category: '情感', platform: '通用', layout: '日式极简',
    bg: '#FFE4E1', thumbnail: 'linear-gradient(135deg, #FFE4E1 0%, #FFB6C1 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFE4E1' }),
      text({ id: 'main', content: '感恩', x: 50, y: 45, fontSize: 56, fontWeight: 300, fontFamily: 'STKaiti', color: '#1a1a1a', letterSpacing: 8 } as any),
      text({ id: 'sub', content: 'GRATITUDE', x: 50, y: 75, fontSize: 16, fontWeight: 400, fontFamily: 'Helvetica', color: '#666', letterSpacing: 6 } as any),
    ]
  }),
  tpl({
    id: 'biz-1', name: '产品发布', ratio: '1:1', category: '知识', platform: '通用', layout: '包豪斯',
    bg: '#0A0A0A', thumbnail: 'linear-gradient(135deg, #0A0A0A 0%, #3B7CFF 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#0A0A0A' }),
      text({ id: 'tag', content: 'NEW LAUNCH', x: 12, y: 10, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#3B7CFF', letterSpacing: 4 } as any),
      text({ id: 'main', content: '全新发布', x: 50, y: 45, fontSize: 48, fontWeight: 900, fontFamily: 'Helvetica', color: '#FFFFFF', letterSpacing: -1 } as any),
      text({ id: 'sub', content: 'NEXT GENERATION', x: 50, y: 70, fontSize: 18, fontWeight: 400, fontFamily: 'Helvetica', color: '#3B7CFF', letterSpacing: 4 } as any),
    ]
  }),
  tpl({
    id: 'biz-2', name: '数据报告', ratio: '1:1', category: '知识', platform: '通用', layout: '瑞士',
    bg: '#FFFFFF', thumbnail: 'linear-gradient(135deg, #FFFFFF 0%, #3B7CFF 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFFFFF' }),
      text({ id: 'tag', content: '2026', x: 12, y: 10, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#666', letterSpacing: 3 } as any),
      text({ id: 'main', content: '年度报告', x: 50, y: 45, fontSize: 48, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: -1 } as any),
      text({ id: 'sub', content: '100 个核心发现', x: 50, y: 70, fontSize: 20, fontWeight: 400, fontFamily: 'Helvetica', color: '#3B7CFF' }),
    ]
  }),
  tpl({
    id: 'biz-3', name: '招商', ratio: '1:1', category: '知识', platform: '通用', layout: '包豪斯',
    bg: '#D4AF37', thumbnail: 'linear-gradient(135deg, #D4AF37 0%, #1a1a1a 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#D4AF37' }),
      text({ id: 'main', content: '招商合作', x: 50, y: 45, fontSize: 48, fontWeight: 900, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 2 } as any),
      shape({ id: 'line', shape: 'line', x: 50, y: 60, width: 30, height: 1, color: '#1a1a1a' } as any),
      text({ id: 'sub', content: 'JOIN US · 2026', x: 50, y: 75, fontSize: 16, fontWeight: 400, fontFamily: 'Helvetica', color: '#1a1a1a', letterSpacing: 4 } as any),
    ]
  }),
  tpl({
    id: 'biz-4', name: '限时优惠', ratio: '1:1', category: '数字震撼', platform: '通用', layout: '包豪斯',
    bg: '#FF3B30', thumbnail: 'linear-gradient(135deg, #FF3B30 0%, #FFD700 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF3B30' }),
      text({ id: 'tag', content: '🔥 LIMITED', x: 12, y: 12, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#FFD700', letterSpacing: 4 } as any),
      text({ id: 'main', content: '24h', x: 50, y: 45, fontSize: 80, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', letterSpacing: -2, shadow: true } as any),
      text({ id: 'sub', content: '限时 5 折', x: 50, y: 78, fontSize: 24, fontWeight: 700, color: '#FFFFFF' }),
    ]
  }),
  tpl({
    id: 'biz-5', name: '品牌介绍', ratio: '1:1', category: '知识', platform: '通用', layout: '意大利',
    bg: '#1a1a1a', thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #D4AF37 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a1a' }),
      text({ id: 'brand', content: 'BRAND', x: 50, y: 35, fontSize: 28, fontWeight: 400, fontFamily: 'Helvetica', color: '#D4AF37', letterSpacing: 8 } as any),
      text({ id: 'main', content: '关于我们', x: 50, y: 60, fontSize: 36, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFFFFF' } as any),
      text({ id: 'sub', content: 'OUR STORY', x: 50, y: 82, fontSize: 14, fontWeight: 400, fontFamily: 'Helvetica', color: '#999', letterSpacing: 5 } as any),
    ]
  }),
]

// ============================================================
// 合并导出：手写 47 + 程序化 153 + 瑞士/斐波 20 + 扩展 80 = 300 套
// ============================================================
export const templates: Template[] = [...HANDCRAFTED, ...PROGRAMMATIC, ...SWISS_TEMPLATES, ...EXTENDED_TEMPLATES]

// 同步生成 templateColors（按 id → 缩略图）
export const templateColors: Record<string, string> = {}
templates.forEach(t => {
  templateColors[t.id] = t.thumbnail
})

export const proTemplates: typeof templates = []
export default templates
