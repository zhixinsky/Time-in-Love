import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminUser = {
  id?: string
  name: string
  role: string
  avatar: string
  username?: string
}

type AdminState = {
  authed: boolean
  dark: boolean
  token: string
  user: AdminUser
  setDark: (dark: boolean) => void
  login: (payload: { token?: string; username?: string; nickname?: string; role?: string; id?: string }) => void
  logout: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      authed: false,
      dark: false,
      token: '',
      user: {
        name: '星芽管理员',
        role: 'super-admin',
        avatar: 'https://api.dicebear.com/9.x/glass/svg?seed=xingya'
      },
      setDark: (dark) => {
        document.documentElement.classList.toggle('dark', dark)
        set({ dark })
      },
      login: (payload) =>
        set({
          authed: true,
          token: payload.token || '',
          user: {
            id: payload.id,
            name: payload.nickname || payload.username || '星芽管理员',
            username: payload.username,
            role: payload.role || 'super_admin',
            avatar: 'https://api.dicebear.com/9.x/glass/svg?seed=xingya'
          }
        }),
      logout: () => set({ authed: false, token: '' })
    }),
    {
      name: 'xingya-admin-session',
      onRehydrateStorage: () => (state) => {
        if (state?.dark) document.documentElement.classList.add('dark')
      }
    }
  )
)
