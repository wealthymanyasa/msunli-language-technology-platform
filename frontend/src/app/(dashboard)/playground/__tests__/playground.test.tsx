import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import PlaygroundPage from "../page"

vi.mock("@/services/api", () => ({
  nlpApi: {
    process: vi.fn().mockRejectedValue(new Error("Network error")),
    tokenize: vi.fn().mockRejectedValue(new Error("Network error")),
    detectLanguage: vi.fn().mockRejectedValue(new Error("Network error")),
  },
}))

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <PlaygroundPage />
    </QueryClientProvider>
  )
}

describe("Playground Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the Playground heading", () => {
    renderPage()
    expect(screen.getByText("Playground")).toBeDefined()
  })

  it("has a language selector with default English value", () => {
    renderPage()
    expect(screen.getByText("en")).toBeDefined()
  })

  it("shows Process, Tokens, and Detect tabs", () => {
    renderPage()
    expect(screen.getByText("Process")).toBeDefined()
    expect(screen.getByText("Tokens")).toBeDefined()
    expect(screen.getByText("Detect")).toBeDefined()
  })

  it("Run button is disabled when text is empty", () => {
    renderPage()
    const runButton = screen.getByRole("button", { name: /run/i })
    expect(runButton).toBeDisabled()
  })

  it("Run button is enabled when text is entered", async () => {
    renderPage()
    const textarea = screen.getByPlaceholderText("Enter text to process...")
    fireEvent.change(textarea, { target: { value: "Mhuri yese yakaungana." } })
    const runButton = screen.getByRole("button", { name: /run/i })
    expect(runButton).not.toBeDisabled()
  })

  it("shows empty state initially", () => {
    renderPage()
    expect(screen.getByText("Run a query to see results")).toBeDefined()
  })

  it("Clear button resets text", () => {
    renderPage()
    const textarea = screen.getByPlaceholderText("Enter text to process...")
    fireEvent.change(textarea, { target: { value: "Test text" } })
    expect(textarea).toHaveValue("Test text")
    const buttons = screen.getAllByRole("button")
    const clearButton = buttons.find((b) => !b.textContent?.trim())
    expect(clearButton).toBeDefined()
    if (clearButton) fireEvent.click(clearButton)
    expect(textarea).toHaveValue("")
  })
})
