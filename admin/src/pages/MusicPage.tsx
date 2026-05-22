import { CloudDownload, Music2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  createLoveMusic,
  deleteLoveMusic,
  listLoveMusic,
  LoveBackgroundMusic,
  syncLoveMusicCloud,
  updateLoveMusic
} from '../api/music'
import { Badge, Button, Card, EmptyState, Input, PageHeader } from '../components/ui'

const emptyForm = (): Partial<LoveBackgroundMusic> => ({
  title: '',
  singer: 'AI星芽',
  epname: '星芽恋记情侣空间',
  fileId: '',
  coverImgUrl: '',
  enabled: true,
  loopEnabled: true,
  sort: 0,
  remark: ''
})

export function MusicPage() {
  const [items, setItems] = useState<LoveBackgroundMusic[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Partial<LoveBackgroundMusic>>(emptyForm())

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listLoveMusic()
      setItems(data.items || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openEdit(row?: LoveBackgroundMusic) {
    setForm(row ? { ...row } : emptyForm())
    setDialogOpen(true)
  }

  async function save() {
    if (!form.title?.trim()) {
      window.alert('请输入标题')
      return
    }
    if (!form.fileId?.trim()) {
      window.alert('请输入云文件 ID')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        singer: form.singer?.trim() || 'AI星芽',
        epname: form.epname?.trim() || '星芽恋记情侣空间',
        fileId: form.fileId.trim(),
        coverImgUrl: form.coverImgUrl?.trim() || undefined,
        enabled: form.enabled ?? true,
        loopEnabled: form.loopEnabled ?? true,
        sort: Number(form.sort) || 0,
        remark: form.remark?.trim() || undefined
      }
      if (form.id) await updateLoveMusic(form.id, payload)
      else await createLoveMusic(payload)
      setDialogOpen(false)
      await load()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function quickToggle(row: LoveBackgroundMusic, key: 'enabled' | 'loopEnabled') {
    const next = !row[key]
    setItems((list) => list.map((item) => (item.id === row.id ? { ...item, [key]: next } : item)))
    try {
      await updateLoveMusic(row.id, { [key]: next })
    } catch (e) {
      setItems((list) => list.map((item) => (item.id === row.id ? { ...item, [key]: row[key] } : item)))
      window.alert(e instanceof Error ? e.message : '更新失败')
    }
  }

  async function syncCloud() {
    setSyncing(true)
    try {
      const res = await syncLoveMusicCloud()
      window.alert(`同步完成：扫描 ${res.scanned} 个对象，识别 ${res.matched} 首，新增 ${res.imported} 首，已存在 ${res.skipped} 首`)
      await load()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '同步失败（云托管环境内才可扫描 COS）')
    } finally {
      setSyncing(false)
    }
  }

  async function remove(row: LoveBackgroundMusic) {
    if (!window.confirm(`确认删除「${row.title}」？删除后小程序将不再播放。`)) return
    try {
      await deleteLoveMusic(row.id)
      await load()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="恋爱音乐"
        description="管理小程序首页背景音乐与循环播放列表。启用且「进入循环」的曲目会参与随机播放。"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button variant="secondary" onClick={syncCloud} disabled={syncing}>
              <CloudDownload className={`h-4 w-4 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? '同步中…' : '同步云存储音乐'}
            </Button>
            <Button onClick={() => openEdit()}>
              <Plus className="h-4 w-4" />
              新增音乐
            </Button>
          </div>
        }
      />

      <Card className="mb-5 border-pink-200/40 bg-pink-50/30 dark:border-pink-500/20 dark:bg-pink-500/5">
        <p className="text-sm leading-6 text-muted-foreground">
          <Music2 className="mr-1 inline h-4 w-4 text-pink-500" />
          点击「同步云存储音乐」会扫描云存储 <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">music/</code>{' '}
          目录下的 mp3/m4a/aac/wav，并自动写入播放列表（fileId 格式与控制台 CloudID 一致）。也可手动填写{' '}
          <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">cloud://环境ID.桶ID/路径</code>。
        </p>
      </Card>

      {error && (
        <Card className="mb-5 border-rose-200/60 bg-rose-50/40 dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="text-sm text-rose-600 dark:text-rose-200">{error}</p>
        </Card>
      )}

      <Card>
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">加载中…</p>
        ) : items.length === 0 ? (
          <EmptyState
            title="还没有背景音乐"
            description="添加云存储 fileID 或同步 music/ 目录后，恋爱时光首页会随机播放已启用且进入循环的音乐。"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/50 text-xs text-muted-foreground dark:border-white/10">
                  <th className="px-3 py-3 font-semibold">排序</th>
                  <th className="px-3 py-3 font-semibold">标题</th>
                  <th className="px-3 py-3 font-semibold">歌手</th>
                  <th className="px-3 py-3 font-semibold">云文件 ID</th>
                  <th className="px-3 py-3 font-semibold">启用</th>
                  <th className="px-3 py-3 font-semibold">进入循环</th>
                  <th className="px-3 py-3 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/40 transition hover:bg-white/30 dark:border-white/8 dark:hover:bg-white/5"
                  >
                    <td className="px-3 py-4 font-mono text-xs">{row.sort}</td>
                    <td className="px-3 py-4 font-bold">{row.title}</td>
                    <td className="px-3 py-4 text-muted-foreground">{row.singer}</td>
                    <td className="max-w-[280px] truncate px-3 py-4 font-mono text-xs text-muted-foreground" title={row.fileId}>
                      {row.fileId}
                    </td>
                    <td className="px-3 py-4">
                      <Toggle checked={row.enabled} onChange={() => quickToggle(row, 'enabled')} label="启用" />
                    </td>
                    <td className="px-3 py-4">
                      <Toggle checked={row.loopEnabled} onChange={() => quickToggle(row, 'loopEnabled')} label="循环" />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="h-9 px-3" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" />
                          编辑
                        </Button>
                        <Button variant="danger" className="h-9 px-3" onClick={() => remove(row)}>
                          <Trash2 className="h-4 w-4" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && items.length > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">共 {items.length} 首 · 小程序接口 GET /love-space/background-music/loop</p>
        )}
      </Card>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <h2 className="text-xl font-black">{form.id ? '编辑音乐' : '新增音乐'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">保存后立即影响小程序播放列表（需重新进入首页或切歌生效）。</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="标题">
                <Input value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="恋爱时光" />
              </Field>
              <Field label="歌手">
                <Input value={form.singer || ''} onChange={(e) => setForm((f) => ({ ...f, singer: e.target.value }))} placeholder="AI星芽" />
              </Field>
              <Field label="专辑 / 副标题" className="sm:col-span-2">
                <Input value={form.epname || ''} onChange={(e) => setForm((f) => ({ ...f, epname: e.target.value }))} placeholder="星芽恋记情侣空间" />
              </Field>
              <Field label="云文件 ID" className="sm:col-span-2">
                <Input
                  value={form.fileId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, fileId: e.target.value }))}
                  placeholder="cloud://prod-xxx.7072-xxx/music/love-bgm.mp3"
                />
              </Field>
              <Field label="封面图 fileID" className="sm:col-span-2">
                <Input
                  value={form.coverImgUrl || ''}
                  onChange={(e) => setForm((f) => ({ ...f, coverImgUrl: e.target.value }))}
                  placeholder="cloud://.../love-bg.png，可为空"
                />
              </Field>
              <Field label="排序">
                <Input
                  type="number"
                  min={0}
                  value={String(form.sort ?? 0)}
                  onChange={(e) => setForm((f) => ({ ...f, sort: Number(e.target.value) || 0 }))}
                />
              </Field>
              <Field label="状态" className="sm:col-span-2">
                <div className="flex flex-wrap gap-4">
                  <Toggle
                    checked={form.enabled ?? true}
                    onChange={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
                    label="启用"
                  />
                  <Toggle
                    checked={form.loopEnabled ?? true}
                    onChange={() => setForm((f) => ({ ...f, loopEnabled: !f.loopEnabled }))}
                    label="进入循环"
                  />
                </div>
              </Field>
              <Field label="备注" className="sm:col-span-2">
                <textarea
                  className="min-h-[88px] w-full rounded-[20px] border border-white/60 bg-white/60 px-4 py-3 text-sm outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-200/30 dark:border-white/10 dark:bg-white/8"
                  value={form.remark || ''}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                  placeholder="可选"
                />
              </Field>
            </div>
            <div className="mt-8 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={saving}>
                取消
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? '保存中…' : '保存'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  children,
  className = ''
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="inline-flex items-center gap-2 text-sm font-semibold"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-gradient-to-r from-pink-500 to-violet-500' : 'bg-zinc-300/80 dark:bg-zinc-600'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </span>
      {label}
    </button>
  )
}
