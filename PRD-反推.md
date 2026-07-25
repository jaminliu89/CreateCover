# CreateCover（CoverForge）产品需求文档（反推）

> 基于全量代码分析反向推导，2026-07-25 更新

---

## 一、产品定位

**一句话定义**：自媒体封面标题生成工具 —「选模板 → 改文字/图片 → AI 辅助设计 → 导出高清封面」全流程可视化编辑器。

**目标用户**：自媒体运营者、短视频创作者、电商运营、封面设计师，无需 PS 技能即可快速产出高质量封面图。

**核心价值**：
1. 无需设计经验：300+ 模板 + AI 辅助设计（一键美化/配色/构图）
2. 爆款标题库：120+ 预置标题（含 CTR 评分）+ 标题公式引擎
3. 全在线操作：浏览器打开即用，支持本地导入图片、模板打包分享

---

## 二、用户故事与流程

### 2.1 核心流程

```
选画布比例 → 选模板 / 空白开始 → 编辑文字/图片/形状 → 
AI 辅助美化 → 导出高清 PNG
```

### 2.2 完整用户故事

| # | 角色 | 故事 | 对应功能 |
|---|------|------|----------|
| US1 | 创作者 | 我想选一个适合抖音/小红书的封面比例，然后套用模板快速开始 | 比例切换（3:4/1:1/9:16/16:9）+ 模板库 |
| US2 | 创作者 | 我想修改模板里的文字内容和样式 | 双击编辑文字 + 字号/字体/颜色/描边/阴影/对齐/背景块 |
| US3 | 创作者 | 我想替换模板里的图片 | 导入图片 + 拖拽缩放 + 圆角/边框/滤镜 |
| US4 | 创作者 | 我想加一些形状装饰元素 | 添加矩形/圆形/标签/线条 + 颜色/圆角/透明度 |
| US5 | 创作者 | 我想微调元素位置/大小/旋转 | 拖拽移动 + 8 点缩放手柄 + 旋转手柄 + 右键菜单 |
| US6 | 创作者 | 我想多选几个元素一起操作 | Ctrl+点击多选 + 批量拖动 + 编组 |
| US7 | 创作者 | 我想让文字更好看 | AI 一键美化 + 智能配色 + 设计风格（7 种）|
| US8 | 创作者 | 我想要更好的版式布局 | 黄金构图 + 三分构图 + 居中堆叠 + 版面推荐 |
| US9 | 创作者 | 我想生成爆款标题 | 标题库（120+条按分类/CTR 浏览）或标题公式（30+填空） |
| US10 | 创作者 | 我想去掉图片背景 | 一键抠图（本地 ONNX 模型 / 服务端 K-means 双模式）|
| US11 | 创作者 | 我想把文字/形状变成图片（防止字体丢失） | 元素栅格化 |
| US12 | 创作者 | 我想把设计保存下来以后继续改 | 项目管理（保存/打开/删除）|
| US13 | 创作者 | 我想导出高清封面图 | 导出 2x PNG（html2canvas）|
| US14 | 创作者 | 我想把模板分享给别人 | 模板打包为 .cccover.json + 导入 |
| US15 | 创作者 | 我想撤销操作 | 撤销/重做（Ctrl+Z/Y，最多 30 步）|
| US16 | 创作者 | 我想对齐多个元素 | 6 方向对齐 + 水平/垂直分布 |
| US17 | 创作者 | 我粘贴了一张图片想直接用 | Ctrl+V 粘贴图片到画布 |
| US18 | 创作者 | 我拖了一张图片到浏览器想直接用 | 文件拖放导入图片 |
| US19 | 创作者 | 我想固定设计稿比例 | 元素锁定（锁定后不可缩放旋转，仍可移动）|
| US20 | 创作者 | 我想保留当前排版作为模板 | 另存为预设 + 加载预设 |

---

## 三、功能模块清单

### 模块 A：画布编辑器（Canvas）

