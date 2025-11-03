import { precision } from "../decimalish"

describe("precision", () => {
  it("counts the significant digits of the value", () => {
    expect(precision("123.456")).toBe(6)
    expect(precision("0.001")).toBe(1)
    expect(precision("100")).toBe(1)
    expect(precision("0")).toBe(0)
  })
})
