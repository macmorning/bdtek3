// Normalise une valeur "author" vers une chaine lisible "A, B, C".
// Gere les cas legacy ou l'auteur a ete stocke :
//  - comme un vrai tableau JS : ["A", "B"]
//  - comme une chaine JSON : '["A", "B"]'
//  - comme une simple chaine : "A"
// Retourne '' pour les valeurs vides/nulles.
export function formatAuthor (value) {
  if (value === undefined || value === null) { return '' }

  // Vrai tableau
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(a => String(a).trim()).join(', ')
  }

  const s = String(value).trim()
  if (s === '') { return '' }

  // Chaine ressemblant a un tableau JSON : tenter de parser
  if (s.startsWith('[') && s.endsWith(']')) {
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map(a => String(a).trim()).join(', ')
      }
    } catch (_) {
      // pas du JSON valide : on retombe sur la chaine brute
    }
  }

  return s
}
