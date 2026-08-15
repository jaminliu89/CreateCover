# Parchment Design System v3.3
> **Core Aesthetic Philosophy**: 人文 (Humanistic) · 留白 (Generous Space) · 克制 (Quiet Restraint) · 史诗 (Epic Proportions)

---

## 01. 系统的哲学精神 (System Thesis)

Parchment 不仅仅是一套 UI 控件库，而是一个面向 **创作者工具 (Creator Tools) 与 AI 工作空间 (AI Workspaces)** 的通用视觉操作系统。

在 v3.3 中，我们明确凝练四大核心精神基石：

```
                    ┌──────────────────────────┐
                    │  Parchment v3.3 四大基石  │
                    └─────────────┬────────────┘
                                  │
         ┌────────────────┬───────┴────────┬────────────────┐
         ▼                ▼                ▼                ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  人 文   │     │  留 白   │     │  克 制   │     │  史 诗   │
   │Humanistic│     │Space/Pacing│   │Restraint │     │   Epic   │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

### 🧠 人文 (Humanistic Editorial)
* **温润纸感与纸墨意境**：告别冷冰冰的蓝灰科技感（No SaaS Blue）。底色采用温润羊皮纸/云雾白 (`#F9F8F6`) 与石墨沉香黑 (`#1A1A1E`)，营造典雅的书卷气与长久阅读的舒适感。
* **经典衬线与现代无衬线的律动**：以 Sans（无衬线）保障高密度界面的精准操作，以 Editorial Serif（衬线体）表达思考、灵感与长文人文温度。

### 🍃 留白 (Generous Space & Breath)
* **呼吸感胜过隔离线**：坚决摒弃靠繁复的边框（Borders）和卡片框线分割界面的旧习。使用大面积的**负空间（Negative Space）与比率间距**建立天然的视线秩序。
* **光影节奏 (Optical Pacing)**：留白不是空白，而是给用户思考与专注创作留出心智空间。

### 🕯️ 克制 (Quiet Restraint)
* **极简 Chrome，内容至上**：所有的按钮、边框、侧边栏均处于“静默（Quiet）”状态。只有当用户产生交互意图（Hover / Focus / Active）时， affordance 才精确显现。
* **去色彩霸权**：拒绝彩虹般炫目的 AI 渐变或饱和度过高的装饰状态。AI 被定义为“**静默的助手状态 (Behavioral State)**”，而非喧宾夺主的色彩主题。

### 🏛️ 史诗 (Epic Proportions & Timeless Hierarchy)
* **大开大合的视效张力**：运用**黄金分割与大尺度排版对比**（如 72px/48px 的典雅 Serif 巨幅标题 vs 12px 极为微弱的 Mono 元数据），呈现经典出版物级别的震撼秩序。
* **永恒的时间感 (Timelessness)**：不盲从短期流行的拟态或玻璃伪影，打造十年后依然经得起审视的视觉契约。

---

## 02. 设计契约与视觉 DNA (Design Contracts)

### 2.1 表面与空间层级 (Surface & Spacing Scale)

拒绝靠阴影堆叠，使用 **色彩温暖度 (Warmth) + 空间密度** 表达层级：

```text
surface-0 (Page / Canvas)     #F9F8F6  ── 暖纸底层，极致开阔
surface-1 (Card / Container)  #FFFFFF  ── 创作承载面，纯净无噪
surface-2 (Raised / Sticky)   #F3F1ED  ── 沉淀操作面，温和嵌入
surface-3 (Floating / Dialog) #FFFFFF  ── 悬浮对话层，配极微弱漫反射阴影 (0 8px 32px rgba(26,26,30,0.06))
```

### 2.2 形状契约 (Semantic Geometry)

形状是语义的延伸，非随意的装饰：

| 形状类型 | 语义用途 | 规范尺寸/圆角 |
| --- | --- | --- |
| **Control (标准控件)** | 次级按钮、输入框、菜单项 | `9px` 圆角 (`radius-control`) |
| **Surface (卡片与容器)** | 编辑器容器、弹窗、侧边栏 | `12px` 圆角 (`radius-surface`) |
| **Pill (胶囊状)** | 仅用于状态指示 (Status Chip / Tag) | `9999px`（**禁止**将常规按钮做成 Pill）|
| **Circle (圆形)** | 单一独立图标按钮、用户头像 | `50%` 圆形 |

---

## 03. Token 架构与编译流 (Token Architecture)

系统的 JSON Token 设计遵循五层派生链：

```
Primitive Token (原始色值/数值)
  └─► Semantic Token (语义别名: text.primary, surface.page)
        └─► Component Token (组件绑定: button.height, input.radius)
              └─► AI State Token (AI 状态别名: ai.diffAdded, ai.suggestion)
                    └─► Platform Output (Style Dictionary 编译输出 CSS / SCSS / TS / iOS / Android)
```

---

## 04. AI-Native 交互状态契约 (Quiet AI States)

AI 在 Parchment 3.3 中拥有 **9 种静默行为语义**，绝对不自动使用紫色/彩虹渐变：

```css
/* AI 语义状态定义 (非侵入式) */
--parchment-ai-suggestion: #FAF6F0;     /* 建议状态：温暖米黄 */
--parchment-ai-suggestion-border: #E6DEC6;
--parchment-ai-processing: #F3EFE6;     /* 推理/生成中：柔和呼吸感 */
--parchment-ai-diff-added: #E6F4EA;     /* AI 增加内容：柔和植物绿 */
--parchment-ai-diff-removed: #FCE8E6;   /* AI 删除/冲突：柔和绯红 */
```

### AI 交互三准则：
1. **可逆性 (Reversibility)**：任何 AI 生成的操作都必须提供 1-click `Accept / Reject / Diff` 结构化响应。
2. **从属关系 (Subordination)**：在用户未采纳前，AI 建议的视觉权重必须低于用户原稿。
3. **消除焦虑 (Calm Processing)**：AI 推理过程使用微弱的光感脉冲，非剧烈的 Spinner 旋转。

---

## 05. CJK 东方排版与光学校准 (CJK Optical Alignment)

针对中日韩（CJK）文字在西文混排下的字重感与间距问题，引入**光学微调算法规范**：

```css
/* Parchment CJK 光学微调规则 */
:lang(zh), :lang(ja), :lang(ko) {
  font-family: "Inter", -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  line-height: 1.65;             /* 比西文 1.5 略宽，保障方块字呼吸感 */
  letter-spacing: 0.025em;       /* 稍微张开字距，避免中文字块压迫感 */
}

/* 史诗级衬线标题 CJK 降级方案 */
.parchment-editorial-title {
  font-family: "Source Serif Pro", Georgia, "Noto Serif SC", "Songti SC", serif;
  font-weight: 600;
  letter-spacing: -0.01em;
}
```

---

## 06. 通用生态演进路线 (System Roadmap)

1. **多端 Token 构建 pipeline**：使用 Style Dictionary 将 `parchment.v3.3.tokens.json` 一键导出 CSS Variable, SCSS, Tailwind Plugin, iOS Swift, Android XML。
2. **React 无头组件库 (`@parchment-ui/react`)**：提供无风骨（Unstyled）但具备 Parchment 交互契约与 A11y 键盘可访问性的 React 组件封装。
3. **Storybook 交互展示**：搭建独立部署的 Storybook 沙盒，支持全状态与 Dark/Light 切换。
