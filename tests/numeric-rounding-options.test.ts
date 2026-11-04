import { round, toFixed, div, movePoint, pow } from "../decimalish"
describe("native integer rounding options", () => {
  it("matches other Numeric option types", () => {
    for (const places of [2, "2", 2n, { valueOf: () => 2 }] as const) {
      expect(toFixed("123.4567", { places })).toBe("123.46")
    }
    for (const precision of [4, "4", 4n, { valueOf: () => 4 }] as const) {
      expect(round("123.4567", { precision })).toBe("123.5")
      expect(div("10", "3", { precision })).toBe("3.333")
    }
    expect(toFixed("12.34", { places: 0 })).toBe("12")
    expect(toFixed("12.34", { places: -1 })).toBe("10")
    expect(movePoint("1", -2)).toBe("0.01")
    expect(pow(2, 3)).toBe("8")
  })
  it("retains validation of noninteger and nonfinite native options", () => {
    for (const places of [1.5, NaN, Infinity, -Infinity]) {
      expect(() => round("1.2", { places })).toThrow("NOT_INT")
    }
  })
})
