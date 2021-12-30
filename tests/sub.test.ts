import { sub } from "../decimalish"

describe("sub", () => {
  it("is equivalent to adding a negated number", () => {
    expect(sub(100, 50)).toBe("50")
    expect(sub(50, 100)).toBe("-50")
    expect(sub(100, 0)).toBe("100")
    expect(sub(0, 100)).toBe("-100")
  })

  it("subtracts with carry", () => {
    expect(sub("1000", "0.01")).toBe("999.99")
  })

  it("subtracts with differing signs", () => {
    expect(sub("999", "-1")).toBe("1000")
  })

  it("subtracts 0 as identity, or as equivalent of neg()", () => {
    expect(sub("100", "0")).toBe("100")
    expect(sub("0", "100")).toBe("-100")
  })
})
