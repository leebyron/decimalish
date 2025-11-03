import { places } from "../decimalish"

describe("places", () => {
  it("counts digits after the decimal point", () => {
    expect(places("123.456")).toBe(3)
    expect(places("0.001")).toBe(3)
    expect(places("100")).toBe(0)
  })
})
