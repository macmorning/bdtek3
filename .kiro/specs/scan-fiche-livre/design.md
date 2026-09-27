# Design Document — scan-fiche-livre

## Overview

La fonctionnalité **scan-fiche-livre** ajoute un mode *consultation* à l'application bdtek3 : l'utilisateur scanne le code barre d'un livre ou d'une BD en magasin et obtient immédiatement une fiche synthétique (informations bibliographiques + avis des sites de référence), sans jamais modifier sa collection.

Le flux est entièrement non-destructif et accessible sans authentification. Une authentification est seulement requise pour l'action optionnelle d'ajout à la collection, déjà implémentée via `saveNewBook`.

### Recherche — points clés identifiés

**Sens Critique GraphQL non officiel**  
Sens Critique expose un endpoint GraphQL non documenté publiquement (`https://www.senscritique.com/graphql`). Des projets communautaires ([senscritique-graphql](https://github.com/SensCritique)) documentent les queries disponibles. La query `searchProducts` avec filtrage par EAN/ISBN ou par titre retourne note, url, et critiques. L'accès est possible sans authentification mais impose un User-Agent navigateur et des en-têtes `Origin`/`Referer` mimant un navigateur. Cet accès non officiel peut être interrompu sans préavis.

**Babelio scraping HTML**  
Babelio n'expose pas d'API publique. La recherche par ISBN se fait via `https://www.babelio.com/recherche.php?Recherche={isbn}&rechercher=1`. La page de résultats contient des balises `<a>` vers les fiches livres. La fiche livre contient : note globale (balise `.grosse_note`), nombre de critiques, extraits de critiques (`.text_bio`). Le scraping impose un User-Agent navigateur, une gestion des délais et une tolérance aux structures HTML changeantes.

**Contraintes techniques retenues**  
- Tous les appels vers Sens Critique et Babelio passent par une **Cloud Function HTTPS** (`getBookReviews`) pour éviter le CORS et cacher l'origine des requêtes.
- Un cache basé sur les **Realtime Database** ou **en mémoire Cloud Function** (réutilisation de l'instance chaude) est utilisé pour éviter de re-scraper le même ISBN.
- L'appel bibliographique (Open Library / Google Books) reste côté client, cohérent avec le fonctionnement actuel de `fetchBookInformations`.

---

## Architecture

### Vue d'ensemble des flux

```
┌─────────────────────────────────────────────────────────────────┐
│  Client (PWA — Vue 2 + Vuetify)                                 │
│                                                                  │
│  Route /scan                    Route /scan/:isbn                │
│  ┌──────────────────┐           ┌──────────────────────────┐    │
│  │  ScanPage.vue    │ ─ isbn ─► │  BookLookup.vue          │    │
│  │  (Scanner.vue    │           │  ┌──────────────────┐    │    │
│  │   en mode consult│           │  │ BiblioSection    │    │    │
│  │   3× stabilisé)  │           │  │ (Open Library /  │    │    │
│  └──────────────────┘           │  │  Google Books)   │    │    │
│                                 │  ├──────────────────┤    │    │
│                                 │  │ ReviewsSection   │    │    │
│                                 │  │ (Cloud Function) │    │    │
│                                 │  └──────────────────┘    │    │
│                                 └──────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────┘
                                     │ HTTPS callable
                                     ▼
┌────────────────────────────────────────────────────────────────┐
│  Firebase Cloud Functions (Node.js v1)                          │
│                                                                  │
│  getBookReviews(isbn)                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Validation ISBN (format)                             │  │
│  │  2. Vérification cache (RTDB /reviewsCache/{isbn})       │  │
│  │  3. Si cache absent ou expiré :                          │  │
│  │     a. Appel Sens Critique GraphQL  ──► avis SC          │  │
│  │     b. Scraping Babelio HTML        ──► avis Babelio     │  │
│  │     c. Agrégation + écriture cache                       │  │
│  │  4. Retour JSON structuré                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Flux résumé

1. L'utilisateur ouvre `/scan` → `ScanPage.vue` active la caméra.
2. Le Scanner détecte 3 fois consécutives le même ISBN → navigation vers `/scan/:isbn`.
3. `BookLookup.vue` se monte : deux chargements parallèles et indépendants :
   - **Bibliographique** : appel direct Open Library → Google Books (comme `fetchBookInformations`, mais côté client sans écriture).
   - **Avis** : appel HTTPS vers la Cloud Function `getBookReviews(isbn)`.
4. Les deux sections s'affichent dès que leurs données respectives arrivent.
5. Aucune écriture Firebase n'est effectuée pendant la consultation.
6. Si l'utilisateur est authentifié et clique sur « Ajouter à ma collection », `store.dispatch('saveNewBook', isbn)` est appelé.

---

## Components and Interfaces

### ScanPage.vue (nouveau)

Composant-page accessible via la route `/scan`. Encapsule `Scanner.vue` en mode consultation.

**Responsabilités :**
- Instancier `Scanner.vue` avec une prop `onDetected` qui alimente un compteur de stabilisation local.
- Détecter la stabilisation (3 lectures consécutives identiques) et naviguer vers `/scan/:isbn`.
- Afficher un message d'erreur si la caméra est inaccessible.
- Ne jamais appeler `saveNewBook` ni écrire en Firebase.

**Interface (data) :**
```js
data() {
  return {
    lastScanned: null,      // dernier code détecté
    scanCount: 0,           // nombre de détections consécutives identiques
    STABLE_THRESHOLD: 3,    // seuil de stabilisation
    cameraError: null       // message d'erreur caméra
  }
}
```

**Logique de stabilisation :**
```js
onBarcodeDetected(payload) {
  const code = payload.codeResult.code
  if (code === this.lastScanned) {
    this.scanCount++
    if (this.scanCount >= this.STABLE_THRESHOLD) {
      this.$router.push(`/scan/${code}`)
    }
  } else {
    this.lastScanned = code
    this.scanCount = 1
  }
}
```

---

### BookLookup.vue (nouveau)

Composant-page accessible via `/scan/:isbn`. Affiche la FicheScan complète.

**Responsabilités :**
- Recevoir l'ISBN depuis `$route.params.isbn`.
- Charger les données bibliographiques (Open Library → Google Books, côté client).
- Appeler la Cloud Function HTTPS `getBookReviews` pour les avis.
- Afficher deux sections avec états de chargement indépendants.
- Indiquer si l'ISBN est déjà dans la collection (si authentifié).
- Proposer le bouton « Ajouter à ma collection » (si authentifié et ISBN absent).
- Libérer l'état local au `beforeDestroy`.

**Interface (data) :**
```js
data() {
  return {
    isbn: '',
    // Données bibliographiques
    bookInfo: null,           // BookInfo | null
    bioLoading: true,
    bioError: null,
    // Données avis
    reviews: [],              // Review[]
    reviewsLoading: true,
    reviewsError: null,
    // État collection (si authentifié)
    alreadyInCollection: false,
    addSuccess: false
  }
}
```

**Lifecycle :**
- `created()` : récupère `this.isbn = this.$route.params.isbn`, déclenche les deux chargements.
- `beforeDestroy()` : réinitialise `bookInfo` et `reviews` à leur valeur initiale (pas de données en Vuex).

**Computed :**
```js
isAuthenticated() { return this.$store.getters.isAuthenticated }
userBooks()        { return this.$store.state.books }
```

---

### Modifications de Scanner.vue (minimal)

Le composant `Scanner.vue` existant est réutilisé sans modification structurelle. La prop `onDetected` est déjà prévue. Les deux pages (`Scanner.vue` route `/scanner` et `ScanPage.vue` route `/scan`) l'utilisent indépendamment.

> La route `/scanner` existante reste inchangée et continue de déclencher `saveNewBook` via son propre composant.

---

## Nouvelles routes Vue Router

```js
// Ajout dans routerOptions dans src/router.js
{ path: '/scan',        component: 'ScanPage'    },
{ path: '/scan/:isbn',  component: 'BookLookup'  },
```

**Remarques :**
- Aucune des deux routes n'a `meta.requiresAuth` → accessibles sans authentification.
- La route `/scan/:isbn` peut aussi être navigable directement (partage de lien, saisie manuelle).

---

## Cloud Function HTTPS — `getBookReviews`

### Déclaration

```js
exports.getBookReviews = functions.https.onRequest(async (req, res) => { ... })
```

Accessible via HTTPS callable depuis le client avec `firebase/functions` ou directement via `fetch`/`axios`.

### Validation de l'ISBN

```js
function isValidIsbn(isbn) {
  const cleaned = String(isbn).replace(/[-\s]/g, '')
  return /^\d{8}$|^\d{10}$|^\d{13}$/.test(cleaned)
}
```

Si l'ISBN est invalide → réponse `400 Bad Request` :
```json
{ "error": "ISBN invalide. Format attendu : 8, 10 ou 13 chiffres numériques." }
```

### Vérification du cache

Le cache est stocké dans Firebase Realtime Database sous `/reviewsCache/{isbn}` avec une TTL de **24 heures**.

```js
const cacheRef = admin.database().ref(`reviewsCache/${isbn}`)
const snapshot = await cacheRef.once('value')
const cached = snapshot.val()
if (cached && (Date.now() - cached.cachedAt) < 24 * 3600 * 1000) {
  return res.json(cached.reviews)
}
```

### Flux d'appel aux sources

Les deux sources sont appelées en parallèle (`Promise.allSettled`) pour minimiser la latence.

```js
const [scResult, babelioResult] = await Promise.allSettled([
  fetchSensCritique(isbn),
  fetchBabelio(isbn)
])
```

Chaque source retourne un tableau de `Review` ou lève une exception. En cas d'exception, l'erreur est loggée et la source est ignorée.

### Structure de réponse

```ts
interface Review {
  source: 'senscritique' | 'babelio'
  sourceName: string        // "Sens Critique" | "Babelio"
  rating: number | null     // note sur 10, null si indisponible
  ratingMax: number | null  // 10 pour SC, 5 pour Babelio
  excerpt: string | null    // extrait de critique, null si indisponible
  url: string               // URL de la fiche sur le site source
}

// Réponse de la Cloud Function :
type GetBookReviewsResponse = Review[]
```

Exemple de réponse :
```json
[
  {
    "source": "senscritique",
    "sourceName": "Sens Critique",
    "rating": 7.2,
    "ratingMax": 10,
    "excerpt": "Une œuvre magistrale qui renouvelle le genre...",
    "url": "https://www.senscritique.com/bd/titre/1234567"
  },
  {
    "source": "babelio",
    "sourceName": "Babelio",
    "rating": 4.1,
    "ratingMax": 5,
    "excerpt": "Un album incontournable pour les amateurs...",
    "url": "https://www.babelio.com/livres/Titre/12345"
  }
]
```

Si aucun avis n'est trouvé : tableau vide `[]` avec statut `200`.

### Gestion des erreurs

| Situation | Comportement |
|---|---|
| ISBN invalide | `400` + message descriptif, aucun appel HTTP |
| Source inaccessible (timeout, 5xx) | Source ignorée, erreur loggée, autres sources retournées |
| Aucune fiche trouvée sur une source | `[]` pour cette source, pas d'erreur |
| Erreur inattendue dans la fonction | `500` + message générique |

Timeout par source : **8 secondes** (Cloud Functions v1 timeout : 60s).

### Configuration CORS

```js
res.set('Access-Control-Allow-Origin', '*')
res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
if (req.method === 'OPTIONS') {
  res.status(204).send('')
  return
}
```

---

## Stratégie de scraping / API par source

### Sens Critique — GraphQL non officiel

**Endpoint :** `https://www.senscritique.com/graphql`

**Requête GraphQL :**
```graphql
query SearchBook($query: String!) {
  searchProducts(query: $query, filters: { universe: "BOOKS" }, limit: 1) {
    results {
      id
      title
      rating
      url
      reviews(limit: 1) {
        body
      }
    }
  }
}
```

La variable `query` est l'ISBN (ou titre en fallback).

**En-têtes requis :**
```js
{
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Origin': 'https://www.senscritique.com',
  'Referer': 'https://www.senscritique.com/'
}
```

**Parsing de la réponse :**
```js
const product = data.data?.searchProducts?.results?.[0]
if (!product) return []
return [{
  source: 'senscritique',
  sourceName: 'Sens Critique',
  rating: product.rating ?? null,
  ratingMax: 10,
  excerpt: product.reviews?.[0]?.body ?? null,
  url: `https://www.senscritique.com${product.url}`
}]
```

**Gestion de la fragilité :** Si la structure GraphQL change, la fonction retourne `[]` pour cette source sans lever d'erreur globale.

---

### Babelio — Scraping HTML

**Étape 1 — Recherche par ISBN :**
```
GET https://www.babelio.com/recherche.php?Recherche={isbn}&rechercher=1
```

Extraction de l'URL de la fiche via `htmlparser2` + `soupselect` (déjà disponibles dans `functions/index.js`) :
```js
// Sélecteur : a.titre_livre ou h2.titre a
const links = select(dom, '.titre_livre a')
const bookPath = links[0]?.attribs?.href  // ex: /livres/Titre/12345
```

**Étape 2 — Scraping de la fiche :**
```
GET https://www.babelio.com{bookPath}
```

Extraction :
```js
const ratingEl = select(dom, '.grosse_note')[0]
const rating = ratingEl ? parseFloat(ratingEl.children[0]?.data) : null

const excerptEl = select(dom, '.text_bio')[0]
const excerpt = excerptEl ? getText(excerptEl) : null
```

**En-têtes requis :**
```js
{
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  'Accept': 'text/html,application/xhtml+xml'
}
```

**Robustesse :** Les sélecteurs CSS sont encapsulés dans des try/catch. Si un sélecteur ne correspond plus à la structure HTML, la source retourne `[]` au lieu de faire planter la Cloud Function.

---

## Data Models

### BookInfo (état local de BookLookup.vue)

```ts
interface BookInfo {
  isbn: string
  title: string
  author: string
  imageURL: string
  publisher: string
  published: string        // format "YYYY" ou "YYYY-MM-DD"
  series: string | null
  volume: string | null
  seriesStatus: 'ongoing' | 'completed' | 'unknown'
  detailsURL: string
  source: 'openlibrary' | 'googlebooks' | 'unknown'
}
```

Le champ `seriesStatus` est absent des APIs actuelles (Open Library, Google Books). Dans un premier temps, la valeur sera `'unknown'` et cette section pourra être enrichie ultérieurement.

### Review (réponse Cloud Function)

Voir section Cloud Function ci-dessus.

### Cache RTDB

```
/reviewsCache/{isbn}/
  cachedAt: number        // timestamp ms
  reviews: Review[]
```

Le nœud cache est écrit par la Cloud Function et lu en lecture directe depuis la même fonction. Les règles RTDB doivent interdire la lecture/écriture publique de ce nœud.

```json
{
  "reviewsCache": {
    ".read": false,
    ".write": false
  }
}
```

---

## Correctness Properties

*Une propriété est une caractéristique ou un comportement qui doit être vérifié pour toutes les exécutions valides d'un système — formellement, une déclaration sur ce que le système doit faire. Les propriétés servent de pont entre les spécifications lisibles par les humains et les garanties de correction vérifiables automatiquement.*

---

### Property 1: Stabilisation du scan — navigation exactement une fois

*Pour tout* ISBN valide (EAN-13, EAN-8, UPC-A), si le même ISBN est émis N fois consécutivement par le Scanner avec N ≥ 3, alors la navigation vers `/scan/:isbn` est déclenchée **exactement une fois**, indépendamment de la valeur N.

**Validates: Requirements 1.2**

---

### Property 2: Erreur caméra — message toujours affiché

*Pour tout* type d'erreur levée lors de l'initialisation de la caméra (permission refusée, aucun périphérique, erreur matérielle), le composant `ScanPage.vue` doit toujours afficher un message d'erreur non vide à l'utilisateur.

**Validates: Requirements 1.3**

---

### Property 3: Rendu complet des champs bibliographiques

*Pour tout* objet `BookInfo` valide retourné par le ServiceBibliographique, le rendu de `BookLookup.vue` doit contenir les champs présents dans l'objet (titre, auteur, image, année, éditeur, série, volume) — aucun champ non-null ne doit être absent du rendu.

**Validates: Requirements 2.1**

---

### Property 4: ISBN conservé sur réponse vide

*Pour tout* ISBN valide fourni à `BookLookup.vue`, si le ServiceBibliographique retourne une réponse nulle ou vide, le composant doit afficher un message d'erreur **et** conserver l'ISBN visible dans l'interface.

**Validates: Requirements 2.3**

---

### Property 5: Rendu complet des avis avec tous les champs requis

*Pour tout* tableau d'avis retourné par `getBookReviews` et pour chaque avis du tableau, le rendu de `BookLookup.vue` doit afficher la source identifiable, la note (si non nulle), l'extrait (si non nul), et un lien cliquable avec `target="_blank"`.

**Validates: Requirements 3.1, 3.4, 3.5**

---

### Property 6: Absence d'avis — message affiché

*Pour tout* ISBN valide dont `getBookReviews` retourne un tableau vide, le composant doit afficher un message indiquant qu'aucun avis n'a été trouvé.

**Validates: Requirements 3.3**

---

### Property 7: Non-écriture Firebase pendant la consultation

*Pour tout* ISBN valide consulté via `BookLookup.vue` (avec ou sans données bibliographiques disponibles, authentifié ou non), aucune écriture dans Firebase Realtime Database (appels `set`, `update`, `remove`) ne doit être effectuée pendant toute la durée du cycle de vie du composant.

**Validates: Requirements 4.1**

---

### Property 8: Absence de données résiduelles dans le store après fermeture

*Pour tout* ensemble de données bibliographiques chargées dans `BookLookup.vue`, après destruction du composant, le store Vuex ne doit contenir aucun état spécifique à la FicheScan (aucune clé ajoutée, `currentBook` inchangé).

**Validates: Requirements 4.2**

---

### Property 9: Indicateur "Déjà dans votre collection" pour les ISBNs présents

*Pour tout* utilisateur authentifié et *pour tout* ISBN présent dans `store.state.books`, `BookLookup.vue` doit afficher l'indicateur "Déjà dans votre collection" et le bouton "Ajouter" doit être désactivé/absent.

**Validates: Requirements 4.3, 5.3**

---

### Property 10: Bouton "Ajouter" absent pour les utilisateurs non authentifiés

*Pour tout* état non authentifié (`store.state.user === null`) et *pour tout* ISBN, le bouton "Ajouter à ma collection" ne doit jamais apparaître dans le rendu de `BookLookup.vue`.

**Validates: Requirements 5.4**

---

### Property 11: saveNewBook appelé avec le bon ISBN

*Pour tout* utilisateur authentifié et *pour tout* ISBN absent de la collection, un clic sur le bouton "Ajouter à ma collection" doit déclencher exactement un appel à `store.dispatch('saveNewBook', isbn)` avec l'ISBN exact affiché dans la FicheScan.

**Validates: Requirements 5.2**

---

### Property 12: Structure de réponse toujours valide pour un ISBN valide

*Pour tout* ISBN valide passé à `getBookReviews`, la réponse doit toujours être un tableau JSON (éventuellement vide) où chaque élément possède obligatoirement les champs `source`, `sourceName`, et `url` (les champs `rating` et `excerpt` peuvent être `null`).

**Validates: Requirements 6.2**

---

### Property 13: Isolation des pannes de sources

*Pour toute* combinaison de sources disponibles/indisponibles (SC disponible + Babelio indisponible, SC indisponible + Babelio disponible, les deux indisponibles), `getBookReviews` doit retourner exactement les avis des sources disponibles — jamais une erreur 5xx en cas de défaillance partielle.

**Validates: Requirements 6.3**

---

### Property 14: Rejet d'ISBN invalide sans requête HTTP

*Pour toute* chaîne dont le format est invalide (non numérique, longueur différente de 8, 10 ou 13, chaîne vide, chaîne avec caractères spéciaux), `getBookReviews` doit retourner une erreur `400` et **ne pas** émettre de requête HTTP vers Sens Critique ou Babelio.

**Validates: Requirements 6.4**

---

## Error Handling

### Côté client (BookLookup.vue)

| Scénario | Comportement |
|---|---|
| Erreur réseau appel bibliographique | `bioError` affiché, ISBN conservé, section avis non bloquée |
| Timeout appel Cloud Function (>15s) | `reviewsError` affiché avec invitation à réessayer |
| ISBN mal formé dans l'URL | Redirection vers `/scan` avec message |
| Store non initialisé (user non auth) | Bouton ajout masqué, consultation disponible |

### Côté Cloud Function (getBookReviews)

| Scénario | Comportement |
|---|---|
| ISBN invalide | `400` immédiat, aucune requête externe |
| Source timeout (>8s) | Source ignorée, log `console.error`, autres sources retournées |
| Parse error HTML Babelio | Source ignorée, log `console.error` |
| Cache read error | Contourné, appel direct aux sources |
| Cache write error | Loggé, réponse retournée quand même |
| Erreur inattendue | `500` avec message générique |

---

## Considérations de sécurité

### CORS
La Cloud Function `getBookReviews` retourne `Access-Control-Allow-Origin: *`. Pour un environnement de production, il est préférable de restreindre à l'origine Firebase Hosting du projet (`https://{project}.web.app`).

### Rate limiting
Les Cloud Functions Firebase v1 n'ont pas de rate limiting natif par appelant. Pour éviter les abus :
- Vérifier que l'appelant est authentifié (optionnel selon la décision produit — cf. Req. 1.4 qui permet l'accès non authentifié).
- Limiter le nombre d'appels par IP via Firebase App Check ou via un compteur en RTDB.
- Le cache 24h réduit naturellement la pression sur les sources externes.

