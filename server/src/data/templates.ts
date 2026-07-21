import type { Template, TextElement, ShapeElement, Element } from '../types.js'

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
  layout: string
  bg: string
  thumbnail: string
  elements: Element[]
}): Template => ({
  id: cfg.id,
  name: cfg.name,
  ratio: cfg.ratio,
  category: cfg.category,
  layout: cfg.layout,
  thumbnail: cfg.thumbnail,
  elements: cfg.elements,
})

// ============================================================
// 渐变缩略图（前端预览用）
// ============================================================
export const templateColors: Record<string, string> = {}

// ============================================================
// 50 个模板
// ============================================================
export const templates: Template[] = [
  // ========== 抖音 (12 个) ==========
  tpl({
    id: 'douyin-hot-1', name: '大字冲击', ratio: '9:16', category: '抖音', layout: '悬念',
    bg: '#1a1a2e', thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e' }),
      text({ id: 'emoji', content: '🔥', x: 50, y: 20, fontSize: 72, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '一句话搞定', x: 50, y: 42, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#FF5E3A', stroke: true, strokeWidth: 4, strokeColor: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '副标题补充说明亮点', x: 50, y: 62, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'douyin-hot-2', name: '黑白冲击', ratio: '9:16', category: '抖音', layout: '震撼',
    bg: '#000000', thumbnail: 'linear-gradient(135deg, #2d3436 0%, #d63031 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#000000' }),
      text({ id: 'main', content: '震撼发布', x: 50, y: 45, fontSize: 68, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'douyin-tips-1', name: '3个技巧', ratio: '9:16', category: '抖音', layout: '清单',
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
    id: 'douyin-question-1', name: '灵魂拷问', ratio: '9:16', category: '抖音', layout: '提问',
    bg: '#f39c12', thumbnail: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#f39c12' }),
      text({ id: 'q', content: '❓', x: 50, y: 25, fontSize: 80, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '为什么你总是', x: 50, y: 50, fontSize: 42, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '做不到这一点？', x: 50, y: 70, fontSize: 42, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'douyin-number-1', name: '数字爆点', ratio: '9:16', category: '抖音', layout: '数据',
    bg: '#e74c3c', thumbnail: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#e74c3c' }),
      text({ id: 'big', content: '99%', x: 50, y: 38, fontSize: 120, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff' }),
      text({ id: 'sub', content: '的人都不知道', x: 50, y: 65, fontSize: 36, fontWeight: 700, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'douyin-secret-1', name: '秘密揭秘', ratio: '9:16', category: '抖音', layout: '揭秘',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'tag', content: '🔒 独家揭秘', x: 50, y: 25, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'main', content: '行业内幕', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '看了你就懂了', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'douyin-warning-1', name: '警示提醒', ratio: '9:16', category: '抖音', layout: '警告',
    bg: '#d63031', thumbnail: 'linear-gradient(135deg, #d63031 0%, #2d3436 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#d63031' }),
      text({ id: 'warn', content: '⚠️', x: 50, y: 22, fontSize: 72, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '千万别这样', x: 50, y: 50, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', stroke: true, strokeWidth: 2, strokeColor: '#000000' }),
      text({ id: 'sub', content: '否则后果严重', x: 50, y: 70, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-festival-1', name: '节日氛围', ratio: '9:16', category: '抖音', layout: '节日',
    bg: '#e17055', thumbnail: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#e17055' }),
      text({ id: 'emoji', content: '🎉', x: 50, y: 25, fontSize: 80, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '新年快乐', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'HAPPY NEW YEAR', x: 50, y: 72, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-tutorial-1', name: '教程合集', ratio: '9:16', category: '抖音', layout: '教学',
    bg: '#0984e3', thumbnail: 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#0984e3' }),
      text({ id: 'tag', content: '📚 零基础教程', x: 50, y: 22, fontSize: 24, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'main', content: '一学就会', x: 50, y: 48, fontSize: 60, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '5分钟搞定', x: 50, y: 70, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'douyin-vs-1', name: '对比测评', ratio: '9:16', category: '抖音', layout: '对比',
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
    id: 'douyin-challenge-1', name: '挑战话题', ratio: '9:16', category: '抖音', layout: '话题',
    bg: '#fd79a8', thumbnail: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fd79a8' }),
      text({ id: 'hashtag', content: '#挑战赛', x: 50, y: 25, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '7天挑战', x: 50, y: 50, fontSize: 60, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '你敢来吗？', x: 50, y: 72, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'douyin-story-1', name: '故事开篇', ratio: '9:16', category: '抖音', layout: '叙事',
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
    id: 'xiaohongshu-pure', name: '纯欲风', ratio: '3:4', category: '小红书', layout: '唯美',
    bg: '#ff9a9e', thumbnail: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ff9a9e' }),
      text({ id: 'main', content: '纯欲天花板', x: 50, y: 45, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '氛围感拍照技巧分享', x: 50, y: 62, fontSize: 20, fontWeight: 500, color: '#fad7de', italic: true }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-daily', name: '日常VLOG', ratio: '3:4', category: '小红书', layout: '清新',
    bg: '#a18cd1', thumbnail: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#a18cd1' }),
      text({ id: 'tag', content: '✨ VLOG ✨', x: 50, y: 28, fontSize: 24, fontWeight: 500, color: '#ffd700' }),
      text({ id: 'main', content: '记录美好日常', x: 50, y: 50, fontSize: 40, fontWeight: 700, color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-recipe-1', name: '美食菜谱', ratio: '3:4', category: '小红书', layout: '美食',
    bg: '#ff7675', thumbnail: 'linear-gradient(135deg, #ff7675 0%, #fab1a0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ff7675' }),
      text({ id: 'emoji', content: '🍰', x: 50, y: 22, fontSize: 72, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '懒人食谱', x: 50, y: 48, fontSize: 52, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '10分钟搞定', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-outfit-1', name: '穿搭分享', ratio: '3:4', category: '小红书', layout: '时尚',
    bg: '#fab1a0', thumbnail: 'linear-gradient(135deg, #fab1a0 0%, #ffeaa7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fab1a0' }),
      text({ id: 'tag', content: '👗 OOTD', x: 50, y: 25, fontSize: 28, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '今天穿什么', x: 50, y: 50, fontSize: 44, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '秋季穿搭灵感', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-travel-1', name: '旅行打卡', ratio: '3:4', category: '小红书', layout: '旅行',
    bg: '#74b9ff', thumbnail: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#74b9ff' }),
      text({ id: 'pin', content: '📍', x: 50, y: 22, fontSize: 60, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '云南大理', x: 50, y: 48, fontSize: 52, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '5天4晚攻略', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-skincare-1', name: '护肤种草', ratio: '3:4', category: '小红书', layout: '美妆',
    bg: '#fd79a8', thumbnail: 'linear-gradient(135deg, #fd79a8 0%, #fab1a0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fd79a8' }),
      text({ id: 'tag', content: '✨ 空瓶记', x: 50, y: 25, fontSize: 24, fontWeight: 500, color: '#ffeaa7' }),
      text({ id: 'main', content: '无限回购', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '亲测好物', x: 50, y: 72, fontSize: 24, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-fitness-1', name: '健身打卡', ratio: '3:4', category: '小红书', layout: '运动',
    bg: '#00b894', thumbnail: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00b894' }),
      text({ id: 'icon', content: '💪', x: 50, y: 25, fontSize: 60, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'main', content: '30天挑战', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '马甲线养成', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-mood-1', name: '情绪文案', ratio: '3:4', category: '小红书', layout: '情感',
    bg: '#a29bfe', thumbnail: 'linear-gradient(135deg, #a29bfe 0%, #dfe6e9 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#a29bfe' }),
      text({ id: 'q', content: '“', x: 35, y: 30, fontSize: 80, fontWeight: 400, fontFamily: 'Georgia', color: '#ffeaa7' }),
      text({ id: 'main', content: '愿你眼里有光', x: 50, y: 50, fontSize: 32, fontWeight: 500, color: '#ffffff' }),
      text({ id: 'sub', content: '心中有爱', x: 50, y: 68, fontSize: 32, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-study-1', name: '学习日常', ratio: '3:4', category: '小红书', layout: '学习',
    bg: '#ffeaa7', thumbnail: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ffeaa7' }),
      text({ id: 'icon', content: '📖', x: 50, y: 25, fontSize: 60, fontWeight: 400, color: '#2d3436' }),
      text({ id: 'main', content: '自律即自由', x: 50, y: 50, fontSize: 44, fontWeight: 700, color: '#2d3436' }),
      text({ id: 'sub', content: 'Study With Me', x: 50, y: 72, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#636e72', italic: true }),
    ]
  }),
  tpl({
    id: 'xiaohongshu-pm-1', name: '好物测评', ratio: '3:4', category: '小红书', layout: '测评',
    bg: '#fab1a0', thumbnail: 'linear-gradient(135deg, #fab1a0 0%, #ff7675 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fab1a0' }),
      text({ id: 'tag', content: '⭐ 真香预警', x: 50, y: 22, fontSize: 24, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '好物分享', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '亲测推荐', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),

  // ========== 公众号 (6 个) ==========
  tpl({
    id: 'wechat-simple', name: '简约商务', ratio: '1:1', category: '公众号', layout: '专业',
    bg: '#2c3e50', thumbnail: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2c3e50' }),
      text({ id: 'main', content: '品牌力量', x: 50, y: 45, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'BRAND POWER', x: 50, y: 62, fontSize: 18, fontWeight: 400, fontFamily: 'Arial', color: '#3498db' }),
    ]
  }),
  tpl({
    id: 'wechat-article-1', name: '深度好文', ratio: '1:1', category: '公众号', layout: '长文',
    bg: '#ecf0f1', thumbnail: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ecf0f1' }),
      shape({ id: 'accent', shape: 'rect', x: 12, y: 30, width: 4, height: 40, color: '#e74c3c' }),
      text({ id: 'main', content: '深度思考', x: 50, y: 38, fontSize: 42, fontWeight: 900, color: '#2c3e50' }),
      text({ id: 'sub', content: '在这个喧嚣的时代', x: 50, y: 62, fontSize: 20, fontWeight: 400, color: '#7f8c8d' }),
    ]
  }),
  tpl({
    id: 'wechat-news-1', name: '行业资讯', ratio: '1:1', category: '公众号', layout: '资讯',
    bg: '#34495e', thumbnail: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#34495e' }),
      text({ id: 'tag', content: '📰 行业洞察', x: 50, y: 25, fontSize: 22, fontWeight: 700, color: '#f39c12' }),
      text({ id: 'main', content: '2026趋势', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'AI 时代的变革', x: 50, y: 72, fontSize: 20, fontWeight: 500, color: '#ecf0f1' }),
    ]
  }),
  tpl({
    id: 'wechat-interview-1', name: '人物访谈', ratio: '1:1', category: '公众号', layout: '访谈',
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
    id: 'wechat-classic-1', name: '国学经典', ratio: '1:1', category: '公众号', layout: '文化',
    bg: '#c0392b', thumbnail: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#c0392b' }),
      text({ id: 'main', content: '君子以文', x: 50, y: 42, fontSize: 52, fontWeight: 900, fontFamily: 'STKaiti', color: '#ffffff' }),
      text({ id: 'sub', content: '会友 以友辅仁', x: 50, y: 64, fontSize: 24, fontWeight: 500, fontFamily: 'STKaiti', color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'wechat-tech-1', name: '科技前沿', ratio: '1:1', category: '公众号', layout: '科技',
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
    id: 'bilibili-tech', name: '科技测评', ratio: '16:9', category: 'B站', layout: '炫酷',
    bg: '#00c6fb', thumbnail: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00c6fb' }),
      text({ id: 'main', content: '新品首发测评', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'bilibili-game-1', name: '游戏实况', ratio: '16:9', category: 'B站', layout: '游戏',
    bg: '#2d3436', thumbnail: 'linear-gradient(135deg, #2d3436 0%, #6c5ce7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2d3436' }),
      text({ id: 'tag', content: '🎮 GAMEPLAY', x: 50, y: 25, fontSize: 24, fontWeight: 700, fontFamily: 'Impact', color: '#fdcb6e' }),
      text({ id: 'main', content: '高光时刻', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'EP. 128', x: 50, y: 75, fontSize: 20, fontWeight: 400, fontFamily: 'Arial', color: '#74b9ff' }),
    ]
  }),
  tpl({
    id: 'bilibili-anime-1', name: '动漫解说', ratio: '16:9', category: 'B站', layout: '动漫',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'tag', content: '🗾 ANIME', x: 50, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#ffeaa7' }),
      text({ id: 'main', content: '神作推荐', x: 50, y: 50, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '2026 必看', x: 50, y: 75, fontSize: 20, fontWeight: 500, color: '#fab1a0' }),
    ]
  }),
  tpl({
    id: 'bilibili-knowledge-1', name: '知识科普', ratio: '16:9', category: 'B站', layout: '知识',
    bg: '#00b894', thumbnail: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#00b894' }),
      text({ id: 'tag', content: '🧠 硬核科普', x: 50, y: 25, fontSize: 24, fontWeight: 700, color: '#ffffff' }),
      text({ id: 'main', content: '一分钟读懂', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '复杂概念简单化', x: 50, y: 75, fontSize: 20, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'bilibili-vlog-1', name: '生活记录', ratio: '16:9', category: 'B站', layout: 'VLOG',
    bg: '#fab1a0', thumbnail: 'linear-gradient(135deg, #fab1a0 0%, #ffeaa7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fab1a0' }),
      text({ id: 'tag', content: '🌅 DAILY VLOG', x: 50, y: 25, fontSize: 22, fontWeight: 400, fontFamily: 'Georgia', color: '#ffffff' }),
      text({ id: 'main', content: '我的日常', x: 50, y: 50, fontSize: 56, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '慢生活分享', x: 50, y: 75, fontSize: 20, fontWeight: 400, color: '#ffffff' }),
    ]
  }),

  // ========== Instagram (4 个) ==========
  tpl({
    id: 'ins-square', name: 'INS风', ratio: '1:1', category: 'Instagram', layout: '极简',
    bg: '#f093fb', thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#f093fb' }),
      text({ id: 'main', content: 'LIFE STYLE', x: 50, y: 45, fontSize: 36, fontWeight: 300, fontFamily: 'Georgia', color: '#ffffff', italic: true, shadow: true }),
      text({ id: 'sub', content: '生活美学', x: 50, y: 62, fontSize: 24, fontWeight: 400, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'ins-quote-1', name: '格言金句', ratio: '1:1', category: 'Instagram', layout: '金句',
    bg: '#2d3436', thumbnail: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2d3436' }),
      text({ id: 'main', content: 'Stay Hungry', x: 50, y: 45, fontSize: 38, fontWeight: 300, fontFamily: 'Georgia', color: '#ffeaa7', italic: true }),
      text({ id: 'sub', content: 'Stay Foolish', x: 50, y: 62, fontSize: 38, fontWeight: 300, fontFamily: 'Georgia', color: '#ffffff', italic: true }),
    ]
  }),
  tpl({
    id: 'ins-fashion-1', name: '时尚潮流', ratio: '1:1', category: 'Instagram', layout: '时尚',
    bg: '#000000', thumbnail: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#000000' }),
      text({ id: 'tag', content: 'F/W 2026', x: 50, y: 25, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: '#d4af37' }),
      text({ id: 'main', content: 'FASHION', x: 50, y: 50, fontSize: 56, fontWeight: 300, fontFamily: 'Georgia', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'NEW COLLECTION', x: 50, y: 70, fontSize: 16, fontWeight: 400, fontFamily: 'Arial', color: '#d4af37' }),
    ]
  }),
  tpl({
    id: 'ins-mood-1', name: '情绪人像', ratio: '1:1', category: 'Instagram', layout: '人像',
    bg: '#6c5ce7', thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#6c5ce7' }),
      text({ id: 'main', content: 'Mood', x: 50, y: 45, fontSize: 60, fontWeight: 300, fontFamily: 'Georgia', color: '#ffffff', italic: true, shadow: true }),
      text({ id: 'sub', content: '色彩的情绪表达', x: 50, y: 65, fontSize: 18, fontWeight: 400, color: '#ffeaa7' }),
    ]
  }),

  // ========== 日签 / 文案 (4 个) ==========
  tpl({
    id: 'morning-quote', name: '早安日签', ratio: '9:16', category: '日签', layout: '治愈',
    bg: '#89f7fe', thumbnail: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#89f7fe' }),
      text({ id: 'emoji', content: '☀️', x: 50, y: 30, fontSize: 64, fontWeight: 400, color: '#ffffff' }),
      text({ id: 'greeting', content: '早安', x: 50, y: 50, fontSize: 48, fontWeight: 300, color: '#2d3436' }),
      text({ id: 'quote', content: '今天也是美好的一天', x: 50, y: 70, fontSize: 22, fontWeight: 400, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'night-quote-1', name: '晚安日签', ratio: '9:16', category: '日签', layout: '治愈',
    bg: '#2c3e50', thumbnail: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2c3e50' }),
      text({ id: 'moon', content: '🌙', x: 50, y: 30, fontSize: 64, fontWeight: 400, color: '#ffeaa7' }),
      text({ id: 'main', content: '晚安', x: 50, y: 50, fontSize: 48, fontWeight: 300, color: '#ffffff' }),
      text({ id: 'sub', content: '愿你有个好梦', x: 50, y: 70, fontSize: 22, fontWeight: 400, color: '#dfe6e9' }),
    ]
  }),
  tpl({
    id: 'quote-daily-1', name: '每日一言', ratio: '9:16', category: '日签', layout: '金句',
    bg: '#f5f5f5', thumbnail: 'linear-gradient(135deg, #f5f5f5 0%, #d4d4d4 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#f5f5f5' }),
      text({ id: 'date', content: '2026.07.21', x: 50, y: 25, fontSize: 18, fontWeight: 400, fontFamily: 'Georgia', color: '#95a5a6' }),
      text({ id: 'main', content: '心怀热爱\n奔赴山海', x: 50, y: 50, fontSize: 44, fontWeight: 700, color: '#2c3e50' }),
      text({ id: 'sub', content: '—— 致每一个努力的人', x: 50, y: 80, fontSize: 18, fontWeight: 400, fontFamily: 'STKaiti', color: '#7f8c8d' }),
    ]
  }),
  tpl({
    id: 'story-dark', name: '深色故事', ratio: '9:16', category: '通用', layout: '高级',
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
    id: 'live-hot', name: '直播预告', ratio: '9:16', category: '直播', layout: '醒目',
    bg: '#e74c3c', thumbnail: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#e74c3c' }),
      text({ id: 'tag', content: '🔴 LIVE', x: 50, y: 25, fontSize: 28, fontWeight: 700, fontFamily: 'Impact', color: '#ffd700' }),
      text({ id: 'main', content: '今晚 8 点', x: 50, y: 50, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '我们不见不散', x: 50, y: 72, fontSize: 24, fontWeight: 700, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'live-flash-1', name: '闪购秒杀', ratio: '9:16', category: '直播', layout: '促销',
    bg: '#ff4757', thumbnail: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ff4757' }),
      text({ id: 'tag', content: '⚡ 限时秒杀', x: 50, y: 22, fontSize: 28, fontWeight: 700, color: '#ffeaa7' }),
      text({ id: 'price', content: '¥99', x: 50, y: 48, fontSize: 96, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '原价 ¥299', x: 50, y: 75, fontSize: 22, fontWeight: 500, color: '#ffffff' }),
    ]
  }),
  tpl({
    id: 'live-teach-1', name: '直播教学', ratio: '9:16', category: '直播', layout: '教学',
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
    id: 'product-show', name: '产品展示', ratio: '3:4', category: '电商', layout: '极简',
    bg: '#43e97b', thumbnail: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#43e97b' }),
      text({ id: 'tag', content: '🔥 NEW ARRIVAL', x: 50, y: 25, fontSize: 20, fontWeight: 700, fontFamily: 'Impact', color: '#ffffff' }),
      text({ id: 'main', content: '新品上市', x: 50, y: 48, fontSize: 48, fontWeight: 900, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '限时特惠 立即抢购', x: 50, y: 68, fontSize: 20, fontWeight: 500, color: '#ffd700' }),
    ]
  }),
  tpl({
    id: 'sale-1', name: '超值特惠', ratio: '1:1', category: '电商', layout: '促销',
    bg: '#ee5a6f', thumbnail: 'linear-gradient(135deg, #ee5a6f 0%, #f29263 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ee5a6f' }),
      text({ id: 'tag', content: '🎁 SUPER SALE', x: 50, y: 25, fontSize: 22, fontWeight: 700, fontFamily: 'Impact', color: '#ffeaa7' }),
      text({ id: 'main', content: '全场5折', x: 50, y: 55, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
    ]
  }),
  tpl({
    id: 'review-1', name: '用户好评', ratio: '3:4', category: '电商', layout: '证言',
    bg: '#fa8072', thumbnail: 'linear-gradient(135deg, #fa8072 0%, #ffa07a 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fa8072' }),
      text({ id: 'stars', content: '⭐⭐⭐⭐⭐', x: 50, y: 25, fontSize: 36, fontWeight: 400, color: '#ffeaa7' }),
      text({ id: 'main', content: '真实好评', x: 50, y: 50, fontSize: 48, fontWeight: 700, color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '10000+ 用户的选择', x: 50, y: 72, fontSize: 22, fontWeight: 500, color: '#ffeaa7' }),
    ]
  }),
  tpl({
    id: 'membership-1', name: '会员招募', ratio: '1:1', category: '电商', layout: '会员',
    bg: '#1e1e1e', thumbnail: 'linear-gradient(135deg, #1e1e1e 0%, #434343 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1e1e1e' }),
      text({ id: 'tag', content: '👑 VIP', x: 50, y: 25, fontSize: 32, fontWeight: 700, fontFamily: 'Impact', color: '#d4af37' }),
      text({ id: 'main', content: '尊享会员', x: 50, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: '专享特权', x: 50, y: 72, fontSize: 22, fontWeight: 400, color: '#d4af37' }),
    ]
  }),

  // ========== 通用/极简 (2 个) ==========
  tpl({
    id: 'minimal-white-1', name: '极简白', ratio: '1:1', category: '通用', layout: '极简',
    bg: '#fafafa', thumbnail: 'linear-gradient(135deg, #fafafa 0%, #e0e0e0 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fafafa' }),
      shape({ id: 'line', shape: 'line', x: 50, y: 40, width: 30, height: 1, color: '#000000' }),
      text({ id: 'main', content: 'LESS IS MORE', x: 50, y: 55, fontSize: 28, fontWeight: 300, fontFamily: 'Georgia', color: '#000000' }),
      text({ id: 'sub', content: '少即是多', x: 50, y: 70, fontSize: 18, fontWeight: 400, fontFamily: 'STKaiti', color: '#666666' }),
    ]
  }),
  tpl({
    id: 'gradient-neon-1', name: '霓虹渐变', ratio: '9:16', category: '通用', layout: '潮流',
    bg: '#5856d6', thumbnail: 'linear-gradient(135deg, #5856d6 0%, #ff2d55 100%)',
    elements: [
      shape({ id: 'bg', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#5856d6' }),
      text({ id: 'main', content: 'NEON', x: 50, y: 45, fontSize: 72, fontWeight: 900, fontFamily: 'Impact', color: '#ffffff', shadow: true }),
      text({ id: 'sub', content: 'VIBES', x: 50, y: 65, fontSize: 36, fontWeight: 300, fontFamily: 'Georgia', color: '#ffeaa7', italic: true }),
    ]
  }),
]

// 同步生成 templateColors（按 id → 缩略图）
templates.forEach(t => {
  templateColors[t.id] = t.thumbnail
})

export const proTemplates: typeof templates = []
export default templates
