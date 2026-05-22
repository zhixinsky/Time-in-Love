import { Badge, Button, Card, Input, PageHeader } from '../components/ui'

export function SettingsPage() {
  const groups = [
    ['基础配置', ['小程序名称', 'Logo', '默认背景', '默认头像']],
    ['AI配置', ['API Key', '模型', 'Prompt模板']],
    ['存储配置', ['本地存储', '腾讯云 COS', '阿里云 OSS']],
    ['内容配置', ['最大上传图片数', '最大视频大小', 'AI次数限制']]
  ]
  return (
    <div>
      <PageHeader eyebrow="System" title="系统配置" description="集中配置基础信息、AI、对象存储和内容规则。" action={<Button>保存配置</Button>} />
      <div className="grid gap-5 xl:grid-cols-2">
        {groups.map(([title, fields]) => (
          <Card key={title as string}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">{title}</h2>
              <Badge tone="violet">可编辑</Badge>
            </div>
            <div className="space-y-4">
              {(fields as string[]).map((field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm font-semibold text-muted-foreground">{field}</span>
                  <Input placeholder={`请输入${field}`} />
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
