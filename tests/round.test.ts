import { round } from "../decimalish"
import type { RoundingRules } from "../decimalish"

describe("round", () => {
  it("throws on bad input", () => {
    // @ts-expect-error 'abc' is not Numeric
    expect(() => round("abc")).toThrow("https://decimali.sh/#NOT_NUM abc")
    expect(() => round("123", { places: 0.5 })).toThrow(
      "https://decimali.sh/#NOT_INT places: 0.5",
    )
    expect(() => round("123", { precision: 0.5 })).toThrow(
      "https://decimali.sh/#NOT_INT precision: 0.5",
    )
    expect(() => round("123", { precision: 1, places: 1 })).toThrow(
      "https://decimali.sh/#NOT_BOTH places: 1, precision: 1",
    )
    // @ts-expect-error 'sideways' is not a valid mode.
    expect(() => round("123", { mode: "sideways" })).toThrow(
      "https://decimali.sh/#NOT_MODE sideways",
    )
  })

  it("rounds with 'half even' default", () => {
    expect(round(0.5)).toBe("0")
    expect(round(1.5)).toBe("2")
    expect(round(-0.5)).toBe("0")
    expect(round(-0.5)).toBe("0")
    expect(round(0.5001)).toBe("1")
    expect(round(-0.5001)).toBe("-1")
    expect(round(9999.9)).toBe("10000")
    expect(round(0)).toBe("0")
    expect(round(9999)).toBe("9999")
  })

  it("rounds to a specified number of decimal places", () => {
    expect(round(12.34567, { places: 5 })).toBe("12.34567")
    expect(round(12.34567, { places: 3 })).toBe("12.346")
    expect(round(12.34567, { places: 1 })).toBe("12.3")
    expect(round(12.34567, { places: 0 })).toBe("12")
    expect(round(12.34567, { places: -1 })).toBe("10")
    expect(round(12.34567, { places: -3 })).toBe("0")

    expect(round(99, { places: 1 })).toBe("99")
    expect(round(99, { places: 0 })).toBe("99")
    expect(round(99, { places: -1 })).toBe("100")
    expect(round(99, { places: -2 })).toBe("100")
    expect(round(99, { places: -3 })).toBe("0")

    // And supports numeric strings places
    expect(round(12.34567, { places: "1" })).toBe("12.3")
    expect(round(12.34567, { places: "0" })).toBe("12")
    expect(round(12.34567, { places: "-1" })).toBe("10")

    // And bigint places
    expect(round(12.34567, { places: 1n })).toBe("12.3")
    expect(round(12.34567, { places: 0n })).toBe("12")
    expect(round(12.34567, { places: -1n })).toBe("10")
  })

  it("rounds to a specified precision", () => {
    expect(round(12.34567, { precision: 7 })).toBe("12.34567")
    expect(round(12.34567, { precision: 5 })).toBe("12.346")
    expect(round(12.34567, { precision: 3 })).toBe("12.3")
    expect(round(12.34567, { precision: 2 })).toBe("12")
    expect(round(12.34567, { precision: 1 })).toBe("10")
    expect(round(12.34567, { precision: 0 })).toBe("0")

    // And supports numeric strings precision
    expect(round(12.34567, { precision: "3" })).toBe("12.3")
    expect(round(12.34567, { precision: "2" })).toBe("12")
    expect(round(12.34567, { precision: "1" })).toBe("10")

    // And bigint precision
    expect(round(12.34567, { precision: 3n })).toBe("12.3")
    expect(round(12.34567, { precision: 2n })).toBe("12")
    expect(round(12.34567, { precision: 1n })).toBe("10")
  })

  it("rounds using different modes", () => {
    // up
    expect(round(1, { mode: "up" })).toBe("1")
    expect(round(0.501, { mode: "up" })).toBe("1")
    expect(round(0.5, { mode: "up" })).toBe("1")
    expect(round(0.499, { mode: "up" })).toBe("1")
    expect(round(0, { mode: "up" })).toBe("0")
    expect(round(-0.499, { mode: "up" })).toBe("-1")
    expect(round(-0.5, { mode: "up" })).toBe("-1")
    expect(round(-0.501, { mode: "up" })).toBe("-1")
    expect(round(-1, { mode: "up" })).toBe("-1")

    // down
    expect(round(1, { mode: "down" })).toBe("1")
    expect(round(0.501, { mode: "down" })).toBe("0")
    expect(round(0.5, { mode: "down" })).toBe("0")
    expect(round(0.499, { mode: "down" })).toBe("0")
    expect(round(0, { mode: "down" })).toBe("0")
    expect(round(-0.499, { mode: "down" })).toBe("0")
    expect(round(-0.5, { mode: "down" })).toBe("0")
    expect(round(-0.501, { mode: "down" })).toBe("0")
    expect(round(-1, { mode: "down" })).toBe("-1")

    // ceil
    expect(round(1, { mode: "ceil" })).toBe("1")
    expect(round(0.501, { mode: "ceil" })).toBe("1")
    expect(round(0.5, { mode: "ceil" })).toBe("1")
    expect(round(0.499, { mode: "ceil" })).toBe("1")
    expect(round(0, { mode: "ceil" })).toBe("0")
    expect(round(-0.499, { mode: "ceil" })).toBe("0")
    expect(round(-0.5, { mode: "ceil" })).toBe("0")
    expect(round(-0.501, { mode: "ceil" })).toBe("0")
    expect(round(-1, { mode: "ceil" })).toBe("-1")

    // floor
    expect(round(1, { mode: "floor" })).toBe("1")
    expect(round(0.501, { mode: "floor" })).toBe("0")
    expect(round(0.5, { mode: "floor" })).toBe("0")
    expect(round(0.499, { mode: "floor" })).toBe("0")
    expect(round(0, { mode: "floor" })).toBe("0")
    expect(round(-0.499, { mode: "floor" })).toBe("-1")
    expect(round(-0.5, { mode: "floor" })).toBe("-1")
    expect(round(-0.501, { mode: "floor" })).toBe("-1")
    expect(round(-1, { mode: "floor" })).toBe("-1")

    // half up
    expect(round(1, { mode: "half up" })).toBe("1")
    expect(round(0.501, { mode: "half up" })).toBe("1")
    expect(round(0.5, { mode: "half up" })).toBe("1")
    expect(round(0.499, { mode: "half up" })).toBe("0")
    expect(round(0, { mode: "half up" })).toBe("0")
    expect(round(-0.499, { mode: "half up" })).toBe("0")
    expect(round(-0.5, { mode: "half up" })).toBe("-1")
    expect(round(-0.501, { mode: "half up" })).toBe("-1")
    expect(round(-1, { mode: "half up" })).toBe("-1")

    // half down
    expect(round(1, { mode: "half down" })).toBe("1")
    expect(round(0.501, { mode: "half down" })).toBe("1")
    expect(round(0.5, { mode: "half down" })).toBe("0")
    expect(round(0.499, { mode: "half down" })).toBe("0")
    expect(round(0, { mode: "half down" })).toBe("0")
    expect(round(-0.499, { mode: "half down" })).toBe("0")
    expect(round(-0.5, { mode: "half down" })).toBe("0")
    expect(round(-0.501, { mode: "half down" })).toBe("-1")
    expect(round(-1, { mode: "half down" })).toBe("-1")

    // half ceil
    expect(round(1, { mode: "half ceil" })).toBe("1")
    expect(round(0.501, { mode: "half ceil" })).toBe("1")
    expect(round(0.5, { mode: "half ceil" })).toBe("1")
    expect(round(0.499, { mode: "half ceil" })).toBe("0")
    expect(round(0, { mode: "half ceil" })).toBe("0")
    expect(round(-0.499, { mode: "half ceil" })).toBe("0")
    expect(round(-0.5, { mode: "half ceil" })).toBe("0")
    expect(round(-0.501, { mode: "half ceil" })).toBe("-1")
    expect(round(-1, { mode: "half ceil" })).toBe("-1")

    // half floor
    expect(round(1, { mode: "half floor" })).toBe("1")
    expect(round(0.501, { mode: "half floor" })).toBe("1")
    expect(round(0.5, { mode: "half floor" })).toBe("0")
    expect(round(0.499, { mode: "half floor" })).toBe("0")
    expect(round(0, { mode: "half floor" })).toBe("0")
    expect(round(-0.499, { mode: "half floor" })).toBe("0")
    expect(round(-0.5, { mode: "half floor" })).toBe("-1")
    expect(round(-0.501, { mode: "half floor" })).toBe("-1")
    expect(round(-1, { mode: "half floor" })).toBe("-1")

    // half even
    expect(round(2.5, { mode: "half even" })).toBe("2")
    expect(round(1.5, { mode: "half even" })).toBe("2")
    expect(round(1, { mode: "half even" })).toBe("1")
    expect(round(0.501, { mode: "half even" })).toBe("1")
    expect(round(0.5, { mode: "half even" })).toBe("0")
    expect(round(0.499, { mode: "half even" })).toBe("0")
    expect(round(0, { mode: "half even" })).toBe("0")
    expect(round(-0.499, { mode: "half even" })).toBe("0")
    expect(round(-0.5, { mode: "half even" })).toBe("0")
    expect(round(-0.501, { mode: "half even" })).toBe("-1")
    expect(round(-1, { mode: "half even" })).toBe("-1")
    expect(round(-1.5, { mode: "half even" })).toBe("-2")
    expect(round(-2.5, { mode: "half even" })).toBe("-2")

    // euclidean (note: for round(), this is equivalent to floor)
    expect(round(1, { mode: "euclidean" })).toBe("1")
    expect(round(0.501, { mode: "euclidean" })).toBe("0")
    expect(round(0.5, { mode: "euclidean" })).toBe("0")
    expect(round(0.499, { mode: "euclidean" })).toBe("0")
    expect(round(0, { mode: "euclidean" })).toBe("0")
    expect(round(-0.499, { mode: "euclidean" })).toBe("-1")
    expect(round(-0.5, { mode: "euclidean" })).toBe("-1")
    expect(round(-0.501, { mode: "euclidean" })).toBe("-1")
    expect(round(-1, { mode: "euclidean" })).toBe("-1")

    // exact
    expect(round(1, { mode: "exact" })).toBe("1")
    expect(() => round(0.5, { mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT round 0.5",
    )
    expect(round(0, { mode: "exact" })).toBe("0")
  })

  it("does not change zero regardless of rounding rules", () => {
    const ruleSets: Array<[string, RoundingRules | undefined]> = [
      ["default", undefined],
      ["places positive", { places: 5 }],
      ["places zero", { places: 0 }],
      ["places negative", { places: -5 }],
      ["precision positive", { precision: 5 }],
      ["precision zero", { precision: 0 }],
      ["precision negative", { precision: -5 }],
      ["mode up", { mode: "up" }],
      ["mode down with places", { mode: "down", places: 3 }],
      ["mode half up with negative places", { mode: "half up", places: -3 }],
      ["mode half even with precision", { mode: "half even", precision: 4 }],
      [
        "mode euclidean with zero precision",
        { mode: "euclidean", precision: 0 },
      ],
    ]

    for (const [, rules] of ruleSets) {
      const result = rules ? round("0", rules) : round("0")
      expect(result).toBe("0")
    }

    expect(round("0", { precision: -1, mode: "exact" })).toBe("0")
    expect(round("0", { places: -2, mode: "exact" })).toBe("0")
  })
})
