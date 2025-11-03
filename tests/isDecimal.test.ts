import { decimal, isDecimal } from "../decimalish"

describe("isDecimal", () => {
  it("returns true for canonical decimal strings", () => {
    expect(isDecimal("0")).toBe(true)
    expect(isDecimal("123")).toBe(true)
    expect(isDecimal("-123.456")).toBe(true)
    expect(isDecimal("123.45")).toBe(true)
  })

  it("returns true for decimals produced by decimal()", () => {
    const produced = decimal("123.45")
    expect(isDecimal(produced)).toBe(true)
  })

  it("returns false for non-canonical or non-decimal values", () => {
    expect(isDecimal(0)).toBe(false)
    expect(isDecimal("-0")).toBe(false)
    expect(isDecimal("001")).toBe(false)
    expect(isDecimal("1.230")).toBe(false)
    expect(isDecimal(123)).toBe(false)
    expect(isDecimal("NaN")).toBe(false)
    expect(isDecimal(123n)).toBe(false)
    expect(isDecimal(true)).toBe(false)
    expect(
      isDecimal({
        valueOf() {
          return "1"
        },
      }),
    ).toBe(false)
    expect(
      isDecimal({
        toString() {
          return "1"
        },
      }),
    ).toBe(false)
  })
})
