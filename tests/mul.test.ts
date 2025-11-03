import { mul } from "../decimalish"

describe("mul", () => {
  it("Multiplies two positive numbers", () => {
    expect(mul(99, 99)).toBe("9801")
    expect(mul(11, 11)).toBe("121")
    expect(mul(1234, 0.9876)).toBe("1218.6984")
  })

  it("Multiplies different signs and scales", () => {
    expect(mul("-2000", "-0.003")).toBe("6")
    expect(mul("2000", "900")).toBe("1800000")
    expect(mul("0.005", "-0.0004")).toBe("-0.000002")
  })

  it("Returns zero when any operand is zero", () => {
    expect(mul(1234, 0)).toBe("0")
    expect(mul(0, 1234)).toBe("0")
    expect(mul(0, 0)).toBe("0")
    expect(mul(-1234, 0)).toBe("0")
    expect(mul(0, -1234)).toBe("0")
    expect(mul("-123.456", "0")).toBe("0")
    expect(mul("0", "-123.456")).toBe("0")
  })
})
