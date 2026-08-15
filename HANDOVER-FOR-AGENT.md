# Creator Arena CN — Agent / 开发者交接文档 (Handover Guide)

> **目标读者**: 接手本项目的 AI Agent、前端工程师或全栈开发者。
> **核心使命**: 维护独立性，接入国内/国外大模型，为 Creator OS 提供偏好数据支持。

---

## 一、 项目快速上下文 (Context Overview)

`Creator Arena CN` 是对标 [arena.ai](https://arena.ai/) 的国内首个**中文创作者大模型盲测竞技场**。
- **与 Creator OS 的关系**：**代码完全独立**。它是一个独立的轻量 Web 应用/工具，仅通过 API 暴露排行榜数据给 Creator OS 主控中枢。
- **技术栈**：React 18 + TypeScript + Vite + Tailwind CSS (Parchment v3.3 主题)。

---

## 二、 核心文件目录索引 (Directory Map)

```text
├── CREATOR-ARENA-DOMESTIC-PRD.md   # 产品需求文档（模型矩阵 + 自媒体场景）
├── DEVELOPMENT-CONTRACT.md         # 开发合同与质量验收标准
├── PROJECT-PROGRESS.md             # 里程碑与 Master Task 看板
├── HANDOVER-FOR-AGENT.md           # 本交接文档
└── client/src/
    ├── utils/
    │   └── arenaAdapter.ts         # 多模型统一请求 SDK (重点维护!)
    ├── styles/
    │   └── parchment.v3.3.tokens.json # Parchment 现代极简设计 Token
    └── types.ts                    # 通用类型定义
```

---

## 三、 核心代码结构说明 (`arenaAdapter.ts`)

`client/src/utils/arenaAdapter.ts` 是整个竞技场的核心，封装了统一的多模型流式适配器：

```typescript
import { fetchMultiLLMStream, calculateEloRating } from './arenaAdapter';

// 1. 发起双栏盲测流式请求
fetchMultiLLMStream(
  { scenario: 'xhs_post', prompt: '推荐一款适合敏感肌的保湿霜' },
  (modelAChunk) => updateModelAUI(modelAChunk),
  (modelBChunk) => updateModelBUI(modelBChunk)
);

// 2. 投票后计算新 Elo 分数
const { newRatingA, newRatingB } = calculateEloRating(1200, 1180, 'model_a');
```

---

## 四、 接手后的下一步动作 (Action Items for Next Agent)

1. **环境配置**:
   - 在 `.env` 中配置硅基流动 (SiliconFlow) 或 One-API 的 `VITE_LLM_API_KEY` 和 `VITE_LLM_BASE_URL`。
2. **开发任务**:
   - 参照 `PROJECT-PROGRESS.md` 中的 Phase 2，在 `client/src/components/` 下构建双栏盲测组件 `BattleView.tsx`。
3. **红线禁忌**:
   - ❌ **严禁**将 Arena 的本地数据库逻辑直接 import 入 Creator OS 主控制仓。
   - ❌ **严禁**硬编码大模型 API Key 入前端代码。
