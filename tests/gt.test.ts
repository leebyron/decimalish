import { gt } from "../decimalish"

describe("gt", () => {
  it("returns true when the first value is greater", () => {
    expect(gt(2, 1)).toBe(true)
    expect(gt("1000", "999")).toBe(true)
    expect(gt(12345678901234567890n, "12345678901234567889")).toBe(true)
  })

  it("returns false when the first value is not greater", () => {
    expect(gt(1, 2)).toBe(false)
    expect(gt(1, 1)).toBe(false)
    expect(gt("-5", -5)).toBe(false)
  })
})
