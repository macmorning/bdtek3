// Normalise n'importe quelle date entrante vers le format ISO plein YYYY-MM-DD.
// Les granularites partielles sont completees au 1er (annee -> -01-01, mois -> -01)
// afin d'homogeneiser le stockage et de rester compatible avec le v-date-picker Vuetify.
// Retourne '' si la valeur n'est pas interpretable.
// NB: cette logique doit rester alignee avec formatDate() dans functions/index.js.
export function normalizeDate (value) {
  if (value === undefined || value === null) { return '' }
  const s = String(value).trim()
  if (s === '') { return '' }

  // Deja ISO plein : YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) { return `${m[1]}-${m[2]}-${m[3]}` }

  // ISO partiel annee-mois : YYYY-MM -> YYYY-MM-01
  m = s.match(/^(\d{4})-(\d{2})$/)
  if (m) { return `${m[1]}-${m[2]}-01` }

  // Annee seule : YYYY -> YYYY-01-01
  m = s.match(/^(\d{4})$/)
  if (m) { return `${m[1]}-01-01` }

  // Format jj/mm/aaaa (ou j/m/aaaa) -> aaaa-mm-jj
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const dd = m[1].padStart(2, '0')
    const mm = m[2].padStart(2, '0')
    return `${m[3]}-${mm}-${dd}`
  }

  // Dernier recours : laisser Date tenter l'analyse (libelles type "June 1, 2015").
  // On lit les composants en heure locale (coherent avec l'interpretation de
  // new Date(libelle)) pour eviter un decalage de jour du au fuseau.
  const parsed = new Date(s)
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear().toString().padStart(4, '0')
    const mm = (parsed.getMonth() + 1).toString().padStart(2, '0')
    const dd = parsed.getDate().toString().padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return ''
}

// Retourne la date du jour (UTC) au format YYYY-MM-DD.
export function todayISO () {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = (now.getUTCMonth() + 1).toString().padStart(2, '0')
  const dd = now.getUTCDate().toString().padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
