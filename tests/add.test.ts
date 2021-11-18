import { add, sub } from '../decimalish'

describe('add', () => {
  it('Adds two positive numbers', () => {
    expect(add(1, 2)).toBe('3')
    expect(add(100, 2)).toBe('102')
    expect(add(2, 100)).toBe('102')
    expect(add(123000, 456)).toBe('123456')
    expect(add(456, 123000)).toBe('123456')
  })

  it('Adds numbers and bigints', () => {
    expect(add(100n, 123n)).toBe('223')
  })

  it('Adds decimal strings', () => {
    expect(add('123.4', '0.102')).toBe('123.502')
  })

  it('Adds with carries', () => {
    expect(add('999.99', '0.01')).toBe('1000')
  })

  it('Adds negative numbers', () => {
    expect(add(-3, -5)).toBe('-8')
  })

  it('Adds numbers with differing signs', () => {
    expect(add(1, 0)).toBe('1')
    expect(add(0, 1)).toBe('1')
    expect(add(0, -1)).toBe('-1')
    expect(add(-1, 0)).toBe('-1')
    expect(add(10, -3)).toBe('7')
    expect(add(-3, 10)).toBe('7')
    expect(add(3, -10)).toBe('-7')
    expect(add(-10, 3)).toBe('-7')
  })

  it('Adds numbers with differing signs with carries', () => {
    expect(add('1234', '-987')).toBe('247')
  })

  it('Adds numbers with differing signs with removed leading spaces', () => {
    expect(add('124.98', '-124.97')).toBe('0.01')
  })

  it('Adds with zero to get identity', () => {
    expect(add(100, 0)).toBe('100')
    expect(add(0, 100)).toBe('100')
  })

  it('Adds negated of itself to get zero', () => {
    expect(add(100, -100)).toBe('0')
  })
})

describe('sub', () => {
  it('is equivalent to adding a negated number', () => {
    expect(sub(100, 50)).toBe('50')
    expect(sub(50, 100)).toBe('-50')
  })
})