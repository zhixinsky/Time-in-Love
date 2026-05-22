import { useAdminStore } from '../store/useAdminStore'

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

type ApiResponse<T> = {
  code: number | string
  data: T
  message?: string
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>
  if (response.status === 401) {
    useAdminStore.getState().logout()
    throw new Error(json.message || '登录已过期')
  }
  if (!response.ok || json.code !== 0) {
    throw new Error(json.message || '请求失败')
  }
  return json.data
}

export async function adminRequest<T>(path: string, options: RequestInit = {}) {
  const token = useAdminStore.getState().token
  const response = await fetch(`${API_BASE}/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  return parseResponse<T>(response)
}

export type LoginResult = {
  token: string
  admin: {
    id: string
    username: string
    nickname: string
    role: string
    lastLoginAt?: string
  }
}

export function loginAdmin(username: string, password: string) {
  return adminRequest<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

export function getAdminMe() {
  return adminRequest<LoginResult['admin']>('/auth/me')
}

export type DashboardPayload = {
  today: {
    users: number
    spaces: number
    diaries: number
    images: number
    aiCalls: number
  }
  growth: number[]
  ai: {
    diarySummary: number
    chat: number
    loveLetter: number
  }
  activeCouples: string[]
  activities: Array<{ type: string; title: string; createdAt: string }>
}

export function getDashboard() {
  return adminRequest<DashboardPayload>('/dashboard')
}

export type ResourceListPayload = {
  resource: string
  meta: {
    title: string
    columns: string[]
  }
  list: Array<Record<string, string>>
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export function listResource(resource: string, params: { page?: number; pageSize?: number; keyword?: string } = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value))
  })
  const qs = search.toString()
  return adminRequest<ResourceListPayload>(`/resources/${resource}${qs ? `?${qs}` : ''}`)
}

export type ReviewTask = {
  id: string
  type: string
  content: string
  status: string
  risk: string
}

export function getReviewQueue(status?: string) {
  return adminRequest<ReviewTask[]>(`/review/queue${status ? `?status=${encodeURIComponent(status)}` : ''}`)
}

export function batchReview(ids: string[], action: 'approve' | 'reject', reason = '') {
  return adminRequest<{ ids: string[]; action: string; reason: string; handledAt: string }>('/review/batch', {
    method: 'POST',
    body: JSON.stringify({ ids, action, reason })
  })
}
