"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { authApi } from "@/services/api"
import type { User } from "@/types"

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, setAuth, setUser, setLoading, logout } =
    useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      const { data: tokens } = await authApi.login({ email, password })
      const { data: user } = await authApi.me()
      setAuth(user, tokens.access_token)
      return user
    },
    [setAuth]
  )

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      await authApi.register({ email, password, name })
      return login(email, password)
    },
    [login]
  )

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await authApi.me()
      setUser(data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [setUser, setLoading, logout])

  const signOut = useCallback(() => {
    logout()
    router.push("/login")
  }, [logout, router])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: signOut,
    fetchUser,
  }
}
