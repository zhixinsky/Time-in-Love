const fs = require('node:fs')
const path = require('node:path')

const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.join(projectRoot, 'dist', 'build', 'mp-weixin')
const configPath = path.join(distRoot, 'project.config.json')
const privateConfigPath = path.join(distRoot, 'project.private.config.json')

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  config.appid = 'wxb76bea40dcb2999b'
  config.projectname = '星芽恋记'
  config.packOptions = config.packOptions || { ignore: [] }
  config.packOptions.ignore = Array.isArray(config.packOptions.ignore) ? config.packOptions.ignore : []
  config.condition = {
    search: { current: -1, list: [] },
    conversation: { current: -1, list: [] },
    game: { current: -1, list: [] },
    miniprogram: { current: -1, list: [] }
  }
  delete config.miniprogramRoot
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
}

if (fs.existsSync(privateConfigPath)) {
  fs.rmSync(privateConfigPath, { force: true })
}
