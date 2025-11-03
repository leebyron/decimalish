import { mod } from "../decimalish"

describe("mod", () => {
  it("returns the mathematical modulo for positive values", () => {
    expect(mod(10, 3)).toBe("1")
    expect(mod("17", "5")).toBe("2")
  })

  it("returns a result with the same sign as the divisor", () => {
    expect(mod(-10, 3)).toBe("2")
    expect(mod(10, -3)).toBe("-2")
    expect(mod(-10, -3)).toBe("-1")
  })

  it("returns the dividend when the divisor has greater magnitude", () => {
    expect(mod(2, 5)).toBe("2")
    expect(mod(-2, -5)).toBe("-2")
  })

  it("returns 0 when the dividend is 0", () => {
    expect(mod(0, 7)).toBe("0")
    expect(mod(0, -7)).toBe("0")
  })

  it("throws for divide by zero", () => {
    expect(() => mod(1, 0)).toThrow("https://decimali.sh/#DIV_ZERO 1/0")
  })
})
