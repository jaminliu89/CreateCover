# arena-text-reference 标杆对标分析与重构优化方案

> **对标目标**: [arena.ai](https://arena.ai/) (原 LMSYS Chatbot Arena)
> **核心结论**: **结构对标成功 70%，但产品语义需要从“通用模型 Chat”升级为“创作者爆款内容定向竞技场”。必须优化。**

---

## 一、 对标成功点（已具备的基础）

1. **双栏/多栏盲测机制 (Side-by-Side Comparison)**: 成功复刻了 `arena.ai` 隐去模型名称（Model A vs Model B）进行双盲对比与人类偏好投票的核心交互。
2. **多模型并发请求结构**: 具备同时调用多个 LLM（如 Claude / OpenAI / DeepSeek）并流式输出（Streaming）的基本能力。

---

## 二、 存在的断层与痛点（为什么必须优化）

| 维度 | `arena.ai` 现状 | `arena-text-reference` 痛点 | 优化方向 |
| --- | --- | --- | --- |
| **应用场景** | 通用问答 / 代码 / 开放式 Chat | 泛泛的 Chat 问答，**缺少创作者业务上下文** | 转向**创作者场景**（小红书文案/短视频脚本/爆款标题） |
| **评估维度** | 泛泛的胜/负/平 (Win/Loss/Tie) | 只有“哪个更好”的粗粒度选择 | 引入**内容 CTR 评分、HOOK 抓人度、排版视觉结构**多维打分 |
| **产物流转** | 投票完即结束 (测试工具) | 结果无法被后续创作流程消费 | 选出的 Winner 文本**直接 1-Click 传入 Creator OS 素材总线** |

---

## 三、 核心优化路线图 (Optimization Checklist)

### 1. 语义升维：从通用 Chat 到 Creator-Specific Battle
将输入口从 generic prompt 改造为标准创作者任务（例：“*输入主题，生成 3 版小红书标题与开头 Hook*”），自动在 Model A 与 Model B 中盲测展示。

### 2. 引入自动结构化评估 (AutoEval & CTR Score)
参考 `arena.ai/blog/autoeval-scores` 机制，不仅依靠人工点击，增加：
- **Hook 强度打分 (0-100)**
- **排版分段与 Emoji 亲和力**
- **预估点击率 (CTR Score)**

### 3. 能力契约化 (Creator OS Capability Contract)
将 `arena-text-reference` 包装为标准的 Creator OS 技能：

```typescript
export interface ArenaEvalInput {
  topic: string;
  contentType: 'xhs_post' | 'video_script' | 'cover_title';
  candidateModels?: string[]; // 如 ["claude-3-5-sonnet", "deepseek-v3"]
}

export interface ArenaEvalOutput {
  winnerModel: string;
  winnerContent: string;
  ctrScore: number;
  evalMetrics: {
    hookStrength: number;
    readability: number;
  };
}
```

---

## 四、 结论建议

- **要不要优化？** ➔ **必须优化**。
- **优化原则**：不要继续抄 `arena.ai` 的通用 Chat 评估，而是把它打造为 **Creator AI Studio 专属的“爆款文案/脚本竞技选优引擎”**。
