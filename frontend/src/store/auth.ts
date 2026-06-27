import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user: User, token: string) =>
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false }),
      setUser: (user: User) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: "zilp-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persisted: unknown, current: AuthStore): AuthStore => {
        const p = persisted as Record<string, unknown>
        const merged = { ...current, ...p }
        const user = p.user as Record<string, unknown> | undefined
        if (user && !user.username && user.name) {
          merged.user = { ...merged.user, username: user.name } as User
        }
        return merged
      },
    }
  )
)
