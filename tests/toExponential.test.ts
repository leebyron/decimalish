import { toExponential } from "../decimalish"

describe("toExponential", () => {
  it("prints Numeric in exponential notation", () => {
    expect(toExponential("0")).toBe("0e+0")
    expect(toExponential("123456")).toBe("1.23456e+5")
    expect(toExponential("123.456")).toBe("1.23456e+2")
    expect(toExponential("1.23456")).toBe("1.23456e+0")
    expect(toExponential("0.123456")).toBe("1.23456e-1")
    expect(toExponential("0.00123456")).toBe("1.23456e-3")
    expect(toExponential("12345678901234567890.1234567890123456789")).toBe(
      "1.23456789012345678901234567890123456789e+19"
    )
  })

  it("prints with specific places", () => {
    expect(toExponential("123456", { places: 0 })).toBe("1e+5")
    expect(toExponential("123.456", { places: 0 })).toBe("1e+2")
    expect(toExponential("1.23456", { places: 0 })).toBe("1e+0")
    expect(toExponential("0.123456", { places: 0 })).toBe("1e-1")
    expect(toExponential("0.00123456", { places: 0 })).toBe("1e-3")

    expect(toExponential("123456", { places: 2 })).toBe("1.23e+5")
    expect(toExponential("123.456", { places: 2 })).toBe("1.23e+2")
    expect(toExponential("1.23456", { places: 2 })).toBe("1.23e+0")
    expect(toExponential("0.123456", { places: 2 })).toBe("1.23e-1")
    expect(toExponential("0.00123456", { places: 2 })).toBe("1.23e-3")

    expect(toExponential("123456", { places: 4 })).toBe("1.2346e+5")
    expect(toExponential("123.456", { places: 4 })).toBe("1.2346e+2")
    expect(toExponential("1.23456", { places: 4 })).toBe("1.2346e+0")
    expect(toExponential("0.123456", { places: 4 })).toBe("1.2346e-1")
    expect(toExponential("0.00123456", { places: 4 })).toBe("1.2346e-3")

    expect(toExponential("123456", { places: 8 })).toBe("1.23456000e+5")
    expect(toExponential("123.456", { places: 8 })).toBe("1.23456000e+2")
    expect(toExponential("1.23456", { places: 8 })).toBe("1.23456000e+0")
    expect(toExponential("0.123456", { places: 8 })).toBe("1.23456000e-1")
    expect(toExponential("0.00123456", { places: 8 })).toBe("1.23456000e-3")

    expect(toExponential("123456", { places: -1 })).toBe("0e+0")
    expect(toExponential("123.456", { places: -1 })).toBe("0e+0")
    expect(toExponential("1.23456", { places: -1 })).toBe("0e+0")
    expect(toExponential("0.123456", { places: -1 })).toBe("0e+0")
    expect(toExponential("0.00123456", { places: -1 })).toBe("0e+0")
  })

  it("prints with specific precision", () => {
    expect(toExponential("123456", { precision: 1 })).toBe("1e+5")
    expect(toExponential("123.456", { precision: 1 })).toBe("1e+2")
    expect(toExponential("1.23456", { precision: 1 })).toBe("1e+0")
    expect(toExponential("0.123456", { precision: 1 })).toBe("1e-1")
    expect(toExponential("0.00123456", { precision: 1 })).toBe("1e-3")

    expect(toExponential("123456", { precision: 4 })).toBe("1.235e+5")
    expect(toExponential("123.456", { precision: 4 })).toBe("1.235e+2")
    expect(toExponential("1.23456", { precision: 4 })).toBe("1.235e+0")
    expect(toExponential("0.123456", { precision: 4 })).toBe("1.235e-1")
    expect(toExponential("0.00123456", { precision: 4 })).toBe("1.235e-3")

    expect(toExponential("123456", { precision: 8 })).toBe("1.2345600e+5")
    expect(toExponential("123.456", { precision: 8 })).toBe("1.2345600e+2")
    expect(toExponential("1.23456", { precision: 8 })).toBe("1.2345600e+0")
    expect(toExponential("0.123456", { precision: 8 })).toBe("1.2345600e-1")
    expect(toExponential("0.00123456", { precision: 8 })).toBe("1.2345600e-3")

    expect(toExponential("123456", { precision: -1 })).toBe("0e+0")
    expect(toExponential("123.456", { precision: -1 })).toBe("0e+0")
    expect(toExponential("1.23456", { precision: -1 })).toBe("0e+0")
    expect(toExponential("0.123456", { precision: -1 })).toBe("0e+0")
    expect(toExponential("0.00123456", { precision: -1 })).toBe("0e+0")
  })

  it("supports rounding mode", () => {
    expect(toExponential("123456", { precision: 1, mode: "up" })).toBe("2e+5")
    expect(toExponential("123.456", { precision: 1, mode: "up" })).toBe("2e+2")
    expect(toExponential("1.23456", { precision: 1, mode: "up" })).toBe("2e+0")
    expect(toExponential("0.123456", { precision: 1, mode: "up" })).toBe("2e-1")
    expect(toExponential("0.00123456", { precision: 1, mode: "up" })).toBe(
      "2e-3"
    )

    expect(toExponential("123456", { precision: 4, mode: "up" })).toBe(
      "1.235e+5"
    )
    expect(toExponential("123.456", { precision: 4, mode: "up" })).toBe(
      "1.235e+2"
    )
    expect(toExponential("1.23456", { precision: 4, mode: "up" })).toBe(
      "1.235e+0"
    )
    expect(toExponential("0.123456", { precision: 4, mode: "up" })).toBe(
      "1.235e-1"
    )
    expect(toExponential("0.00123456", { precision: 4, mode: "up" })).toBe(
      "1.235e-3"
    )

    expect(toExponential("123456", { precision: 8, mode: "up" })).toBe(
      "1.2345600e+5"
    )
    expect(toExponential("123.456", { precision: 8, mode: "up" })).toBe(
      "1.2345600e+2"
    )
    expect(toExponential("1.23456", { precision: 8, mode: "up" })).toBe(
      "1.2345600e+0"
    )
    expect(toExponential("0.123456", { precision: 8, mode: "up" })).toBe(
      "1.2345600e-1"
    )
    expect(toExponential("0.00123456", { precision: 8, mode: "up" })).toBe(
      "1.2345600e-3"
    )

    expect(toExponential("123456", { precision: -1, mode: "up" })).toBe("1e+7")
    expect(toExponential("123.456", { precision: -1, mode: "up" })).toBe("1e+4")
    expect(toExponential("1.23456", { precision: -1, mode: "up" })).toBe("1e+2")
    expect(toExponential("0.123456", { precision: -1, mode: "up" })).toBe(
      "1e+1"
    )
    expect(toExponential("0.00123456", { precision: -1, mode: "up" })).toBe(
      "1e-1"
    )
  })
})
