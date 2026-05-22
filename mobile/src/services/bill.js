import api from './api'

export default {
  list: (params) => api.listBills(params),
  create: (data) => api.createBill(data),
  remove: (id) => api.deleteBill(id)
}
