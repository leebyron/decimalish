import { max, type NumericString } from "../decimalish"

describe("max", () => {
  it("returns the largest numeric value", () => {
    expect(max(1, 2, 3)).toBe("3")
    expect(max("12345678901234567890", "12345678901234567891", 5)).toBe(
      "12345678901234567891",
    )
    expect(max(-5, -2, -3)).toBe("-2")
  })

  it("handles many arguments and numeric objects", () => {
    const values = [
      1, -1, 3, -3, 5, -5, 7, -7, 9, -9, 11, -11, 13, -13, 15, -15, 17, -17, 19,
      -19,
    ]
    expect(max(...values)).toBe("19")
    expect(max("123", { valueOf: () => "124" as NumericString })).toBe("124")
  })
})
