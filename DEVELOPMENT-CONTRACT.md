# Creator Arena CN (国内创作者大模型竞技场) — 开发合同与交付契约

> **甲方 (需求方/指挥部)**: Creator AI Studio 创始团队
> **乙方 (研发方/Agent)**: 研发工程团队
> **项目名称**: 中文创作者大模型竞技场 (Creator Arena CN) 独立复刻与能力增强系统

---

## 一、 项目范围与交付标的 (Scope of Work)

1. **多模型适配器 (Multi-LLM Stream Adapter)**：
   - 支持国内主流大模型：DeepSeek V3/R1、Moonshot Kimi、字节豆包 Pro、阿里云通义千问 Qwen 2.5/Max、智谱 GLM-4 Plus、阶跃星辰 Step-2。
   - 支持国外经典大模型：Claude 3.5 Sonnet、GPT-4o/4o-mini、Gemini 1.5 Pro。
2. **Side-by-Side 盲测交互系统**：
   - 双栏流式渲染，模型隐名随机抽选（Model A vs Model B）。
   - 包含自媒体预设场景 Prompt 模版（小红书种草、短视频 3s Hook、公众号标题）。
3. **Elo 积分与排行榜引擎**：
   - 依据胜/负/平/双劣投票计算模型 Elo 分数，产出自媒体场景胜率榜单。
4. **Creator OS 数据回流 API**：
   - 提供 REST/JSON API 供 Creator OS 随时拉取最佳模型调度规则 (`GET /api/rankings/creator-text`)。

---

## 二、 质量与验收标准 (Acceptance Criteria)

| 交付模块 | 验收标准 | 测试/验证方式 |
| --- | --- | --- |
| **API 适配器** | 首字响应时间 (TTFT) < 1.5s，流式输出不打断，支持自动重试 | 单元测试 & API 连通性测试 |
| **盲测交互** | Model A/B 抽选概率均等，盲测揭晓前 100% 遮蔽真实名称 | UI 状态机测试与盲测漏洞测试 |
| **数据一致性** | 投票后 Elo 分数实时更新，不产生并发冲突 | 数据库/内存状态落盘验证 |
| **数据契约** | `GET /api/rankings/creator-text` 返回符合 `CreatorModelLeaderboard` 接口 | JSON Schema 自动校验 |

---

## 三、 开发周期与里程碑 (Milestones)

- **M1 (基石阶段 / Day 1-2)**: 统一适配器 TypeScript SDK、领域模型与 Mock 数据就位。
- **M2 (核心功能 / Day 3-5)**: 盲测双栏流式渲染界面、自媒体场景预设、投票逻辑闭环。
- **M3 (联调与回流 / Day 6-7)**: Elo 排行榜计算、Creator OS 数据接口暴露、全流程验收交付。

---

## 四、 违约与风险控制

- **模型 API 宕机/限流**: 适配器必须具备一键 Failover 降级机制，自动切换备用供应商（如 SiliconFlow / One-API）。
- **代码隔离原则**: 保持独立的 API/组件架构，**严禁将 Arena 的数据库或代码强耦合进 Creator OS 核心仓**。
