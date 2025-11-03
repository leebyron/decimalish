import { div } from "../decimalish"

describe("div", () => {
  it("throws for divide by zero", () => {
    expect(() => div(1, 0)).toThrow("https://decimali.sh/#DIV_ZERO 1/0")
  })

  it("throws for inexact division", () => {
    expect(() => div(1, 3, { mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT 1/3",
    )
  })

  it("specifies places", () => {
    expect(div(1, 3, { places: 0 })).toBe("0")
    expect(div(7, 3, { places: 0 })).toBe("2")
    expect(div(10, 3, { places: 0 })).toBe("3")
    expect(div(1, 3, { places: 1 })).toBe("0.3")
    expect(div(7, 3, { places: 1 })).toBe("2.3")
    expect(div(10, 3, { places: 1 })).toBe("3.3")
    expect(div(1, 3, { places: 2 })).toBe("0.33")
    expect(div(7, 3, { places: 2 })).toBe("2.33")
    expect(div(10, 3, { places: 2 })).toBe("3.33")
  })

  it("specifies precision", () => {
    expect(div(1, 3, { precision: 1 })).toBe("0.3")
    expect(div(7, 3, { precision: 1 })).toBe("2")
    expect(div(10, 3, { precision: 1 })).toBe("3")
    expect(div(1, 3, { precision: 2 })).toBe("0.33")
    expect(div(7, 3, { precision: 2 })).toBe("2.3")
    expect(div(10, 3, { precision: 2 })).toBe("3.3")
    expect(div(1, 3, { precision: 3 })).toBe("0.333")
    expect(div(7, 3, { precision: 3 })).toBe("2.33")
    expect(div(10, 3, { precision: 3 })).toBe("3.33")
  })

  it("divides with correct sign", () => {
    expect(div(8, 2)).toBe("4")
    expect(div(-8, 2)).toBe("-4")
    expect(div(8, -2)).toBe("-4")
    expect(div(-8, -2)).toBe("4")
  })

  it("divides big numbers", () => {
    expect(div("12345678901234567890", "3")).toBe("4115226300411522630")
    expect(div("123456789012345678901234567890", "12345678901234567890")).toBe(
      "10000000000.00000000009999999999",
    )
    expect(div("3", "12345678901234567890")).toBe(
      "0.0000000000000000002430000021870000199041301811273416",
    )
  })

  it("rounds half to even by default", () => {
    expect(div(5, 2, { places: 0 })).toBe("2")
    expect(div(15, 2, { places: 0 })).toBe("8")
  })

  it("supports alternate rounding modes", () => {
    expect(div(5, 2, { places: 0, mode: "half up" })).toBe("3")
    expect(div(5, 2, { places: 0, mode: "half down" })).toBe("2")
    expect(div(-5, 2, { places: 0, mode: "ceil" })).toBe("-2")
  })

  it("returns zero when the dividend is zero", () => {
    expect(div(0, 1)).toBe("0")
    expect(div(0, -7)).toBe("0")
    expect(div(0, 2n)).toBe("0")
    expect(div(0, "10", { precision: 4 })).toBe("0")
  })
})