### User-Agent scraping
Les requêtes vers Babelio et Sens Critique utilisent un User-Agent navigateur standard pour éviter le blocage. L'IP de la Cloud Function sera celle de Google Cloud — en cas de blocage par IP, une rotation via Cloud NAT ou un proxy sera nécessaire.

### Fragilité des sources non officielles
L'API GraphQL de Sens Critique et le scraping Babelio peuvent être modifiés ou bloqués sans préavis. La Cloud Function est conçue pour dégrader gracieusement (retour d'un tableau vide) sans impact sur les fonctionnalités core de l'application.

### Données en cache
Le nœud `/reviewsCache` en RTDB ne doit être accessible qu'aux Cloud Functions (règles `.read: false, .write: false` pour les clients). Aucune donnée personnelle n'est stockée dans ce cache (ISBN + avis publics uniquement).

---

## Testing Strategy

### Approche duale

La stratégie combine des **tests unitaires** pour les cas concrets et des **tests property-based** pour les propriétés universelles.

**Library property-based retenue :** [fast-check](https://fast-check.dev/) (JavaScript, compatible Node.js et navigateur, supporte les arbitraires complexes).

Configuration : minimum **100 itérations** par propriété.

---

### Tests property-based (fast-check)

Chaque propriété du document est implémentée par un test fast-check unique. Tag format : `Feature: scan-fiche-livre, Property {N}: {titre}`.

| Propriété | Composant/Module testé | Arbitraires fast-check |
|---|---|---|
| P1 — Stabilisation scan | `stabilizeBarcode()` (pure fn extraite) | `fc.string()` filtré ISBN valides, `fc.integer(min:3, max:50)` |
| P2 — Erreur caméra | `ScanPage.vue` (test composant) | `fc.oneof(fc.constant('NotAllowedError'), fc.constant('NotFoundError'), fc.string())` |
| P3 — Rendu champs bibliographiques | `BookLookup.vue` (test composant) | `fc.record({ title: fc.string(), author: fc.string(), ... })` |
| P4 — ISBN conservé sur réponse vide | `BookLookup.vue` | `fc.string().filter(isValidIsbn)` |
| P5 — Rendu avis complet | `BookLookup.vue` | `fc.array(fc.record({ source, rating, excerpt, url }))` |
| P6 — Absence avis → message | `BookLookup.vue` | `fc.string().filter(isValidIsbn)` |
| P7 — Non-écriture Firebase | `BookLookup.vue` | `fc.string().filter(isValidIsbn)`, mock Firebase |
| P8 — Pas de données résiduelles Vuex | `BookLookup.vue` | `fc.record(BookInfo)` |
| P9 — Indicateur "Déjà en collection" | `BookLookup.vue` | `fc.array(fc.string().filter(isValidIsbn))` + ISBN présent |
| P10 — Bouton ajout absent si non auth | `BookLookup.vue` | `fc.string().filter(isValidIsbn)` |
| P11 — saveNewBook bon ISBN | `BookLookup.vue` | `fc.string().filter(isValidIsbn)` |
| P12 — Structure réponse CF valide | `getBookReviews` (test Cloud Function, sources mockées) | `fc.string().filter(isValidIsbn)` |
| P13 — Isolation pannes sources | `getBookReviews` | `fc.boolean()` × 2 (SC up/down, Babelio up/down) |
| P14 — Rejet ISBN invalide | `getBookReviews` | `fc.string().filter(s => !isValidIsbn(s))` |

---

### Tests unitaires (exemple-based)

- **ScanPage.vue** : état initial correct, pas d'appel saveNewBook quand l'ISBN est émis.
- **BookLookup.vue** : indicateurs de chargement indépendants (bioLoading vs reviewsLoading), statut série (3 exemples : ongoing, completed, unknown), bouton retour présent, libération caméra au beforeDestroy.
- **Router** : routes `/scan` et `/scan/:isbn` sans `requiresAuth`.
- **getBookReviews** : réponse vide `[]` quand les deux sources échouent, log d'erreur effectif.

---

### Tests d'intégration

- Appel réel à Open Library / Google Books avec un ISBN connu (ex : `9782756061801`).
- Appel réel à `getBookReviews` déployé en émulateur Firebase avec un ISBN connu.
- Vérification que le nœud `/reviewsCache` est bien écrit après le premier appel.
