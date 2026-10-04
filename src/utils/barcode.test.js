import { describe, it, expect } from 'vitest'
import { stabilizeBarcode } from './barcode'

describe('stabilizeBarcode', () => {
  it('initialise le compteur a 1 pour un premier code', () => {
    const r = stabilizeBarcode(null, 0, '9782012345678', 3)
    expect(r).toEqual({ lastScanned: '9782012345678', scanCount: 1, navigate: false })
  })

  it('incremente le compteur quand le meme code est relu', () => {
    const r = stabilizeBarcode('9782012345678', 1, '9782012345678', 3)
    expect(r).toEqual({ lastScanned: '9782012345678', scanCount: 2, navigate: false })
  })

  it('declenche navigate quand le seuil est atteint', () => {
    const r = stabilizeBarcode('9782012345678', 2, '9782012345678', 3)
    expect(r).toEqual({ lastScanned: '9782012345678', scanCount: 3, navigate: true })
  })

  it('reste a navigate=true au-dela du seuil', () => {
    const r = stabilizeBarcode('9782012345678', 5, '9782012345678', 3)
    expect(r.navigate).toBe(true)
    expect(r.scanCount).toBe(6)
  })

  it('reinitialise le compteur quand un code different est lu', () => {
    const r = stabilizeBarcode('9782012345678', 2, '9781234567897', 3)
    expect(r).toEqual({ lastScanned: '9781234567897', scanCount: 1, navigate: false })
  })

  it('respecte un seuil de 1 (declenche des la premiere lecture repetee)', () => {
    const r = stabilizeBarcode('123', 0, '123', 1)
    expect(r.navigate).toBe(true)
  })
})
