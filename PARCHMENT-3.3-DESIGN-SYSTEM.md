# Parchment Design System v3.3
> **Core Aesthetic Philosophy**: 人文 (Humanistic) · 留白 (Generous Space) · 克制 (Quiet Restraint) · 史诗 (Epic Proportions)
> **Color Voice**: 现代极简纯净色系 (Modern Minimalist Pure Neutrals) — 极致冷洁白 + 纯净石墨黑 + 冰川微灰

---

## 01. 系统的哲学精神 (System Thesis)

Parchment 不仅仅是一套 UI 控件库，而是一个面向 **创作者工具 (Creator Tools) 与 AI 工作空间 (AI Workspaces)** 的通用视觉操作系统。

在 v3.3 中，我们将“现代极简”的纯净色彩质感注入四大核心精神基石：

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
* **现代极简纯净色彩**：告别温暖羊皮纸/云雾白，全面转向**纯净冰川灰底 (`#FAFAFA`) + 纯白质感层 (`#FFFFFF`) + 深邃石墨黑 (`#18181B`)**。如冷泉般通透无噪，带来现代科技与人文思考兼具的沉浸感。
* **经典衬线与现代无衬线的律动**：以 Sans（无衬线）保障高密度界面的精准操作，以 Editorial Serif（衬线体）表达思考、灵感与长文人文温度。

### 🍃 留白 (Generous Space & Breath)
* **呼吸感胜过隔离线**：坚决摒弃靠繁复的边框（Borders）和卡片框线分割界面的旧习。使用大面积的**负空间（Negative Space）与比率间距**建立天然的视线秩序。
* **光影节奏 (Optical Pacing)**：留白不是空白，而是给用户思考与专注创作留出心智空间。

### 🕯️ 克制 (Quiet Restraint)
* **极简 Chrome，内容至上**：所有的按钮、边框、侧边栏均处于“静默（Quiet）”状态。只有当用户产生交互意图（Hover / Focus / Active）时， affordance 才精确显现。
* **去色彩霸权**：拒绝彩虹般炫目的 AI 渐变或高饱和度装饰。AI 被定义为“**静默的行为状态 (Behavioral State)**”，而非喧宾夺主的色彩主题。

### 🏛️ 史诗 (Epic Proportions & Timeless Hierarchy)
* **大开大合的视效张力**：运用**黄金分割与大尺度排版对比**（如 72px/48px 的典雅 Serif 巨幅标题 vs 12px 极为微弱的 Mono 元数据），呈现经典出版物级别的震撼秩序。
* **永恒的时间感 (Timelessness)**：不盲从短期流行的拟态或玻璃伪影，打造十年后依然经得起审视的视觉契约。

---

## 02. 现代极简色彩与表面层级 (Modern Minimalist Palette & Surfaces)

拒绝偏黄偏暖的旧色彩，使用**绝对纯净的中性冷灰色阶**与空间密度表达层级：

```text
surface-0 (Page / Canvas)     #FAFAFA  ── 冰川极轻灰，纯净无瑕的开阔基底
surface-1 (Card / Container)  #FFFFFF  ── 纯白创作面，通透清晰
surface-2 (Raised / Sticky)   #F4F4F5  ── 现代灰色阶，沉淀操作面
surface-3 (Floating / Dialog) #FFFFFF  ── 悬浮层，配超微弱冷影 (0 8px 30px rgba(0,0,0,0.04))
```

---

## 03. Token 架构 (Token Architecture)

系统的 JSON Token 设计遵循五层派生链：

```
Primitive Token (现代极简色值/尺寸)
  └─► Semantic Token (语义别名: text.primary, surface.page)
        └─► Component Token (组件绑定: button.height, input.radius)
              └─► AI State Token (AI 状态别名: ai.diffAdded, ai.suggestion)
                    └─► Platform Output (Style Dictionary 编译输出 CSS / SCSS / TS / iOS / Android)
```

---

## 04. AI-Native 现代极简状态契约 (Quiet AI States)

AI 在 Parchment 3.3 中拥有 **9 种静默行为语义**，采用现代极简灰阶与极低饱和度微调：

```css
/* AI 语义状态定义 (现代极简纯净风格) */
--parchment-ai-suggestion: #F4F4F5;     /* 建议状态：极轻现代灰 */
--parchment-ai-suggestion-border: #E4E4E7;
--parchment-ai-processing: #F4F4F5;     /* 推理/生成中：柔和脉冲感 */
--parchment-ai-diff-added: #ECFDF5;     /* AI 增加内容：薄荷冷绿 */
--parchment-ai-diff-removed: #FEF2F2;   /* AI 删除/冲突：冰爽微红 */
```

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
  color: #18181B;
  letter-spacing: -0.01em;
}
```

---

## 06. 通用生态演进路线 (System Roadmap)

1. **多端 Token 构建 pipeline**：使用 Style Dictionary 将 `parchment.v3.3.tokens.json` 一键导出 CSS Variable, SCSS, Tailwind Plugin, iOS Swift, Android XML。
2. **React 无头组件库 (`@parchment-ui/react`)**：提供无风骨（Unstyled）但具备 Parchment 交互契约与 A11y 键盘可访问性的 React 组件封装。
3. **Storybook 交互展示**：搭建独立部署的 Storybook 沙盒，支持全状态与 Dark/Light 切换。
