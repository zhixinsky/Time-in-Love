/**
 * 云存储资源勿打进小程序包（ailogo / love-bg / logo）。
 * 构建后删除 dist 里可能残留的本地副本。
 */
const fs = require('fs')
const path = require('path')

const roots = [
  path.join(__dirname, '../dist/build/mp-weixin/static'),
  path.join(__dirname, '../dist/dev/mp-weixin/static')
]

const relPaths = [
  'love-bg.png',
  'ailogo.png',
  'logo.png',
  'tab/ailogo.png',
  'tab/logo.png'
]

function rm(target) {
  if (!fs.existsSync(target)) return
  fs.rmSync(target, { force: true, recursive: true })
  console.log('[prune-cloud-static] removed', path.relative(path.join(__dirname, '..'), target))
}

for (const root of roots) {
  if (!fs.existsSync(root)) continue
  for (const rel of relPaths) {
    rm(path.join(root, rel))
  }
  // 清掉可能残留的空目录
  rm(path.join(root, 'tab'))
}
