# CoverForge — 自媒体封面标题生成工具

可视化封面编辑器：选模板 → 改文字/图片 → AI 生成爆款标题 → 导出高清 PNG。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Zustand + Tailwind CSS + html2canvas
- **后端**：Node.js + Express + Sharp（K-means 抠图）
- **数据**：JSON 文件存储（`server/data/projects.json`）

## 快速开始

### 开发模式（前后端分离，热更新）

```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

npm run dev
```

- 前端：http://localhost:5176
- 后端：http://localhost:3006

### 生产模式（单服务，后端托管前端）

```bash
npm run build   # 构建前端 + 后端
npm start       # 启动，访问 http://localhost:3006
```

## 功能

- 画布编辑：4 种比例（3:4 / 1:1 / 9:16 / 16:9）、拖拽、双击内联编辑
- 元素：文字（字体/描边/阴影）、图片（滤镜/圆角/抠图）、形状（5 种）
- 模板：12 个精选模板（抖音/小红书/公众号/B 站/INS/日签/直播/电商）
- 标题：14 个爆款公式 + CTR 评分 + 排序
- 项目：保存 / 打开 / 删除（服务端持久化）
- 导出：2x 高清 PNG

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` 或 `Ctrl/Cmd + Y` | 重做 |
| `Ctrl/Cmd + S` | 保存项目 |
| `Ctrl/Cmd + D` | 复制选中元素 |
| `Ctrl/Cmd + ]` | 上移一层（Figma 风格） |
| `Ctrl/Cmd + [` | 下移一层 |
| `Ctrl/Cmd + Shift + ]` | 移到最顶层 |
| `Ctrl/Cmd + Shift + [` | 移到最底层 |
| `Delete / Backspace` | 删除选中元素 |
| `方向键` | 微调位置（`Shift` 加速） |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/templates?ratio=&category=` | 模板列表 |
| GET | `/api/templates/:id` | 模板详情 |
| POST | `/api/titles/generate` | 生成标题 `{ keyword, count }` |
| POST | `/api/cutout` | 抠图 `{ image: dataURL }`（≤10MB，PNG/JPG/WebP） |
| GET | `/api/projects` | 项目列表 |
| GET | `/api/projects/:id` | 项目详情 |
| POST | `/api/projects` | 新建项目 |
| PUT | `/api/projects/:id` | 更新项目 |
| DELETE | `/api/projects/:id` | 删除项目 |

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `PORT` | `3006` | 后端端口 |
| `VITE_API_URL` | 开发 `http://localhost:3006/api` / 生产 `/api` | 前端 API 地址（一般无需设置） |

## 部署

任意支持 Node.js 18+ 的平台（VPS / Railway / Render）：

```bash
npm run build
PORT=8080 npm start
```

注意：项目数据存储在 `server/data/`，抠图产物在 `server/uploads/`，部署时需持久化这两个目录。

## 目录结构

```
CreateCover/
├── client/          # React 前端
│   └── src/
│       ├── components/   # Toolbar / Canvas / 属性面板 / 项目管理
│       ├── store/        # Zustand 状态（含撤销重做）
│       ├── hooks/        # 键盘快捷键
│       ├── data/         # 12 个模板 + 标题库
│       └── utils/        # API 封装 + 标题生成
├── server/          # Express 后端
│   └── src/routes/       # templates / titles / projects / cutout
└── shared/          # 共享类型
```
