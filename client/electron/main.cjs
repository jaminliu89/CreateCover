const { app, BrowserWindow, Menu, shell, protocol, ipcMain, net } = require('electron')
const path = require('path')
const fs = require('fs')

// ============================================================
// 常量
// ============================================================

const SCHEME = 'app'
const HOST = 'coverforge'
const ORIGIN = `${SCHEME}://${HOST}`

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
}

let mainWindow = null

// ============================================================
// 自定义协议：app://coverforge/*
//
// 替代本地 HTTP server 的标准做法：
//   - 安全：自定义协议 + contextIsolation = Electron 推荐安全模型
//   - 性能：比 localhost HTTP 少一层 TCP 栈
//   - 兼容：ONNX 模型 / WASM 都能正确加载（设置正确 MIME）
// ============================================================

function getDistPath() {
  // 打包后：app.asar 同级的 dist 目录；开发时：项目根的 dist
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'dist')
  }
  return path.join(__dirname, '../dist')
}

function getModelsPath() {
  // 打包后：Resources/models；开发时：public/models（通过 dist 访问）
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'models')
  }
  return path.join(__dirname, '../public/models')
}

function getOnnxRuntimePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'onnxruntime-web')
  }
  return path.join(__dirname, '../public/onnxruntime-web')
}

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME[ext] || 'application/octet-stream'
}

// 注册为 privileged（支持 fetch / Service Worker 等）
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: true,
      stream: true,
      codeCache: true,
    },
  },
])

function handleSchemeRequest(request) {
  const url = new URL(request.url)
  let reqPath = decodeURIComponent(url.pathname)

  // 根路径 → index.html
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html'
  }

  let filePath

  // 模型文件：/models/xxx → Resources/models/xxx
  if (reqPath.startsWith('/models/')) {
    filePath = path.join(getModelsPath(), reqPath.replace('/models/', ''))
  }
  // ONNX Runtime：/onnxruntime-web/xxx → Resources/onnxruntime-web/xxx
  else if (reqPath.startsWith('/onnxruntime-web/')) {
    filePath = path.join(getOnnxRuntimePath(), reqPath.replace('/onnxruntime-web/', ''))
  }
  // resources.json → Resources/resources.json（打包后）或 dist/resources.json（开发）
  else if (reqPath === '/resources.json') {
    const distPath = path.join(getDistPath(), 'resources.json')
    if (fs.existsSync(distPath)) {
      filePath = distPath
    } else if (app.isPackaged) {
      filePath = path.join(process.resourcesPath, 'resources.json')
    } else {
      filePath = path.join(__dirname, '../public/resources.json')
    }
  }
  // 普通静态资源 → dist/
  else {
    filePath = path.join(getDistPath(), reqPath)
  }

  // 安全检查：防止路径穿越
  const distPath = getDistPath()
  const modelsPath = getModelsPath()
  const onnxPath = getOnnxRuntimePath()
  const normalized = path.normalize(filePath)
  const inDist = normalized.startsWith(path.normalize(distPath))
  const inModels = normalized.startsWith(path.normalize(modelsPath))
  const inOnnx = normalized.startsWith(path.normalize(onnxPath))

  if (!inDist && !inModels && !inOnnx) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const data = fs.readFileSync(normalized)
    const contentType = getMime(normalized)
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  } catch {
    // SPA fallback：任何不存在的路径都返回 index.html
    try {
      const indexPath = path.join(getDistPath(), 'index.html')
      const indexData = fs.readFileSync(indexPath)
      return new Response(indexData, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    } catch {
      return new Response('Not Found', { status: 404 })
    }
  }
}

// ============================================================
// 窗口创建
// ============================================================

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'CoverForge - 自媒体封面编辑器',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      // 保持默认安全配置（不设 webSecurity: false）
      sandbox: false, // preload 用 Node API 时需要
    },
  })

  // 调试日志（仅开发环境）
  if (!app.isPackaged) {
    mainWindow.webContents.on('console-message', (e, level, message) => {
      const lvl = ['log', 'warn', 'error'][level] || `L${level}`
      console.log(`[renderer:${lvl}] ${message}`)
    })
  }
  mainWindow.webContents.on('render-process-gone', (e, details) => {
    console.error('[renderer:crash]', JSON.stringify(details))
  })

  // 注册协议处理器
  protocol.handle(SCHEME, handleSchemeRequest)

  // 加载应用
  await mainWindow.loadURL(`${ORIGIN}/index.html`)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  createMenu()
}

// ============================================================
// IPC
// ============================================================

ipcMain.handle('capture-page', async (_, rect) => {
  if (!mainWindow) return null
  const { x, y, width, height } = rect
  const image = await mainWindow.webContents.capturePage({ x, y, width, height })
  return image.toDataURL()
})

// ============================================================
// 菜单
// ============================================================

function createMenu() {
  const isMac = process.platform === 'darwin'
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: '关于 CoverForge' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    }] : []),
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ============================================================
// 应用生命周期
// ============================================================

// 必须在 ready 之前注册 scheme 特权
// （registerSchemesAsPrivileged 已经在上面调用了）

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  mainWindow = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
