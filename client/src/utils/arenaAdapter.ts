/**
 * Creator Arena CN — 多模型统一适配器与 Elo 评分引擎 SDK
 *
 * 功能：
 * 1. 抹平国内 (DeepSeek, Kimi, 豆包, Qwen, GLM) 与国外 (Claude, GPT-4o) API 差异
 * 2. 提供统一的 Side-by-Side 双栏流式输出 (Streaming) 接口
 * 3. 实时 Elo 胜率打分计算
 */

export interface LLMModelConfig {
  id: string;
  name: string;
  provider: 'deepseek' | 'moonshot' | 'bytedance' | 'aliyun' | 'zhipu' | 'openai' | 'anthropic';
  isDomestic: boolean;
  avatarUrl?: string;
}

export const SUPPORTED_ARENA_MODELS: LLMModelConfig[] = [
  { id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'deepseek', isDomestic: true },
  { id: 'deepseek-r1', name: 'DeepSeek-R1 (推理)', provider: 'deepseek', isDomestic: true },
  { id: 'kimi-k1.5', name: 'Kimi (月之暗面)', provider: 'moonshot', isDomestic: true },
  { id: 'doubao-pro', name: '豆包 Pro', provider: 'bytedance', isDomestic: true },
  { id: 'qwen-2.5-max', name: '通义千问 Qwen 2.5 Max', provider: 'aliyun', isDomestic: true },
  { id: 'glm-4-plus', name: '智谱 GLM-4 Plus', provider: 'zhipu', isDomestic: true },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', isDomestic: false },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', isDomestic: false },
]

export interface ArenaBattlePayload {
  scenario: 'xhs_post' | 'video_hook' | 'article_title' | 'custom';
  prompt: string;
  modelAId?: string;
  modelBId?: string;
}

/** 随机抽取两个不相等的模型进行盲测 */
export function getRandomModelPair(): { modelA: LLMModelConfig; modelB: LLMModelConfig } {
  const shuffled = [...SUPPORTED_ARENA_MODELS].sort(() => 0.5 - Math.random())
  return { modelA: shuffled[0], modelB: shuffled[1] }
}

/** 模拟/真实流式调用多模型接口 */
export async function streamLLMResponse(
  modelId: string,
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = import.meta.env.VITE_LLM_API_KEY
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL || 'https://api.siliconflow.cn/v1'

  // 若未配置 API Key，走流畅 Mock 流式输出（保障开发预览与测试）
  if (!apiKey) {
    const mockContent = `【${modelId} 盲测生成】针对需求："${prompt}"\n\n1. ✨ 绝绝子！这个灵感必须收藏！\n2. 💥 告别焦虑，3 个步骤直接拿捏！\n3. 真实体验分享，建议直接抄作业！`
    const chunks = mockContent.split('')
    let fullText = ''
    for (const char of chunks) {
      await new Promise(r => setTimeout(r, 30))
      fullText += char
      onChunk(char)
    }
    return fullText
  }

  // 真实 API 请求 (适配 OpenAI 兼容标准结构)
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      temperature: 0.7,
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`Model ${modelId} request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunkStr = decoder.decode(value, { stream: true })
    const lines = chunkStr.split('\n').filter(line => line.trim().startsWith('data: '))
    for (const line of lines) {
      const jsonStr = line.replace(/^data: /, '').trim()
      if (jsonStr === '[DONE]') break
      try {
        const parsed = JSON.parse(jsonStr)
        const content = parsed.choices?.[0]?.delta?.content || ''
        if (content) {
          fullText += content
          onChunk(content)
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }

  return fullText
}

/** 计算 Elo 积分更新 */
export function calculateEloRating(
  ratingA: number,
  ratingB: number,
  winner: 'model_a' | 'model_b' | 'tie' | 'both_bad',
  kFactor: number = 32
): { newRatingA: number; newRatingB: number } {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400))

  let scoreA = 0.5, scoreB = 0.5
  if (winner === 'model_a') { scoreA = 1; scoreB = 0 }
  else if (winner === 'model_b') { scoreA = 0; scoreB = 1 }
  else if (winner === 'both_bad') { scoreA = 0; scoreB = 0 }

  return {
    newRatingA: Math.round(ratingA + kFactor * (scoreA - expectedA)),
    newRatingB: Math.round(ratingB + kFactor * (scoreB - expectedB)),
  }
}
