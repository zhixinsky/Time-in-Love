/**
 * 删除已移除组件在 dist 中的残留文件，并清理 json 里的 usingComponents 引用。
 * 解决微信开发者工具 ENOENT: DiaryPublishSheet.wxml
 */
const fs = require('node:fs')
const path = require('node:path')

const distRoot = path.join(__dirname, '..', 'dist', 'build', 'mp-weixin')
const REMOVED = ['DiaryPublishSheet']

if (!fs.existsSync(distRoot)) {
  process.exit(0)
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name)
    if (name.isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

for (const base of REMOVED) {
  for (const ext of ['.wxml', '.wxss', '.js', '.json', '.ts']) {
    const file = path.join(distRoot, 'components', `${base}${ext}`)
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
      console.log('[clean-stale] removed', path.relative(distRoot, file))
    }
  }
}

for (const file of walk(distRoot)) {
  if (!file.endsWith('.json')) continue
  let raw
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (!raw.includes('DiaryPublishSheet') && !raw.includes('diary-publish-sheet')) continue
  try {
    const json = JSON.parse(raw)
    let changed = false
    if (json.usingComponents) {
      for (const key of Object.keys(json.usingComponents)) {
        const val = String(json.usingComponents[key] || '')
        if (/DiaryPublishSheet/i.test(key) || /DiaryPublishSheet/i.test(val)) {
          delete json.usingComponents[key]
          changed = true
        }
      }
    }
    if (changed) {
      fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
      console.log('[clean-stale] patched', path.relative(distRoot, file))
    }
  } catch {
    /* ignore non-json */
  }
}