| 功能 | 状态 | 说明 |
|------|------|------|
| 画布比例切换 | ✅ | 3:4 / 1:1 / 9:16 / 16:9 |
| 视口缩放 | ✅ | 20%-400%，滚轮缩放 + 按钮 +/-/适应 |
| 元素拖拽移动 | ✅ | 百分比坐标，吸附边界 |
| 元素缩放（8 方向）| ✅ | 4 角 + 4 边缩放手柄，文字缩放 fontSize |
| 元素旋转 | ✅ | 顶部旋转手柄 + 双击回正 |
| 元素翻转 | ✅ | 水平/垂直翻转 |
| 双击文字编辑 | ✅ | 内联 textarea，Enter 换行/Shift+Enter 保存 |
| 多选 | ✅ | Ctrl+点击 或 框选（已移除框选）|
| 对齐辅助线 | ✅ | 粉色参考线 + 距离气泡 |
| 文件拖入 | ✅ | 拖拽图片到画布自动创建图片元素 |
| 粘贴图片 | ✅ | Ctrl+V 粘贴剪贴板图片 |
| 右键菜单 | ✅ | 复制/锁定/编组/栅格化/层级/删除 |
| 框选 | ❌ | 已移除（用户要求） |

### 模块 B：元素系统

| 元素类型 | 支持属性 | 交互 |
|----------|----------|------|
| **文字** | content/fontSize/fontWeight/fontFamily/color/textAlign/italic/underline/stroke/shadow/bg/bgColor/bgPadding/rotation/opacity/locked | 双击编辑 + 拖拽移动 + 缩放旋转 |
| **图片** | src/x/y/width/rotation/radius/border/ shadow/filter/opacity/useCutout/flip | 导入/替换 + 拖拽 + 缩放旋转 |
| **形状** | shape/color/x/y/width/height/rotation/opacity/radius/border | rect/circle/tag/line/overlay |

### 模块 C：AI 工具箱

| 功能 | 实现方式 | 适用范围 |
|------|----------|----------|
| 爆款标题 | 预置库（120+条，8 类）+ 30+ 填空公式 | 选中文字元素 |
| 智能配色 | 本地 HSL 算法 + WCAG 对比度检查 | 全局（基于背景色）|
| 一键美化 | 本地算法：主标题放大 + 字重加粗 + 对比度优化 | 全局 |
| 黄金构图 | 四种构图算法（三分/黄金比例/螺线/居中） | 全局 |
| 设计风格 | 7 种风格预设（包豪斯/意大利/新拟物/瑞士/日式等） | 全局 |
| 版面推荐 | 3 种布局 preset | 全局 |
| 一键抠图 | 双模式：浏览器 ONNX / 服务端 K-means | 选中图片元素 |
| 智能生成 | 标题公式填充（占位符替换） | 空白画布 |

### 模块 D：模板系统

| 功能 | 状态 | 详情 |
|------|------|------|
| 模板库 | ✅ | 12 个精选模板 + pro 版，按比例/平台/分类过滤 |
| 点击套用 | ✅ | 模板元素直接加载到画布 |
| 模板打包 | ✅ | 导出为 .cccover.json |
| 模板导入 | ✅ | 导入 .cccover.json |
| 用户预设 | ✅ | 自定义设计另存为预设 |
| 预设管理 | ✅ | 保存/加载/删除预设 |

### 模块 E：排版辅助

| 功能 | 状态 | 详情 |
|------|------|------|
| 图层上移/下移 | ✅ | + 置于顶层/底层 |
| 图层锁定 | ✅ | 锁大小比例但仍可拖动 |
| 编组 | ✅ | 选中多元素编组 + 取消编组 |
| 栅格化 | ✅ | 文字/形状 → 图片 |
| 对齐 | ✅ | 6 方向（左/中/右/上/中/下）|
| 分布 | ✅ | 水平分布 + 垂直分布 |
| 微调（方向键）| ✅ | 1px 步进，Shift=10px |

### 模块 F：项目与存储

| 功能 | 状态 | 详情 |
|------|------|------|
| 自动保存 | ✅ | Zustand persist → localStorage |
| 项目管理 | ✅ | 保存/打开/删除（API）|
| 撤销/重做 | ✅ | 30 步历史栈 |
| 导出高清 PNG | ✅ | 2x scale（html2canvas）|
| 快捷键 | ✅ | 完整 Figma 风格快捷键体系 |

