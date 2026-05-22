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
