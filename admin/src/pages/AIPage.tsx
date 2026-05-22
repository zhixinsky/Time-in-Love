import { aiCards } from '../data/adminData'
import { Badge, Button, Card, Input, PageHeader } from '../components/ui'

export function AIPage() {
  return (
    <div>
      <PageHeader
        eyebrow="AI Xingya"
        title="AI星芽管理"
        description="管理 Prompt、模型、调用统计、敏感词过滤与 AI 生成记录。"
        action={<Button>保存 AI 配置</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {aiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-black">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.desc}</p>
            </Card>
          )
        })}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="mb-4 text-lg font-black">Prompt 模板</h2>
          <textarea
            className="min-h-[260px] w-full rounded-[24px] border border-white/60 bg-white/55 p-5 text-sm leading-7 outline-none dark:border-white/10 dark:bg-white/6"
            defaultValue={'你是星芽恋记里的温柔恋爱陪伴助手。请用治愈、克制、真诚的语气总结情侣当天的心动日记，并避免输出敏感内容。'}
          />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-black">模型与限流</h2>
          <div className="space-y-4">
            {['AI小记', 'AI聊天', '情话生成', '周报生成'].map((item, index) => (
              <div key={item} className="rounded-3xl bg-white/45 p-4 dark:bg-white/6">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{item}</p>
                  <Badge tone={index === 1 ? 'violet' : 'pink'}>{index === 1 ? 'gpt-4.1-mini' : 'gpt-4.1'}</Badge>
                </div>
                <Input className="mt-3" placeholder="每日次数限制" defaultValue={`${1000 - index * 120}`} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
