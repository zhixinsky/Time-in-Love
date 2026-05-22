import {
  Album,
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  CalendarHeart,
  ClipboardCheck,
  Flag,
  Gift,
  Heart,
  Home,
  Image,
  ListChecks,
  LockKeyhole,
  MessageCircleHeart,
  NotebookPen,
  Settings,
  ShieldAlert,
  Sparkles,
  Users,
  WalletCards
} from 'lucide-react'

export type AdminModule = {
  key: string
  path: string
  label: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  metrics: Array<{ label: string; value: string; trend: string }>
  columns: string[]
  rows: Array<Record<string, string>>
  filters: string[]
  actions: string[]
}

export const menuGroups = [
  {
    label: '总览',
    items: [
      { path: '/', label: '仪表盘', icon: Home },
      { path: '/analytics', label: '数据统计', icon: BarChart3 }
    ]
  },
  {
    label: '用户与空间',
    items: [
      { path: '/users', label: '用户管理', icon: Users },
      { path: '/spaces', label: '情侣空间', icon: Heart }
    ]
  },
  {
    label: '内容管理',
    items: [
      { path: '/diaries', label: '心动日记', icon: NotebookPen },
      { path: '/anniversaries', label: '纪念日', icon: CalendarHeart },
      { path: '/albums', label: '时光相册', icon: Album },
      { path: '/todos', label: '恋爱清单', icon: ListChecks },
      { path: '/questions', label: '甜蜜问答', icon: MessageCircleHeart },
      { path: '/bills', label: '情侣账本', icon: WalletCards }
    ]
  },
  {
    label: '运营与安全',
    items: [
      { path: '/ai', label: 'AI星芽', icon: Bot },
      { path: '/review', label: '内容审核', icon: ShieldAlert },
      { path: '/reports', label: '举报管理', icon: Flag },
      { path: '/banners', label: 'Banner管理', icon: Image },
      { path: '/files', label: '文件资源库', icon: Gift },
      { path: '/notifications', label: '消息通知', icon: Bell }
    ]
  },
  {
    label: '系统',
    items: [
      { path: '/settings', label: '系统配置', icon: Settings },
      { path: '/admins', label: '管理员权限', icon: LockKeyhole }
    ]
  }
]

export const menu = menuGroups.flatMap((group) => group.items)

const baseRows = [
  ['星芽用户', '恋爱时光', '2026-05-22 09:30', '正常', '精选'],
  ['小鹿', '海边日落', '2026-05-22 10:12', '待审核', '普通'],
  ['Moon', '第一次约会', '2026-05-21 22:48', '正常', '推荐'],
  ['栗子', '周年纪念册', '2026-05-21 18:06', '已屏蔽', '违规']
]

function makeRows(entity: string) {
  return baseRows.map((row, index) => ({
    名称: `${entity}${index + 1}`,
    用户: row[0],
    空间: row[1],
    时间: row[2],
    状态: row[3],
    标记: row[4]
  }))
}

