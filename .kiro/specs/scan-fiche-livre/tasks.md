# Implementation Plan: scan-fiche-livre

## Overview

Ce plan implémente le mode consultation par scan de code barre en Vue 2 + Firebase. Il couvre :
- La Cloud Function `getBookReviews` (validation, cache RTDB, scraping/API)
- Les composants Vue `ScanPage.vue` et `BookLookup.vue`
- Les nouvelles routes `/scan` et `/scan/:isbn`
- Les tests property-based (fast-check) et les tests unitaires

---

## Tasks

- [x] 1. Créer la Cloud Function `getBookReviews` — structure de base et validation
  - [x] 1.1 Créer le squelette de la Cloud Function avec validation ISBN et gestion CORS
    - Ajouter `exports.getBookReviews` dans `functions/index.js` (ou fichier séparé importé)
    - Implémenter `isValidIsbn(isbn)` : nettoyage, regexp `/^\d{8}$|^\d{10}$|^\d{13}$/`
    - Retourner `400` avec message descriptif si ISBN invalide
    - Configurer les en-têtes CORS (`Access-Control-Allow-Origin: *`, gestion `OPTIONS`)
    - _Requirements: 6.1, 6.4_

  - [ ]* 1.2 Écrire le test property-based P14 — Rejet ISBN invalide sans requête HTTP
    - **Propriété 14 : Rejet d'ISBN invalide sans requête HTTP**
    - **Valide : Requirements 6.4**
    - Utiliser `fc.string().filter(s => !isValidIsbn(s))` pour générer des ISBNs invalides
    - Vérifier que `400` est retourné ET qu'aucune requête HTTP externe n'est émise (espionnage via mock)

- [x] 2. Implémenter le cache RTDB dans `getBookReviews`
  - [x] 2.1 Ajouter la lecture et l'écriture du cache RTDB (`/reviewsCache/{isbn}`)
    - Lire le nœud `/reviewsCache/{isbn}` avant tout appel externe
    - Vérifier TTL 24 heures ; retourner le cache si valide
    - Écrire `{ cachedAt: Date.now(), reviews: [...] }` après appel aux sources
    - Gérer les erreurs de lecture/écriture cache sans bloquer la réponse principale
    - _Requirements: 6.1, 6.2_

- [x] 3. Implémenter l'appel Sens Critique dans `getBookReviews`
  - [x] 3.1 Créer la fonction `fetchSensCritique(isbn)` avec requête GraphQL
    - Envoyer la query `searchProducts` à `https://www.senscritique.com/graphql`
    - Inclure les en-têtes requis (`User-Agent`, `Origin`, `Referer`)
    - Parser la réponse et retourner un tableau `Review[]` (ou `[]` si aucun résultat)
    - Timeout à 8 secondes, erreur loggée et `[]` retourné en cas d'exception
    - _Requirements: 6.2, 6.3_

  - [ ]* 3.2 Écrire le test property-based P13 — Isolation des pannes de sources
    - **Propriété 13 : Isolation des pannes de sources**
    - **Valide : Requirements 6.3**
    - Utiliser `fc.boolean()` × 2 pour simuler SC disponible/indisponible et Babelio disponible/indisponible
    - Vérifier que `getBookReviews` ne retourne jamais 5xx en cas de panne partielle
    - Vérifier que les avis des sources disponibles sont bien retournés

- [x] 4. Implémenter le scraping Babelio dans `getBookReviews`
  - [x] 4.1 Créer la fonction `fetchBabelio(isbn)` avec scraping HTML en deux étapes
    - Étape 1 : GET sur `recherche.php?Recherche={isbn}` → extraire l'URL de la fiche via `.titre_livre a`
    - Étape 2 : GET sur la fiche → extraire `.grosse_note` et `.text_bio`
    - Inclure les en-têtes requis (`User-Agent`, `Accept-Language`, `Accept`)
    - Encapsuler les sélecteurs CSS dans des try/catch ; retourner `[]` en cas d'erreur de parsing
    - Timeout à 8 secondes, erreur loggée et `[]` retourné en cas d'exception
    - _Requirements: 6.2, 6.3_

