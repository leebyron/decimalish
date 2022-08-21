import { abs } from "../decimalish"

describe("abs", () => {
  it("Returns a decimal with the same value but always positive", () => {
    expect(abs("-123")).toBe("123")
    expect(abs("123")).toBe("123")
    expect(abs("0")).toBe("0")
  })

  it("implicitly casts to decimal", () => {
    expect(abs(-123)).toBe("123")
    expect(abs(-123n)).toBe("123")
    expect(abs("-3e3")).toBe("3000")
  })
})
