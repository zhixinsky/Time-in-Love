import { ImagePlus, Trash2 } from 'lucide-react'
import { Badge, Button, Card, Input, PageHeader } from '../components/ui'

const media = Array.from({ length: 12 }, (_, index) => ({
  title: index % 3 === 0 ? '旅行相册' : index % 3 === 1 ? '海边日落' : '甜蜜日常',
  type: index % 4 === 0 ? '视频' : '图片',
  size: `${(index + 2) * 1.4} MB`,
  color: ['from-pink-200 to-violet-200', 'from-amber-100 to-pink-200', 'from-sky-100 to-violet-200'][index % 3]
}))

export function GalleryPage({ kind }: { kind: 'albums' | 'files' }) {
  const isFiles = kind === 'files'
  return (
    <div>
      <PageHeader
        eyebrow={isFiles ? 'Resource Library' : 'Albums'}
        title={isFiles ? '文件资源库' : '时光相册管理'}
        description={
          isFiles
            ? '统一管理图片、视频、上传时间、文件大小、使用位置与分类。'
            : '支持相册列表、图片/视频审核、大图预览、批量删除和瀑布流预览。'
        }
        action={<Button><ImagePlus className="h-4 w-4" /> 上传资源</Button>}
      />
      <Card>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input className="max-w-md" placeholder="搜索文件名、上传用户、使用位置..." />
          <div className="flex gap-2">
            <Button variant="secondary">全部</Button>
            <Button variant="secondary">图片</Button>
            <Button variant="secondary">视频</Button>
            <Button variant="danger"><Trash2 className="h-4 w-4" /> 批量删除</Button>
          </div>
        </div>
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-4">
          {media.map((item, index) => (
            <div key={index} className="mb-4 break-inside-avoid overflow-hidden rounded-[26px] border border-white/55 bg-white/45 p-3 dark:border-white/10 dark:bg-white/6">
              <div className={`h-${index % 3 === 0 ? '56' : index % 3 === 1 ? '44' : '36'} rounded-[22px] bg-gradient-to-br ${item.color}`} />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.size} · 上传于今天</p>
                </div>
                <Badge tone={item.type === '视频' ? 'violet' : 'pink'}>{item.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