- [x] 5. Assembler `getBookReviews` — appels parallèles et réponse finale
  - [x] 5.1 Câbler `fetchSensCritique` et `fetchBabelio` avec `Promise.allSettled` et structurer la réponse
    - Appeler les deux sources en parallèle via `Promise.allSettled`
    - Agréger les résultats valides dans un tableau `Review[]`
    - Écrire le résultat en cache RTDB
    - Retourner le tableau JSON (tableau vide `[]` acceptable si aucun avis trouvé)
    - Retourner `500` avec message générique en cas d'erreur inattendue
    - _Requirements: 6.2, 6.3_

  - [ ]* 5.2 Écrire le test property-based P12 — Structure de réponse toujours valide pour un ISBN valide
    - **Propriété 12 : Structure de réponse toujours valide pour un ISBN valide**
    - **Valide : Requirements 6.2**
    - Utiliser `fc.string().filter(isValidIsbn)` avec sources mockées retournant des données aléatoires
    - Vérifier que chaque élément du tableau possède obligatoirement `source`, `sourceName`, `url`
    - Vérifier que `rating` et `excerpt` peuvent être `null` mais que la réponse est toujours un tableau

- [x] 6. Checkpoint — Cloud Function
  - S'assurer que tous les tests de la Cloud Function passent, demander à l'utilisateur si des questions se posent.

- [x] 7. Créer `ScanPage.vue` avec logique de stabilisation
  - [x] 7.1 Implémenter `ScanPage.vue` — page `/scan` encapsulant `Scanner.vue` en mode consultation
    - Créer `src/views/ScanPage.vue` (ou `src/components/ScanPage.vue` selon convention du projet)
    - Instancier `Scanner.vue` avec la prop `onDetected` → `onBarcodeDetected`
    - Extraire `stabilizeBarcode(lastScanned, scanCount, code, threshold)` comme fonction pure testable
    - Implémenter la logique : 3 lectures consécutives identiques → `this.$router.push('/scan/' + code)`
    - La navigation ne doit être déclenchée qu'une seule fois pour N ≥ 3 lectures identiques
    - Afficher un message d'erreur si la caméra est inaccessible (`cameraError`)
    - Ne jamais appeler `saveNewBook` ni écrire en Firebase
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 7.2 Écrire le test property-based P1 — Stabilisation du scan
    - **Propriété 1 : Stabilisation du scan — navigation exactement une fois**
    - **Valide : Requirements 1.2**
    - Utiliser `fc.string().filter(isValidIsbn)` et `fc.integer({ min: 3, max: 50 })` pour N
    - Vérifier que `stabilizeBarcode` déclenche la navigation exactement une fois pour N ≥ 3

  - [ ]* 7.3 Écrire le test property-based P2 — Erreur caméra toujours affichée
    - **Propriété 2 : Erreur caméra — message toujours affiché**
    - **Valide : Requirements 1.3**
    - Utiliser `fc.oneof(fc.constant('NotAllowedError'), fc.constant('NotFoundError'), fc.string())`
    - Vérifier que `ScanPage.vue` affiche un message d'erreur non vide pour tout type d'erreur caméra

- [x] 8. Ajouter les routes `/scan` et `/scan/:isbn` dans le routeur
  - [x] 8.1 Déclarer les deux nouvelles routes dans `src/router.js`
    - Ajouter `{ path: '/scan', component: ScanPage }` sans `meta.requiresAuth`
    - Ajouter `{ path: '/scan/:isbn', component: BookLookup }` sans `meta.requiresAuth`
    - Importer `ScanPage` et `BookLookup` dans le fichier routeur
    - Vérifier que la route `/scanner` existante reste inchangée
    - _Requirements: 1.1, 1.4_

