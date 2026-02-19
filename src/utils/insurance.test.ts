import { describe, expect, it } from 'vitest'
import {
  calculateInsuranceSum,
  formatCurrency,
  isValidSkDate,
  numberOfDays,
  parseDate,
  validatePersonCount,
  validateShortTermDateRange
} from './insurance'

describe('insurance utils', () => {
  it('validates strict Slovak date format including calendar validity', () => {
    expect(isValidSkDate('5.4.2026')).toBe(true)
    expect(isValidSkDate('31.02.2026')).toBe(false)
    expect(isValidSkDate('2026-04-05')).toBe(false)
  })

  it('parses strict dates and rejects invalid dates', () => {
    expect(parseDate('1.1.2026')).toEqual(new Date(2026, 0, 1))
    expect(parseDate('31.02.2026')).toBeNull()
  })

  it('calculates inclusive day count correctly', () => {
    const start = new Date(2026, 3, 1)
    const end = new Date(2026, 3, 10)
    expect(numberOfDays(start, end)).toBe(10)
  })

  it('validates short-term date range constraints', () => {
    expect(validateShortTermDateRange('1.4.2026', '1.4.2026')).toEqual({
      valid: false,
      message: 'Poistenie musí trvať aspoň 2 dni.'
    })

    expect(validateShortTermDateRange('10.4.2026', '9.4.2026')).toEqual({
      valid: false,
      message: 'Koniec poistenia musí byť po začiatku.'
    })

    expect(validateShortTermDateRange('1.1.2026', '31.12.2026')).toEqual({
      valid: false,
      message: 'Maximálna dĺžka krátkodobého poistenia je 364 dní.'
    })

    expect(validateShortTermDateRange('1.4.2026', '10.4.2026')).toEqual({
      valid: true,
      message: ''
    })
  })

  it('validates person count range', () => {
    expect(validatePersonCount(1).valid).toBe(true)
    expect(validatePersonCount(100).valid).toBe(true)
    expect(validatePersonCount(0).valid).toBe(false)
    expect(validatePersonCount(101).valid).toBe(false)
    expect(validatePersonCount(2.5).valid).toBe(false)
  })

  it('calculates short-term insurance sum with add-ons', () => {
    const sum = calculateInsuranceSum({
      typ: 'kratkodobe',
      zaciatokPoistenia: '1.4.2026',
      koniecPoistenia: '10.4.2026',
      balikId: 'zakladny',
      pocetOsob: 2,
      pripoistenia: ['storno_cesty']
    })

    expect(sum).toBeCloseTo(36, 4)
    expect(formatCurrency(sum)).toBe('Suma: 36,00 €')
  })

  it('calculates annual insurance sum with add-ons', () => {
    const sum = calculateInsuranceSum({
      typ: 'celorocne',
      zaciatokPoistenia: '1.4.2026',
      koniecPoistenia: null,
      balikId: 'extra',
      pocetOsob: 3,
      pripoistenia: ['storno_cesty', 'sportove_aktivity']
    })

    expect(sum).toBeCloseTo(233.64, 4)
    expect(formatCurrency(sum)).toBe('Suma: 233,64 €')
  })

  it('throws when person count is out of range', () => {
    expect(() => calculateInsuranceSum({
      typ: 'celorocne',
      zaciatokPoistenia: '1.4.2026',
      koniecPoistenia: null,
      balikId: 'extra',
      pocetOsob: 0,
      pripoistenia: []
    })).toThrow('Počet osôb musí byť v rozsahu 1 až 100.')
  })
})
