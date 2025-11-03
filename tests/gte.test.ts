import { gte } from "../decimalish"

describe("gte", () => {
  it("returns true when the first value is greater", () => {
    expect(gte(2, 1)).toBe(true)
    expect(gte("1000", "999")).toBe(true)
  })

  it("returns true when the values are equal", () => {
    expect(gte(1, 1)).toBe(true)
    expect(gte("12345678901234567890", 12345678901234567890n)).toBe(true)
  })

  it("returns false when the first value is smaller", () => {
    expect(gte(-2, -1)).toBe(false)
    expect(gte(0, 1)).toBe(false)
  })
})
