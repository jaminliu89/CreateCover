# Creator OS — 领域模型与 Capability Contract 标准规范 (v1.0)

> **定位**: Creator OS 的基础设施协议标准 (Protocol Standard)。
> **目标**: 避免代码强行拆合导致的“代码垃圾场”，通过**统一数据模型与 Capability 技能契约**，连接“创作者意图 (Intent)”与“底层专业工具能力”。

---

## 一、 领域模型定义 (Domain Models)

```text
 ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
 │   Identity    │───────►│    Project    │───────►│   Workflow    │
 │  (创作者/记忆)  │        │  (创作项目)   │        │   (状态机)    │
 └───────────────┘        └───────┬───────┘        └───────┬───────┘
                                  │                        │
                                  ▼                        ▼
                          ┌───────────────┐        ┌───────────────┐
                          │   Asset Bus   │        │ Agent / Skill │
                          │  (素材/产物)  │        │  (执行契约)   │
                          └───────────────┘        └───────────────┘
```

### 1. Identity (创作者与长期记忆)
```typescript
export interface CreatorIdentity {
  id: string;               // 创作者唯一 ID
  name: string;             // 品牌/创作者名称
  toneStyle: string[];      // 表达风格标签 (如: ["幽默", "极简", "硬核"])
  brandVI: {
    primaryColor: string;   // 主色调
    fontFamily: string;     // 默认字体
    logoUrl?: string;       // 品牌 Logo 资产
  };
  voiceProfileId?: string;  // 绑定的复刻音色 ID (audio-transcriber-tts)
  memoryContext: {
    pastTopics: string[];   // 过往选题历史 (避免同质化)
    platformPrefs: ('xhs' | 'dy' | 'bilibili' | 'mp')[]; // 主攻平台
  };
}
```

### 2. Project (创作项目)
```typescript
export interface CreatorProject {
  id: string;
  creatorId: string;
  title: string;
  aspectRatio: '16:9' | '3:4' | '9:16' | '1:1';
  brief: {
    topic: string;          // 核心选题
    targetAudience: string; // 目标受众
    coreMessage: string;    // 一句话核心价值
  };
  script?: {
    nodes: Array<{
      id: string;
      focal: string;        // 镜头焦点
      spokenText: string;   // 口播文案
      durationEst: number;  // 预估时长 (秒)
    }>;
  };
  createdAt: number;
  updatedAt: number;
}
```

### 3. Asset Bus (素材总线与产物)
```typescript
export type AssetType = 'video' | 'audio' | 'image' | 'caption' | 'document';

export interface Asset {
  id: string;
  projectId: string;
  type: AssetType;
  uri: string;              // 本地 file:// 或云端 https:// URL
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    mimeType: string;
    sourceSkill?: string;   // 生成该资产的 Skill (如 "OmnipotentDirector")
  };
  createdAt: number;
}
```

---

## 二、 Capability Contract (技能协议契约)

任何被 Creator OS 调用的能力，**只需遵循标准输入输出契约 (IO Contract)**，无需将其代码合入 Creator OS 仓库：

```typescript
export interface CapabilitySkill<TInput, TOutput> {
  id: string;               // 技能唯一 ID (如 "skill.video.render")
  name: string;             // 技能名称
  version: string;          // 契约版本 (如 "1.0.0")
  capabilityType: 'think' | 'create' | 'grow';

  /** 探针校验：检测环境与依赖是否准备就绪 */
  checkAvailability(): Promise<{ available: boolean; reason?: string }>;

  /** 执行技能逻辑 */
  execute(input: TInput, ctx: ExecutionContext): Promise<TOutput>;
}

export interface ExecutionContext {
  projectId: string;
  creator: CreatorIdentity;
  assetBus: {
    register(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset>;
    get(assetId: string): Promise<Asset | null>;
  };
  logger: (msg: string, level?: 'info' | 'warn' | 'error') => void;
}
```

---

## 三、 第一阶段 MVP (Idea → Publish → Learn) 工作流契约

```typescript
// 第一阶段 MVP 工作流状态机定义
export type MVPWorkflowState =
  | 'IDEA_PENDING'      // 1. 选题思考中 (Gaozi / Creative Wizard)
  | 'SCRIPT_GENERATED'  // 2. 脚本生成完成 (SCRIPT.md)
  | 'AUDIO_SYNTHESIZED' // 3. 配音与音色对齐完成 (Audio TTS)
  | 'RENDER_COMPLETED'  // 4. 视频装配与封面渲染完成 (智剪 AI / CoverForge)
  | 'PUBLISH_READY'     // 5. 准备推送与分发 (MCN Engine)
  | 'LEARN_FEEDBACK';   // 6. 数据回流与记忆学习 (Memory)
```

---

## 四、 10 大能力仓库 Governance & Action Matrix (治理矩阵)

| 仓库名称 | 第一阶段 MVP 动作 | 执行形态 | 挂载契约标准 |
| --- | --- | --- | --- |
| **`Creator OS`** | **主控中枢 (Host)** | 桌面/Web 控制台 | 调度领域模型状态机 |
| **`智剪 AI`** | **挂载 (Mount)** | 本地/远程 API | `skill.video.assembly` |
| **`omnipotent-director`** | **挂载 (Mount)** | Skill CLI | `skill.director.pipeline` |
| **`audio-transcriber-tts`**| **挂载 (Mount)** | REST Service | `skill.audio.tts` |
| **`CoverForge`** | **挂载 (Mount)** | REST / Canvas SDK | `skill.cover.render` |
| **`MCN-Matrix-Engine`** | **挂载 (Mount)** | API Gateway | `skill.distribution.publish` |
| **`Gaozi / Creative-Wizard`**| **融合协议 (Schema)** | Agent Prompt / Function | `skill.think.scriptgen` |
| **`MarkdownForge` / `Typeset`**| **按需调用 (On-Demand)** | Export SDK | `skill.export.document` |
| **`Music Studio`** | **按需调用 (On-Demand)** | Audio Engine | `skill.audio.bgm` |
| **`MetaForge Pipeline`** | **底层支撑 (Infra)** | CLI Toolchain | `infra.render.engine` |
