import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { AdminModule } from '../data/adminData'
import { Badge, Button, Card, Input, PageHeader, StatusDot } from '../components/ui'
import { listResource, ResourceListPayload } from '../api/admin'

export function ModulePage({ module }: { module: AdminModule }) {
  const Icon = module.icon
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [remote, setRemote] = useState<ResourceListPayload | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => {
      listResource(module.key, { page, pageSize: 20, keyword })
        .then(setRemote)
        .catch(() => setRemote(null))
    }, 200)
    return () => window.clearTimeout(id)
  }, [module.key, page, keyword])

  const rows = remote?.list?.length
    ? remote.list.map((item) => ({
        名称: item.name || item.名称 || item.id || '-',
        用户: item.user || item.用户 || '-',
        空间: item.space || item.空间 || '-',
        时间: item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : item.时间 || '-',
        状态: item.status || item.状态 || '-',
        标记: item.tag || item.标记 || '-'
      }))
    : module.rows
  const total = remote?.pagination.total || 128
  const currentPage = remote?.pagination.page || page
  const canPrev = currentPage > 1
  const canNext = currentPage * (remote?.pagination.pageSize || 20) < total

  const columns = useMemo(() => module.columns, [module.columns])

  return (
    <div>
      <PageHeader
        eyebrow={module.label}
        title={module.title}
        description={module.description}
        action={
          <div className="flex gap-2">
            <Button variant="secondary">批量操作</Button>
            <Button>{module.actions[0]}</Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {module.metrics.map((metric) => (
          <Card key={metric.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-3xl font-black">{metric.value}</p>
                <Badge className="mt-4" tone="green">
                  {metric.trend}
                </Badge>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/65 text-pink-500 dark:bg-white/10">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder={`搜索${module.filters.join(' / ')}`}
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {module.filters.map((filter) => (
              <Button key={filter} variant="secondary" className="h-9">
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/55 bg-white/35 dark:border-white/10 dark:bg-white/5">
          <div className="grid min-w-[820px] grid-cols-6 border-b border-white/55 px-5 py-3 text-xs font-bold text-muted-foreground dark:border-white/10">
            {columns.map((column) => (
              <div key={column}>{column}</div>
            ))}
          </div>
          {rows.map((row, index) => (
            <div
              key={`${row.名称}-${index}`}
              className="grid min-w-[820px] grid-cols-6 items-center border-b border-white/35 px-5 py-4 text-sm last:border-b-0 dark:border-white/8"
            >
              {columns.map((column) => (
                <div key={column} className="min-w-0 truncate pr-4">
                  {column === '状态' ? (
                    <span className="inline-flex items-center gap-2">
                      <StatusDot tone={row[column] === '正常' ? 'green' : row[column] === '待审核' ? 'amber' : 'red'} />
                      {row[column]}
                    </span>
                  ) : column === '标记' ? (
                    <Badge tone={row[column] === '违规' ? 'red' : row[column] === '推荐' ? 'violet' : 'gray'}>{row[column]}</Badge>
                  ) : (
                    row[column]
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            共 {total} 条，第 {currentPage} 页
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!canPrev} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              上一页
            </Button>
            <Button variant="secondary" disabled={!canNext} onClick={() => setPage((value) => value + 1)}>
              下一页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
