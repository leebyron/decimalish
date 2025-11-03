import { clamp, type NumericString } from "../decimalish"

describe("clamp", () => {
  it("returns the value when already within bounds", () => {
    expect(clamp(5, 1, 10)).toBe("5")
  })

  it("returns the lower bound when value is below it", () => {
    expect(clamp(-1, 0, 10)).toBe("0")
  })

  it("returns the upper bound when value is above it", () => {
    expect(clamp(15, 0, 10)).toBe("10")
  })

  it("handles many arguments and numeric objects", () => {
    const values = Array.from({ length: 20 }, (_, i) => (i % 2 ? -i : i))
    const low = Math.min(...values)
    const high = Math.max(...values)
    expect(clamp(5, low, high)).toBe("5")
    expect(clamp(-50, low, high)).toBe(String(low))
    expect(clamp(50, low, high)).toBe(String(high))
    expect(
      clamp(
        5,
        { valueOf: () => "1" as NumericString },
        { valueOf: () => "10" as NumericString },
      ),
    ).toBe("5")
  })
})
