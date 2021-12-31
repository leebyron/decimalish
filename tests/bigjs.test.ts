import { decimal, add } from "../decimalish"
import Big from "big.js"

describe("big.js", () => {
  it("converts from a Big.js value", () => {
    expect(decimal(new Big("123"))).toBe("123")
    expect(decimal(new Big("-12345678901234567890"))).toBe(
      "-12345678901234567890"
    )
    expect(decimal(new Big("-0"))).toBe("0")
  })

  it("converts to a Big.js value", () => {
    expect(new Big(add(3n, "4"))).toStrictEqual(new Big("7"))
  })

  it("allows using Big.js values directly in functions", () => {
    expect(add(new Big("199"), 1)).toBe("200")
  })
})
