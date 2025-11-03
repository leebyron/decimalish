import { floor } from "../decimalish"

describe("floor", () => {
  it("rounds toward negative infinity", () => {
    expect(floor("2.5")).toBe("2")
    expect(floor("2.49")).toBe("2")
    expect(floor("-2.5")).toBe("-3")
    expect(floor("-2.01")).toBe("-3")
    expect(floor("12345678901234567890.5")).toBe("12345678901234567890")
  })
})
