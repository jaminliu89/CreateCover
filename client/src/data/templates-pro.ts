// ========================================
// 🔥 黄油相机小红书爆款封面模板库
// ========================================
// 包含：大字标题、人物抠图+描边、贴纸标签、渐变背景等

export interface Template {
  id: string
  name: string
  ratio: string
  category: string
  layout: string
  elements: any[]
}

export const proTemplates: Template[] = [
  // ========================================
  // 🎯 旅游攻略类模板
  // ========================================
  
  {
    id: 'tour-001',
    name: '三天两晚攻略',
    ratio: '3:4',
    category: '旅游攻略',
    layout: '大字冲击',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#87CEEB', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '三天两晚攻略', x: 50, y: 35, fontSize: 72, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFE66D', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 6, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '➡️ 新手直接抄作业', x: 50, y: 50, fontSize: 40, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'tag1', type: 'text', content: '不绕道 不踩雷', x: 50, y: 68, fontSize: 56, fontWeight: 900, fontFamily: 'PingFang SC', color: '#EE6A50', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'location', type: 'text', content: '📍北京', x: 30, y: 85, fontSize: 48, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FF6B35', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ========================================
  // 💼 职场成长类模板
  // ========================================
  
  {
    id: 'career-001',
    name: '晋升答辩',
    ratio: '3:4',
    category: '职场成长',
    layout: '左右结构',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#1A1A2E', rotation: 0, opacity: 1 },
      { id: 'title1', type: 'text', content: '晋 升', x: 50, y: 18, fontSize: 96, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title2', type: 'text', content: '答 辩', x: 50, y: 45, fontSize: 96, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '3分钟讲清楚你的核心价值', x: 50, y: 62, fontSize: 24, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFE66D', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  {
    id: 'career-002',
    name: '赚钱思路',
    ratio: '3:4',
    category: '职场成长',
    layout: '左文右图',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFB6C1', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '赚钱思路', x: 50, y: 25, fontSize: 56, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FF69B4', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '从月光到存下钱', x: 50, y: 38, fontSize: 28, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'point1', type: 'text', content: '✅ 轻量起步', x: 35, y: 52, fontSize: 20, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF1493', textAlign: 'left', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'point2', type: 'text', content: '✅ 聚焦变现', x: 35, y: 62, fontSize: 20, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF1493', textAlign: 'left', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'point3', type: 'text', content: '✅ 持续迭代', x: 35, y: 72, fontSize: 20, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF1493', textAlign: 'left', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'bottom', type: 'text', content: '💰普通人可复制的存钱逻辑', x: 50, y: 88, fontSize: 36, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFD700', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ========================================
  // 🧠 知识干货类模板
  // ========================================
  
  {
    id: 'knowledge-001',
    name: '5个步骤',
    ratio: '3:4',
    category: '知识干货',
    layout: '数字清单',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#D3D3D3', rotation: 0, opacity: 1 },
      { id: 'number', type: 'text', content: '5个步骤', x: 25, y: 20, fontSize: 72, fontWeight: 900, fontFamily: 'Impact', color: '#FFE66D', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '助你摆脱焦虑', x: 35, y: 50, fontSize: 48, fontWeight: 900, fontFamily: 'PingFang SC', color: '#333333', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'tag', type: 'text', content: '粉碎内耗❌', x: 85, y: 38, fontSize: 24, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF6B35', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  {
    id: 'knowledge-002',
    name: '装修避坑指南',
    ratio: '3:4',
    category: '知识干货',
    layout: '大字+副标题',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#F5DEB3', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '装修避坑指南', x: 50, y: 25, fontSize: 52, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FF6B35', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '都是过来人的忠告', x: 50, y: 40, fontSize: 32, fontWeight: 700, fontFamily: 'PingFang SC', color: '#333333', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'tip', type: 'text', content: '⚠️装修前必看', x: 65, y: 55, fontSize: 28, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF4500', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: true, bgColor: '#FFFFFF', bgPadding: 8, rotation: 0, opacity: 1 },
      { id: 'point1', type: 'text', content: '✅消费陷阱', x: 18, y: 70, fontSize: 20, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF6B35', textAlign: 'left', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'point2', type: 'text', content: '✅复杂装饰', x: 18, y: 78, fontSize: 20, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF6B35', textAlign: 'left', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'point3', type: 'text', content: '✅美丽废物', x: 18, y: 86, fontSize: 20, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF6B35', textAlign: 'left', italic: false, underline: false, stroke: false, shadow: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ========================================
  // 💔 情感共鸣类模板
  // ========================================
  
  {
    id: 'emotion-001',
    name: '停止内耗',
    ratio: '3:4',
    category: '情感共鸣',
    layout: '大字居中',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#DEB887', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '停止内耗', x: 50, y: 25, fontSize: 64, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFE4B5', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#8B4513', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle1', type: 'text', content: '3个秘诀', x: 68, y: 35, fontSize: 28, fontWeight: 900, fontFamily: 'Impact', color: '#FFE4B5', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#8B4513', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle2', type: 'text', content: '恢复好状态', x: 68, y: 45, fontSize: 28, fontWeight: 700, fontFamily: 'PingFang SC', color: '#8B4513', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'bottom', type: 'text', content: '凡事看得开 生活才能嗨', x: 50, y: 65, fontSize: 32, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 2, strokeColor: '#8B4513', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  {
    id: 'emotion-002',
    name: '远离内耗',
    ratio: '3:4',
    category: '情感共鸣',
    layout: '标签装饰',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFB6C1', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '远离「内耗」', x: 50, y: 22, fontSize: 64, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FF1493', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '3步教你', x: 15, y: 35, fontSize: 32, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FF1493', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'bottom', type: 'text', content: '抛掉 敏感心理', x: 30, y: 75, fontSize: 40, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FF69B4', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ========================================
  // 🎓 教育留学类模板
  // ========================================
  
  {
    id: 'education-001',
    name: '留学避坑',
    ratio: '3:4',
    category: '教育留学',
    layout: '人物+大字',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#87CEFA', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '留学避坑', x: 50, y: 25, fontSize: 64, fontWeight: 900, fontFamily: 'Impact', color: '#FFD700', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#FF0000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '一句话讲透彻', x: 70, y: 42, fontSize: 36, fontWeight: 700, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 2, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'bottom', type: 'text', content: '行前注意事项', x: 70, y: 55, fontSize: 48, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFD700', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  {
    id: 'education-002',
    name: '雅思自学9分',
    ratio: '3:4',
    category: '教育留学',
    layout: '左右文字',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#DEB887', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '雅思听力&阅读', x: 50, y: 20, fontSize: 40, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#8B4513', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '如何自学9分', x: 50, y: 32, fontSize: 52, fontWeight: 900, fontFamily: 'Impact', color: '#FFD700', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 4, strokeColor: '#8B4513', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'tip', type: 'text', content: '3招教你无痛学习！', x: 50, y: 75, fontSize: 36, fontWeight: 900, fontFamily: 'PingFang SC', color: '#FFD700', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#8B4513', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  // ========================================
  // ☀️ 生活日常类模板
  // ========================================
  
  {
    id: 'life-001',
    name: '夏日底妆',
    ratio: '3:4',
    category: '生活美妆',
    layout: '清新夏日',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#F0E68C', rotation: 0, opacity: 1 },
      { id: 'summer', type: 'text', content: 'SUMMER', x: 75, y: 18, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#40E0D0', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '夏日', x: 68, y: 35, fontSize: 48, fontWeight: 900, fontFamily: 'Impact', color: '#FF8C00', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: 'Long lasting!!', x: 75, y: 45, fontSize: 24, fontWeight: 700, fontFamily: 'Impact', color: '#FF8C00', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'bottom', type: 'text', content: '持久底妆', x: 75, y: 75, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#FF8C00', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },

  {
    id: 'life-002',
    name: 'i人的放风日',
    ratio: '3:4',
    category: '生活美妆',
    layout: '可爱清新',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#87CEEB', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: 'i人的', x: 78, y: 22, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#FF69B4', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title2', type: 'text', content: '放风日', x: 78, y: 38, fontSize: 56, fontWeight: 900, fontFamily: 'Impact', color: '#FF69B4', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 3, strokeColor: '#FFFFFF', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'subtitle', type: 'text', content: '周末一个人出门', x: 72, y: 55, fontSize: 32, fontWeight: 700, fontFamily: 'PingFang SC', color: '#4169E1', textAlign: 'center', italic: false, underline: false, stroke: false, shadow: false, bg: true, bgColor: '#FFFFFF', bgPadding: 8, rotation: 0, opacity: 1 },
    ]
  },

  {
    id: 'life-003',
    name: '炸消息',
    ratio: '3:4',
    category: '生活美妆',
    layout: '大字爆炸',
    elements: [
      { id: 'bg', type: 'shape', shape: 'overlay', x: 50, y: 50, width: 100, height: 100, color: '#FFE66D', rotation: 0, opacity: 1 },
      { id: 'title', type: 'text', content: '爆炸', x: 50, y: 22, fontSize: 80, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 8, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title2', type: 'text', content: 'BOOM', x: 50, y: 45, fontSize: 72, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 8, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
      { id: 'title3', type: 'text', content: '消息', x: 50, y: 68, fontSize: 80, fontWeight: 900, fontFamily: 'Impact', color: '#FFFFFF', textAlign: 'center', italic: false, underline: false, stroke: true, strokeWidth: 8, strokeColor: '#000000', shadow: true, bg: false, bgPadding: 0, rotation: 0, opacity: 1 },
    ]
  },
]

export const categoryColors: Record<string, string> = {
  '旅游攻略': 'bg-green-500',
  '职场成长': 'bg-blue-500',
  '知识干货': 'bg-yellow-500',
  '情感共鸣': 'bg-pink-500',
  '教育留学': 'bg-purple-500',
  '生活美妆': 'bg-orange-500',
}

export default proTemplates
