// Note: could use { add, mul }, but this tests that namespace use still allows
// appropriate tree shaking.
import * as Decimal from "decimalish"

if (Decimal.mul(6, Decimal.add(4, 3)) !== "42") {
  throw new Error("Expected the answer")
}

// Introspect and assert that we have two used imports.
const imports = Object.keys(eval("decimalish__WEBPACK_IMPORTED_MODULE_0__"))
if (imports.length !== 2) throw new Error("Expected two imports")

console.log("Webpack tree shaking test successful")
