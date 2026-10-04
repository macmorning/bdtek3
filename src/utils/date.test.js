import { describe, it, expect } from 'vitest'
import { normalizeDate, todayISO } from './date'

describe('normalizeDate', () => {
  it('conserve une date ISO pleine YYYY-MM-DD', () => {
    expect(normalizeDate('2015-06-01')).toBe('2015-06-01')
  })

  it('complete une date ISO partielle annee-mois au 1er du mois', () => {
    expect(normalizeDate('2015-06')).toBe('2015-06-01')
  })

  it('complete une annee seule au 1er janvier', () => {
    expect(normalizeDate('2015')).toBe('2015-01-01')
  })

  it('convertit le format jj/mm/aaaa en aaaa-mm-jj', () => {
    expect(normalizeDate('01/06/2015')).toBe('2015-06-01')
  })

  it('pad le format j/m/aaaa non zero-padde', () => {
    expect(normalizeDate('1/6/2015')).toBe('2015-06-01')
  })

  it('interprete un libelle texte sans decalage de fuseau', () => {
    expect(normalizeDate('June 1, 2015')).toBe('2015-06-01')
  })

  it('retourne une chaine vide pour une valeur vide', () => {
    expect(normalizeDate('')).toBe('')
  })

  it('retourne une chaine vide pour une valeur non interpretable', () => {
    expect(normalizeDate('pas une date')).toBe('')
  })

  it('retourne une chaine vide pour null et undefined', () => {
    expect(normalizeDate(null)).toBe('')
    expect(normalizeDate(undefined)).toBe('')
  })

  it('ignore les espaces de bordure', () => {
    expect(normalizeDate('  2015-06-01  ')).toBe('2015-06-01')
  })
})

describe('todayISO', () => {
  it('retourne une chaine au format YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('correspond a la date UTC courante', () => {
    const now = new Date()
    const expected = now.getUTCFullYear() + '-' +
      (now.getUTCMonth() + 1).toString().padStart(2, '0') + '-' +
      now.getUTCDate().toString().padStart(2, '0')
    expect(todayISO()).toBe(expected)
  })
})
