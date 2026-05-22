import request from './request'

export const api = {
  health: () => request('/health'),

  getSpaceDashboard: (spaceId) => request(`/spaces/${spaceId}/dashboard`),

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
