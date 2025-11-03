import { toFixed } from "../decimalish"

describe("toFixed", () => {
  it("prints Numeric in fixed notation", () => {
    expect(toFixed("0")).toBe("0")
    expect(toFixed("123456")).toBe("123456")
    expect(toFixed("123.456")).toBe("123.456")
    expect(toFixed("1.23456")).toBe("1.23456")
    expect(toFixed("0.123456")).toBe("0.123456")
    expect(toFixed("0.00123456")).toBe("0.00123456")
    expect(toFixed("12345678901234567890.1234567890123456789")).toBe(
      "12345678901234567890.1234567890123456789",
    )
  })

  it("prints with specific places", () => {
    expect(toFixed("123456", { places: 0 })).toBe("123456")
    expect(toFixed("123.456", { places: 0 })).toBe("123")
    expect(toFixed("1.23456", { places: 0 })).toBe("1")
    expect(toFixed("0.123456", { places: 0 })).toBe("0")
    expect(toFixed("0.00123456", { places: 0 })).toBe("0")

    expect(toFixed("123456", { places: 2 })).toBe("123456.00")
    expect(toFixed("123.456", { places: 2 })).toBe("123.46")
    expect(toFixed("1.23456", { places: 2 })).toBe("1.23")
    expect(toFixed("0.123456", { places: 2 })).toBe("0.12")
    expect(toFixed("0.00123456", { places: 2 })).toBe("0.00")

    expect(toFixed("123456", { places: 4 })).toBe("123456.0000")
    expect(toFixed("123.456", { places: 4 })).toBe("123.4560")
    expect(toFixed("1.23456", { places: 4 })).toBe("1.2346")
    expect(toFixed("0.123456", { places: 4 })).toBe("0.1235")
    expect(toFixed("0.00123456", { places: 4 })).toBe("0.0012")

    expect(toFixed("123456", { places: -1 })).toBe("123460")
    expect(toFixed("123.456", { places: -1 })).toBe("120")
    expect(toFixed("1.23456", { places: -1 })).toBe("0")
    expect(toFixed("0.123456", { places: -1 })).toBe("0")
    expect(toFixed("0.00123456", { places: -1 })).toBe("0")
  })

  it("prints with specific precision", () => {
    expect(toFixed("123456", { precision: 1 })).toBe("100000")
    expect(toFixed("123.456", { precision: 1 })).toBe("100")
    expect(toFixed("1.23456", { precision: 1 })).toBe("1")
    expect(toFixed("0.123456", { precision: 1 })).toBe("0.1")
    expect(toFixed("0.00123456", { precision: 1 })).toBe("0.001")

    expect(toFixed("123456", { precision: 4 })).toBe("123500")
    expect(toFixed("123.456", { precision: 4 })).toBe("123.5")
    expect(toFixed("1.23456", { precision: 4 })).toBe("1.235")
    expect(toFixed("0.123456", { precision: 4 })).toBe("0.1235")
    expect(toFixed("0.00123456", { precision: 4 })).toBe("0.001235")

    expect(toFixed("123456", { precision: 8 })).toBe("123456.00")
    expect(toFixed("123.456", { precision: 8 })).toBe("123.45600")
    expect(toFixed("1.23456", { precision: 8 })).toBe("1.2345600")
    expect(toFixed("0.123456", { precision: 8 })).toBe("0.12345600")
    expect(toFixed("0.00123456", { precision: 8 })).toBe("0.0012345600")

    expect(toFixed("123456", { precision: -1 })).toBe("0")
    expect(toFixed("123.456", { precision: -1 })).toBe("0")
    expect(toFixed("1.23456", { precision: -1 })).toBe("0")
    expect(toFixed("0.123456", { precision: -1 })).toBe("0")
    expect(toFixed("0.00123456", { precision: -1 })).toBe("0")
  })

  it("supports rounding mode", () => {
    expect(toFixed("123456", { precision: 1, mode: "up" })).toBe("200000")
    expect(toFixed("123.456", { precision: 1, mode: "up" })).toBe("200")
    expect(toFixed("1.23456", { precision: 1, mode: "up" })).toBe("2")
    expect(toFixed("0.123456", { precision: 1, mode: "up" })).toBe("0.2")
    expect(toFixed("0.00123456", { precision: 1, mode: "up" })).toBe("0.002")

    expect(toFixed("123456", { precision: 4, mode: "up" })).toBe("123500")
    expect(toFixed("123.456", { precision: 4, mode: "up" })).toBe("123.5")
    expect(toFixed("1.23456", { precision: 4, mode: "up" })).toBe("1.235")
    expect(toFixed("0.123456", { precision: 4, mode: "up" })).toBe("0.1235")
    expect(toFixed("0.00123456", { precision: 4, mode: "up" })).toBe("0.001235")

    expect(toFixed("123456", { precision: 8, mode: "up" })).toBe("123456.00")
    expect(toFixed("123.456", { precision: 8, mode: "up" })).toBe("123.45600")
    expect(toFixed("1.23456", { precision: 8, mode: "up" })).toBe("1.2345600")
    expect(toFixed("0.123456", { precision: 8, mode: "up" })).toBe("0.12345600")
    expect(toFixed("0.00123456", { precision: 8, mode: "up" })).toBe(
      "0.0012345600",
    )

    expect(toFixed("123456", { precision: -1, mode: "up" })).toBe("10000000")
    expect(toFixed("123.456", { precision: -1, mode: "up" })).toBe("10000")
    expect(toFixed("1.23456", { precision: -1, mode: "up" })).toBe("100")
    expect(toFixed("0.123456", { precision: -1, mode: "up" })).toBe("10")
    expect(toFixed("0.00123456", { precision: -1, mode: "up" })).toBe("0.1")
  })
})
