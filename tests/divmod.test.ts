import { divmod } from '../decimalish'

describe('divmod', () => {

  it('throws for divide by zero', () => {
    expect(() => divmod(1, 0)).toThrow('Divide by 0')
    expect(() => divmod(123, 123, { places: 0.5 })).toThrow('places must be a whole number')
    expect(() => divmod(123, 123, { precision: 0.5 })).toThrow('precision must be a whole number')

  })

  it('returns 0 when 0 is divided', () => {
    expect(divmod(0, 1)).toStrictEqual(['0', '0'])
  })

  it('returns no remainder when dividing evenly', () => {
    expect(divmod(12, 3)).toStrictEqual(['4', '0'])
  })

  it('returns a remainder when dividing unevenly', () => {
    expect(divmod(10, 3)).toStrictEqual(['3', '1'])
  })

  it('returns a remainder of the same sign as the divisor', () => {
    expect(divmod(10, -3)).toStrictEqual(['-3', '1'])
    expect(divmod(-10, -3)).toStrictEqual(['3', '-1'])
    expect(divmod(-10, 3)).toStrictEqual(['-3', '-1'])
  })

  it('returns the dividend when the divisor is larger', () => {
    expect(divmod(1, 3)).toStrictEqual(['0', '1'])
    expect(divmod(1, -3)).toStrictEqual(['0', '1'])
    expect(divmod(-1, 3)).toStrictEqual(['0', '-1'])
    expect(divmod(-1, -3)).toStrictEqual(['0', '-1'])
  })

  it('specifies precision or places', () => {
    expect(divmod(7, 3, { places: 1 })).toStrictEqual(['2.3', '0.1'])
    expect(divmod(7, 3, { precision: 2 })).toStrictEqual(['2.3', '0.1'])
    expect(divmod(10, 3, { places: 1 })).toStrictEqual(['3.3', '0.1'])
    expect(divmod(10, 3, { precision: 2 })).toStrictEqual(['3.3', '0.1'])
  })
})
