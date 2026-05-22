import app from './app.js'
import { config } from './config/index.js'
import { bootstrapDatabase } from './db/bootstrap.js'
import { isDbEnabled } from './db/pool.js'

async function main() {
  if (isDbEnabled()) {
    try {
      await bootstrapDatabase()
    } catch (err) {
      console.error('[api] db bootstrap failed:', err.message)
    }
  }

  app.listen(config.port, () => {
    console.log(`[api] listening on :${config.port} (${config.env})`)
    console.log(`[api] cloud env: ${config.wx.cloudEnvId}`)
    console.log(
      `[api] database: ${isDbEnabled() ? `mysql://${config.mysql.host}/${config.mysql.database}` : 'memory seed'}`
    )
  })
}

main()