export const moduleRoutes: AdminModule[] = [
  {
    key: 'users',
    path: '/users',
    label: '用户管理',
    title: '用户管理',
    description: '搜索用户、查看资料、禁用解封、追踪所属情侣空间与 AI 使用情况。',
    icon: Users,
    metrics: [
      { label: '总用户', value: '48,230', trend: '+12.4%' },
      { label: '今日新增', value: '326', trend: '+8.1%' },
      { label: '已绑定空间', value: '31,904', trend: '+6.8%' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('用户'),
    filters: ['昵称', '手机号', 'OpenID', '状态'],
    actions: ['查看详情', '禁用', '解封', '删除']
  },
  {
    key: 'spaces',
    path: '/spaces',
    label: '情侣空间',
    title: '情侣空间管理',
    description: '管理空间资料、成员关系、恋爱天数、内容资产与推荐状态。',
    icon: Heart,
    metrics: [
      { label: '空间总数', value: '19,406', trend: '+9.2%' },
      { label: '活跃情侣', value: '8,912', trend: '+5.9%' },
      { label: '待邀请空间', value: '1,204', trend: '-2.1%' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('空间'),
    filters: ['空间名', '成员', '创建时间', '推荐状态'],
    actions: ['查看空间', '修改资料', '推荐', '解散空间']
  },
  {
    key: 'diaries',
    path: '/diaries',
    label: '心动日记',
    title: '心动日记管理',
    description: '审核日记正文、图片视频、AI 小记，支持屏蔽、推荐、精选。',
    icon: NotebookPen,
    metrics: [
      { label: '日记总数', value: '126,880', trend: '+18.6%' },
      { label: '待审核', value: '248', trend: '+3.4%' },
      { label: '今日发布', value: '1,426', trend: '+11.0%' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('日记'),
    filters: ['作者', '空间', '审核状态', '发布时间'],
    actions: ['详情', '屏蔽', '推荐', '精选']
  },
  {
    key: 'anniversaries',
    path: '/anniversaries',
    label: '纪念日',
    title: '纪念日管理',
    description: '查看所有纪念日、即将到来的提醒、热门纪念日类型和违规内容。',
    icon: CalendarHeart,
    metrics: [
      { label: '纪念日', value: '76,204', trend: '+7.2%' },
      { label: '7天内到来', value: '3,912', trend: '+4.8%' },
      { label: '热门类型', value: '18', trend: '+2' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('纪念日'),
    filters: ['标题', '日期', '重复规则', '提醒状态'],
    actions: ['查看', '删除违规', '设为热门']
  },
  {
    key: 'todos',
    path: '/todos',
    label: '恋爱清单',
    title: '恋爱清单管理',
    description: '查看热门清单、完成率、官方推荐和违规清单处理。',
    icon: ListChecks,
    metrics: [
      { label: '清单条目', value: '92,102', trend: '+13.5%' },
      { label: '完成率', value: '42%', trend: '+4.1%' },
      { label: '官方推荐', value: '86', trend: '+12' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('清单'),
    filters: ['分类', '完成状态', '推荐状态'],
    actions: ['推荐官方', '删除违规', '查看完成记录']
  },
  {
    key: 'questions',
    path: '/questions',
    label: '甜蜜问答',
    title: '甜蜜问答管理',
    description: '维护每日问题库，按初识、恋爱、日常、未来、甜蜜、深夜话题分类。',
    icon: MessageCircleHeart,
    metrics: [
      { label: '问题库', value: '1,260', trend: '+36' },
      { label: '今日回答', value: '9,420', trend: '+16.8%' },
      { label: '收藏问题', value: '21,095', trend: '+10.2%' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('问题'),
    filters: ['分类', '关键词', '启用状态'],
    actions: ['添加问题', '推荐热门', '删除']
  },
  {
    key: 'bills',
    path: '/bills',
    label: '情侣账本',
    title: '情侣账本管理',
    description: '查看账单、分类统计、金额统计、月度报表与消费趋势。',
    icon: WalletCards,
    metrics: [
      { label: '账单笔数', value: '238,410', trend: '+8.9%' },
      { label: '本月流水', value: '¥8.9M', trend: '+5.6%' },
      { label: 'AA 账单', value: '31%', trend: '+1.2%' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('账单'),
    filters: ['分类', '支付人', '金额区间', '月份'],
    actions: ['查看凭证', '导出报表', '删除']
  },
  {
    key: 'reports',
    path: '/reports',
    label: '举报管理',
    title: '举报管理',
    description: '处理举报内容、举报用户、举报原因与封禁/删除/忽略流程。',
    icon: Flag,
    metrics: [
      { label: '待处理', value: '42', trend: '-18.0%' },
      { label: '今日举报', value: '18', trend: '+3' },
      { label: '平均处理', value: '16m', trend: '-22%' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('举报'),
    filters: ['原因', '状态', '内容类型'],
    actions: ['封禁用户', '删除内容', '忽略举报']
  },
  {
    key: 'banners',
    path: '/banners',
    label: 'Banner管理',
    title: 'Banner 管理',
    description: '管理首页、活动、节日 Banner 的图片、跳转、排序和上下架。',
    icon: Image,
    metrics: [
      { label: '在线 Banner', value: '12', trend: '+2' },
      { label: '点击率', value: '8.6%', trend: '+1.4%' },
      { label: '节日活动', value: '4', trend: '+1' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('Banner'),
    filters: ['位置', '活动', '上下架'],
    actions: ['上传图片', '配置跳转', '排序', '下架']
  },
  {
    key: 'notifications',
    path: '/notifications',
    label: '消息通知',
    title: '消息通知',
    description: '配置系统通知、恋爱提醒、AI 消息、活动通知与模板消息批量发送。',
    icon: Bell,
    metrics: [
      { label: '今日推送', value: '28,610', trend: '+6.4%' },
      { label: '打开率', value: '31.2%', trend: '+2.8%' },
      { label: '模板数', value: '38', trend: '+5' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('通知'),
    filters: ['类型', '人群', '发送状态'],
    actions: ['新建通知', '批量发送', '暂停']
  },
  {
    key: 'admins',
    path: '/admins',
    label: '管理员权限',
    title: '管理员权限',
    description: '管理超级管理员、审核员、运营、客服的 RBAC 页面/按钮/API 权限。',
    icon: LockKeyhole,
    metrics: [
      { label: '管理员', value: '24', trend: '+1' },
      { label: '角色', value: '4', trend: '稳定' },
      { label: '权限点', value: '186', trend: '+12' }
    ],
    columns: ['名称', '用户', '空间', '时间', '状态', '标记'],
    rows: makeRows('管理员'),
    filters: ['角色', '状态', '权限'],
    actions: ['新增角色', '分配权限', '停用账号']
  }
]

export const dashboardStats = [
  { label: '今日新增用户', value: 326, trend: '+12.4%', icon: Users },
  { label: '今日新增情侣空间', value: 148, trend: '+8.2%', icon: Heart },
  { label: '今日发布日记', value: 1426, trend: '+18.6%', icon: NotebookPen },
  { label: '今日上传图片', value: 8904, trend: '+9.1%', icon: Image },
  { label: '今日 AI 调用次数', value: 21180, trend: '+22.0%', icon: Sparkles }
]

export const activities = [
  { title: '小鹿发布了心动日记', meta: '海边日落 · 2分钟前', type: '日记' },
  { title: 'Moon 创建情侣空间', meta: '恋爱时光 · 8分钟前', type: '空间' },
  { title: '收到一条图片举报', meta: '内容审核 · 14分钟前', type: '举报' },
  { title: 'AI 生成恋爱周报', meta: 'AI星芽 · 21分钟前', type: 'AI' },
  { title: '新 Banner 已上线', meta: '运营配置 · 34分钟前', type: '运营' }
]

export const reviewItems = [
  { id: 'R-1024', type: '日记', content: '今天和 Ta 一起看了日落...', status: '待审核', risk: '低' },
  { id: 'R-1025', type: '图片', content: '相册上传 3 张图片', status: '待审核', risk: '中' },
  { id: 'R-1026', type: 'AI生成', content: '朋友圈文案生成记录', status: '已通过', risk: '低' },
  { id: 'R-1027', type: '昵称', content: '用户昵称变更', status: '已拒绝', risk: '高' }
]

export const aiCards = [
  { title: 'AI Prompt 配置', desc: '配置小记、聊天、情话、周报模板', icon: ClipboardCheck },
  { title: '模型切换', desc: '按场景切换默认模型与降级策略', icon: Bot },
  { title: '敏感词过滤', desc: '输入输出双向拦截与审计', icon: ShieldAlert },
  { title: '生成记录', desc: '追踪用户、空间、Token 与成本', icon: BadgeCheck }
]
