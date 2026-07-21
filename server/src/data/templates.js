// 热门短视频封面模板 - 全离线内置
const templates = [
  // ===== 抖音爆款风格 =====
  {
    id: 'douyin-001',
    name: '抖音大字标题',
    ratio: '9:16',
    category: '抖音',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1a1a2e', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '🔥 标题在这里', x: 50, y: 40, fontSize: 72, fontWeight: 900, fontFamily: 'Arial Black', color: '#FF5E3A', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#ffffff', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '副标题吸引点击', x: 50, y: 55, fontSize: 36, fontWeight: 700, fontFamily: 'Arial', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
  {
    id: 'douyin-002',
    name: '对比反差',
    ratio: '9:16',
    category: '抖音',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#0f0f0f', rotation: 0, opacity: 1 },
      { id: 'before', type: 'text', content: '❌ 以前', x: 25, y: 45, fontSize: 48, fontWeight: 700, fontFamily: 'Arial', color: '#888888', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'vs', type: 'text', content: 'VS', x: 50, y: 45, fontSize: 56, fontWeight: 900, fontFamily: 'Arial Black', color: '#FF5E3A', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'after', type: 'text', content: '✅ 现在', x: 75, y: 45, fontSize: 48, fontWeight: 700, fontFamily: 'Arial', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
  {
    id: 'douyin-003',
    name: '数字干货',
    ratio: '9:16',
    category: '抖音',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#2d3436', rotation: 0, opacity: 1 },
      { id: 'number', type: 'text', content: '7', x: 50, y: 30, fontSize: 120, fontWeight: 900, fontFamily: 'Arial Black', color: '#FF5E3A', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '个技巧提升10倍效率', x: 50, y: 50, fontSize: 42, fontWeight: 700, fontFamily: 'Arial', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
  {
    id: 'douyin-004',
    name: '悬念提问',
    ratio: '9:16',
    category: '抖音',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1e3799', rotation: 0, opacity: 1 },
      { id: 'emoji', type: 'text', content: '🤔', x: 50, y: 25, fontSize: 80, fontWeight: 400, fontFamily: 'Arial', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '为什么你总是...', x: 50, y: 45, fontSize: 52, fontWeight: 900, fontFamily: 'Arial Black', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '99%的人都不知道', x: 50, y: 60, fontSize: 32, fontWeight: 400, fontFamily: 'Arial', color: '#ffd32a', textAlign: 'center', italic: true, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ===== 小红书风格 =====
  {
    id: 'xiaohongshu-001',
    name: '小红书ins风',
    ratio: '3:4',
    category: '小红书',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#f8f9fa', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '✨ 今日分享', x: 50, y: 35, fontSize: 56, fontWeight: 700, fontFamily: 'Arial', color: '#333333', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'tag', type: 'text', content: '#干货分享 #收藏', x: 50, y: 70, fontSize: 28, fontWeight: 400, fontFamily: 'Arial', color: '#FF5E3A', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
  {
    id: 'xiaohongshu-002',
    name: '真实测评',
    ratio: '3:4',
    category: '小红书',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#ffffff', rotation: 0, opacity: 1 },
      { id: 'badge', type: 'text', content: '🔥 真实测评', x: 50, y: 20, fontSize: 36, fontWeight: 700, fontFamily: 'Arial', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: true, bgColor: '#FF5E3A', bgPadding: 12, rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '谁用谁知道！', x: 50, y: 50, fontSize: 52, fontWeight: 900, fontFamily: 'Arial Black', color: '#333333', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ===== B站风格 =====
  {
    id: 'bilibili-001',
    name: 'B站鬼畜封面',
    ratio: '16:9',
    category: 'B站',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#fb7299', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '这才叫标题！', x: 50, y: 45, fontSize: 64, fontWeight: 900, fontFamily: 'Arial Black', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '看完直接三连', x: 50, y: 65, fontSize: 36, fontWeight: 700, fontFamily: 'Arial', color: '#000000', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ===== 通用 =====
  {
    id: 'common-001',
    name: '黑底白字',
    ratio: '9:16',
    category: '通用',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#000000', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '双击编辑标题', x: 50, y: 50, fontSize: 64, fontWeight: 900, fontFamily: 'Arial Black', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
  {
    id: 'common-002',
    name: '橙红热点',
    ratio: '9:16',
    category: '通用',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FF5E3A', rotation: 0, opacity: 1 },
      { id: 'hot', type: 'text', content: '🔥 HOT', x: 50, y: 30, fontSize: 42, fontWeight: 700, fontFamily: 'Arial', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '热点标题', x: 50, y: 55, fontSize: 60, fontWeight: 900, fontFamily: 'Arial Black', color: '#ffffff', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 2, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
]

module.exports = { templates }
