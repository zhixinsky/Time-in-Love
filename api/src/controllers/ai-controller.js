import { generateAiContent } from '../services/ai-service.js'

export async function generateAiContentHandler(req, res) {
  const data = generateAiContent(req.body || {})
  res.json({ code: 0, data })
}
