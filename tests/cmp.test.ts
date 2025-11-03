import { cmp } from "../decimalish"

describe("cmp", () => {
  it("returns 0 when values are equal", () => {
    expect(cmp(1, 1)).toBe(0)
    expect(cmp("12345678901234567890", 12345678901234567890n)).toBe(0)
    expect(cmp("-0", "0")).toBe(0)
  })

  it("returns 1 when the first value is greater", () => {
    expect(cmp(2, 1)).toBe(1)
    expect(cmp("0.0002", "0.0001")).toBe(1)
    expect(cmp(-1, -2)).toBe(1)
  })

  it("returns -1 when the first value is smaller", () => {
    expect(cmp(1, 2)).toBe(-1)
    expect(cmp("0.0001", "0.0002")).toBe(-1)
    expect(cmp(-2, -1)).toBe(-1)
  })
})
