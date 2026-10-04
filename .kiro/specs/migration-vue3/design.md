# Design Document: Migration vers Vue 3

## Overview

La migration suit une **stratégie in-place** (dépôt existant, branche dédiée `migration/vue3`, un commit par phase) plutôt qu'une reconstruction. Ce choix minimise le risque de régression sur les parties déjà stabilisées et conserve l'historique git.

Le périmètre couvre trois chantiers d'ampleur très inégale :

1. **Cœur Vue** (Vue 3 + Router 4 + Vuex 4) — mécanique, faible risque.
2. **Vuetify 2 → 3** — le vrai chantier, concentré sur `v-data-table` (Home) et `v-date-picker` (BookEditor).
3. **Firebase / ZXing** — quasi inchangés (agnostiques du framework).

## Architecture

### État cible des dépendances

| Paquet | Avant | Après |
|---|---|---|
| vue | ^2.7.16 | ^3.x |
| vue-router | ^3.6.5 | ^4.x |
| vuex | ^3.6.2 | ^4.x |
| vuetify | ^2.7.2 | ^3.x |
| vuetify-loader | ^1.9.2 | webpack-plugin-vuetify (ou vite-plugin-vuetify) |
| vue-template-compiler | ^2.7.16 | @vue/compiler-sfc |
| eslint-plugin-vue | ^8.7.1 | ^9.x (règles vue3) |
| @zxing/library | ^0.19.0 | inchangé |
| firebase | ^9.23.0 | inchangé |

### Décision Build : Vue CLI d'abord, Vite ensuite (optionnel)

Pour ne pas cumuler deux migrations simultanées, on **reste sur Vue CLI 5 / webpack** pendant la migration Vue 3. La bascule vers Vite est traitée comme une étape ultérieure et séparée, hors du chemin critique. Cela découple le risque « nouvelle version de framework » du risque « nouvel outil de build ».

### Décision date-picker : option A privilégiée

Le `v-date-picker` de Vuetify 3 travaille avec des objets `Date` et un système d'adaptateurs, alors que la logique actuelle repose sur des chaînes `YYYY-MM-DD` (fruit de la normalisation récente). Deux options :

- **Option A (privilégiée)** : remplacer le `v-date-picker` par un `v-text-field` éditable avec validation du format `YYYY-MM-DD`. Les computed `publishedDate` / `addedDate` existants (getter/setter normalisés via `normalizeDate`) sont réutilisés tels quels. Zéro adaptateur, cohérence totale avec le stockage.
- **Option B (repli)** : intégrer le `v-date-picker` Vuetify 3 + adaptateur de dates, avec conversion `Date` ↔ `YYYY-MM-DD` dans les getters/setters.

Le design retient l'option A pour sa simplicité et son alignement avec la normalisation déjà en place. L'option B reste documentée en repli si l'ergonomie du calendrier est jugée indispensable.

## Components and Interfaces

### main.js
- Remplacer `new Vue({ render: h => h(App), vuetify, router, store }).$mount('#app')` par :
  `createApp(App).use(router).use(store).use(vuetify).mount('#app')`.
- Conserver le wrapping dans `onAuthStateChanged` qui retarde le montage jusqu'à connaître l'état d'auth (Req 6.2).

### src/plugins/vuetify.js
- Remplacer `Vue.use(Vuetify)` + `new Vuetify(opts)` par `createVuetify({ components, directives, ... })`.
- Déclarer composants/directives selon le mode de tree-shaking du plugin build.

### src/router.js
- `createRouter({ history: createWebHistory(), routes })`.
- `beforeEach` conservé à l'identique (Req 2.5).
- Les imports dynamiques `() => import(...)` restent valables.
- Note : la route wildcard `'*'` doit devenir `'/:pathMatch(.*)*'` (changement d'API de matching Vue Router 4).

### src/store.js
- `createStore({ ... })` ; suppression de `Vue.use(Vuex)` et de la propriété `data()` parasite.
- Retrait de l'import `import Vue from 'vue'` devenu inutile (Req 2.4). NB : contrairement à une première analyse, `Vue` est bien importé aujourd'hui — il n'y a pas de bug latent, juste un import qui deviendra superflu avec `createStore`.

### Composants modaux (ScanDialog.vue, BookLookup.vue)
- Prop `value` → `modelValue` ; event `input` → `update:modelValue` (Req 4.2).
- `emits: ['update:modelValue', 'detected']`.
- Côté parent `Home.vue` : `v-model` inchangé dans le template (Req 4.3).

### Scanner.vue (ZXing conservé)
- `beforeDestroy` → `beforeUnmount` (Req 4.1).
- Logique ZXing + BarcodeDetector inchangée (agnostique du framework, Req 5).
- Optionnel : convertir les props-callbacks `onDetected`/`onError` en `emits`.

### App.vue / BookEditor.vue (slots activator)
- Convertir `#activator="{ on }"` + `v-on="on"` vers l'API Vuetify 3 (`v-slot:activator="{ props }"` + `v-bind="props"`) (Req 3.4).

### Home.vue (v-data-table)
- Composant le plus impacté. Revalider : définition des `headers` (clés renommées), slots d'items (`#item.actions`), sélection (`v-model="selectedBooks"`, `show-select`), tri, pagination, slot d'expansion.

## Data Models

Aucun changement de modèle de données. Les objets `book` (uid, title, author, published, dateAdded, series, volume, publisher, imageURL, detailsURL, needLookup, computedOrderField) restent identiques. La migration est purement technique côté présentation/framework.

## Error Handling

- La gestion d'erreur existante (snackbars via store `error`/`success`, fallback image cassée, erreurs caméra) est préservée telle quelle.
- Vérifier que les watchers de `error`/`alert` dans App.vue et Home.vue restent déclenchés de façon équivalente sous Vue 3 (réactivité basée sur Proxy, sémantique identique pour ces cas simples).

## Testing Strategy

### Phase 0 — Tests de non-régression (avant toute migration)
- Mettre en place un runner de test (Vitest recommandé, compatible Vue CLI/Vite ; Jest acceptable).
- Extraire `stabilizeBarcode` de `ScanDialog.vue` vers `src/utils/barcode.js` (Req 7.2).
- Écrire des tests unitaires pour `normalizeDate`, `todayISO`, `stabilizeBarcode` couvrant les cas déjà validés manuellement (formats de dates variés, seuil de stabilisation).
- Ces tests servent de référence : exécutés identiquement avant/après (Req 7.3).

### Vérification continue
- Lint (config Vue 3) à 0 erreur après chaque phase (Req 4.4).
- Build de production sans erreur après chaque phase majeure (Req 7.4).
- Tests manuels de bout en bout en fin de migration : connexion, liste (tri/sélection), édition (dates), loupe (recherche Internet), image cassée, scan → fiche → ajout, fond figé.

## Risks and Mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| v-data-table Vuetify 3 (API refondue) | Élevé | Isoler Home.vue, phase dédiée, tester tri/sélection/slots |
| v-date-picker Vuetify 3 | Élevé | Option A (text-field validé) alignée sur la normalisation |
| Slots #activator | Moyen | Conversion `{ on }` → `{ props }` + `v-bind` |
| Route wildcard `'*'` | Faible | `'/:pathMatch(.*)*'` |
| PWA / service worker | Moyen | Conserver le plugin CLI tant qu'on reste sur webpack |
| Import `Vue` superflu (store) après createStore | Faible | Retirer l'import lors de la tâche 2.4 |