- [x] 9. Créer `BookLookup.vue` — structure et chargement bibliographique
  - [x] 9.1 Implémenter la structure de `BookLookup.vue` avec le chargement des données bibliographiques
    - Créer `src/views/BookLookup.vue` (ou selon convention du projet)
    - Récupérer `this.isbn = this.$route.params.isbn` dans `created()`
    - Appeler le ServiceBibliographique (Open Library → Google Books, même logique que `fetchBookInformations` mais sans écriture)
    - Gérer `bioLoading: true` pendant le chargement, `bioError` si erreur réseau ou réponse vide
    - Afficher un indicateur de chargement pendant `bioLoading`
    - Afficher le message « œuvre non trouvée » tout en conservant l'ISBN si réponse vide
    - Afficher : titre, auteur, couverture, année, éditeur, série, volume, statut série
    - Proposer un bouton retour vers `/scan`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 9.2 Écrire le test property-based P3 — Rendu complet des champs bibliographiques
    - **Propriété 3 : Rendu complet des champs bibliographiques**
    - **Valide : Requirements 2.1**
    - Utiliser `fc.record({ title: fc.string(), author: fc.string(), imageURL: fc.string(), ... })`
    - Vérifier qu'aucun champ non-null du `BookInfo` n'est absent du rendu HTML du composant

  - [ ]* 9.3 Écrire le test property-based P4 — ISBN conservé sur réponse vide
    - **Propriété 4 : ISBN conservé sur réponse vide**
    - **Valide : Requirements 2.3**
    - Utiliser `fc.string().filter(isValidIsbn)` avec mock ServiceBibliographique retournant null/vide
    - Vérifier que le composant affiche un message d'erreur ET que l'ISBN reste visible

- [x] 10. Implémenter la section avis dans `BookLookup.vue`
  - [x] 10.1 Ajouter l'appel à la Cloud Function `getBookReviews` et l'affichage des avis
    - Appeler `getBookReviews(isbn)` en parallèle et indépendamment du chargement bibliographique
    - Gérer `reviewsLoading: true` pendant le chargement, `reviewsError` si timeout ou erreur réseau
    - Afficher un indicateur de chargement dans la section avis indépendamment de `bioLoading`
    - Afficher chaque avis avec : source identifiable, note (si non null), extrait (si non null), lien `target="_blank"`
    - Afficher un message « aucun avis trouvé » si le tableau retourné est vide
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 10.2 Écrire le test property-based P5 — Rendu complet des avis
    - **Propriété 5 : Rendu complet des avis avec tous les champs requis**
    - **Valide : Requirements 3.1, 3.4, 3.5**
    - Utiliser `fc.array(fc.record({ source: fc.constantFrom('senscritique', 'babelio'), rating: fc.option(fc.float()), excerpt: fc.option(fc.string()), url: fc.string() }))`
    - Vérifier que pour chaque avis non vide, source, note, extrait, et lien cliquable avec `target="_blank"` sont présents

  - [ ]* 10.3 Écrire le test property-based P6 — Absence d'avis → message affiché
    - **Propriété 6 : Absence d'avis — message affiché**
    - **Valide : Requirements 3.3**
    - Utiliser `fc.string().filter(isValidIsbn)` avec mock `getBookReviews` retournant `[]`
    - Vérifier qu'un message « aucun avis » est présent dans le rendu

- [x] 11. Implémenter la non-persistance et l'isolation dans `BookLookup.vue`
  - [x] 11.1 Implémenter le nettoyage au `beforeDestroy` et la vérification d'absence d'écriture Firebase
    - Réinitialiser `bookInfo` et `reviews` dans `beforeDestroy()`
    - Ne pas dispatcher d'action Vuex ni écrire en RTDB pendant le cycle de vie du composant
    - Ne conserver aucune clé spécifique à la FicheScan dans le store Vuex
    - _Requirements: 4.1, 4.2_

  - [ ]* 11.2 Écrire le test property-based P7 — Non-écriture Firebase pendant la consultation
    - **Propriété 7 : Non-écriture Firebase pendant la consultation**
    - **Valide : Requirements 4.1**
    - Utiliser `fc.string().filter(isValidIsbn)` avec mock Firebase espionné sur `set`, `update`, `remove`
    - Vérifier qu'aucun de ces appels n'est effectué pendant le cycle de vie complet du composant

  - [ ]* 11.3 Écrire le test property-based P8 — Pas de données résiduelles dans le store Vuex
    - **Propriété 8 : Absence de données résiduelles dans le store après fermeture**
    - **Valide : Requirements 4.2**
    - Utiliser `fc.record(BookInfo)` pour générer des données de BookInfo variées
    - Monter le composant, charger des données, détruire le composant
    - Vérifier que le store Vuex ne contient aucun état ajouté par la FicheScan

