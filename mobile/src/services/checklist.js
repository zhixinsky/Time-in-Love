import api from './api'

export default {
  list: () => api.listChecklist(),
  create: (data) => api.createChecklistItem(data),
  update: (id, data) => api.updateChecklistItem(id, data),
  remove: (id) => api.deleteChecklistItem(id)
}
