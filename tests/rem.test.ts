import { rem } from "../decimalish"

describe("rem", () => {
  it("returns 0 for evenly divisible operands", () => {
    expect(rem(12, 3)).toBe("0")
    expect(rem("12345678901234567890", "3")).toBe("0")
  })

  it("matches the sign of the dividend", () => {
    expect(rem(10, 3)).toBe("1")
    expect(rem(-10, 3)).toBe("-1")
    expect(rem(10, -3)).toBe("1")
    expect(rem(-10, -3)).toBe("-1")
  })

  it("returns the dividend when the divisor has greater magnitude", () => {
    expect(rem(2, 5)).toBe("2")
    expect(rem(-2, 5)).toBe("-2")
    expect(rem(2, -5)).toBe("2")
    expect(rem(-2, -5)).toBe("-2")
  })

  it("returns 0 when the dividend is 0", () => {
    expect(rem(0, 7)).toBe("0")
    expect(rem(0, -7)).toBe("0")
  })

  it("honors rounding options", () => {
    expect(rem(1, 3, { places: 1 })).toBe("0.1")
    expect(rem(1, 3, { precision: 2 })).toBe("0.01")
  })

  it("throws when using exact mode with an inexact remainder", () => {
    expect(() => rem(1, 3, { mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT 1/3",
    )
  })

  it("throws for divide by zero", () => {
    expect(() => rem(1, 0)).toThrow("https://decimali.sh/#DIV_ZERO 1/0")
  })
})
