import { lt } from "../decimalish"

describe("lt", () => {
  it("returns true when the first value is smaller", () => {
    expect(lt(1, 2)).toBe(true)
    expect(lt("-1000", "-999")).toBe(true)
    expect(lt("12345678901234567889", 12345678901234567890n)).toBe(true)
  })

  it("returns false when the first value is not smaller", () => {
    expect(lt(2, 1)).toBe(false)
    expect(lt(1, 1)).toBe(false)
    expect(lt("-5", -6)).toBe(false)
  })
})