### 模块 G：服务端

| 接口 | 方法 | 用途 |
|------|------|------|
| `/api/templates` | GET | 模板列表 |
| `/api/templates/:id` | GET | 模板详情 |
| `/api/titles/generate` | POST | 标题生成 |
| `/api/projects` | GET/POST | 项目 CRUD |
| `/api/projects/:id` | GET/PUT/DELETE | 项目详情/更新/删除 |
| `/api/cutout` | POST | K-means 抠图 |
| `/api/render` | POST | 服务端 SVG/PNG 渲染 |

---

## 四、数据模型

### 4.1 Element 联合类型

```typescript
type Element = TextElement | ImageElement | ShapeElement
```

#### TextElement
| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| id | string | 必填 | 唯一标识 |
| type | `'text'` | 固定 | — |
| content | string | `''` | 文字内容，支持 `\n` 换行 |
| x, y | number | 50 | 画布百分比坐标（中心对齐） |
| fontSize | number | 48 | 字号 |
| fontWeight | number | 700 | 字重 |
| fontFamily | string | `'Inter, sans-serif'` | 字体 |
| color | string | `'#FFFFFF'` | 文字颜色 |
| textAlign | `'left'\|'center'\|'right'` | `'center'` | 对齐方式 |
| italic | boolean | false | 斜体 |
| underline | boolean | false | 下划线 |
| stroke | boolean | false | 是否开启描边 |
| strokeWidth | number | optional | 描边宽度 |
| strokeColor | string | optional | 描边颜色 |
| shadow | boolean | false | 文字阴影 |
| bg | boolean | false | 文字背景块 |
| bgColor | string | `'rgba(0,0,0,0.5)'` | 背景块颜色 |
| bgPadding | number | 12 | 背景块内边距 |
| rotation | number | 0 | 旋转角度 |
| opacity | number | 1 | 透明度 0-1 |
| flipH, flipV | boolean | optional | 水平/垂直翻转 |
| locked | boolean | optional | 锁定（不可缩放旋转） |
| groupId | string | optional | 编组 ID |

#### ImageElement
| 字段 | 类型 | 说明 |
|------|------|------|
| type | `'image'` | — |
| src | string | base64 或 URL，持久化时标记为 `__IMAGE_LOST__` |
| width | number | 百分比宽度 |
| rotation | number | 旋转 |
| radius | number | 圆角 |
| border | number | 边框宽度 |
| borderColor | string | 边框颜色 |
| filter | string | CSS filter 值 |
| useCutout | boolean | 是否已抠图 |
| originalWidth/Height | number | optional，原始尺寸 |
| 其余同 TextElement | — | x/y/opacity/flip/locked/groupId |

#### ShapeElement
| 字段 | 类型 | 说明 |
|------|------|------|
| type | `'shape'` | — |
| shape | `'rect'\|'circle'\|'tag'\|'line'\|'overlay'` | 形状类型 |
| width, height | number | 百分比尺寸 |
| color | string | 填充色 |
| radius | number | 圆角（rect/tag）|
| 其余同 TextElement | — | x/y/rotation/opacity/border/locked/groupId |

### 4.2 模板

```typescript
interface CoverTemplate {
  format: string          // 'createcover.template.v1'
  name: string
  ratio: Ratio
  elements: Element[]
  createdAt?: string
}
```

### 4.3 项目

```typescript
interface Project {
  id: string
  name: string
  ratio: Ratio
  elements: Element[]
  thumbnail: string       // base64
  createdAt: string
  updatedAt: string
}
```

---

## 五、状态管理（Zustand Store）

**核心状态**（~30 个字段）：

