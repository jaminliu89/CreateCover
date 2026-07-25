# Agent Operating System — CoverForge (AGENTS.md)

> **⚠️ 在进行任何文件修改或终端命令执行前，请务必完整阅读本文件。**
> 本文件是 CoverForge 项目的最高执行准则。如果指令与本文件冲突，**以本文件为准**。
>
> 跨 Agent 共享规则主库:
> - `~/.claude/AGENTS.md` — 跨 Agent 共享主库（安全红线/工作流/铁律/沟通规范）
> - `~/.claude/WORKING-STYLE.md` — VibeCoding SDLC v2 五阶段闭环 + CSS 布局铁律
>
> 本文件是上述主库的 **CoverForge 项目实例化**（填项目实际信息 + 特有规则）。

---

## 1 · 项目概况

- **项目名**: CoverForge (亦称 CreateCover)
- **简述**: 自媒体封面标题生成工具 — 浏览器内画布设计 + AI 一键抠图 + 模板导出
- **当前阶段**: Electron 桌面端已上线，Pages 双端（Cloudflare + EdgeOne）版本同步维护
- **目标**: 提供浏览器/桌面双端体验,核心功能(模板/画布/抠图/导出)全平台可用

---

## 2 · 技术栈与环境

### 2.1 技术栈
- **语言**: TypeScript 5.5
- **框架**: React 18.3 + Vite 5.4
- **状态管理**: Zustand 5（带 persist 中间件 → localStorage 持久化）
- **样式**: TailwindCSS 3.4 + lucide-react 图标
- **桌面端**: Electron 32 + electron-builder 25
- **AI 抠图**: @imgly/background-removal（ONNX 模型 ISNet 88MB，本地推理）
- **后端**: Express + TypeScript（`server/`，仅 API mock）

### 2.2 常用命令（务必使用这些命令，不要自由发挥）

| 用途 | 命令 | 说明 |
|------|------|------|
| 安装依赖 | `cd client && npm install` | 客户端装包，根目录不需要 |
| 启动 Web dev | `cd client && npm run dev` | **只用这个命令**起客户端。**不要用 `wrangler dev` 起前端**（已知会读陈旧产物） |
| 启动全栈 dev | `npm run dev` | 根目录，并发 server+client |
| TypeScript 检查 | `cd client && npx tsc -b` | 任何改代码后必跑 |
| 构建 Web | `cd client && npm run build` | 输出 `client/dist/` |
| 构建 macOS DMG | `npm run app:mac` | 输出 `client/release/` |
| 冒烟测试 | `node scripts/smoke-test.mjs` | 48 个检查点全过才算 PASS |
| 抠图模型下载 | `bash scripts/download-cutout-models.sh` | 仅首次需要 |

### 2.3 目录结构
```
CreateCover/
├── client/           # React + Vite 前端
│   ├── src/
│   │   ├── components/   # Canvas/Toolbar/PropertiesPanel 等
│   │   ├── store/        # Zustand store
│   │   ├── utils/        # 工具函数（cutout/color/beautify/assetBase）
│   │   ├── data/         # 默认模板定义
│   │   └── App.tsx
│   ├── electron/     # Electron main + preload
│   ├── public/       # 静态资源 + models/ + onnxruntime-web/
│   └── package.json
├── server/           # Express API mock
├── scripts/          # smoke-test.mjs / build-release.sh
├── tauri-app/        # 历史 Tauri 版本（已废弃保留参考）
└── shared/           # 跨端类型定义
```

---

## 3 · 🚫 安全红线（绝对禁止）

作为自主 Agent，你拥有执行命令的权限。以下行为被**严格禁止**，违反将导致任务终止：

### 通用红线
1. **禁止破坏性操作**: 绝对不要执行 `rm -rf`、`git reset --hard`（除非我明确要求）、`drop table` 等任何带有破坏性的终端或数据库命令。
2. **禁止修改核心配置**: 不要擅自修改 `package.json`、`tsconfig.json`、`.env`、`.gitignore`、`.codebuddy/` 文件，除非明确指示。
3. **禁止越界修改**: 只修改与当前任务直接相关的文件，不要为了"优化"而重构无关的旧代码。
4. **禁止盲目安装**: 如果需要引入新的第三方依赖，**必须先向我说明用途并等待我确认**，不要自行执行 `install` 命令。

