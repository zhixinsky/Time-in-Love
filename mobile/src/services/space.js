import api from './api'

/**
 * 从云托管拉取首页仪表盘数据
 * 失败时由 store 继续走本地 mock
 */
export async function fetchSpaceDashboard(spaceId = 'current') {
  if (spaceId === 'current') return api.getCurrentSpaceDashboard()
  return api.getSpaceDashboard(spaceId)
}

export const DEMO_SPACE_ID = 'space_demo'