| 状态 | 类型 | 说明 |
|------|------|------|
| elements | Element[] | 画布元素 |
| ratio | Ratio | 画布比例 |
| selectedId | string\|null | 当前选中 |
| multiSelectedIds | string[] | 多选列表 |
| editingElementId | string\|null | 文字编辑态 |
| history/historyIndex | (Element[] + scroll)[] / number | 撤销栈，最多 30 |
| viewportZoom | number | 视口缩放 0.2-4 |
| forceNoStroke | boolean | 默认无描边 |
| userPresets | Preset[] | 用户预设库 |
| currentProjectId/Name | string | 当前项目信息 |
| dirty | boolean | 未保存标记 |

**核心 Actions**（~35 个）：增删改元素、选择管理、变换、图层、编组、对齐/分布、栅格化、锁定、历史、项目、预设。

---

## 六、非功能性需求

### 6.1 性能

| 指标 | 目标 |
|------|------|
| 画布元素数 | 支持 50+ 元素流畅操作 |
| 撤销步数 | 30 步，含完整元素快照 |
| 导出时间 | 5 秒内完成 2x PNG 导出 |
| 抠图推理 | 本地 ONNX ≈ 3-8 秒（GPU）/ 15-30 秒（CPU） |
| 模板加载 | 点击即应用（<100ms）|
| 画布缩放 | 滚轮即时缩放，无卡顿 |

### 6.2 兼容性

| 维度 | 要求 |
|------|------|
| 浏览器 | Chrome/Firefox/Safari/Edge 最新 2 个主版本 |
| 屏幕 | ≥1280×720，768px 宽度可编辑 |
| 离线 | 设计功能全离线（模板/标题/美化/构图均本地算法）|
| 网络 | 仅项目管理/抠图（服务端）/首次模型下载需要网络 |

### 6.3 存储

| 数据 | 存储位置 | 容量控制 |
|------|----------|----------|
| 编辑状态 | localStorage | 过滤 base64 图片，≤5MB |
| 项目 | 服务端 JSON 文件 | 服务端无上限 |
| 抠图模型 | 浏览器缓存（IndexedDB）| 约 130MB（含 ORT WASM）|
| 用户预设 | localStorage | ≤50 个 |

---

## 七、业务规则

| # | 规则 | 说明 |
|---|------|------|
| 1 | 背景元素锁定 | overlay 形状和 id 以 `bg-` 开头的元素不可移动/删除/缩放/图层操作 |
| 2 | 图层保护 | 所有元素必须在背景层之上，moveLayerDown/moveLayerToBottom 受保护 |
| 3 | 锁定元素 | locked 元素仍可拖拽移动，但不可缩放/旋转 |
| 4 | 默认无描边 | forceNoStroke = true，用户可手动开启 |
| 5 | 图片 base64 过滤 | localStorage 持久化时图片 src 标记为 `__IMAGE_LOST__` |
| 6 | 文字编辑 | Enter = 换行，Shift+Enter = 保存退出，Esc = 取消 |
| 7 | 多选范围 | 多选时属性面板显示"混合"值（琥珀色）|
| 8 | 删除保护 | 背景元素和空文字不可删除 |
| 9 | 视图缩放范围 | 20%-400%，适应按钮自动计算最优缩放 |
| 10 | 导出 | html2canvas 2x scale，onclone 阶段去除阴影避免白边 |
| 11 | 抠图档位 | 四档统一使用 isnet_fp16 模型（本地仅有此模型）|
| 12 | 栅格化限制 | 图片元素和 overlay 形状不可栅格化 |

---

## 八、已知已知问题 / 待优化

| # | 问题 | 优先级 |
|---|------|--------|
| 1 | 抠图模型 CDN 内容变更（@imgly 服务端返回 PyTorch 而非 ONNX），本地模型格式不匹配 | **高** |
| 2 | TextElement 类型缺少 `width` 字段，多处使用 `as any` | 中 |
| 3 | 图片元素 base64 持久化丢失（标记 `__IMAGE_LOST__` 需重新上传）| 低 |
| 4 | 多选时部分属性面板未合并显示 | 低 |
| 5 | 未接入 LLM 的「批量标题生成」功能 | 低 |
| 6 | 模板库按比例/分类筛选时部分筛选条件无结果（空状态处理）| 低 |
