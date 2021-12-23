import { div } from "../decimalish"

describe("div", () => {
  it("throws for divide by zero", () => {
    expect(() => div(1, 0)).toThrow("https://decimali.sh/#DIV_ZERO 1/0")
  })

  it("throws for inexact division", () => {
    expect(() => div(1, 3, { mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT 1/3"
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
})
