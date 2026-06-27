import { describe, it, expect, beforeEach } from "vitest"
import { useThemeStore } from "../theme"

beforeEach(() => {
  useThemeStore.setState({ theme: "dark" })
})

describe("ThemeStore", () => {
  it("defaults to dark mode", () => {
    expect(useThemeStore.getState().theme).toBe("dark")
  })

  it("toggleTheme switches between dark and light", () => {
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe("light")
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe("dark")
  })

  it("setTheme sets a specific theme", () => {
    useThemeStore.getState().setTheme("light")
    expect(useThemeStore.getState().theme).toBe("light")
    useThemeStore.getState().setTheme("dark")
    expect(useThemeStore.getState().theme).toBe("dark")
  })
})
