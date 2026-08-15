# 中文创作者大模型竞技场 (Creator Arena CN) 独立产品 PRD & 接口规范

> **定位**: 国内首个聚焦中文创作者/自媒体场景的大模型盲测竞技场与排行榜。
> **原则**: **完全独立部署 / 零侵入 Creator OS 主线 / 偏好数据回流 Creator OS**。

---

## 一、 产品需求与核心场景

### 1.1 标杆与差异化
- **对标**: [arena.ai](https://arena.ai/) (LMSYS Chatbot Arena) 的 Side-by-Side 盲测交互与 Elo 榜单。
- **差异化**: 不做通用问答，**专注于中文自媒体内容创作（爆款标题 / 小红书文案 / 短视频 3s Hook / 公众号排版）**。

### 1.2 支持模型矩阵 (Model Matrix)

```text
                     ┌───────────────────────────────────┐
                     │    Creator Arena 模型接入矩阵      │
                     └─────────────────┬─────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
  【国内大模型 (Domestic Primary)】                           【国外大模型 (Global Classic)】
  • DeepSeek V3 / R1 (深度求索)                               • Claude 3.5 Sonnet (Anthropic)
  • Moonshot Kimi (月之暗面)                                  • GPT-4o / GPT-4o-mini (OpenAI)
  • Doubao 豆包 Pro (字节跳动)                                • Gemini 1.5 Pro / Flash (Google)
  • Qwen 2.5 / Max (阿里云通义千问)
  • GLM-4 Plus (智谱 AI)
  • Step-2 阶跃星辰 / Baichuan 百川
```

---

## 二、 核心交互流程 (User Flow)

```text
1. 选题 / Prompt 输入 (预设三大自媒体模版或自定义)
   ↓
2. 系统隐去模型名称，随机抽取 Model A 与 Model B
   ↓
3. 双栏并发流式渲染 (Streaming Render) 输出对比
   ↓
4. 用户体验评估 ➔ 点击 【Model A 胜】/【Model B 胜】/【平局】/【两者均差】
   ↓
5. 揭晓真实模型身份 ➔ 更新模型 Elo 积分排名 ➔ 成果 1-Click 导出或流向 Creator OS
```

---

## 三、 自媒体预设场景 (Creator Scenarios)

1. **场景 A：爆款小红书文案与 Emoji 排版**
   - 评估重点：标题吸引力、段落呼吸感、Emoji 匹配度、种草语气。
2. **场景 B：短视频 3 秒黄金 Hook 开头**
   - 评估重点：反直觉悬念、痛点引发、口语化表达。
3. **场景 C：公众号 / 视频号高 CTR 标题**
   - 评估重点：情绪价值、数字转化、信息差。

---

## 四、 接口契约与数据结构 (API Contracts)

### 1. 多模型统一请求契约 (Multi-LLM Stream Interface)
```typescript
export interface ArenaBattleRequest {
  scenario: 'xhs_post' | 'video_hook' | 'article_title' | 'custom';
  prompt: string;
  modelA?: string; // 若指定模型则走非盲测模式；不传则系统随机隐名抽取
  modelB?: string;
  temperature?: number;
}

export interface ArenaVoteRequest {
  battleId: string;
  winner: 'model_a' | 'model_b' | 'tie' | 'both_bad';
  feedbackTags?: string[]; // 例: ["标题抓人", "排版舒适", "废话太多"]
}
```

### 2. 回流 Creator OS 数据契约 (Data Feedback API)
```typescript
export interface CreatorModelLeaderboard {
  updatedAt: number;
  rankings: Array<{
    modelId: string;
    modelName: string;
    eloScore: number;         // 依据胜率计算的 Elo 分数
    winRateByScenario: {
      xhsPost: number;        // 小红书场景胜率
      videoHook: number;      // 视频 Hook 场景胜率
      articleTitle: number;   // 标题场景胜率
    };
  }>;
}
```

---

## 五、 执行路线图 (Execution Roadmap)

- **Phase 1（接口与模型集成）**: 接入硅基流动 / One-API，一次性连通 DeepSeek、Kimi、豆包、Qwen、Claude、GPT-4o 接口。
- **Phase 2（盲测界面与场景）**: 在 `arena-text-reference` 前端实现双栏盲测与自媒体 Prompt 预设。
- **Phase 3（排行榜与数据回流）**: 上线 Elo 榜单，并通过 API 向 Creator OS 实时输出最佳模型调度策略。
