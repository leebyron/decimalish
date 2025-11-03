import { divRem } from "../decimalish"

describe("divRem", () => {
  it("throws for divide by zero", () => {
    expect(() => divRem(1, 0)).toThrow("https://decimali.sh/#DIV_ZERO 1/0")
    expect(() => divRem(123, 123, { places: 0.5 })).toThrow(
      "https://decimali.sh/#NOT_INT places: 0.5",
    )
    expect(() => divRem(123, 123, { precision: 0.5 })).toThrow(
      "https://decimali.sh/#NOT_INT precision: 0.5",
    )
    expect(() => divRem(123, 123, { precision: 1, places: 1 })).toThrow(
      "https://decimali.sh/#NOT_BOTH places: 1, precision: 1",
    )
  })

  it("returns 0 when 0 is divided", () => {
    expect(divRem(0, 1)).toStrictEqual(["0", "0"])
    expect(divRem(0, "12345678901234567890")).toStrictEqual(["0", "0"])
  })

  it("returns no remainder when dividing evenly", () => {
    expect(divRem(12, 3)).toStrictEqual(["4", "0"])
  })

  it("returns a remainder when dividing unevenly", () => {
    expect(divRem(10, 3)).toStrictEqual(["3", "1"])
  })

  it("returns a remainder of the same sign as the dividend", () => {
    expect(divRem(10, -3)).toStrictEqual(["-3", "1"])
    expect(divRem(-10, -3)).toStrictEqual(["3", "-1"])
    expect(divRem(-10, 3)).toStrictEqual(["-3", "-1"])
  })

  it("returns the dividend when the divisor is larger (same sign)", () => {
    expect(divRem(1, 3)).toStrictEqual(["0", "1"])
    expect(divRem(-1, -3)).toStrictEqual(["0", "-1"])
  })

  it("specifies places", () => {
    expect(divRem(1, 3, { places: 0 })).toStrictEqual(["0", "1"])
    expect(divRem(7, 3, { places: 0 })).toStrictEqual(["2", "1"])
    expect(divRem(10, 3, { places: 0 })).toStrictEqual(["3", "1"])
    expect(divRem(1, 3, { places: 1 })).toStrictEqual(["0.3", "0.1"])
    expect(divRem(7, 3, { places: 1 })).toStrictEqual(["2.3", "0.1"])
    expect(divRem(10, 3, { places: 1 })).toStrictEqual(["3.3", "0.1"])
    expect(divRem(1, 3, { places: 2 })).toStrictEqual(["0.33", "0.01"])
    expect(divRem(7, 3, { places: 2 })).toStrictEqual(["2.33", "0.01"])
    expect(divRem(10, 3, { places: 2 })).toStrictEqual(["3.33", "0.01"])
  })

  it("specifies precision", () => {
    expect(divRem(1, 3, { precision: 1 })).toStrictEqual(["0.3", "0.1"])
    expect(divRem(7, 3, { precision: 1 })).toStrictEqual(["2", "1"])
    expect(divRem(10, 3, { precision: 1 })).toStrictEqual(["3", "1"])
    expect(divRem(1, 3, { precision: 2 })).toStrictEqual(["0.33", "0.01"])
    expect(divRem(7, 3, { precision: 2 })).toStrictEqual(["2.3", "0.1"])
    expect(divRem(10, 3, { precision: 2 })).toStrictEqual(["3.3", "0.1"])
    expect(divRem(1, 3, { precision: 3 })).toStrictEqual(["0.333", "0.001"])
    expect(divRem(7, 3, { precision: 3 })).toStrictEqual(["2.33", "0.01"])
    expect(divRem(10, 3, { precision: 3 })).toStrictEqual(["3.33", "0.01"])
  })

  it("performs euclidean division", () => {
    expect(divRem(10, 3, { mode: "euclidean" })).toStrictEqual(["3", "1"])
    expect(divRem(10, -3, { mode: "euclidean" })).toStrictEqual(["-3", "1"])
    expect(divRem(-10, 3, { mode: "euclidean" })).toStrictEqual(["-4", "2"])
    expect(divRem(-10, -3, { mode: "euclidean" })).toStrictEqual(["4", "2"])
  })
})
