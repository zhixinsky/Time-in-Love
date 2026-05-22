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

/** 本地开发：关闭合法域名校验（与 project.config.json 中 urlCheck 双保险） */
fs.writeFileSync(
  privateConfigPath,
  `${JSON.stringify(
    {
      description: '本地开发配置，勿提交敏感信息',
      projectname: '星芽恋记',
      setting: {
        urlCheck: false,
        ignoreDevUnusedFiles: false,
        ignoreUploadUnusedFiles: false
      }
    },
    null,
    2
  )}\n`
)
