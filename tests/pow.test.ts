import { pow } from "../decimalish"

describe("pow", () => {
  it("handles common exponent cases", () => {
    expect(pow(2, 0)).toBe("1")
    expect(pow(2, 10)).toBe("1024")
    expect(pow(-2, 3)).toBe("-8")
    expect(pow("1.5", 3)).toBe("3.375")
  })

  it("raises large bases accurately", () => {
    expect(pow("12345678901234567890", 2)).toBe(
      "152415787532388367501905199875019052100",
    )
  })

  it("accepts numeric strings as the exponent", () => {
    expect(pow(5, "3")).toBe("125")
  })

  it("throws when exponent is negative", () => {
    expect(() => pow(2, -1)).toThrow(
      "https://decimali.sh/#NOT_POS exponent: -1",
    )
  })

  it("throws when exponent is not an integer", () => {
    expect(() => pow(2, 1.5)).toThrow(
      "https://decimali.sh/#NOT_INT exponent: 1.5",
    )
  })
})
