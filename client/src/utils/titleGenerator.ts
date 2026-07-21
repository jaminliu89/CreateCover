// 标题生成器 - 内置算法 + API 接口预留

export interface TitleResult {
  content: string
  score: number
  tags: string[]
  advice: string
}

const titleTemplates = [
  { template: '为什么{keyword}的人都在看这个？', tags: ['疑问', '好奇'], score: 88 },
  { template: '{keyword}的3个秘密，最后一个惊呆了！', tags: ['秘密', '悬念'], score: 92 },
  { template: '如何做到{keyword}？看完这篇就够了', tags: ['教程', '干货'], score: 85 },
  { template: '{keyword}的5个技巧，第3个绝了', tags: ['技巧', '数字'], score: 90 },
  { template: '7天学会{keyword}，我只用了这招', tags: ['快速', '高效'], score: 87 },
  { template: '10个{keyword}的方法，学会就是赚', tags: ['方法', '福利'], score: 86 },
  { template: '我敢说，90%的人不知道{keyword}', tags: ['悬念', '稀缺'], score: 91 },
  { template: '{keyword}这件事，我只告诉你一个人', tags: ['独家', '私密'], score: 84 },
  { template: '千万别这么做{keyword}，后悔死了', tags: ['警示', '避坑'], score: 89 },
  { template: '学会{keyword}，让你少走十年弯路', tags: ['利益', '价值'], score: 88 },
  { template: '{keyword}做好了，收入翻10倍', tags: ['收入', '增长'], score: 93 },
  { template: '掌握{keyword}，就是掌握财富密码', tags: ['财富', '密码'], score: 85 },
  { template: '同样是{keyword}，为什么别人比你强？', tags: ['对比', '提升'], score: 87 },
  { template: '普通人做{keyword}和大神的区别', tags: ['对比', '进阶'], score: 86 },
  { template: '以前的{keyword}VS现在的{keyword}', tags: ['变化', '趋势'], score: 83 },
  { template: '做{keyword}，治愈了我的精神内耗', tags: ['治愈', '情感'], score: 90 },
  { template: '{keyword}让我重新爱上了生活', tags: ['热爱', '积极'], score: 88 },
  { template: '坚持{keyword}一年，我收获了什么', tags: ['坚持', '收获'], score: 89 },
  { template: '火爆全网的{keyword}，到底是什么？', tags: ['热门', '好奇'], score: 91 },
  { template: '被问爆了的{keyword}，今天一次性讲清楚', tags: ['热门', '解答'], score: 87 },
]

const adviceList = [
  '这个标题直击痛点，容易引发共鸣',
  '数字标题点击率更高，建议使用',
  '悬念式标题完播率提升30%',
  '利益点明确，用户更容易点击',
  '情感共鸣强，转发率高',
  '问句形式容易引发评论互动',
  '稀缺感强，激发好奇心',
  '时效性强，容易引发紧迫感',
]

export const generateTitles = (keyword: string, count: number = 8): TitleResult[] => {
  if (!keyword.trim()) return []
  
  const shuffled = [...titleTemplates].sort(() => Math.random() - 0.5)
  
  return shuffled.slice(0, count).map((item, index) => {
    const content = item.template.replace(/\{keyword\}/g, keyword)
    const scoreVariation = Math.floor(Math.random() * 10) - 5
    
    return {
      content,
      score: Math.min(99, Math.max(60, item.score + scoreVariation)),
      tags: item.tags,
      advice: adviceList[index % adviceList.length],
    }
  }).sort((a, b) => b.score - a.score)
}

export interface ApiConfig {
  endpoint: string
  apiKey?: string
}

const defaultConfig: ApiConfig = {
  endpoint: import.meta.env.DEV ? 'http://localhost:3006/api' : '/api',
}

let globalConfig: ApiConfig = defaultConfig

export const configureApi = (config: Partial<ApiConfig>) => {
  globalConfig = { ...globalConfig, ...config }
}

export const generateTitlesApi = async (keyword: string, count: number = 8): Promise<TitleResult[]> => {
  try {
    const response = await fetch(`${globalConfig.endpoint}/titles/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(globalConfig.apiKey ? { 'Authorization': `Bearer ${globalConfig.apiKey}` } : {}),
      },
      body: JSON.stringify({ keyword, count }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.titles || data
    }
  } catch (error) {
    console.warn('API调用失败，使用本地算法:', error)
  }
  
  return generateTitles(keyword, count)
}

export interface CutoutResult {
  success: boolean
  imageUrl?: string
  processingTime?: number
  error?: string
}

export const cutoutImageApi = async (imageFile: File | string): Promise<CutoutResult> => {
  try {
    let imageData = imageFile
    
    if (imageFile instanceof File) {
      const reader = new FileReader()
      imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = e => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })
    }
    
    const response = await fetch(`${globalConfig.endpoint}/cutout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.cutoutUrl) {
        return {
          success: true,
          imageUrl: `${globalConfig.endpoint.replace('/api', '')}${data.cutoutUrl}`,
          processingTime: data.processingTime,
        }
      }
      return { success: false, error: data.error || '抠图服务返回异常' }
    }
    return { success: false, error: `抠图服务错误 (${response.status})` }
  } catch (error) {
    console.warn('抠图API调用失败:', error)
    return { success: false, error: '抠图服务不可用，请确认后端已启动' }
  }
}

/*
============================================
🚀 可接入的抠图 API 示例配置（4种方案）
============================================

1️⃣ remove.bg (付费，效果好)
   configureApi({
     endpoint: 'https://api.remove.bg/v1.0/removebg',
     apiKey: 'YOUR_REMOVE_BG_API_KEY',
   })

2️⃣ 百度智能云 - 人像分割 (有免费额度)
   configureApi({
     endpoint: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg',
     apiKey: 'YOUR_ACCESS_TOKEN',
   })

3️⃣ 字节火山引擎 - 通用分割
   configureApi({
     endpoint: 'https://visual.volcengineapi.com/',
     apiKey: 'YOUR_API_KEY',
   })

4️⃣ 自建后端 + Python rembg (免费！推荐)
   后端用 Flask/FastAPI + rembg 库部署
   configureApi({ endpoint: 'http://localhost:3006/api' })
   完全免费，效果好，无调用限制
*/

export default {
  generateTitles,
  generateTitlesApi,
  cutoutImageApi,
  configureApi,
}
