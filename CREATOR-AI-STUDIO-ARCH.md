# Creator AI Studio — 全景能力资产盘点与 Creator OS 中枢架构白皮书

> **战略视角**：从“多个零散 Demo / SaaS”升维至“**创作者 AI 工作室 (Creator AI Studio)**”公司级产品版图。
> **核心原则**：不优先融合代码（避免巨大垃圾场），优先统一协议（Project / Asset / Workflow / Agent / Skill / Event）。

---

## 一、 创作者 AI 工作室产品版图 (Product Map)

将过去的 10 个能力仓库抽象归类为三大创作者核心价值链：**THINK（策划） → CREATE（生产） → GROW（分发与增长）**。

```text
                               CREATOR OS
                          创作者总操作系统 / 中枢
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
     THINK                       CREATE                      GROW
  灵感 / 研究 / 策划            内容生产 / 渲染             发布 / 矩阵增长
       │                           │                           │
       ├─ Gaozi Assistant          ├─ 智剪 AI (独立核心)         └─ MCN Matrix Content Engine
       ├─ Creative Wizard          ├─ Omnipotent Director (Skill)
       └─ Research Engine          ├─ Music Studio / Audio TTS
                                   ├─ TypeSet / CoverForge
                                   └─ MetaForge Pipeline
```

---

## 二、 10 大能力仓库资产盘点 (Capability Inventory)

| 仓库名称 | 战略分级 | 独立产品 vs 能力组件 | 接入 Creator OS 的契约方式 |
| --- | --- | --- | --- |
| **Creator OS** | ⭐⭐⭐⭐⭐ | **公司总操作系统 / 控制中枢** | 调度中心，定义 Workspace / Project / Workflow |
| **智剪 AI** | ⭐⭐⭐⭐⭐ | **独立核心产品 (Product Independence)** | 开放 API / IPC 接口，被 Creator OS 唤醒调用 |
| **Omnipotent Director** | ⭐⭐⭐⭐⭐ | **Agent 导演能力 (Skill)** | Skill 级编排，输出成片/字幕/多规格封面 |
| **MCN Content Engine** | ⭐⭐⭐⭐ | **B 端 / MCN 矩阵产品** | 导出节点事件触发，自动排期多账号发布 |
| **MetaForge Pipeline** | ⭐⭐⭐⭐ | **底层视频渲染基础设施** | CLI / SDK 级渲染任务调度 |
| **Music Studio** | ⭐⭐⭐⭐ | **配乐与音效能力组件** | 按照视频六线（Six-Line）时间轴提供 BGM 对齐 |
| **Audio Transcriber TTS**| ⭐⭐⭐⭐ | **基础 ASR / 音色复刻 AI 能力** | 提供 Voice Cloning 与字幕时间轴对齐接口 |
| **Creative Wizard** | ⭐⭐⭐ | **灵感与工作流引擎** | 为 Think 节点生成多版块分镜与创意脚本 |
| **Typeset App / CoverForge**| ⭐⭐⭐ | **图文与视觉输出能力** | 负责导出高清卡片/矢量单页 PDF/封面图 |
| **Gaozi Assistant** | ⭐⭐ | **选题与写作助手** | 提供初稿文本与语气改写 API |

---

## 三、 架构设计：Creator Platform Core 协议统一层

我们**不直接做代码强合并**，而是建立 **Creator Platform Core 协议**。任何能力只需要实现标准 JSON/REST/IPC 协议，即可被 Creator OS 挂载调度：

```text
                      Creator OS 中枢 (Orchestrator)
                                   │
                   ┌───────────────┴───────────────┐
                   │    Creator Platform Core     │
                   │           (协议层)            │
                   └───────────────┬───────────────┘
                                   │
  ┌───────────────┬────────────────┼───────────────┬───────────────┐
  ▼               ▼                ▼               ▼               ▼
Project API    Asset Bus     Workflow State    Agent Skill     Event Stream
(项目契约)     (素材总线)       (状态机)        (技能调度)      (事件日志)
```

### 1. 核心数据对象契约 (Core Domain Models)
- **Identity**: 创作者标识、品牌 VI 色彩、音色档案库（Voice Profiles）。
- **Project**: 创作目标、选题、分镜、多轨道时间轴。
- **Asset**: 原始视频、音频、图片、字体、风格预设（由 Asset Bus 统一管理路径/URL）。
- **Workflow / Task**: 状态机（Draft → Scripted → Voiced → Rendered → Published）。
- **Agent / Skill**: 拥有输入输出契约的无状态执行器（例如 `Skill: OmnipotentDirector`）。

---

## 四、 Creator OS 调度流（Orchestration Flow）

当创作者在 Creator OS 输入：“*帮我制作一条关于摄影入门的 1 分钟短视频*”：

```text
1. THINK 节点
   └─ Creator OS 唤醒 Gaozi Assistant / Creative Wizard
      └─ 生成 BRIEF.md + 脚本 SCRIPT.md + 六线分镜 STORYBOARD.md

2. CREATE 节点
   ├─ 调度 Audio Transcriber TTS → 生成音色复刻配音 (.wav) + 字幕时间轴
   ├─ 调度 Music Studio → 自动合成匹配 BGM
   ├─ 唤醒 智剪 AI / Omnipotent Director → 渲染视频帧与转场
   └─ 调用 CoverForge → 输出 16:9 与 3:4 爆款封面

3. GROW 节点
   └─ 调度 MCN Content Engine → 自动打标、生成各平台标题文案，分发排期
```

---

## 五、 开发路线图与刹车机制 (Roadmap & Focus)

### 阶段 1: MVP 核心闭环 (Current Focus)
* **目标**: 搭建 Creator OS 最小中枢控制台，跑通极简闭环：
  `Idea (选题) → Script (脚本) → Six-Line (六线分镜) → 智剪 AI (渲染) → Output`
* **原则**: 不开启新仓库；所有新想法优先放入 **R&D Backlog**。

### 阶段 2: 规范能力接口 (Protocol Standard)
* 将 `audio-transcriber-tts`、`CoverForge` 等成熟仓库抽象为带 Standard Input/Output 的能力插件（Plugin）。

### 阶段 3: 矩阵独立产品化 (Product Independence)
* 当智剪 AI / Omnipotent Director 验证出独立商业价值时，保留其独立 Branding 与商业化 SaaS 门面，实现“**中枢组合 + 独立大单品**”的创作者 AI 矩阵。
