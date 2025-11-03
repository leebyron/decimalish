import { movePoint } from "../decimalish"

describe("movePoint", () => {
  it("Moves decimal point", () => {
    expect(movePoint(3, 1)).toBe("30")
    expect(movePoint(3, -1)).toBe("0.3")
    expect(movePoint(3, 0)).toBe("3")
    expect(movePoint("12345678901234567890", -10)).toBe("1234567890.123456789")
  })

  it("requires an integer", () => {
    expect(() => movePoint(10, 0.5)).toThrow(
      "https://decimali.sh/#NOT_INT places: 0.5",
    )
  })
})
