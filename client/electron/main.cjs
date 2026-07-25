const { app, BrowserWindow, Menu, shell, protocol } = require('electron')
const http = require('http')
const fs = require('fs')
const path = require('path')

// 禁用 GPU 加速（解决 GPU 进程崩溃问题）
app.disableHardwareAcceleration()

let mainWindow
let server

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.mjs': 'application/javascript',
  '.ico': 'image/x-icon',
}

// 简易 HTTP 服务器：托管 dist/ + resources
function startServer() {
  const distPath = path.join(__dirname, '../dist')
  const resourcesPath = process.resourcesPath || path.join(__dirname, '..')

  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let url = req.url.split('?')[0]
      let filePath = path.join(distPath, url === '/' ? 'index.html' : url)

      // 资源路径映射: /resources/xxx → Resources/xxx
      if (url.startsWith('/resources/')) {
        const relPath = url.replace('/resources/', '')
        filePath = path.join(resourcesPath, relPath)
      }

      const ext = path.extname(filePath)
      const contentType = MIME[ext] || 'application/octet-stream'

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // SPA fallback
          fs.readFile(path.join(distPath, 'index.html'), (err2, data2) => {
            if (err2) {
              res.writeHead(404)
              res.end('404')
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end(data2)
            }
          })
        } else {
          res.writeHead(200, { 'Content-Type': contentType })
          res.end(data)
        }
      })
    })

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      console.log(`[server] http://127.0.0.1:${port}`)
      resolve(port)
    })
  })
}

async function createWindow() {
  const port = await startServer()

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'CoverForge - 自媒体封面编辑器',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, 'preload.cjs'),  // 暂时不用
      webSecurity: false,
    },
  })

  // 调试日志
  mainWindow.webContents.on('console-message', (e, level, message) => {
    const lvl = ['log', 'warn', 'error'][level] || `L${level}`
    console.log(`[renderer:${lvl}] ${message}`)
  })
  mainWindow.webContents.on('render-process-gone', (e, details) => {
    console.error('[renderer:crash]', JSON.stringify(details))
  })

  // 通过本地 HTTP server 加载（避开 file:// 协议坑）
  await mainWindow.loadURL(`http://127.0.0.1:${port}`)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  createMenu()
}

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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (server) server.close()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})