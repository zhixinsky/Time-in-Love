import request from './request'

export const diaryApi = {
  getByDate: (date) => request(`/diaries/by-date?date=${encodeURIComponent(date)}`),
  getRecentDetails: (days = 7, endDate) =>
    request(
      `/diaries/recent-details?days=${encodeURIComponent(days)}${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ''}`
    ),
  getTimeline: (page = 1, pageSize = 5) =>
    request(`/diaries/timeline?page=${page}&pageSize=${pageSize}`),
  getDetail: (id) => request(`/diaries/${id}`),
  create: (data) => request('/diaries', { method: 'POST', data }),
  update: (id, data) => request(`/diaries/${id}`, { method: 'PUT', data }),
  remove: (id) => request(`/diaries/${id}`, { method: 'DELETE' }),
  generateAiSummary: (id) => request(`/diaries/${id}/ai-summary`, { method: 'POST' })
}

export default diaryApi
