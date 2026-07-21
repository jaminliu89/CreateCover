import React, { useRef } from 'react'
import { useEditorStore } from '../store/useEditorStore'
import { showToast } from '../store/useToastStore'
import { templates } from '../data'
import { titleFormulas } from '../data/formulas'
import type { Element, TextElement } from '../data'

// ============================================================
// 智能公式填充：将 {占位符} 替换为关键词 + 随机搭配
// ============================================================

const SMART_DEFAULTS: Record<string, string[]> = {
  '结果': ['效率翻倍', '轻松上手', '惊艳全场', '月入过万', '脱颖而出', '逆袭成功', '再也不愁'],
  '人群': ['女生', '上班族', '学生党', '新手', '宝妈', '打工人', '90后'],
  '动作': ['做过了', '试过了', '用上了', '收藏了', '学完了', '知道了'],
  '起点': ['小白', '零基础', '新手', '入门', '素人'],
  '终点': ['高手', '大师', '专家', '达人', '大神'],
  '时间': ['30天', '7天', '1个月', '3个月', '1年'],
  '周期': ['一年', '半年', '三个月', '一个月'],
  '优惠': ['全场5折', '立减100', '秒杀价', '免单'],
  '问题': ['烦恼', '困扰', '难题', '痛点', '焦虑'],
  '错误动作': ['这样做', '这样学', '这样买', '这样吃', '这样写'],
  '正确方法': ['应该这样做', '专业方法来了', '看这篇就够了'],
  '错误': ['做错了这一步', '没用对方法', '方向错了', '信了谣言'],
  '状态': ['不理想', '反复失败', '没什么用', '原地踏步'],
  '解决方案': ['终极方案来了', '用这个方法搞定', '一键解决'],
  '产品': ['洗发水', '面霜', '防晒霜', 'APP', '工具'],
  '冠军': ['性价比之王', '第一名', '最强王者', 'yyds'],
  '物品': ['包包', '口红', '耳机', '好物'],
  '效果': ['白了', '瘦了', '惊艳', '好用到哭'],
  '反应': ['惊了', '沉默了', '问疯了', '跪了'],
  '答案': ['答案在这里', '看完就懂了', '一个视频讲清楚'],
  '主题': ['成长', '赚钱', '变美', '学习'],
  '技能': ['剪辑', 'P图', '写作', '摄影', '画画'],
  '坑': ['雷区', '误区', '弯路', '陷阱'],
  '难度': ['保姆级', '零基础', '一站式', '小白'],
  '人': ['姐妹', '粉丝', '朋友', '同事', '同行'],
  '行业': ['手机店', '航空公司', '4S店', '医美', '金融'],
}

function fillFormula(formula: string, keyword: string): string {
  let result = formula
  result = result.replace(/\{数字\}/g, () => String(Math.floor(Math.random() * 90) + 3))
  result = result.replace(/\{n\}/g, () => String(Math.floor(Math.random() * 90) + 3))
  result = result.replace(/\{topic\}/gi, keyword)
  result = result.replace(/\{主题\}/g, keyword)
  result = result.replace(/\{话题\}/g, keyword)
  result = result.replace(/\{([^}]+)\}/g, (_m, placeholder: string) => {
    if (placeholder.includes('/')) {
      const options = placeholder.split('/')
      return options[Math.floor(Math.random() * options.length)]
    }
    if (placeholder.includes('..')) {
      const adj = ['好', '值', '强', '快', '美', '赞', '牛', '靠谱']
      return adj[Math.floor(Math.random() * adj.length)]
    }
    if (SMART_DEFAULTS[placeholder]) {
      const pool = SMART_DEFAULTS[placeholder]
      return pool[Math.floor(Math.random() * pool.length)]
    }
    return keyword
  })
  return result
}

// ============================================================
// 画板尺寸
// ============================================================
const RATIO_SIZES: Record<string, { w: number; h: number }> = {
  '3:4':  { w: 480, h: 640 },
  '1:1':  { w: 500, h: 500 },
  '9:16': { w: 405, h: 720 },
  '16:9': { w: 720, h: 405 },
}

/** 自动收缩字号：保证文字宽度 ≤ 画板宽度 × 0.9 */
function autoFitFontSize(text: string, fontSize: number, canvasW: number): number {
  if (!text) return fontSize
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const other = text.length - cjk
  const estimatedW = cjk * fontSize + other * fontSize * 0.5
  const maxW = canvasW * 0.9
  if (estimatedW <= maxW) return fontSize
  return Math.max(12, Math.round(fontSize * (maxW / estimatedW)))
}

// ============================================================
// 热词库（每次随机抽取一个）
// ============================================================
const HOT_TOPICS = [
  '自媒体', '涨粉', '搞钱', '副业', '减肥', '护肤', '穿搭', '美食',
  '学习', '职场', '理财', '健身', '恋爱', '育儿', '装修', '旅行',
  '摄影', '画画', '剪辑', '写作', '面试', '考研', '考证', '买房',
]

// ============================================================
// useMagicGenerate — 真·一键生成 hook（无弹条/无输入框）
// 用法：const { generate, lastKw } = useMagicGenerate(); <button onClick={() => generate()}>
// ============================================================
export function useMagicGenerate() {
  const lastKwRef = useRef<string>('')

  const generate = (overrideKw?: string) => {
    const kw = overrideKw?.trim() || HOT_TOPICS[Math.floor(Math.random() * HOT_TOPICS.length)]
    lastKwRef.current = kw

    if (!templates.length) {
      showToast('模板库为空', { type: 'error' })
      return
    }
    const tpl = templates[Math.floor(Math.random() * templates.length)]
    const formula = titleFormulas[Math.floor(Math.random() * titleFormulas.length)]
    const title = fillFormula(formula.template, kw)

    const newElements: Element[] = tpl.elements.map(el => ({
      ...el,
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }))
    useEditorStore.getState().loadProject(null, `AI生成 - ${kw}`, tpl.ratio, newElements)

    setTimeout(() => {
      const store = useEditorStore.getState()
      const firstText = store.elements.find(e => e.type === 'text') as TextElement | undefined
      if (firstText) {
        const canvasW = RATIO_SIZES[tpl.ratio]?.w ?? 480
        const fitted = autoFitFontSize(title, firstText.fontSize || 36, canvasW)
        store.updateElement(firstText.id, {
          content: title,
          color: firstText.color || '#FFFFFF',
          fontSize: fitted,
        } as any)
        store.saveHistory()
      }
      showToast(
        `✨ 已生成「${kw}」封面！\n模板：${tpl.name} · 公式：${formula.type}（${tpl.platform}）`,
        { type: 'success', duration: 4000 }
      )
    }, 100)
  }

  return { generate, lastKw: lastKwRef.current }
}

// ============================================================
// MagicGenerate 组件 — 兼容旧调用，返回 null
// 真·一键请用 useMagicGenerate().generate()
// ============================================================
const MagicGenerate: React.FC<{ onClose: () => void }> = () => {
  return null
}

export default MagicGenerate
