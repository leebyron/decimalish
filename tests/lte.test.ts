import { lte } from "../decimalish"

describe("lte", () => {
  it("returns true when the first value is smaller", () => {
    expect(lte(1, 2)).toBe(true)
    expect(lte("-1000", "-999")).toBe(true)
  })

  it("returns true when values are equal", () => {
    expect(lte(1, 1)).toBe(true)
    expect(lte("12345678901234567890", 12345678901234567890n)).toBe(true)
  })

  it("returns false when the first value is greater", () => {
    expect(lte(2, 1)).toBe(false)
    expect(lte(0, -1)).toBe(false)
  })
})
