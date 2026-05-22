import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartHandshake, LockKeyhole } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { useAdminStore } from '../store/useAdminStore'
import { loginAdmin } from '../api/admin'

export function LoginPage() {
  const authed = useAdminStore((state) => state.authed)
  const login = useAdminStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (authed) return <Navigate to="/" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await loginAdmin(username, password)
      login({
        token: result.token,
        id: result.admin.id,
        username: result.admin.username,
        nickname: result.admin.nickname,
        role: result.admin.role
      })
      const to = (location.state as { from?: string } | null)?.from || '/'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[980px]"
      >
        <Card className="grid overflow-hidden p-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[520px] overflow-hidden bg-gradient-to-br from-pink-200/80 via-violet-200/70 to-white/70 p-10 dark:from-pink-500/18 dark:via-violet-500/16 dark:to-white/5">
            <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-white/50 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/70 shadow-soft">
                <HeartHandshake className="h-7 w-7 text-pink-500" />
              </div>
              <p className="text-sm font-bold text-pink-500">Xingya Love Admin</p>
              <h1 className="mt-3 max-w-md text-5xl font-black leading-tight tracking-tight">
                星芽恋记后台管理系统
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                管理情侣空间、内容审核、AI 生成、运营配置和数据增长。界面采用 Apple Glass 与 Linear 风格，面向高频运营工作流。
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="flex flex-col justify-center p-8 sm:p-10">
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black">管理员登录</h2>
              <p className="mt-2 text-sm text-muted-foreground">Demo 账号已预填，后续可接 JWT/RBAC。</p>
            </div>
            <div className="space-y-4">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" />
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" type="password" />
              {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</p>}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? '登录中...' : '进入后台'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
