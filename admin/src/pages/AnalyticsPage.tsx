import { Card, PageHeader } from '../components/ui'

export function AnalyticsPage() {
  const items = ['DAU', 'MAU', '留存率', '活跃情侣数', '日记发布量', 'AI调用量', '图片上传量', '视频上传量']
  return (
    <div>
      <PageHeader eyebrow="Statistics" title="数据统计" description="监控核心增长指标、内容生产和 AI 使用趋势。" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <Card key={item}>
            <p className="text-sm text-muted-foreground">{item}</p>
            <p className="mt-3 text-3xl font-black">{index === 2 ? '42.8%' : (12800 + index * 1840).toLocaleString()}</p>
            <div className="mt-5 h-20 rounded-[22px] bg-gradient-to-r from-pink-300/40 via-violet-300/40 to-sky-200/40" />
          </Card>
        ))}
      </div>
    </div>
  )
}
