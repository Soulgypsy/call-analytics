import type { CallFilters } from "./components/FilterSection"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const AUTH_TOKEN_KEY = 'callDataAuthToken'
const CALL_API = `${API_BASE_URL}/call-records`

interface AuthResponse {
  success?: boolean
  token?: string
  user?: {
    id?: number
    username?: string
    email?: string
    role?: 'ANALYST' | 'ADMIN'
  }
  error?: string
}

export type UserRole = 'ANALYST' | 'ADMIN'

export interface CallSummary {
  totalCalls: number
  totalDuration: number
  totalCost: number
  avgCallDuration: number
  answeredCalls: number
  unansweredCalls: number
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error
  }

  return fallback
}

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getRoleFromToken(): UserRole | null {
  const token = getAuthToken()
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const role = json?.role
    if (role === 'USER') {
      return 'ANALYST'
    }

    if (role === 'ANALYST' || role === 'ADMIN') {
      return role
    }
  } catch {
    return null
  }

  return null
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const payload: AuthResponse = await res.json().catch(() => ({}))

  if (!res.ok || !payload.token) {
    throw new Error(getErrorMessage(payload, 'Login failed'))
  }

  saveAuthToken(payload.token)
  return payload
}

export async function signup(input: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  age?: number
  role?: 'ANALYST' | 'ADMIN'
}) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const payload: AuthResponse = await res.json().catch(() => ({}))

  if (!res.ok || !payload.token) {
    throw new Error(getErrorMessage(payload, 'Signup failed'))
  }

  saveAuthToken(payload.token)
  return payload
}

export async function fetchCallList(filters?: CallFilters, page: number = 1) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const params = new URLSearchParams()
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.callerName) params.append('callerName', filters.callerName)
  if (filters?.callerNumber) params.append('callerNumber', filters.callerNumber)
  if (filters?.receiverNumber) params.append('receiverNumber', filters.receiverNumber)
  if (filters?.city) params.append('city', filters.city)
  if (filters?.callDirection !== null && filters?.callDirection !== undefined) params.append('callDirection', String(filters.callDirection))
  if (filters?.callStatus !== null && filters?.callStatus !== undefined) params.append('callStatus', String(filters.callStatus))
  if (filters?.limit) params.append('limit', String(Math.min(filters.limit, 25)))
  params.append('page', String(page))

  const queryString = params.toString()
  const url = queryString ? `${CALL_API}?${queryString}` : CALL_API

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to load call records'))
  }

  return payload ?? { data: [] }
}

export async function fetchCallSummary(): Promise<CallSummary> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const res = await fetch(`${CALL_API}?aggregate=summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to load call summary'))
  }

  return payload?.data ?? {
    totalCalls: 0,
    totalDuration: 0,
    totalCost: 0,
    avgCallDuration: 0,
    answeredCalls: 0,
    unansweredCalls: 0,
  }
}

export async function fetchCallById(id: string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated. Please log in first.')
  }

  const res = await fetch(`${CALL_API}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const payload = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, 'Failed to load call record'))
  }

  return payload?.data
}