### CoverForge 项目特有红线
5. **禁止明文落盘密钥**: 任何 API key / token / secret **绝不允许**写入代码、配置文件、commit 历史。Cloudflare 部署用 `wrangler secret put`；本地用 `.env.local`（已在 `.gitignore`）。
6. **禁止单次改动超过 3 个文件**: lock 类文件每次只能 `replace_in_file` 最小增量修改（基于历史教训，CreateCover Canvas/PropertiesPanel 等 UI 组件 lock 级别保护）。
7. **禁止自由发挥 dev 命令**: 必须用第二节列出的命令，不要 `nohup` / `wrangler dev` / 自创脚本替代。

---

## 4 · 工作流规范

### 4.1 VibeCoding SDLC v2 五阶段闭环（强制执行，禁止跳步）

完整流程见 `~/.claude/WORKING-STYLE.md` 一至五章，这里只列要点：

| Phase | 名称 | 产出 | 时间 |
|-------|------|------|------|
| 1 | 脚手架 | 配置/类型/工具函数就位 | 10 min |
| 2 | 产品推演 + 接口契约 | 状态机/数据表/字段命名统一 | 15 min |
| 3 | 核心链路验证 | CLI → Rust → 前端最小链路通 | 30 min |
| 4 | UI + 冒烟测试 | 全页面 + smoke-test 48/48 | 45 min |
| 5 | 打包 + 交付 + 沉淀 | DMG + memory update + git tag | 10 min |

**核心原则**: 脚手架优先 → 核心链路优先 → 产品推演优先 → 冒烟测试优先 → 知识沉淀优先。

### 4.2 单次任务流程

当接收到一个新任务时，请遵循以下工作流（除非我特别说明"直接做"）：

#### 步骤 1 · 规划与确认
- 在动手写代码前，先向我输出你的**实施计划**：
  - 打算新建哪些文件？
  - 修改哪些文件？每个文件预计改几行？
  - 逻辑是怎样的？涉及哪些 store action / IPC / 组件 props？
- 等待我回复 "OK" 或 "同意" 后，再进入步骤 2。
- **单次修改 ≤ 3 个文件**（基于 2026-07-21 历史教训：lock 文件单次改动范围限制）。

#### 步骤 2 · 执行与自检
- 按照计划修改/创建代码。
- **代码风格要求**:
  - 函数式组件 + Hooks，禁止 class 组件
  - 变量名小驼峰，组件名大驼峰
  - 必须添加中文注释（关键逻辑必加，废话不必加）
  - 优先 TailwindCSS 而不是内联样式（Canvas 等动态定位元素除外）
  - store 边界 `camelCase`，DB 边界 `snake_case`
- **修改代码后，你必须自己跑一次**:
  - `cd client && npx tsc -b`（TS 检查）
  - `cd client && npm run build`（构建检查）
  - 必要时跑 `node scripts/smoke-test.mjs`（冒烟测试）
- 如果有错误，请自行修复，不要把语法错误留给我。

#### 步骤 3 · 测试与汇报
- 涉及核心逻辑时，编写对应的单元测试或扩展 smoke-test.mjs 并运行。
- 任务完成后，**不要只说"做完了"**。请汇报：
  1. 具体修改了哪些文件（`git diff --stat` 输出）
  2. 做了哪些关键决策
  3. 跑过哪些验证命令 + 结果
  4. 如果有未解决的潜在问题，请指出

---

## 5 · 报错处理机制

### 5.1 三层策略（来自 systematic-debugging Skill）

| 层级 | 触发条件 | 行动 |
|------|---------|------|
| **L1 直接修复层** | 语法/类型/import 错误 | 直接喂代码修复 |
| **L2 引导式诊断层** | 复杂行为异常 | 提供上下文（错误位置/堆栈/复现步骤/已尝试），让 AI 给 3-5 种可能原因 |
| **L3 手动深度介入层** | 竞态/底层依赖 Bug | 用 DevTools/Console/网络抓包/Egolite 工具排查 |

### 5.2 "行为异常"类 Bug 第一动作（CSS 布局铁律 2）

**绝对不要**：看到 drag/click/animation 异常就改事件链。**改 ≥3 次还不通，必须停下来**。

**正确流程**（5 分钟自检）:
1. 用 `playwright_evaluate` dispatch mousedown/mousemove，console.log 每次 handler 输出
2. 看 store 是否每次都 set() 成功（`fiber.memoizedProps` 立即更新?）
3. 看 DOM 是否 commit（`getBoundingClientRect()` 立即变化?）
4. 看 React 是否有 error/warning（`console_logs type=error`）
5. **如果 JS 路径 100% 正常** → 把假设转向 CSS 布局层
6. **如果 JS 路径异常** → 才回头修事件链/deps/store

**口诀**: "先验 JS 路径，后查 CSS 布局"。

### 5.3 报错升级阈值

