import { min, type NumericString } from "../decimalish"

describe("min", () => {
  it("returns the smallest numeric value", () => {
    expect(min(1, 2, -5)).toBe("-5")
    expect(min("12345678901234567890", "12345678901234567891")).toBe(
      "12345678901234567890",
    )
    expect(min(-5, -2, -3)).toBe("-5")
  })

  it("handles many arguments and numeric objects", () => {
    const values = [
      1, -1, 3, -3, 5, -5, 7, -7, 9, -9, 11, -11, 13, -13, 15, -15, 17, -17, 19,
      -19,
    ]
    expect(min(...values)).toBe("-19")
    expect(min("123", { valueOf: () => "124" as NumericString })).toBe("123")
  })
})
