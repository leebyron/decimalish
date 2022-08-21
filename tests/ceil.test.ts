import { ceil } from "../decimalish"

describe("ceil", () => {
  it("Rounds up to the nearest whole number in the direction of Infinity", () => {
    expect(ceil("2.5")).toBe("3")
    expect(ceil("2.51")).toBe("3")
    expect(ceil("2.49")).toBe("3")
    expect(ceil("-2.5")).toBe("-2")
    expect(ceil("-2.51")).toBe("-2")
    expect(ceil("-2.49")).toBe("-2")
  })
})
