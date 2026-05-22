import { config } from '../config/index.js'

const FALLBACKS = [
  '看得出来，今天是和他一起度过的温暖又浪漫的一天呢～',
  '你们今天的小互动，都藏着很甜的默契呀。',
  '这样松弛又陪伴感满满的一天，真的很让人羡慕呢～',
  '今天的心情和天气，都在悄悄替你们加分呢～',
  '把这些心动瞬间留下来，以后回看一定更甜。'
]

export function generateLoveDiarySummary({ content, mood, weather, temperature, locationName }) {
  const moodText = mood ? `今天心情是「${mood}」，` : ''
  const place = locationName ? `在${locationName}` : ''
  const weatherText = weather ? `${weather}${temperature ? ` ${temperature}` : ''}` : ''
  const snippet = (content || '').replace(/\s+/g, ' ').trim().slice(0, 24)
  if (snippet) {
    return `${moodText}${place}${weatherText ? `${weatherText}，` : ''}你们写下了「${snippet}…」，很值得珍藏呢～`.slice(
      0,
      40
    )
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

const generators = {
  advice(input) {
    const scene = input || '今天'
    return `给你们的小建议：${scene}里，试着给对方一个认真倾听的十分钟。恋爱里的安全感，很多时候就藏在“我有被好好放在心上”这件事里。`
  },
  loveWords(input) {
    const name = input || '你'
    return `想把今天的云、晚风和所有温柔都攒起来送给${name}。因为遇见你以后，普通的日子也会悄悄发光。`
  },
  anniversary(input) {
    const event = input || '我们的纪念日'
    return `${event}快乐。谢谢你把平凡日子过成了值得收藏的回忆，往后的每一年，也想和你一起慢慢走、认真爱。`
  },
  moments(input) {
    const text = (input || '').replace(/\s+/g, ' ').trim()
    if (!text) return '这一段回忆里有陪伴、有心动，也有属于你们的默契。它值得被好好保存，等以后再一起回看。'
    return `这段记录最动人的地方，是你们把普通日常过出了亲密感。“${text.slice(0, 36)}${text.length > 36 ? '…' : ''}”里藏着很多真实的喜欢。`
  },
  post(input) {
    const text = input || '和喜欢的人在一起'
    return `${text}。日子不用特别盛大，只要身边是你，就已经很值得记录。`
  },
  weekly(input) {
    const text = input || '这一周'
    return `${text}的甜蜜指数：92%。本周关键词是“陪伴”和“默契”。建议下周安排一次小约会，把喜欢说得更直接一点。`
  }
}

function systemPrompt(type) {
  const map = {
    advice: '你是情侣恋爱记录小程序“星芽恋记”的温柔恋爱建议助手。给出具体、克制、不油腻的建议。',
    loveWords: '你是擅长写中文情话的助手。输出温柔、真诚、少女感但不廉价的短文案。',
    anniversary: '你是情侣纪念日文案助手。输出适合发给恋人的纪念日祝福，真诚、有画面感。',
    moments: '你是恋爱日记总结助手。提炼用户输入中的心动瞬间，输出温柔总结。',
    post: '你是小红书风格情侣朋友圈文案助手。输出简洁、自然、适合分享的文案。',
    weekly: '你是情侣周报助手。根据输入生成甜蜜指数、关键词和下周建议。'
  }
  return map[type] || map.advice
}

function fallbackContent(type, input) {
  const fn = generators[type] || generators.advice
  return {
    type,
    result: fn(input),
    provider: 'local-template',
    generatedAt: new Date().toISOString()
  }
}

async function callOpenAiCompatible({ type, input }) {
  if (!config.ai.apiKey) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.ai.timeoutMs)
  try {
    const response = await fetch(`${config.ai.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.ai.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.ai.model,
        temperature: 0.78,
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt(type) },
          {
            role: 'user',
            content: input || '请根据当前功能生成一段适合情侣恋爱记录小程序使用的内容。'
          }
        ]
      }),
      signal: controller.signal
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const err = new Error(data?.error?.message || data?.message || 'AI 生成失败')
      err.status = response.status
      throw err
    }
    const result = data?.choices?.[0]?.message?.content?.trim()
    if (!result) return null
    return {
      type,
      result,
      provider: config.ai.provider,
      model: config.ai.model,
      generatedAt: new Date().toISOString()
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function generateAiContent({ type = 'advice', input = '' }) {
  try {
    const remote = await callOpenAiCompatible({ type, input })
    if (remote) return remote
  } catch (err) {
    console.error('[ai-service] remote generate failed, fallback template', err.message)
  }
  return fallbackContent(type, input)
}
