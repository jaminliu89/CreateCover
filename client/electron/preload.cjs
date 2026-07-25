const { contextBridge } = require('electron')

// 暴露资源路径给渲染进程，用于加载本地模型文件
// process.resourcesPath → CoverForge.app/Contents/Resources/
contextBridge.exposeInMainWorld('electronAPI', {
  resourcesPath: process.resourcesPath || '',
  isElectron: true,
})
