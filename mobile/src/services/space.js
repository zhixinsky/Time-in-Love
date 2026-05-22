import api from './api'

const DEMO_SPACE_ID = 'space_demo'

/**
 * 从云托管拉取首页仪表盘数据
 * 失败时由 store 继续走本地 mock
 */
export async function fetchSpaceDashboard(spaceId = DEMO_SPACE_ID) {
  return api.getSpaceDashboard(spaceId)
}

export { DEMO_SPACE_ID }