- 自行尝试修复**最多 3 次**。
- 如果 3 次后仍然失败，停止操作，向我汇报：
  - 完整的报错日志
  - 你认为的原因
  - 你打算尝试的下一步方案
  - 涉及的猜测假设列表（按概率排序）

---

## 6 · Git 提交规范

### 6.1 提交原则
- **不要自行执行 `git add` 或 `git commit`**，除非我明确要求。
- 提交粒度：每个原子化改动（一个 feature/fix/refactor = 一次 commit）。

### 6.2 Commit 消息格式

遵循 Conventional Commits：

```bash
feat: 新增 AI 一键美化算法
fix: 修复文字拖动变竖排 bug（CSS shrink-to-fit）
refactor: 拆分 PropertiesPanel 为子组件
docs: 更新 README 部署章节
test: 补充冒烟测试到 60 个检查点
chore: 升级 zustand 到 5.0
```

### 6.3 发布流程（DMG / 部署）

1. `cd client && npm run build` — 构建 Web
2. `npm run app:mac` — 构建 DMG
3. `xattr -d com.apple.quarantine /Applications/CoverForge.app` — 去除隔离
4. 验证 DMG 可运行
5. `git tag -a "v1.x.x" -m "..."` → 推送双端（origin + gitee）
6. GitHub Releases 上传 DMG

---

## 7 · CoverForge 项目特有规则

### 7.1 CSS 布局铁律（2026-07-25 教训固化）

任何 `position: absolute` + `left: x%` 元素**必须显式 width**，否则向右拖动会被 shrink-to-fit 压扁。

| 元素类型 | 正模式 |
|---------|--------|
| 文字 | `width: 'max-content'; maxWidth: '95%';` |
| 图片 | `width: \`${element.width}%\`;`（与 shape 一致）|
| 形状 | `width: ${w}%; height: ${h}%;`（已有）|

### 7.2 Canvas 元素保护规则（2026-07-21 教训固化）

- **背景层**（`isBackgroundElement`）永远锁定在所有元素之下，**任何拖动/缩放/删除/上下移**操作一律 return。
- **id 命名约定**: `bg-` 开头 = 背景，`main-` 开头 = 主标题，`sub-` 开头 = 副标题，`test-` 开头 = 测试用（冒烟脚本会自动清理）。
- **图层顺序**: 所有改顺序的入口（`moveLayerUp/Down/ToTop/ToBottom/AddElement/Sort/Reverse`）必须一致检查背景层。**漏一个 = 漏**。

### 7.3 Store 持久化铁律

- `zustand/persist` 的 `partialize` **必须**过滤 base64 图片（`src: '__IMAGE_LOST__'` 占位符），否则超 5MB localStorage 限制。
- 任何新增的 state 字段 → 想清楚是否要持久化（用户偏好如 `forceNoStroke` 才需要）。
- `useEditorStore.persist.hasHydrated()` + `onFinishHydration` 双保险，**避免 App.tsx 启动 useEffect 覆盖 hydrate 数据**。

### 7.4 5 大设计风格预设（properties）

`client/src/utils/styles.ts` 固化的设计风格（包豪斯/意大利/新拟物/瑞士/日式），每个 style 含完整 designer Prompt 决策树。**改风格时改这里，不要散落在组件里**。

### 7.5 部署双端（Cloudflare + EdgeOne）

- 任何发布**必须同时部署两个 Pages 平台**。
- ONNX 模型文件（isnet 88MB + ORT wasm 23MB + resources.json）超 25MB Pages 限制，部署前**必须排除**：`rm -rf dist/models dist/resources.json dist/onnxruntime-web dist/assets/*.wasm`，前端 `checkModelAvailable()` 自动降级到 K-means 抠图。
- Cloudflare: `wrangler pages deploy <deploy-dir> --project-name createcover`
- EdgeOne: 用 `deploy_folder` 集成工具

---

## 8 · 触发复盘的条件

满足任一即触发 `~/.claude/WORKING-STYLE.md` 第六章 + 本文件第 5.2 节流程：

- 我连续 2 次反馈"X 行为异常"，修了 ≥3 次还没解决
- 同一类 bug 在同一项目里出现 ≥2 次
- 修复后发现根因不在第一假设（JS 层 → CSS 层，或前端 → 后端）
- 同一 session 跑了 ≥20 次工具调用还没闭环

---

**最后提醒**：本文件**不是死文档**。遇到新 Trap / 新规则 / 新流程，欢迎提出"我们在 AGENTS.md 加一条：..."让我更新。本文件融合在 `~/.claude/WORKING-STYLE.md` 之上，全局规则变更优先改主库。
