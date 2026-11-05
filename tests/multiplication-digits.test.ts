import { mul, NumericString } from "../decimalish"
import Big from "big.js"
describe("decoded multiplication", () => {
  it("matches exact products for balanced and asymmetric operands", () => {
    for (const length of [1, 2, 4, 5, 7, 8, 9, 28, 100]) {
      const a = ("9".repeat(length) + ".001") as NumericString
      for (const b of [
        "0",
        "1",
        "-1",
        "0.0003",
        "8".repeat(length),
        "1000000000000",
      ] as NumericString[]) {
        expect(mul(a, b)).toBe(new Big(a).times(b).toFixed())
        expect(mul(b, a)).toBe(new Big(b).times(a).toFixed())
      }
    }
  })
})
