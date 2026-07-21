// ============================================================
// 抖音/小红书 爆款标题公式（填空型，可定制化）
//
// 与 titleLibrary 的"完整短句"互补：
// - titleLibrary: 完整标题，1 键直接用
// - titleFormulas: 填空模板，{占位符} 由用户填入
//
// 公式来自爆款短视频/小红书封面的真实规律：
// 数字 / 转折 / 提问 / 限时 / 痛点 / 对比 / 揭秘 / 清单 / 教程 / 种草
// ============================================================

export interface TitleFormula {
  id: string
  // 公式模板，用 {占位符} 表示可填空
  template: string
  // 必填占位符
  required: string[]
  // 公式类型
  type: '数字' | '转折' | '提问' | '限时' | '痛点' | '对比' | '揭秘' | '清单' | '教程' | '种草'
  // 平台
  platform: '抖音' | '小红书' | 'B站' | '通用'
  // 预估 CTR
  ctr: number
  // 真实案例（3 个）
  examples: string[]
  // emoji 推荐
  emoji?: string
  // 简述
  desc: string
}

export const titleFormulas: TitleFormula[] = [
  // ========== 数字公式 ==========
  { id: 'f-num-1', template: '{数字}个{技巧/方法/秘诀}，让你{结果}', required: ['数字', '技巧/方法/秘诀', '结果'], type: '数字', platform: '抖音', ctr: 92, examples: ['5个方法，让你轻松学会剪辑', '10个秘诀，让你月入过万', '3个技巧，让你告别选择困难'], emoji: '🔢', desc: '经典数字型，开门见山' },
  { id: 'f-num-2', template: '{时间}内，{数字}个{动作}，{结果}', required: ['时间', '数字', '动作', '结果'], type: '数字', platform: '抖音', ctr: 90, examples: ['30天内，5个动作，马甲线', '7天内，3个步骤，瘦10斤', '1小时内，10个tips，速成PPT'], emoji: '⏱️', desc: '时间+数字双重紧迫' },
  { id: 'f-num-3', template: '{数字}%的{人群}都{动作}了，你还不知道？', required: ['数字', '人群', '动作'], type: '数字', platform: '小红书', ctr: 91, examples: ['99%的女生都这样做了，你还没？', '10万人都用过的小技巧，你呢？'], emoji: '😱', desc: '群体效应+从众心理' },
  { id: 'f-num-4', template: '{数字}个{工具/APP/网站}，{结果}', required: ['数字', '工具/APP/网站', '结果'], type: '清单', platform: '通用', ctr: 88, examples: ['10个设计师必备网站', '5个提升效率的APP', '8个学英语的神器'], emoji: '🛠️', desc: '清单式，干货向' },

  // ========== 转折公式 ==========
  { id: 'f-turn-1', template: '{之前} vs {之后}，{结果}', required: ['之前', '之后', '结果'], type: '对比', platform: '小红书', ctr: 89, examples: ['素颜 vs 化妆，判若两人', '租房 vs 自家房，差别惊人', '月薪3k vs 月薪3w，生活方式'], emoji: '🔄', desc: '前后对比，反差吸引' },
  { id: 'f-turn-2', template: '从{起点}到{终点}，{数字}天{结果}', required: ['起点', '终点', '数字', '结果'], type: '转折', platform: '抖音', ctr: 87, examples: ['从60kg到50kg，30天蜕变', '从月薪3k到3w，1年逆袭', '从素人到网红，90天记录'], emoji: '🚀', desc: '成长曲线，励志感' },
  { id: 'f-turn-3', template: '{数字}个月前 vs 现在，{人群}都{反应}', required: ['数字', '人群', '反应'], type: '转折', platform: '小红书', ctr: 88, examples: ['3个月前 vs 现在，闺蜜都惊了', '半年前 vs 现在，同事问我整容了吗'], emoji: '😲', desc: '时间+视觉冲击' },

  // ========== 提问公式 ==========
  { id: 'f-ask-1', template: '为什么{人群}都{动作}？{答案}', required: ['人群', '动作', '答案'], type: '提问', platform: '抖音', ctr: 89, examples: ['为什么明星都不吃主食？', '为什么有钱人都爱跑步？', '为什么网红都用这个APP？'], emoji: '❓', desc: '好奇心驱动，必看' },
  { id: 'f-ask-2', template: '{人群}最大的{问题}是什么？', required: ['人群', '问题'], type: '提问', platform: '抖音', ctr: 86, examples: ['女生最大的烦恼是什么？', '新手最大的疑问是什么？', '上班族最关心的问题是什么？'], emoji: '🤔', desc: '引发共鸣，互动强' },
  { id: 'f-ask-3', template: '{数字}个{人}问我的{话题}问题，一次性回答！', required: ['数字', '人', '话题'], type: '提问', platform: '小红书', ctr: 87, examples: ['100个姐妹问我的护肤问题', '10个人问我的减肥问题', '50个粉丝问我的穿搭问题'], emoji: '💬', desc: '高频问题，权威性' },

  // ========== 限时公式 ==========
  { id: 'f-time-1', template: '仅{时间}，{优惠}，错过等{周期}', required: ['时间', '优惠', '周期'], type: '限时', platform: '通用', ctr: 93, examples: ['仅3天，全场5折，错过等一年', '仅24小时，立减100，错过再等一年', '仅1小时，秒杀价，错过等明年'], emoji: '⏰', desc: '紧迫感+损失厌恶' },
  { id: 'f-time-2', template: '{周期}前必看，{主题}', required: ['周期', '主题'], type: '限时', platform: '抖音', ctr: 88, examples: ['双11前必看，购物清单', '春节前必看，旅行攻略', '毕业前必看，求职指南'], emoji: '🚨', desc: '节庆借势' },
  { id: 'f-time-3', template: '最后{数字}天，{行动}', required: ['数字', '行动'], type: '限时', platform: '通用', ctr: 90, examples: ['最后3天，大促', '最后1周，清仓', '最后24小时，报名'], emoji: '⚠️', desc: '倒计时紧迫' },

  // ========== 痛点公式 ==========
  { id: 'f-pain-1', template: '{人群}都有的{问题}，{解决方案}', required: ['人群', '问题', '解决方案'], type: '痛点', platform: '小红书', ctr: 91, examples: ['油皮都有的痘痘问题，终极解决方案', '上班族都有的腰酸问题，5个动作缓解', '学生党都有的脱发问题，3个方法改善'], emoji: '😩', desc: '共鸣+解决方案' },
  { id: 'f-pain-2', template: '别再{错误动作}了！{正确方法}', required: ['错误动作', '正确方法'], type: '痛点', platform: '抖音', ctr: 90, examples: ['别再这样减肥了！正确方法', '别再这样护肤了！专业建议', '别再这样学英语了！高效方法'], emoji: '🚫', desc: '否定式，纠正误区' },
  { id: 'f-pain-3', template: '为什么{问题}总是{状态}？因为你{错误}！', required: ['问题', '状态', '错误'], type: '痛点', platform: '抖音', ctr: 88, examples: ['为什么减肥总是失败？因为你吃错了！', '为什么皮肤总是差？因为你忽略了这一步！'], emoji: '😤', desc: '因果分析，反思型' },

  // ========== 对比公式 ==========
  { id: 'f-vs-1', template: '{A} vs {B}，到底哪个{更...}？', required: ['A', 'B'], type: '对比', platform: '小红书', ctr: 87, examples: ['苹果 vs 安卓，到底哪个更值？', '国货 vs 大牌，到底哪个更好用？', '租房 vs 买房，哪个划算？'], emoji: '⚔️', desc: '二元对比，引发选择' },
  { id: 'f-vs-2', template: '买{低价}还是{高价}？{人群}告诉你', required: ['低价', '高价', '人群'], type: '对比', platform: '抖音', ctr: 86, examples: ['买100的还是1000的？老司机告诉你', '买平价还是大牌？皮肤科医生告诉你'], emoji: '💰', desc: '价格+权威背书' },
  { id: 'f-vs-3', template: '{数字}款{产品}横评，谁才是{冠军}？', required: ['数字', '产品'], type: '对比', platform: 'B站', ctr: 89, examples: ['10款洗发水横评，谁才是油头克星？', '5款防晒霜横评，谁才是性价比之王？'], emoji: '🏆', desc: '横评向，B站爆款' },

  // ========== 揭秘公式 ==========
  { id: 'f-secret-1', template: '{数字}个{行业}不{会告诉你/敢告诉你的}秘密', required: ['数字', '行业'], type: '揭秘', platform: '抖音', ctr: 92, examples: ['5个手机店不告诉你的秘密', '10个航空公司不敢告诉你的潜规则', '3个医院不会主动告诉你的事'], emoji: '🤫', desc: '信息差，揭秘型' },
  { id: 'f-secret-2', template: '内行人揭秘：{话题}', required: ['话题'], type: '揭秘', platform: '抖音', ctr: 90, examples: ['内行人揭秘：保险怎么买', '内行人揭秘：房子怎么挑', '内行人揭秘：手机怎么选'], emoji: '🔍', desc: '身份背书' },
  { id: 'f-secret-3', template: '终于知道了！{话题}的{真相}', required: ['话题', '真相'], type: '揭秘', platform: '小红书', ctr: 88, examples: ['终于知道了！皮肤差的真相', '终于知道了！减肥失败的真相', '终于知道了！英语学不好的真相'], emoji: '💡', desc: '恍然大悟' },

  // ========== 清单公式 ==========
  { id: 'f-list-1', template: '{数字}个{主题}，第{n}个超好用！', required: ['数字', '主题', 'n'], type: '清单', platform: '小红书', ctr: 90, examples: ['5个护手霜，第3个超好用！', '10款面霜，第5个最惊艳！'], emoji: '📋', desc: '悬念清单，第N个吸引点击' },
  { id: 'f-list-2', template: '{人群}必备的{数字}个{物品}', required: ['人群', '数字', '物品'], type: '清单', platform: '抖音', ctr: 88, examples: ['女生必备的10个包包', '学生党必备的5个APP', '程序员必备的8个工具'], emoji: '🎁', desc: '群体定位，必备' },

  // ========== 教程公式 ==========
  { id: 'f-tut-1', template: '{难度}教程：从{起点}到{终点}', required: ['难度', '起点', '终点'], type: '教程', platform: 'B站', ctr: 89, examples: ['保姆级教程：从零到剪辑高手', '零基础教程：从入门到精通', '一站式教程：从设计到发布'], emoji: '📚', desc: '完整学习路径' },
  { id: 'f-tut-2', template: '一节课学会{技能}', required: ['技能'], type: '教程', platform: '抖音', ctr: 87, examples: ['一节课学会剪辑', '一节课学会PS', '一节课学会摄影'], emoji: '🎓', desc: '极简承诺' },
  { id: 'f-tut-3', template: '新手必看！{主题}的{数字}个{坑}', required: ['主题', '数字'], type: '教程', platform: '小红书', ctr: 91, examples: ['新手必看！装修的5个坑', '新手必看！护肤的3个误区', '新手必看！健身的8个雷区'], emoji: '⚡', desc: '避坑型，决策辅助' },

  // ========== 种草公式 ==========
  { id: 'f-grass-1', template: '亲测{时间}，{物品}真的{效果}', required: ['时间', '物品', '效果'], type: '种草', platform: '小红书', ctr: 92, examples: ['亲测1个月，这个面霜真的白了', '亲测3个月，这款洗发水真的去屑'], emoji: '💖', desc: '亲身体验，真实感' },
  { id: 'f-grass-2', template: '{人群}用{物品}，{效果}了', required: ['人群', '物品', '效果'], type: '种草', platform: '小红书', ctr: 89, examples: ['敏感肌用这个面霜，救回来了', '油头用这个洗发水，不油了'], emoji: '✨', desc: '人群共鸣，效果可视' },
  { id: 'f-grass-3', template: '终于找到{场景}的{产品}！{效果}', required: ['场景', '产品', '效果'], type: '种草', platform: '小红书', ctr: 88, examples: ['终于找到约会穿的连衣裙！超美', '终于找到学生党的平价面霜！好用'], emoji: '🎉', desc: '场景+效果' },
]

// 应用公式 → 提取所有占位符
export function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g) || []
  return matches.map(m => m.slice(1, -1))
}

// 应用公式 + 用户输入 → 生成完整标题
export function applyFormula(template: string, values: Record<string, string>): string {
  return template.replace(/\{([^}]+)\}/g, (_, key) => values[key] || `{${key}}`)
}
