import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Home from "../page"

describe("Landing Page", () => {
  it("renders the ZILP branding", () => {
    render(<Home />)
    expect(screen.getByText("ZILP")).toBeDefined()
  })

  it("has a Get Started link pointing to /register", () => {
    render(<Home />)
    const links = screen.getAllByText(/get started/i)
    expect(links.length).toBeGreaterThanOrEqual(1)
    expect(links[0].closest("a")).toHaveAttribute("href", "/register")
  })

  it("has a Sign In link pointing to /login", () => {
    render(<Home />)
    const links = screen.getAllByText(/sign in/i)
    expect(links.length).toBeGreaterThanOrEqual(1)
    expect(links[0].closest("a")).toHaveAttribute("href", "/login")
  })

  it("mentions Shona, Ndebele, Tonga, Nambya", () => {
    render(<Home />)
    expect(screen.getAllByText(/shona/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/ndebele/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/tonga/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/nambya/i).length).toBeGreaterThanOrEqual(1)
  })
})
