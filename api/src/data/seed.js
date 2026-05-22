/** 演示数据：后续替换为 MySQL / 云数据库 */
export const seed = {
  users: [
    { id: 'u_me', openId: 'mock-openid-me', nickname: '我', role: 'member' },
    { id: 'u_ta', openId: 'mock-openid-ta', nickname: 'Ta', role: 'member' }
  ],
  spaces: [
    {
      id: 'space_demo',
      name: '恋爱时光',
      subtitle: '记录我们的心动瞬间',
      firstJoinedAt: '2024-12-19',
      loveStartDate: '2024-12-19',
      couplePhoto: '',
      memberIds: ['u_me', 'u_ta']
    }
  ],
  anniversaries: [
    { id: 'a1', spaceId: 'space_demo', title: '恋爱纪念日', date: '2024-12-19', repeatType: 'yearly' },
    { id: 'a2', spaceId: 'space_demo', title: '第一次约会', date: '2025-01-12', repeatType: 'yearly' }
  ],
  moods: [
    { id: 'm1', spaceId: 'space_demo', owner: '我', avatar: '👧🏻', mood: '很幸福', date: '2026-05-22' },
    { id: 'm2', spaceId: 'space_demo', owner: 'Ta', avatar: '👦🏻', mood: '想见你', date: '2026-05-22' }
  ],
  bills: {
    space_demo: { expense: 1314, income: 520, month: '2026-05' }
  },
  diaries: [
    {
      id: 'd1',
      spaceId: 'space_demo',
      content:
        '今天一起去看了日落，他的侧脸在夕阳下好温柔。走在海边吹着风，突然觉得能和他一起看很多很多次日落，真的是很幸福的事呀～',
      mood: '很幸福',
      weather: '晴 26℃',
      location: '海边',
      createdAt: '2026-05-22T10:00:00.000Z'
    }
  ]
}
