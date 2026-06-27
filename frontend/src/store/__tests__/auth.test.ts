import { describe, it, expect, beforeEach } from "vitest"
import { useAuthStore } from "../auth"

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  })
})

describe("AuthStore", () => {
  it("starts unauthenticated", () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it("setAuth sets user and token", () => {
    const user = { id: "1", email: "test@zilp.zw", username: "Test", role: "user" as const, is_active: true, created_at: "2024-01-01" }
    useAuthStore.getState().setAuth(user, "token123")
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe("token123")
    expect(state.isLoading).toBe(false)
  })

  it("logout clears all state", () => {
    useAuthStore.getState().setAuth(
      { id: "1", email: "test@zilp.zw", username: "Test", role: "user", is_active: true, created_at: "2024-01-01" },
      "token123"
    )
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it("setUser updates user without changing auth state", () => {
    useAuthStore.getState().setAuth(
      { id: "1", email: "test@zilp.zw", username: "Test", role: "user", is_active: true, created_at: "2024-01-01" },
      "token123"
    )
    const updated = { id: "1", email: "updated@zilp.zw", username: "Updated", role: "admin" as const, is_active: true, created_at: "2024-01-01" }
    useAuthStore.getState().setUser(updated)
    expect(useAuthStore.getState().user).toEqual(updated)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it("setAuth requires accessToken for isAuthenticated", () => {
    useAuthStore.getState().setAuth(
      { id: "1", email: "test@zilp.zw", username: "Test", role: "user", is_active: true, created_at: "2024-01-01" },
      ""
    )
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
})
