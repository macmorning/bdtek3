import { describe, it, expect } from 'vitest'
import { formatAuthor } from './author'

describe('formatAuthor', () => {
  it('joint un vrai tableau par des virgules', () => {
    expect(formatAuthor(['Thierry Cailleteau', 'Ciro Tota'])).toBe('Thierry Cailleteau, Ciro Tota')
  })

  it('parse une chaine JSON de tableau', () => {
    expect(formatAuthor('["Thierry Cailleteau", "Ciro Tota"]')).toBe('Thierry Cailleteau, Ciro Tota')
  })

  it('gere un tableau JSON a un seul element', () => {
    expect(formatAuthor('["Jacques Rouxel"]')).toBe('Jacques Rouxel')
  })

  it('laisse une chaine simple inchangee', () => {
    expect(formatAuthor('Franquin')).toBe('Franquin')
  })

  it('ignore les elements vides du tableau', () => {
    expect(formatAuthor(['A', '', null, 'B'])).toBe('A, B')
  })

  it('retourne une chaine vide pour vide/null/undefined', () => {
    expect(formatAuthor('')).toBe('')
    expect(formatAuthor(null)).toBe('')
    expect(formatAuthor(undefined)).toBe('')
  })

  it('retombe sur la chaine brute si le JSON est invalide', () => {
    expect(formatAuthor('[pas du json')).toBe('[pas du json')
  })

  it('ignore les espaces de bordure', () => {
    expect(formatAuthor('  Hergé  ')).toBe('Hergé')
  })
})
