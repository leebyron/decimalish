import { round } from '../decimalish'

describe('round', () => {

  it('throws on bad input', () => {
    // @ts-expect-error 'abc' is not Numeric
    expect(() => round('abc')).toThrow('[decimalish] Not numeric: abc')
    expect(() => round('123', { places: 0.5 })).toThrow('[decimalish] places must be a whole number')
    expect(() => round('123', { precision: 0.5 })).toThrow('[decimalish] precision must be a whole number')
    // @ts-expect-error cannot provide both.
    expect(() => round('123', { precision: 1, places: 1 })).toThrow('[decimalish] Cannot provide both precision and places')
    // @ts-expect-error 'sideways' is not a valid mode.
    expect(() => round('123', { mode: 'sideways' })).toThrow('[decimalish] Unknown rounding mode: sideways')
  })

  it('rounds with defaults similar to Math.round()', () => {
    expect(round(0.5)).toBe('1')
    expect(round(-0.5)).toBe('0')
    expect(round(-0.5)).toBe('0')
    expect(round(0.5001)).toBe('1')
    expect(round(-0.5001)).toBe('-1')
    expect(round(9999.9)).toBe('10000')
    expect(round(0)).toBe('0')
    expect(round(9999)).toBe('9999')
  })

  it('rounds to a specified number of decimal places', () => {
    expect(round(12.34567, { places: 5 })).toBe('12.34567')
    expect(round(12.34567, { places: 3 })).toBe('12.346')
    expect(round(12.34567, { places: 1 })).toBe('12.3')
    expect(round(12.34567, { places: 0 })).toBe('12')
    expect(round(12.34567, { places: -1 })).toBe('10')
    expect(round(12.34567, { places: -3 })).toBe('0')

    expect(round(99, { places: 1 })).toBe('99')
    expect(round(99, { places: 0 })).toBe('99')
    expect(round(99, { places: -1 })).toBe('100')
    expect(round(99, { places: -2 })).toBe('100')
    expect(round(99, { places: -3 })).toBe('0')

    // And supports numeric strings places
    expect(round(12.34567, { places: '1' })).toBe('12.3')
    expect(round(12.34567, { places: '0' })).toBe('12')
    expect(round(12.34567, { places: '-1' })).toBe('10')

    // And bigint places
    expect(round(12.34567, { places: 1n })).toBe('12.3')
    expect(round(12.34567, { places: 0n })).toBe('12')
    expect(round(12.34567, { places: -1n })).toBe('10')
  })

  it('rounds to a specified precision', () => {
    expect(round(12.34567, { precision: 7 })).toBe('12.34567')
    expect(round(12.34567, { precision: 5 })).toBe('12.346')
    expect(round(12.34567, { precision: 3 })).toBe('12.3')
    expect(round(12.34567, { precision: 2 })).toBe('12')
    expect(round(12.34567, { precision: 1 })).toBe('10')
    expect(round(12.34567, { precision: 0 })).toBe('0')

    // And supports numeric strings precision
    expect(round(12.34567, { precision: '3' })).toBe('12.3')
    expect(round(12.34567, { precision: '2' })).toBe('12')
    expect(round(12.34567, { precision: '1' })).toBe('10')

    // And bigint precision
    expect(round(12.34567, { precision: 3n })).toBe('12.3')
    expect(round(12.34567, { precision: 2n })).toBe('12')
    expect(round(12.34567, { precision: 1n })).toBe('10')
  })

  it('rounds using different modes', () => {
    // up
    expect(round(1, { mode: 'up' })).toBe('1')
    expect(round(0.501, { mode: 'up' })).toBe('1')
    expect(round(0.5, { mode: 'up' })).toBe('1')
    expect(round(0.499, { mode: 'up' })).toBe('1')
    expect(round(0, { mode: 'up' })).toBe('0')
    expect(round(-0.499, { mode: 'up' })).toBe('-1')
    expect(round(-0.5, { mode: 'up' })).toBe('-1')
    expect(round(-0.501, { mode: 'up' })).toBe('-1')
    expect(round(-1, { mode: 'up' })).toBe('-1')

    // down
    expect(round(1, { mode: 'down' })).toBe('1')
    expect(round(0.501, { mode: 'down' })).toBe('0')
    expect(round(0.5, { mode: 'down' })).toBe('0')
    expect(round(0.499, { mode: 'down' })).toBe('0')
    expect(round(0, { mode: 'down' })).toBe('0')
    expect(round(-0.499, { mode: 'down' })).toBe('0')
    expect(round(-0.5, { mode: 'down' })).toBe('0')
    expect(round(-0.501, { mode: 'down' })).toBe('0')
    expect(round(-1, { mode: 'down' })).toBe('-1')

    // ceiling
    expect(round(1, { mode: 'ceiling' })).toBe('1')
    expect(round(0.501, { mode: 'ceiling' })).toBe('1')
    expect(round(0.5, { mode: 'ceiling' })).toBe('1')
    expect(round(0.499, { mode: 'ceiling' })).toBe('1')
    expect(round(0, { mode: 'ceiling' })).toBe('0')
    expect(round(-0.499, { mode: 'ceiling' })).toBe('0')
    expect(round(-0.5, { mode: 'ceiling' })).toBe('0')
    expect(round(-0.501, { mode: 'ceiling' })).toBe('0')
    expect(round(-1, { mode: 'ceiling' })).toBe('-1')

    // floor
    expect(round(1, { mode: 'floor' })).toBe('1')
    expect(round(0.501, { mode: 'floor' })).toBe('0')
    expect(round(0.5, { mode: 'floor' })).toBe('0')
    expect(round(0.499, { mode: 'floor' })).toBe('0')
    expect(round(0, { mode: 'floor' })).toBe('0')
    expect(round(-0.499, { mode: 'floor' })).toBe('-1')
    expect(round(-0.5, { mode: 'floor' })).toBe('-1')
    expect(round(-0.501, { mode: 'floor' })).toBe('-1')
    expect(round(-1, { mode: 'floor' })).toBe('-1')

    // half up
    expect(round(1, { mode: 'half up' })).toBe('1')
    expect(round(0.501, { mode: 'half up' })).toBe('1')
    expect(round(0.5, { mode: 'half up' })).toBe('1')
    expect(round(0.499, { mode: 'half up' })).toBe('0')
    expect(round(0, { mode: 'half up' })).toBe('0')
    expect(round(-0.499, { mode: 'half up' })).toBe('0')
    expect(round(-0.5, { mode: 'half up' })).toBe('-1')
    expect(round(-0.501, { mode: 'half up' })).toBe('-1')
    expect(round(-1, { mode: 'half up' })).toBe('-1')

    // half down
    expect(round(1, { mode: 'half down' })).toBe('1')
    expect(round(0.501, { mode: 'half down' })).toBe('1')
    expect(round(0.5, { mode: 'half down' })).toBe('0')
    expect(round(0.499, { mode: 'half down' })).toBe('0')
    expect(round(0, { mode: 'half down' })).toBe('0')
    expect(round(-0.499, { mode: 'half down' })).toBe('0')
    expect(round(-0.5, { mode: 'half down' })).toBe('0')
    expect(round(-0.501, { mode: 'half down' })).toBe('-1')
    expect(round(-1, { mode: 'half down' })).toBe('-1')

    // half ceiling
    expect(round(1, { mode: 'half ceiling' })).toBe('1')
    expect(round(0.501, { mode: 'half ceiling' })).toBe('1')
    expect(round(0.5, { mode: 'half ceiling' })).toBe('1')
    expect(round(0.499, { mode: 'half ceiling' })).toBe('0')
    expect(round(0, { mode: 'half ceiling' })).toBe('0')
    expect(round(-0.499, { mode: 'half ceiling' })).toBe('0')
    expect(round(-0.5, { mode: 'half ceiling' })).toBe('0')
    expect(round(-0.501, { mode: 'half ceiling' })).toBe('-1')
    expect(round(-1, { mode: 'half ceiling' })).toBe('-1')

    // half floor
    expect(round(1, { mode: 'half floor' })).toBe('1')
    expect(round(0.501, { mode: 'half floor' })).toBe('1')
    expect(round(0.5, { mode: 'half floor' })).toBe('0')
    expect(round(0.499, { mode: 'half floor' })).toBe('0')
    expect(round(0, { mode: 'half floor' })).toBe('0')
    expect(round(-0.499, { mode: 'half floor' })).toBe('0')
    expect(round(-0.5, { mode: 'half floor' })).toBe('-1')
    expect(round(-0.501, { mode: 'half floor' })).toBe('-1')
    expect(round(-1, { mode: 'half floor' })).toBe('-1')

    // half even
    expect(round(2.5, { mode: 'half even' })).toBe('2')
    expect(round(1.5, { mode: 'half even' })).toBe('2')
    expect(round(1, { mode: 'half even' })).toBe('1')
    expect(round(0.501, { mode: 'half even' })).toBe('1')
    expect(round(0.5, { mode: 'half even' })).toBe('0')
    expect(round(0.499, { mode: 'half even' })).toBe('0')
    expect(round(0, { mode: 'half even' })).toBe('0')
    expect(round(-0.499, { mode: 'half even' })).toBe('0')
    expect(round(-0.5, { mode: 'half even' })).toBe('0')
    expect(round(-0.501, { mode: 'half even' })).toBe('-1')
    expect(round(-1, { mode: 'half even' })).toBe('-1')
    expect(round(-1.5, { mode: 'half even' })).toBe('-2')
    expect(round(-2.5, { mode: 'half even' })).toBe('-2')

    // euclidean (note: for round(), this is equivalent to floor)
    expect(round(1, { mode: 'euclidean' })).toBe('1')
    expect(round(0.501, { mode: 'euclidean' })).toBe('0')
    expect(round(0.5, { mode: 'euclidean' })).toBe('0')
    expect(round(0.499, { mode: 'euclidean' })).toBe('0')
    expect(round(0, { mode: 'euclidean' })).toBe('0')
    expect(round(-0.499, { mode: 'euclidean' })).toBe('-1')
    expect(round(-0.5, { mode: 'euclidean' })).toBe('-1')
    expect(round(-0.501, { mode: 'euclidean' })).toBe('-1')
    expect(round(-1, { mode: 'euclidean' })).toBe('-1')
  })

})
