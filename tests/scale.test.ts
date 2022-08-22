import { scale } from "../decimalish"

describe("scale", () => {
  it("returns the scale of the provided value", () => {
    expect(scale(20)).toBe(1)
    expect(scale(-20)).toBe(1)
    expect(scale(0.2)).toBe(-1)
    expect(scale(-0.2)).toBe(-1)
    expect(scale(2)).toBe(0)
    expect(scale(0)).toBe(0)
  })
})
