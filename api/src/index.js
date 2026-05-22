import app from './app.js'
import { config } from './config/index.js'
import { bootstrapDatabase } from './db/bootstrap.js'
import { isDbEnabled } from './db/pool.js'

process.on('uncaughtException', (err) => {
  console.error('[api] uncaughtException', err)
})
process.on('unhandledRejection', (err) => {
  console.error('[api] unhandledRejection', err)
})

function startBootstrapBackground() {
  if (!isDbEnabled()) {
    console.log('[api] db bootstrap skipped (mysql not configured)')
    return
  }
  const timeoutMs = Number(process.env.DB_BOOTSTRAP_TIMEOUT_MS || 20000)
  Promise.race([
    bootstrapDatabase(),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`bootstrap timeout ${timeoutMs}ms`)), timeoutMs)
    })
  ])
    .then((ok) => {
      if (ok) console.log('[api] db bootstrap finished')
    })
    .catch((err) => {
      console.error('[api] db bootstrap failed:', err.message)
    })
}

function main() {
  console.log('[api] starting...', { env: config.env, port: config.port, node: process.version })

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[api] listening on 0.0.0.0:${config.port} (${config.env})`)
    console.log(`[api] cloud env: ${config.wx.cloudEnvId}`)
    console.log(
      `[api] database: ${isDbEnabled() ? `mysql://${config.mysql.host}/${config.mysql.database}` : 'memory seed'}`
    )
    startBootstrapBackground()
  })
}

main()
