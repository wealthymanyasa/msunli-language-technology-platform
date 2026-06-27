import { describe, it, expect, vi } from "vitest"

const { mockPost } = vi.hoisted(() => ({
  mockPost: vi.fn(),
}))

vi.mock("axios", () => ({
  default: {
    create: () => ({
      post: mockPost,
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }),
  },
}))

import { authApi, nlpApi } from "@/services/api"

describe("authApi", () => {
  it("login sends email as username for OAuth2 compatibility", async () => {
    mockPost.mockRejectedValueOnce(new Error("network"))
    await authApi.login({ email: "test@test.com", password: "secret123" }).catch(() => {})
    expect(mockPost).toHaveBeenCalledWith("/auth/login/json", {
      username: "test@test.com",
      password: "secret123",
    })
  })

  it("register sends name, email, and password", async () => {
    mockPost.mockRejectedValueOnce(new Error("network"))
    await authApi
      .register({ email: "test@test.com", password: "secret123", name: "Test User" })
      .catch(() => {})
    expect(mockPost).toHaveBeenCalledWith("/auth/register", {
      email: "test@test.com",
      password: "secret123",
      name: "Test User",
    })
  })
})

describe("nlpApi", () => {
  it("process sends text and language", async () => {
    mockPost.mockRejectedValueOnce(new Error("network"))
    await nlpApi.process({ text: "hello", language: "sn" }).catch(() => {})
    expect(mockPost).toHaveBeenCalledWith("/api/v1/process", {
      text: "hello",
      language: "sn",
    })
  })

  it("tokenize sends text and language", async () => {
    mockPost.mockRejectedValueOnce(new Error("network"))
    await nlpApi.tokenize({ text: "hello", language: "nd" }).catch(() => {})
    expect(mockPost).toHaveBeenCalledWith("/api/v1/tokenize", {
      text: "hello",
      language: "nd",
    })
  })

  it("detectLanguage sends text", async () => {
    mockPost.mockRejectedValueOnce(new Error("network"))
    await nlpApi.detectLanguage({ text: "hello" }).catch(() => {})
    expect(mockPost).toHaveBeenCalledWith("/api/v1/detect-language", {
      text: "hello",
    })
  })
})
