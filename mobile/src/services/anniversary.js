import api from './api'

export default {
  list: () => api.listCurrentAnniversaries(),
  create: (data) => api.createAnniversary(data),
  update: (id, data) => api.updateAnniversary(id, data),
  remove: (id) => api.deleteAnniversary(id)
}
