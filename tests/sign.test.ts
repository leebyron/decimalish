import { sign } from "../decimalish"

describe("sign", () => {
  it("returns the sign of the provided value", () => {
    expect(sign(10)).toBe(1)
    expect(sign(-10)).toBe(-1)
    expect(sign(0)).toBe(0)
    expect(sign(10n)).toBe(1)
    expect(sign(-10n)).toBe(-1)
    expect(sign(0n)).toBe(0)
    expect(sign("10")).toBe(1)
    expect(sign("-10")).toBe(-1)
    expect(sign("0")).toBe(0)
  })
})