- [x] 12. Implémenter les indicateurs de collection et l'action d'ajout dans `BookLookup.vue`
  - [x] 12.1 Implémenter les computed `isAuthenticated` et `userBooks`, les indicateurs de collection et le bouton d'ajout
    - Ajouter `isAuthenticated` → `this.$store.getters.isAuthenticated` et `userBooks` → `this.$store.state.books`
    - Afficher « Déjà dans votre collection » si l'ISBN est déjà dans `userBooks`
    - Afficher le bouton « Ajouter à ma collection » uniquement si authentifié ET ISBN absent de la collection
    - Masquer le bouton et afficher un lien de connexion si l'utilisateur n'est pas authentifié
    - Au clic du bouton : `store.dispatch('saveNewBook', isbn)`, puis afficher `addSuccess: true`
    - _Requirements: 4.3, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 12.2 Écrire le test property-based P9 — Indicateur "Déjà en collection"
    - **Propriété 9 : Indicateur "Déjà dans votre collection" pour les ISBNs présents**
    - **Valide : Requirements 4.3, 5.3**
    - Utiliser `fc.array(fc.string().filter(isValidIsbn))` pour la liste de la collection, inclure l'ISBN courant
    - Vérifier que l'indicateur est présent et le bouton "Ajouter" désactivé/absent

  - [ ]* 12.3 Écrire le test property-based P10 — Bouton "Ajouter" absent si non authentifié
    - **Propriété 10 : Bouton "Ajouter" absent pour les utilisateurs non authentifiés**
    - **Valide : Requirements 5.4**
    - Utiliser `fc.string().filter(isValidIsbn)` avec `store.state.user === null`
    - Vérifier que le bouton "Ajouter à ma collection" n'apparaît jamais dans le rendu

  - [ ]* 12.4 Écrire le test property-based P11 — saveNewBook appelé avec le bon ISBN
    - **Propriété 11 : saveNewBook appelé avec le bon ISBN**
    - **Valide : Requirements 5.2**
    - Utiliser `fc.string().filter(isValidIsbn)` avec utilisateur authentifié et ISBN absent de la collection
    - Espionner `store.dispatch`, simuler le clic sur le bouton
    - Vérifier qu'exactement un appel `dispatch('saveNewBook', isbn)` est effectué avec l'ISBN exact

- [x] 13. Checkpoint final — Intégration complète
  - S'assurer que tous les tests passent et que les routes `/scan` et `/scan/:isbn` fonctionnent correctement. Demander à l'utilisateur si des questions se posent.

---

## Notes

- Les tâches postfixées `*` sont optionnelles et peuvent être ignorées pour un MVP plus rapide
- Chaque tâche référence les exigences précises pour la traçabilité
- Les tests property-based utilisent la librairie [fast-check](https://fast-check.dev/) avec un minimum de 100 itérations par propriété
- Les tests unitaires complémentaires (indicateurs de chargement indépendants, états de série, bouton retour) sont à écrire aux côtés des tâches d'implémentation concernées
- La fonction `stabilizeBarcode` doit être extraite comme fonction pure pour faciliter les tests P1
- Le nœud RTDB `/reviewsCache` doit avoir les règles `.read: false, .write: false` pour les clients (à vérifier dans `database.rules.json`)

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["3.1", "4.1"] },
    { "id": 3, "tasks": ["3.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "7.1", "8.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "10.1"] },
    { "id": 7, "tasks": ["10.2", "10.3", "11.1"] },
    { "id": 8, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 9, "tasks": ["12.2", "12.3", "12.4"] }
  ]
}
```
