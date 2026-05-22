import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, Crown, Sparkles } from 'lucide-react'
import { activities, dashboardStats } from '../data/adminData'
import { formatNumber } from '../lib/utils'
import { Badge, Button, Card, PageHeader, StatusDot } from '../components/ui'
import { DashboardPayload, getDashboard } from '../api/admin'

const trend = [28, 34, 30, 46, 52, 48, 68, 74, 66, 82, 96, 108]
const heat = Array.from({ length: 42 }, (_, index) => [15, 28, 44, 62, 86][(index * 7 + 3) % 5])

export function DashboardPage() {
  const [remote, setRemote] = useState<DashboardPayload | null>(null)

  useEffect(() => {
    getDashboard()
      .then(setRemote)
      .catch(() => setRemote(null))
  }, [])

  const stats = useMemo(() => {
    if (!remote) return dashboardStats
    return dashboardStats.map((item) => {
      const map: Record<string, number> = {
        今日新增用户: remote.today.users,
        今日新增情侣空间: remote.today.spaces,
        今日日记发布: remote.today.diaries,
        今日发布日记: remote.today.diaries,
        今日上传图片: remote.today.images,
        '今日 AI 调用次数': remote.today.aiCalls
      }
      return { ...item, value: map[item.label] ?? item.value }
    })
  }, [remote])

  const trendData = remote?.growth?.length ? remote.growth : trend
  const recentActivities = remote?.activities?.length
    ? remote.activities.map((item) => ({
        title: item.title,
        meta: new Date(item.createdAt).toLocaleString('zh-CN'),
        type: item.type === 'report' ? '举报' : item.type === 'ai' ? 'AI' : item.type === 'space' ? '空间' : '日记'
      }))
    : activities
  const activeCouples = remote?.activeCouples?.length ? remote.activeCouples : ['海边日落', '草莓牛奶', '月亮邮局', '一起去旅行', '南风与星']

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="高级数据驾驶舱"
        description="实时查看用户增长、情侣空间活跃、日记发布、AI 使用与内容审核风险。"
        action={<Button>导出日报</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card className="relative overflow-hidden">
                <div className="absolute right-[-24px] top-[-20px] h-24 w-24 rounded-full bg-pink-300/20 blur-2xl" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-3 text-3xl font-black">{formatNumber(stat.value)}</p>
                    <Badge className="mt-4" tone="green">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/65 text-pink-500 dark:bg-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">用户增长趋势</h2>
              <p className="text-sm text-muted-foreground">7天 / 30天 / 90天留存观察</p>
            </div>
            <div className="flex rounded-full bg-white/55 p-1 text-sm dark:bg-white/8">
              {['7天', '30天', '90天'].map((item, index) => (
                <button key={item} className={`rounded-full px-3 py-1.5 ${index === 1 ? 'bg-white shadow-sm dark:bg-white/12' : 'text-muted-foreground'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-64 items-end gap-3 rounded-[24px] bg-white/35 p-5 dark:bg-white/5">
            {trendData.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ delay: index * 0.03, duration: 0.5 }}
                  className="w-full rounded-full bg-gradient-to-t from-pink-400 to-violet-400 shadow-lg shadow-pink-400/20"
                />
                <span className="text-[10px] text-muted-foreground">{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">日记发布热力图</h2>
              <p className="text-sm text-muted-foreground">每小时发布密度</p>
            </div>
            <Sparkles className="h-5 w-5 text-pink-500" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {heat.map((value, index) => (
              <div
                key={index}
                className="aspect-square rounded-xl"
                style={{ background: `rgba(244, 95, 157, ${value / 100})` }}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['AI小记', remote?.ai.diarySummary?.toLocaleString() || '8,240'],
              ['AI聊天', remote?.ai.chat?.toLocaleString() || '11,680'],
              ['情话生成', remote?.ai.loveLetter?.toLocaleString() || '1,260']
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-white/45 p-4 dark:bg-white/6">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">活跃情侣排行榜</h2>
            <Button variant="ghost" className="h-8 px-2">
              全部 <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {activeCouples.map((name, index) => (
              <div key={name} className="flex items-center justify-between rounded-3xl bg-white/45 p-3 dark:bg-white/6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 to-violet-300 text-white">
                    {index === 0 ? <Crown className="h-5 w-5" /> : index + 1}
                  </div>
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-xs text-muted-foreground">连续活跃 {18 - index * 2} 天</p>
                  </div>
                </div>
                <Badge tone="violet">{980 - index * 86} 分</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">最近动态</h2>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {recentActivities.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-3xl bg-white/45 p-4 dark:bg-white/6">
                <div className="flex items-center gap-3">
                  <StatusDot tone={item.type === '举报' ? 'red' : item.type === 'AI' ? 'pink' : 'green'} />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                </div>
                <Badge tone={item.type === '举报' ? 'red' : 'gray'}>{item.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
