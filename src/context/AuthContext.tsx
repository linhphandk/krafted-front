import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, logout as apiLogout, me as apiMe } from "@/api/generated"
import { setTokens, clearTokens, hasTokens, getRefreshToken, setUserId } from "@/utils/token"
import type { UserResponse } from "@/api/generated"

interface AuthContextValue {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!hasTokens()) {
        setIsLoading(false)
        return
      }
      try {
        const user = await apiMe()
        if (!cancelled) { setUser(user); setUserId(user.id) }
      } catch {
        clearTokens()
      }
      if (!cancelled) setIsLoading(false)
    }

    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin({ email, password })
    setTokens(response.access_token, response.refresh_token, response.expires_in)
    setUserId(response.user.id)
    setUser(response.user)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const response = await apiRegister({ email, password, name: displayName })
    setTokens(response.access_token, response.refresh_token, response.expires_in)
    setUserId(response.user.id)
    setUser(response.user)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const user = await apiMe()
      setUser(user)
      setUserId(user.id)
    } catch {
      clearTokens()
      setUser(null)
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try { await apiLogout({ refresh_token: refreshToken }) } catch { /* ignore */ }
    }
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
