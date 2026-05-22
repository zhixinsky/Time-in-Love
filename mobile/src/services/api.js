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

  listCurrentAnniversaries: () => request('/spaces/current/anniversaries'),

  createAnniversary: (data) => request('/spaces/current/anniversaries', { method: 'POST', data }),

  updateAnniversary: (id, data) => request(`/spaces/current/anniversaries/${id}`, { method: 'PATCH', data }),

  deleteAnniversary: (id) => request(`/spaces/current/anniversaries/${id}`, { method: 'DELETE' }),

  listMoods: (spaceId) => request(`/spaces/${spaceId}/moods`),

  getBillSummary: (spaceId) => request(`/spaces/${spaceId}/bills/summary`),

  listBills: (params = {}) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value))
    })
    const qs = search.toString()
    return request(`/bills${qs ? `?${qs}` : ''}`)
  },

  createBill: (data) => request('/bills', { method: 'POST', data }),

  deleteBill: (id) => request(`/bills/${id}`, { method: 'DELETE' }),

  getLatestDiary: (spaceId) => request(`/spaces/${spaceId}/diaries/latest`),

  login: (code) => request('/auth/wechat-login', { method: 'POST', data: { code } }),

  getDiaryByDate: (date) => request(`/diaries/by-date?date=${encodeURIComponent(date)}`),
  getDiaryTimeline: (page = 1, pageSize = 10) =>
    request(`/diaries/timeline?page=${page}&pageSize=${pageSize}`)
}

export default api
