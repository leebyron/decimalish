import { construct } from "../decimalish"

describe("construct", () => {
  it("Construct a decimal from an internal representation", () => {
    expect(construct(1, "99", 1)).toBe("99")
    expect(construct(-1, "123", 4)).toBe("-12300")
    expect(construct(-1, "0012300", 2)).toBe("-1.23")
    expect(construct(-1, "0012300", 0)).toBe("-0.0123")

    expect(construct(0, "", 0)).toBe("0")
    expect(construct(-1, "", 0)).toBe("0")
    expect(construct(0, "000000000", 2)).toBe("0")
  })
})
