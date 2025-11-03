import { decimal } from "../decimalish"
import Big from "big.js"

describe("decimal", () => {
  it("throws on non numeric", () => {
    expect(() => decimal(NaN)).toThrow("https://decimali.sh/#NOT_NUM NaN")
    expect(() => decimal(Infinity)).toThrow(
      "https://decimali.sh/#NOT_NUM Infinity",
    )
    expect(() => decimal(-Infinity)).toThrow(
      "https://decimali.sh/#NOT_NUM -Infinity",
    )
    expect(() => decimal("abc")).toThrow("https://decimali.sh/#NOT_NUM abc")
    expect(() => decimal("")).toThrow("https://decimali.sh/#NOT_NUM ")
    expect(() => decimal(".")).toThrow("https://decimali.sh/#NOT_NUM .")
    expect(() => decimal("1.2a")).toThrow("https://decimali.sh/#NOT_NUM 1.2a")
    expect(() => decimal("0xF00D")).toThrow(
      "https://decimali.sh/#NOT_NUM 0xF00D",
    )
    expect(() => decimal(Symbol("3"))).toThrow(
      "https://decimali.sh/#NOT_NUM Symbol(3)",
    )
    expect(() => decimal({})).toThrow(
      "https://decimali.sh/#NOT_NUM [object Object]",
    )
    expect(() =>
      decimal({
        toString() {
          return "abc"
        },
      }),
    ).toThrow("https://decimali.sh/#NOT_NUM abc")
  })

  it("canonicalizes numeric values", () => {
    expect(decimal("-0")).toBe("0")
    expect(decimal("123.0")).toBe("123")
    expect(decimal("1.23e2")).toBe("123")
    expect(decimal("1.23E+2")).toBe("123")
    expect(decimal("-.00032e-5")).toBe("-0.0000000032")
    expect(decimal("123.")).toBe("123")
    expect(decimal("0000001")).toBe("1")
    expect(decimal("1000000")).toBe("1000000")
    expect(decimal(".0000001")).toBe("0.0000001")
    expect(decimal("1.000000")).toBe("1")
    expect(decimal("+000000099")).toBe("99")
  })

  it("converts various primitive types to decimal values", () => {
    expect(decimal(true)).toBe("1")
    expect(decimal(false)).toBe("0")
    expect(decimal(0)).toBe("0")
    expect(decimal(-0)).toBe("0")
    expect(decimal(-0.456)).toBe("-0.456")
    expect(decimal(-123n)).toBe("-123")
    expect(decimal(0xf00d)).toBe("61453")
    expect(decimal("1.23")).toBe("1.23")
  })

  it("converts various object types to decimal values", () => {
    expect(decimal(new Date("May 6, 2017 UTC"))).toBe("1494028800000")
    expect(
      decimal({
        valueOf() {
          return -42
        },
      }),
    ).toBe("-42")
    expect(
      decimal({
        toString() {
          return "12345"
        },
      }),
    ).toBe("12345")
  })

  it("converts from a Big.js value", () => {
    expect(decimal(new Big("123"))).toBe("123")
  })
})
