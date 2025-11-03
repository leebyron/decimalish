import { int } from "../decimalish"

describe("int", () => {
  it("truncates toward zero", () => {
    expect(int("2.5")).toBe("2")
    expect(int("-2.5")).toBe("-2")
    expect(int("12345678901234567890.5")).toBe("12345678901234567890")
  })
})
