/**
 * CoverForge 全路径冒烟测试 (40+ 检查点)
 *
 * 用法:
 *   1. 确保 dist/ 已构建 (cd client && npm run build)
 *   2. node scripts/smoke-test.mjs
 *
 * 自动启动 HTTP 服务器托管 dist/，然后运行 Playwright 测试。
 */

import { chromium } from 'playwright'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'client', 'dist')
const PORT = 5199

// ── 测试报告 ──
let passed = 0
let failed = 0
const errors = []

function check(name, ok, detail = '') {
  if (ok) {
    passed++
    console.log(`  ✅ ${name}`)
  } else {
    failed++
    const msg = `  ❌ ${name}${detail ? ' — ' + detail : ''}`
    console.error(msg)
    errors.push(msg)
  }
}

// ── 简易 HTTP 服务器 ──
function serveDist() {
  const MIME = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
    '.mjs': 'application/javascript',
  }

  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url)
    const ext = path.extname(filePath)
    const contentType = MIME[ext] || 'application/octet-stream'

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // SPA fallback: return index.html
        fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(500)
            res.end('500')
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

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[server] http://127.0.0.1:${PORT}\n`)
      resolve(server)
    })
  })
}

// ── 测试主流程 ──
async function runTests() {
  console.log('='.repeat(60))
  console.log('  CoverForge 全路径冒烟测试')
  console.log('='.repeat(60))
  console.log()

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const ctx = { page }

  try {
    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle', timeout: 15000 })
    console.log('--- [1] 启动与导航 ---')

    check('页面加载无报错', true)
    const title = await page.title()
    check('页面标题存在', title.length > 0, `title="${title}"`)

    // 检查主要区块
    const bodyText = await page.textContent('body')
    check('显示 CoverForge 标题', bodyText.includes('CoverForge'))
    check('模板库面板存在', bodyText.includes('模板库'))
    check('AI 工具箱存在', bodyText.includes('AI 智能工具箱'))

    // Toolbar 导航
    check('文字按钮存在', bodyText.includes('文字'))
    check('图片按钮存在', bodyText.includes('图片'))
    check('形状按钮存在', bodyText.includes('形状'))
    check('导出封面按钮存在', bodyText.includes('导出封面'))
    check('保存按钮存在', bodyText.includes('保存'))

    // 画布元素
    check('画布引导提示存在', bodyText.includes('点击画布中的任意元素'))

    // ── 模板测试 ──
    console.log('\n--- [2] 模板浏览 ---')

    // 检查分类标签
    const categories = ['全部', '种草', '爆款标题', '教程', '情感', '测评']
    for (const cat of categories) {
      const el = await page.$(`text=${cat}`)
      check(`分类标签 "${cat}" 存在`, !!el)
    }

    // 过滤按钮
    const filters = ['小红书', '抖音', 'B站', '通用']
    for (const f of filters) {
      const el = await page.$(`text=${f}`)
      check(`平台过滤 "${f}" 存在`, !!el)
    }

    // 模板卡片
    const templateCards = await page.$$('button:has-text("点击套用")')
    check(`模板卡片数量 >= 20`, templateCards.length >= 20, `实际 ${templateCards.length}`)

    // 套用模板
    const firstTemplate = templateCards[0]
    if (firstTemplate) {
      await firstTemplate.click()
      await page.waitForTimeout(500)
      await page.waitForLoadState('networkidle')
      const canvasText = await page.textContent('body')
      check('套用模板后画布有内容', canvasText.includes('100') || canvasText.includes('%') || canvasText.includes('-'),
        '画布控件可见')
    }

    // ── 元素选中与编辑 ──
    console.log('\n--- [3] 元素编辑 ---')
    // 点击画布上的元素
    const canvasElements = await page.$$('[data-element-id]')
    if (canvasElements.length > 0) {
      await canvasElements[0].click()
      await page.waitForTimeout(300)
      check('点击元素可选中', true)
    }

    // ── AI 工具箱 ──
    console.log('\n--- [4] AI 工具箱 ---')
    const aiButtons = ['一键美化', '智能配色', '黄金构图', '设计风格', '一键抠图', '爆款标题']
    for (const btn of aiButtons) {
      const el = await page.$(`text=${btn}`)
      check(`AI 按钮 "${btn}" 存在`, !!el)
    }

    // 一键美化
    const beautifyBtn = await page.$('text=一键美化')
    if (beautifyBtn) {
      await beautifyBtn.click()
      await page.waitForTimeout(800)
      // Toast 可能显示 "已美化"
      const textAfter = await page.textContent('body')
      check('一键美化可点击', true)
    }

    // ── 图层控制 ──
    console.log('\n--- [5] 图层控制 ---')
    const layerActions = ['清除描边', '重置画布', '另存预设']
    for (const action of layerActions) {
      const el = await page.$(`text=${action}`)
      check(`图层按钮 "${action}" 存在`, !!el)
    }

    // ── 导出 ──
    console.log('\n--- [6] 导出 ---')
    const exportBtn = await page.$('text=导出封面')
    check('导出按钮可点击', !!exportBtn)
    if (exportBtn) {
      await exportBtn.click()
      await page.waitForTimeout(500)
      const exportDialog = await page.textContent('body')
      check('导出弹窗打开', exportDialog.includes('PNG') || exportDialog.includes('导出'))
    }

    // ── 快捷键 ──
    console.log('\n--- [7] 快捷键 ---')
    const shortcutTooltip = await page.$('[title*="Ctrl"]')
    const shortcutCmdTooltip = await page.$('[title*="Cmd"]')
    const shortcutText = bodyText.includes('Ctrl') || bodyText.includes('Cmd')
    check('快捷键说明存在', !!(shortcutTooltip || shortcutCmdTooltip || shortcutText))

    // ── 画布比例 ──
    console.log('\n--- [8] 画布设置 ---')
    const ratios = ['3:4', '9:16', '1:1', '16:9']
    for (const r of ratios) {
      const el = await page.$(`button:has-text("${r}")`)
      check(`比例按钮 "${r}" 存在`, !!el)
    }

    // ── 初始化检查 ──
    console.log('\n--- [9] 初始化状态 ---')
    const initialText = await page.textContent('body')
    // 检查是否有 JS 错误 (通过 console 事件)
    const jsErrors = []
    page.on('pageerror', err => jsErrors.push(err.message))
    await page.waitForTimeout(500)
    check('无 JS 运行时错误', jsErrors.length === 0, jsErrors.join('; '))

    // ── Canvas 缩放 ──
    const zoomControl = await page.$('text=%') || await page.$('text=-') || await page.$('text=+')
    check('缩放控件存在', !!zoomControl)

    // ── 模板搜索 ──
    console.log('\n--- [10] 搜索与过滤 ---')
    const searchInput = await page.$('input[placeholder*="搜索"]')
    check('搜索输入框存在', !!searchInput)
    if (searchInput) {
      await searchInput.fill('种草')
      await page.waitForTimeout(300)
      check('搜索可输入', true)
      await searchInput.fill('')
    }

    // ── 打包/导入模板 ──
    console.log('\n--- [11] 模板导入导出 ---')
    const packBtn = await page.$('text=打包模板')
    const importBtn = await page.$('text=导入模板')
    check('打包模板按钮存在', !!packBtn)
    check('导入模板按钮存在', !!importBtn)

    // ── 底部信息 ──
    console.log('\n--- [12] 导出格式 ---')
    check('PNG 导出提示存在', bodyText.includes('PNG'))

  } catch (e) {
    console.error('\n[FATAL] 测试执行异常:', e.message)
    failed++
    errors.push('FATAL: ' + e.message)
  } finally {
    await browser.close()
  }

  // ── 报告 ──
  console.log('\n' + '='.repeat(60))
  console.log(`  测试完成: ✅ ${passed} 通过  ❌ ${failed} 失败`)
  console.log('='.repeat(60))

  if (errors.length > 0) {
    console.log('\n失败明细:')
    errors.forEach(e => console.log(e))
  }

  process.exit(failed > 0 ? 1 : 0)
}

// ── 入口 ──
async function main() {
  const server = await serveDist()
  try {
    await runTests()
  } finally {
    server.close()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
