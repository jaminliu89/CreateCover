# CoverForge 任务看板

> **当前迭代**：v1.5 — Electron 安全加固
> **更新时间**：2026-08-15
> **状态说明**：✅ 完成 · 🚧 进行中 · ⏳ 待启动 · ⚠️ 阻塞

---

## Gate 0 · 已完成（基线）

所有已上线、冒烟测试 68/68 通过的功能。

| ID | 任务 | 版本 | 状态 |
|----|------|------|------|
| G0-1 | 画布编辑器核心（拖拽/缩放/旋转/撤销） | v1.0 | ✅ |
| G0-2 | 文字元素（双击编辑/字号/字重/字体/颜色） | v1.0 | ✅ |
| G0-3 | 图片元素（导入/拖拽/圆角/边框/滤镜） | v1.0 | ✅ |
| G0-4 | 形状元素（矩形/圆/标签/线条/遮罩） | v1.0 | ✅ |
| G0-5 | 模板库（分类/平台过滤/搜索） | v1.0 | ✅ |
| G0-6 | PNG 导出 | v1.0 | ✅ |
| G0-7 | K-means 抠图降级 | v1.1 | ✅ |
| G0-8 | Canvas 背景导出引擎 | v1.1 | ✅ |
| G0-9 | 文字排版增强 P0+P1（8 项） | v1.2 | ✅ |
| G0-10 | ONNX 抠图（双模式自动降级） | v1.3 | ✅ |
| G0-11 | 智能吸附参考线 | v1.3 | ✅ |
| G0-12 | 构图参考线（三分/黄金/中心） | v1.3 | ✅ |
| G0-13 | SVG 矢量导出 | v1.4 | ✅ |
| G0-14 | WebP 导出 | v1.4 | ✅ |
| G0-15 | AI 自动排版（文字密度算法） | v1.4 | ✅ |
| G0-16 | 文字转图片（防字体丢失） | v1.4 | ✅ |
| G0-17 | 文字特效（发光/3D/雕印） | v1.4 | ✅ |
| G0-18 | 字符级彩虹描边 | v1.4 | ✅ |
| G0-19 | Electron 桌面端（初版） | v1.4 | ✅ |

---

## Gate 1 · 代码质量修复（已完成）

| ID | 任务 | 版本 | 状态 |
|----|------|------|------|
| G1-1 | 补全 types.ts 类型定义（15+ 字段） | v1.4.1 | ✅ |
| G1-2 | 修复 SVG 导出图片比例失真 | v1.4.1 | ✅ |
| G1-3 | 清理 cutout.ts 死代码（kmeansPPInit/colorDistance） | v1.4.1 | ✅ |
| G1-4 | 修复径向渐变 circle 半径计算错误 | v1.4.1 | ✅ |

---

## Gate 2 · Electron 安全加固（当前）

**目标**：移除 `webSecurity: false` 和 `disableHardwareAcceleration()`，用 `protocol.handle` 替代本地 HTTP server，恢复标准 Electron 安全模型。

| ID | 任务 | 优先级 | 状态 | 验收标准 |
|----|------|--------|------|----------|
| G2-1 | 用 protocol.handle 注册 app:// scheme 替代 HTTP server | P0 | ✅ | 页面通过 app://coverforge/index.html 加载，所有静态资源正常 |
| G2-2 | 恢复 webSecurity: true（默认值） | P0 | ✅ | 移除 webSecurity: false 配置项 |
| G2-3 | 恢复 GPU 硬件加速 | P1 | ✅ | 移除 disableHardwareAcceleration()，应用启动后 GPU 进程正常不崩溃 |
| G2-4 | ONNX 模型文件通过 protocol 提供 | P0 | ✅ | /models/ 和 /onnxruntime-web/ 路径已映射到 Resources |
| G2-5 | preload + IPC 链路验证 | P1 | ✅ | preload 已启用，capture-page IPC handler 保留 |
| G2-6 | 构建 DMG 验证 | P0 | ✅ | npm run app:mac 成功，DMG 安装后可启动不崩溃 |

---

## Gate 3 · 待规划

| ID | 任务 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| G3-1 | data/index.ts 与 types.ts 类型去重统一 | P2 | ⏳ | 两个文件重复定义 TextElement/ImageElement/ShapeElement |
| G3-2 | GuideOverlay 改用 Tailwind 替代 inline style | P3 | ⏳ | 代码风格一致性 |
| G3-3 | 抠图 _fallbackNotified 改为 per-session 可重置 | P3 | ⏳ | 用户切换模式时应重新提示 |
| G3-4 | 导出 SVG 背景渐变支持 | P2 | ⏳ | 当前 SVG 导出只有白色背景 |

---

## 工作流规则

1. **任何代码改动之前**，先更新本文档（对应任务行 → 🚧 进行中）
2. **改动完成并验证后**，更新为 ✅，同时更新 PRD.md 版本行
3. **单次改动 ≤ 3 个文件**（lock 级别保护）
4. **每改完一个 Gate**，必须跑：tsc -b → vitest run → npm run build → smoke-test.mjs
