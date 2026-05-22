import api from './api'

export default {
  today: () => api.getTodayQuestion(),
  answer: (answer) => api.answerTodayQuestion(answer),
  history: () => api.getQaHistory()
}
