const resources = {
  users: { title: '用户', columns: ['昵称', 'OpenID', '手机号', '状态'] },
  spaces: { title: '情侣空间', columns: ['空间名称', '成员', '恋爱天数', '状态'] },
  diaries: { title: '心动日记', columns: ['作者', '摘要', '媒体数', '状态'] },
  anniversaries: { title: '纪念日', columns: ['标题', '日期', '重复规则', '提醒'] },
  albums: { title: '时光相册', columns: ['相册', '资源数', '上传用户', '状态'] },
  todos: { title: '恋爱清单', columns: ['标题', '分类', '完成率', '推荐'] },
  questions: { title: '甜蜜问答', columns: ['问题', '分类', '回答数', '状态'] },
  bills: { title: '情侣账本', columns: ['标题', '金额', '分类', '支付人'] },
  ai: { title: 'AI星芽', columns: ['场景', '模型', '调用次数', '状态'] },
  reports: { title: '举报管理', columns: ['举报内容', '原因', '举报人', '状态'] },
  banners: { title: 'Banner管理', columns: ['标题', '位置', '排序', '上下架'] },
  files: { title: '文件资源库', columns: ['文件名', '类型', '大小', '使用位置'] },
  notifications: { title: '消息通知', columns: ['标题', '类型', '人群', '发送状态'] },
  admins: { title: '管理员权限', columns: ['账号', '角色', '权限数', '状态'] }
}

function makeRows(resource, total = 128) {
  const title = resources[resource]?.title || resource
  return Array.from({ length: total }, (_, index) => ({
    id: `${resource}-${index + 1}`,
    name: `${title}${index + 1}`,
    user: ['星芽用户', '小鹿', 'Moon', '栗子'][index % 4],
    space: ['恋爱时光', '海边日落', '草莓牛奶', '月亮邮局'][index % 4],
    status: ['正常', '待审核', '已屏蔽', '违规'][index % 4],
    tag: ['精选', '普通', '推荐', '违规'][index % 4],
    createdAt: new Date(Date.now() - index * 3600 * 1000).toISOString()
  }))
}

export function getAdminDashboard() {
  return {
    today: {
      users: 326,
      spaces: 148,
      diaries: 1426,
      images: 8904,
      aiCalls: 21180
    },
    growth: [28, 34, 30, 46, 52, 48, 68, 74, 66, 82, 96, 108],
    ai: {
      diarySummary: 8240,
      chat: 11680,
      loveLetter: 1260
    },
    activeCouples: ['海边日落', '草莓牛奶', '月亮邮局', '一起去旅行', '南风与星'],
    activities: [
      { type: 'diary', title: '小鹿发布了心动日记', createdAt: new Date().toISOString() },
      { type: 'space', title: 'Moon 创建情侣空间', createdAt: new Date().toISOString() },
      { type: 'report', title: '收到一条图片举报', createdAt: new Date().toISOString() },
      { type: 'ai', title: 'AI 生成恋爱周报', createdAt: new Date().toISOString() }
    ]
  }
}

export function listAdminResource(resource, query = {}) {
  const page = Math.max(Number(query.page) || 1, 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 20, 1), 100)
  const keyword = String(query.keyword || '').trim().toLowerCase()
  const all = makeRows(resource)
  const filtered = keyword
    ? all.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword))
    : all
  const start = (page - 1) * pageSize
  return {
    resource,
    meta: resources[resource] || { title: resource, columns: [] },
    list: filtered.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      total: filtered.length
    }
  }
}

export function getReviewQueue(query = {}) {
  const data = [
    { id: 'R-1024', type: 'diary', content: '今天和 Ta 一起看了日落...', status: 'pending', risk: 'low' },
    { id: 'R-1025', type: 'image', content: '相册上传 3 张图片', status: 'pending', risk: 'medium' },
    { id: 'R-1026', type: 'ai', content: '朋友圈文案生成记录', status: 'approved', risk: 'low' },
    { id: 'R-1027', type: 'nickname', content: '用户昵称变更', status: 'rejected', risk: 'high' }
  ]
  const status = query.status
  return status ? data.filter((item) => item.status === status) : data
}

export function getSystemConfig() {
  return {
    app: {
      name: '星芽恋记',
      logo: '',
      defaultBackground: '',
      defaultAvatar: ''
    },
    ai: {
      model: 'gpt-4.1',
      promptTemplate: '你是星芽恋记里的温柔恋爱陪伴助手。',
      dailyLimit: 1000
    },
    storage: {
      provider: 'local',
      cosBucket: '',
      ossBucket: ''
    },
    content: {
      maxImages: 9,
      maxVideoSizeMb: 200,
      aiLimitPerDay: 20
    }
  }
}
