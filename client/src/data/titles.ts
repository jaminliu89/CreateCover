// ============================================================
// 预生成爆款标题库（内嵌在程序中，不依赖 LLM / 外部 API）
//
// 设计思路：把短视频 / 公众号 / 小红书等平台的"爆款公式"硬编码下来，
// 按 8 大内容类型分组，每个标题带 CTR 预测分数 + 标签。
// 用户直接点选应用到画布，0 网络成本、0 token、即时反馈。
//
// 数据来源：基于历史爆款标题的共性规律整理。
// ============================================================

export interface TitleItem {
  id: string
  content: string
  category: string       // 8 大类型
  ctr: number            // CTR 预测分数 (50-99)
  tags: string[]         // 风格标签
  emoji?: string         // 推荐 emoji（可选）
}

// 8 大内容类型 + 预生成标题池（120+ 条）
export const titleLibrary: TitleItem[] = [
  // ========== 🔥 爆款标题（20） ==========
  { id: 'hot-01', content: '99%人不知道的真相', category: '爆款标题', ctr: 92, tags: ['爆款', '悬念'], emoji: '❓' },
  { id: 'hot-02', content: '震撼发布！', category: '爆款标题', ctr: 88, tags: ['爆款', '冲击'], emoji: '🚀' },
  { id: 'hot-03', content: '建议收藏', category: '爆款标题', ctr: 90, tags: ['爆款', '实用'] },
  { id: 'hot-04', content: '不建议看第二遍', category: '爆款标题', ctr: 87, tags: ['爆款', '悬疑'] },
  { id: 'hot-05', content: '深度好文', category: '爆款标题', ctr: 85, tags: ['爆款', '知识'] },
  { id: 'hot-06', content: '全网最全整理', category: '爆款标题', ctr: 89, tags: ['爆款', '清单'] },
  { id: 'hot-07', content: '建议全文背诵', category: '爆款标题', ctr: 86, tags: ['爆款', '干货'] },
  { id: 'hot-08', content: '一文读懂', category: '爆款标题', ctr: 84, tags: ['爆款', '知识'] },
  { id: 'hot-09', content: '完整版来了', category: '爆款标题', ctr: 82, tags: ['爆款', '资源'] },
  { id: 'hot-10', content: '小白必看', category: '爆款标题', ctr: 83, tags: ['爆款', '入门'] },
  { id: 'hot-11', content: '从入门到精通', category: '爆款标题', ctr: 87, tags: ['爆款', '教程'] },
  { id: 'hot-12', content: '看完这篇就够了', category: '爆款标题', ctr: 85, tags: ['爆款', '干货'] },
  { id: 'hot-13', content: '建议收藏慢慢看', category: '爆款标题', ctr: 88, tags: ['爆款', '实用'] },
  { id: 'hot-14', content: '深度解析', category: '爆款标题', ctr: 84, tags: ['爆款', '知识'] },
  { id: 'hot-15', content: '硬核科普', category: '爆款标题', ctr: 86, tags: ['爆款', '知识'] },
  { id: 'hot-16', content: '一探究竟', category: '爆款标题', ctr: 82, tags: ['爆款', '好奇'] },
  { id: 'hot-17', content: '学到了吗', category: '爆款标题', ctr: 80, tags: ['爆款', '互动'] },
  { id: 'hot-18', content: '千万别错过', category: '爆款标题', ctr: 87, tags: ['爆款', '紧迫'] },
  { id: 'hot-19', content: '年度最佳', category: '爆款标题', ctr: 89, tags: ['爆款', '排名'] },
  { id: 'hot-20', content: '终极指南', category: '爆款标题', ctr: 88, tags: ['爆款', '完整'] },

  // ========== 💯 数字震撼（18） ==========
  { id: 'num-01', content: '3个技巧', category: '数字震撼', ctr: 90, tags: ['数字', '清单'] },
  { id: 'num-02', content: '5个方法', category: '数字震撼', ctr: 88, tags: ['数字', '清单'] },
  { id: 'num-03', content: '7天速成', category: '数字震撼', ctr: 91, tags: ['数字', '快速'] },
  { id: 'num-04', content: '10倍效果', category: '数字震撼', ctr: 89, tags: ['数字', '冲击'] },
  { id: 'num-05', content: '99% 的人都不知道', category: '数字震撼', ctr: 92, tags: ['数字', '悬念'] },
  { id: 'num-06', content: '30天改变', category: '数字震撼', ctr: 86, tags: ['数字', '蜕变'] },
  { id: 'num-07', content: '100万+', category: '数字震撼', ctr: 87, tags: ['数字', '数据'] },
  { id: 'num-08', content: '0基础入门', category: '数字震撼', ctr: 85, tags: ['数字', '入门'] },
  { id: 'num-09', content: '3分钟搞定', category: '数字震撼', ctr: 88, tags: ['数字', '快速'] },
  { id: 'num-10', content: '7天见效', category: '数字震撼', ctr: 87, tags: ['数字', '快速'] },
  { id: 'num-11', content: '10w+ 阅读', category: '数字震撼', ctr: 86, tags: ['数字', '数据'] },
  { id: 'num-12', content: '1小时学会', category: '数字震撼', ctr: 84, tags: ['数字', '快速'] },
  { id: 'num-13', content: '365天计划', category: '数字震撼', ctr: 83, tags: ['数字', '长期'] },
  { id: 'num-14', content: '3步搞定', category: '数字震撼', ctr: 89, tags: ['数字', '步骤'] },
  { id: 'num-15', content: '5倍提升', category: '数字震撼', ctr: 85, tags: ['数字', '提升'] },
  { id: 'num-16', content: '100% 推荐', category: '数字震撼', ctr: 87, tags: ['数字', '肯定'] },
  { id: 'num-17', content: '24小时限时', category: '数字震撼', ctr: 86, tags: ['数字', '紧迫'] },
  { id: 'num-18', content: '5个细节', category: '数字震撼', ctr: 85, tags: ['数字', '清单'] },

  // ========== ❓ 悬念钩子（18） ==========
  { id: 'sus-01', content: '你敢信？', category: '悬念钩子', ctr: 89, tags: ['悬念', '质疑'] },
  { id: 'sus-02', content: '万万没想到', category: '悬念钩子', ctr: 87, tags: ['悬念', '反转'] },
  { id: 'sus-03', content: '结果出人意料', category: '悬念钩子', ctr: 85, tags: ['悬念', '结局'] },
  { id: 'sus-04', content: '真相竟然是', category: '悬念钩子', ctr: 88, tags: ['悬念', '揭秘'] },
  { id: 'sus-05', content: '这都能？', category: '悬念钩子', ctr: 84, tags: ['悬念', '惊讶'] },
  { id: 'sus-06', content: '为什么？', category: '悬念钩子', ctr: 82, tags: ['悬念', '提问'] },
  { id: 'sus-07', content: '细思极恐', category: '悬念钩子', ctr: 86, tags: ['悬念', '深度'] },
  { id: 'sus-08', content: '终于明白了', category: '悬念钩子', ctr: 84, tags: ['悬念', '领悟'] },
  { id: 'sus-09', content: '原来如此', category: '悬念钩子', ctr: 83, tags: ['悬念', '解惑'] },
  { id: 'sus-10', content: '震惊！', category: '悬念钩子', ctr: 90, tags: ['悬念', '冲击'] },
  { id: 'sus-11', content: '我哭了', category: '悬念钩子', ctr: 88, tags: ['悬念', '情感'] },
  { id: 'sus-12', content: '结果反转', category: '悬念钩子', ctr: 86, tags: ['悬念', '剧情'] },
  { id: 'sus-13', content: '细品', category: '悬念钩子', ctr: 81, tags: ['悬念', '品味'] },
  { id: 'sus-14', content: '你猜怎么着', category: '悬念钩子', ctr: 83, tags: ['悬念', '故事'] },
  { id: 'sus-15', content: '千万别点开', category: '悬念钩子', ctr: 89, tags: ['悬念', '好奇'] },
  { id: 'sus-16', content: '结局太意外', category: '悬念钩子', ctr: 87, tags: ['悬念', '结局'] },
  { id: 'sus-17', content: '后劲太大', category: '悬念钩子', ctr: 85, tags: ['悬念', '余韵'] },
  { id: 'sus-18', content: '别划走', category: '悬念钩子', ctr: 90, tags: ['悬念', '停留'] },

  // ========== 📚 教程（15） ==========
  { id: 'tut-01', content: '保姆级教程', category: '教程', ctr: 89, tags: ['教程', '详细'] },
  { id: 'tut-02', content: '零基础入门', category: '教程', ctr: 87, tags: ['教程', '入门'] },
  { id: 'tut-03', content: '手把手教你', category: '教程', ctr: 88, tags: ['教程', '实操'] },
  { id: 'tut-04', content: '5分钟学会', category: '教程', ctr: 86, tags: ['教程', '快速'] },
  { id: 'tut-05', content: '一学就会', category: '教程', ctr: 85, tags: ['教程', '简单'] },
  { id: 'tut-06', content: '不踩坑指南', category: '教程', ctr: 87, tags: ['教程', '避雷'] },
  { id: 'tut-07', content: '从0到1', category: '教程', ctr: 84, tags: ['教程', '完整'] },
  { id: 'tut-08', content: '全流程详解', category: '教程', ctr: 86, tags: ['教程', '完整'] },
  { id: 'tut-09', content: '超详细', category: '教程', ctr: 83, tags: ['教程', '详细'] },
  { id: 'tut-10', content: '一站式', category: '教程', ctr: 84, tags: ['教程', '完整'] },
  { id: 'tut-11', content: '小白教程', category: '教程', ctr: 85, tags: ['教程', '入门'] },
  { id: 'tut-12', content: '完整流程', category: '教程', ctr: 82, tags: ['教程', '步骤'] },
  { id: 'tut-13', content: '看完即会', category: '教程', ctr: 84, tags: ['教程', '易学'] },
  { id: 'tut-14', content: '不踩雷', category: '教程', ctr: 87, tags: ['教程', '避雷'] },
  { id: 'tut-15', content: '10分钟包会', category: '教程', ctr: 86, tags: ['教程', '快速'] },

  // ========== 💖 种草（15） ==========
  { id: 'grass-01', content: '无限回购', category: '种草', ctr: 91, tags: ['种草', '必入'] },
  { id: 'grass-02', content: '必入！', category: '种草', ctr: 88, tags: ['种草', '肯定'] },
  { id: 'grass-03', content: '巨好用', category: '种草', ctr: 89, tags: ['种草', '强推'] },
  { id: 'grass-04', content: '真心推荐', category: '种草', ctr: 86, tags: ['种草', '真诚'] },
  { id: 'grass-05', content: '已入手', category: '种草', ctr: 85, tags: ['种草', '体验'] },
  { id: 'grass-06', content: '安利给大家', category: '种草', ctr: 84, tags: ['种草', '分享'] },
  { id: 'grass-07', content: '私藏好物', category: '种草', ctr: 88, tags: ['种草', '私心'] },
  { id: 'grass-08', content: '上头了', category: '种草', ctr: 87, tags: ['种草', '沉迷'] },
  { id: 'grass-09', content: '离不开', category: '种草', ctr: 85, tags: ['种草', '依赖'] },
  { id: 'grass-10', content: '必囤！', category: '种草', ctr: 86, tags: ['种草', '囤货'] },
  { id: 'grass-11', content: '治愈系', category: '种草', ctr: 87, tags: ['种草', '情感'] },
  { id: 'grass-12', content: '氛围感拉满', category: '种草', ctr: 89, tags: ['种草', '美学'] },
  { id: 'grass-13', content: '仪式感', category: '种草', ctr: 84, tags: ['种草', '情调'] },
  { id: 'grass-14', content: 'OOTD', category: '种草', ctr: 86, tags: ['种草', '穿搭'] },
  { id: 'grass-15', content: '巨出片', category: '种草', ctr: 88, tags: ['种草', '拍摄'] },

  // ========== 🧠 知识（12） ==========
  { id: 'know-01', content: '深度思考', category: '知识', ctr: 84, tags: ['知识', '深度'] },
  { id: 'know-02', content: '底层逻辑', category: '知识', ctr: 86, tags: ['知识', '思维'] },
  { id: 'know-03', content: '思维模型', category: '知识', ctr: 85, tags: ['知识', '方法论'] },
  { id: 'know-04', content: '深度复盘', category: '知识', ctr: 83, tags: ['知识', '总结'] },
  { id: 'know-05', content: '深度好文', category: '知识', ctr: 84, tags: ['知识', '阅读'] },
  { id: 'know-06', content: '方法论', category: '知识', ctr: 82, tags: ['知识', '系统'] },
  { id: 'know-07', content: '认知升级', category: '知识', ctr: 85, tags: ['知识', '成长'] },
  { id: 'know-08', content: '系统思考', category: '知识', ctr: 81, tags: ['知识', '思维'] },
  { id: 'know-09', content: '独立思考', category: '知识', ctr: 80, tags: ['知识', '思辨'] },
  { id: 'know-10', content: '思维跃迁', category: '知识', ctr: 83, tags: ['知识', '成长'] },
  { id: 'know-11', content: '底层原理', category: '知识', ctr: 82, tags: ['知识', '本质'] },
  { id: 'know-12', content: '认知差', category: '知识', ctr: 84, tags: ['知识', '信息'] },

  // ========== ⚖️ 测评（12） ==========
  { id: 'rev-01', content: '真实测评', category: '测评', ctr: 87, tags: ['测评', '客观'] },
  { id: 'rev-02', content: '亲测推荐', category: '测评', ctr: 86, tags: ['测评', '体验'] },
  { id: 'rev-03', content: '实测对比', category: '测评', ctr: 88, tags: ['测评', '对比'] },
  { id: 'rev-04', content: '深度测评', category: '测评', ctr: 85, tags: ['测评', '详细'] },
  { id: 'rev-05', content: '优缺点', category: '测评', ctr: 83, tags: ['测评', '客观'] },
  { id: 'rev-06', content: '真心话', category: '测评', ctr: 84, tags: ['测评', '真诚'] },
  { id: 'rev-07', content: '不吹不黑', category: '测评', ctr: 86, tags: ['测评', '客观'] },
  { id: 'rev-08', content: '使用一个月', category: '测评', ctr: 82, tags: ['测评', '长期'] },
  { id: 'rev-09', content: '横评对比', category: '测评', ctr: 85, tags: ['测评', '对比'] },
  { id: 'rev-10', content: '理性分析', category: '测评', ctr: 81, tags: ['测评', '客观'] },
  { id: 'rev-11', content: '真实体验', category: '测评', ctr: 84, tags: ['测评', '分享'] },
  { id: 'rev-12', content: '深度对比', category: '测评', ctr: 83, tags: ['测评', '详细'] },

  // ========== 💗 情感（10） ==========
  { id: 'emo-01', content: '我哭了', category: '情感', ctr: 88, tags: ['情感', '泪目'] },
  { id: 'emo-02', content: '破防了', category: '情感', ctr: 86, tags: ['情感', '崩溃'] },
  { id: 'emo-03', content: '破防瞬间', category: '情感', ctr: 85, tags: ['情感', '共鸣'] },
  { id: 'emo-04', content: '人间真实', category: '情感', ctr: 84, tags: ['情感', '扎心'] },
  { id: 'emo-05', content: '人间清醒', category: '情感', ctr: 83, tags: ['情感', '通透'] },
  { id: 'emo-06', content: '深夜emo', category: '情感', ctr: 82, tags: ['情感', '夜晚'] },
  { id: 'emo-07', content: '笑着笑着就哭了', category: '情感', ctr: 87, tags: ['情感', '反差'] },
  { id: 'emo-08', content: '扎心了', category: '情感', ctr: 84, tags: ['情感', '刺痛'] },
  { id: 'emo-09', content: '治愈向', category: '情感', ctr: 85, tags: ['情感', '温暖'] },
  { id: 'emo-10', content: '回忆杀', category: '情感', ctr: 86, tags: ['情感', '怀念'] },
]

// 8 大类型 emoji 映射（UI 用）
export const categoryEmoji: Record<string, string> = {
  '爆款标题': '🔥',
  '数字震撼': '💯',
  '悬念钩子': '❓',
  '教程': '📚',
  '种草': '💖',
  '知识': '🧠',
  '测评': '⚖️',
  '情感': '💗',
}

// 兼容旧 API（防止其它地方引用）
export const titleFormulas: Array<{ template: string; baseScore: number; category: string }> = []
export const hotKeywords: string[] = []

// 旧 Title 类型（防止 import 报错）
export interface Title {
  id: string
  content: string
  category: string
  ctrScore: number
}
