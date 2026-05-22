import { Check, X } from 'lucide-react'
import { reviewItems } from '../data/adminData'
import { Badge, Button, Card, PageHeader, StatusDot } from '../components/ui'

export function ReviewPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Safety"
        title="内容审核中心"
        description="审核日记、图片、视频、昵称与 AI 生成内容，支持批量通过、批量拒绝和理由填写。"
        action={
          <div className="flex gap-2">
            <Button variant="secondary"><Check className="h-4 w-4" /> 批量通过</Button>
            <Button variant="danger"><X className="h-4 w-4" /> 批量拒绝</Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {['待审核', '已通过', '已拒绝'].map((status, index) => (
          <Card key={status}>
            <p className="text-sm text-muted-foreground">{status}</p>
            <p className="mt-3 text-3xl font-black">{[248, 12040, 86][index]}</p>
            <Badge className="mt-4" tone={index === 0 ? 'amber' : index === 1 ? 'green' : 'red'}>
              今日
            </Badge>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <div className="space-y-3">
          {reviewItems.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-[24px] bg-white/45 p-4 dark:bg-white/6 lg:grid-cols-[120px_1fr_120px_120px_180px] lg:items-center">
              <Badge tone="gray">{item.id}</Badge>
              <div>
                <p className="font-bold">{item.type}</p>
                <p className="text-sm text-muted-foreground">{item.content}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm">
                <StatusDot tone={item.status === '待审核' ? 'amber' : item.status === '已通过' ? 'green' : 'red'} />
                {item.status}
              </span>
              <Badge tone={item.risk === '高' ? 'red' : item.risk === '中' ? 'amber' : 'green'}>风险 {item.risk}</Badge>
              <div className="flex gap-2">
                <Button variant="secondary" className="h-9">通过</Button>
                <Button variant="danger" className="h-9">拒绝</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
