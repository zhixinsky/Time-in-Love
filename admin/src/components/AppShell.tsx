import { ReactNode, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, LogOut, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { menu } from '../data/adminData'
import { useAdminStore } from '../store/useAdminStore'
import { Button, Input } from './ui'
import { cn } from '../lib/utils'

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const dark = useAdminStore((state) => state.dark)
  const setDark = useAdminStore((state) => state.setDark)
  const logout = useAdminStore((state) => state.logout)
  const user = useAdminStore((state) => state.user)
  const navigate = useNavigate()

  const nav = useMemo(
    () => (
      <nav className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition',
                  'hover:bg-white/55 hover:text-foreground dark:hover:bg-white/10',
                  isActive && 'bg-white/75 text-foreground shadow-sm dark:bg-white/12'
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    ),
    []
  )

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[284px] border-r border-white/50 bg-white/45 p-4 backdrop-blur-3xl transition dark:border-white/10 dark:bg-white/5 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 text-lg font-black text-white shadow-lg shadow-pink-500/25">
              星
            </div>
            <div>
              <p className="text-base font-black leading-tight">星芽恋记</p>
              <p className="text-xs text-muted-foreground">Love Admin OS</p>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-112px)] overflow-y-auto pr-1">{nav}</div>
      </aside>

      <div className="lg:pl-[284px]">
        <header className="sticky top-0 z-30 border-b border-white/40 bg-white/45 px-4 py-3 backdrop-blur-3xl dark:border-white/10 dark:bg-[#130d1b]/70">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="搜索用户、空间、日记、举报、AI生成记录..." />
            </div>
            <Button variant="ghost" className="hidden h-10 w-10 px-0 sm:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" className="h-10 w-10 px-0" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-white/60 p-1 pr-3 dark:bg-white/10">
                  <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                  <span className="hidden text-sm font-semibold sm:block">{user.name}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 mt-2 w-56 rounded-3xl border border-white/50 bg-white/80 p-2 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-[#201629]/90"
                >
                  <DropdownMenu.Item className="rounded-2xl px-3 py-2 text-sm outline-none">超级管理员</DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-sm text-rose-500 outline-none hover:bg-rose-500/10"
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <motion.div layout>{children}</motion.div>
        </main>
      </div>
    </div>
  )
}
