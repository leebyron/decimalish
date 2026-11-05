import {
  add,
  round,
  roundRem,
  toFixed,
  toExponential,
  NumericString,
  RoundingMode,
} from "../decimalish"
describe("rounding with retained parts", () => {
  it("preserves the remainder identity and formatted rounding", () => {
    const modes: RoundingMode[] = [
      "up",
      "down",
      "floor",
      "ceil",
      "euclidean",
      "half up",
      "half down",
      "half ceil",
      "half floor",
      "half even",
    ]
    for (const value of [
      "0",
      "123.456",
      "-123.456",
      "9.999",
      "-0.005",
      "0.00501",
      "0.005",
      "0.004",
      "125",
      "120",
      "9999",
    ] as NumericString[]) {
      for (const places of [-5, -2, 0, 2, 8])
        for (const mode of modes) {
          const rules = { places, mode }
          const [rounded, remainder] = roundRem(value, rules)
          expect(add(rounded, remainder)).toBe(add(value, "0"))
          expect(round(value, rules)).toBe(rounded)
        }
    }
    expect(toFixed("9.999", { places: 2 })).toBe("10.00")
    expect(toExponential("9.999", { places: 2 })).toBe("1.00e+1")
    expect(roundRem("123", { precision: -1, mode: "up" })).toEqual([
      "10000",
      "-9877",
    ])
    expect(roundRem("123", { precision: 0, mode: "up" })).toEqual([
      "1000",
      "-877",
    ])
    expect(() => roundRem("123", { precision: 2, mode: "exact" })).toThrow(
      "INEXACT",
    )
  })
})
