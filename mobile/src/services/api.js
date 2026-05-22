import request from './request'

export const api = {
  health: () => request('/health'),

  me: () => request('/auth/me'),

  getSpaceDashboard: (spaceId) => request(`/spaces/${spaceId}/dashboard`),

  getCurrentSpaceDashboard: () => request('/spaces/current/dashboard'),

  updateCurrentSpace: (data) => request('/spaces/current', { method: 'PATCH', data }),

  createSpace: (data) => request('/spaces', { method: 'POST', data }),

  createSpaceInvite: () => request('/spaces/current/invite', { method: 'POST' }),

  joinSpace: (inviteCode) => request('/spaces/join', { method: 'POST', data: { inviteCode } }),

  listAnniversaries: (spaceId) => request(`/spaces/${spaceId}/anniversaries`),

  listMoods: (spaceId) => request(`/spaces/${spaceId}/moods`),

  getBillSummary: (spaceId) => request(`/spaces/${spaceId}/bills/summary`),

  getLatestDiary: (spaceId) => request(`/spaces/${spaceId}/diaries/latest`),

  login: (code) => request('/auth/wechat-login', { method: 'POST', data: { code } }),

  getDiaryByDate: (date) => request(`/diaries/by-date?date=${encodeURIComponent(date)}`),
  getDiaryTimeline: (page = 1, pageSize = 10) =>
    request(`/diaries/timeline?page=${page}&pageSize=${pageSize}`)
}

export default api
