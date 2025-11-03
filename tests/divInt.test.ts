import { divInt } from "../decimalish"

describe("divInt", () => {
  it("throws for divide by zero", () => {
    expect(() => divInt(1, 0)).toThrow("https://decimali.sh/#DIV_ZERO 1/0")
  })

  it("truncates toward zero by default", () => {
    expect(divInt(10, 3)).toBe("3")
    expect(divInt(-10, 3)).toBe("-3")
    expect(divInt(10, -3)).toBe("-3")
    expect(divInt(-7, 3)).toBe("-2")
  })

  it("respects rounding modes", () => {
    expect(divInt(7, 3, { mode: "up" })).toBe("3")
    expect(divInt(-7, 3, { mode: "up" })).toBe("-3")
    expect(divInt(-7, 3, { mode: "ceil" })).toBe("-2")
    expect(divInt(-7, 3, { mode: "floor" })).toBe("-3")
  })

  it("supports euclidean division", () => {
    expect(divInt(-7, 3, { mode: "euclidean" })).toBe("-3")
    expect(divInt(7, -3, { mode: "euclidean" })).toBe("-2")
  })

  it("returns zero when the dividend is zero", () => {
    expect(divInt(0, 7)).toBe("0")
    expect(divInt(0, -7)).toBe("0")
    expect(divInt(0, 3.5, { mode: "up" })).toBe("0")
  })

  it("supports asserting exact results", () => {
    expect(divInt(6, 3, { mode: "exact" })).toBe("2")
    expect(() => divInt(1, 3, { mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT 1/3",
    )
  })
})
