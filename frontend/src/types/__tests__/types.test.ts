import { describe, it, expect } from "vitest"
import { SUPPORTED_LANGUAGES } from "../index"

describe("SUPPORTED_LANGUAGES", () => {
  it("includes all 5 ZILP languages", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code)
    expect(codes).toContain("sn")
    expect(codes).toContain("nd")
    expect(codes).toContain("tn")
    expect(codes).toContain("nx")
    expect(codes).toContain("en")
  })

  it("has display names for all languages", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.name).toBeTruthy()
      expect(lang.native).toBeTruthy()
    }
  })

  it("Shona is the first language", () => {
    expect(SUPPORTED_LANGUAGES[0].code).toBe("sn")
  })
})
