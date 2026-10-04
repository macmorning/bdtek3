# Implementation Plan: migration-vue3

## Overview

Ce plan migre bdtek3 de Vue 2.7 vers Vue 3 en stratégie in-place, sur une branche dédiée `migration/vue3`, à iso-fonctionnalité. ZXing est conservé. L'ordre va du plus sûr (filet de tests, cœur Vue) au plus risqué (Vuetify 3 : data-table et date-picker).

Convention : les sous-tâches marquées `*` sont des tests (optionnelles mais recommandées).

---

## Tasks

- [ ] 0. Préparation et filet de sécurité
  - [ ] 0.1 Créer la branche `migration/vue3` et commiter le lockfile actuel comme point de retour
    - Vérifier que `npm run build` et `npm run lint` passent sur l'état courant (référence connue)
    - _Requirements: 7.4_
  - [ ] 0.2 Extraire `stabilizeBarcode` de `ScanDialog.vue` vers `src/utils/barcode.js`
    - Déplacer la fonction pure et l'exporter ; importer depuis `ScanDialog.vue`
    - Aucun changement de comportement
    - _Requirements: 7.2_
  - [ ]* 0.3 Mettre en place le runner de test (Vitest) et écrire les tests de non-régression
    - Tests pour `normalizeDate` et `todayISO` (`src/utils/date.js`) : formats `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, `jj/mm/aaaa`, libellés texte, valeurs vides/null
    - Tests pour `stabilizeBarcode` : incrément, reset sur code différent, franchissement du seuil
    - _Requirements: 7.1, 7.3_
  - [x] 0.4 Vérifier l'état de `store.js` vis-à-vis de `Vue` — RAS en phase 0
    - Constat : `Vue` est bien importé (ligne 1) ; pas de bug latent. Le retrait de cet import et le passage à `createStore` sont traités en tâche 2.4.
    - _Requirements: 2.4_

- [ ] 1. Mise à jour des dépendances et de l'outillage
  - [ ] 1.1 Monter le cœur et Vuetify vers les versions Vue 3
    - `vue@^3`, `vue-router@^4`, `vuex@^4`, `vuetify@^3`
    - Remplacer `vuetify-loader` par `webpack-plugin-vuetify`
    - Remplacer `vue-template-compiler` par `@vue/compiler-sfc`
    - _Requirements: 2.1, 3.1_
  - [ ] 1.2 Mettre à jour ESLint pour Vue 3
    - `eslint-plugin-vue@^9`, config `plugin:vue/vue3-essential`
    - _Requirements: 4.4_
  - [ ] 1.3 Rester sur Vue CLI 5 / webpack (ne pas basculer Vite dans cette migration)
    - Décision documentée ; bascule Vite reportée en étape ultérieure séparée
    - _Requirements: 6.3_

- [ ] 2. Bootstrap de l'application (cœur Vue)
  - [ ] 2.1 Migrer `main.js` vers `createApp`
    - `createApp(App).use(router).use(store).use(vuetify).mount('#app')`
    - Conserver le retard de montage via `onAuthStateChanged`
    - _Requirements: 2.1, 6.1, 6.2_
  - [ ] 2.2 Migrer `src/plugins/vuetify.js` vers `createVuetify`
    - Supprimer `Vue.use(Vuetify)` et `new Vuetify(opts)`
    - _Requirements: 3.1_
  - [ ] 2.3 Migrer `router.js` vers Vue Router 4
    - `createRouter` + `createWebHistory` ; conserver `beforeEach` (requiresAuth)
    - Remplacer la route wildcard `'*'` par `'/:pathMatch(.*)*'`
    - _Requirements: 2.2, 2.5_
  - [ ] 2.4 Migrer `store.js` vers Vuex 4
    - `createStore({ ... })` ; retirer `Vue.use(Vuex)` et la propriété `data()` parasite
    - _Requirements: 2.3, 2.4_
  - [ ] 2.5 Vérifier le démarrage de l'app (page blanche / erreurs console) avant d'aller plus loin
    - _Requirements: 1.1_

- [ ] 3. Adaptations transverses des composants (conventions Vue 3)
  - [ ] 3.1 Renommer `beforeDestroy` → `beforeUnmount` dans `Scanner.vue`, `ScanDialog.vue`, `BookLookup.vue`
    - Retirer les commentaires `eslint-disable vue/no-deprecated-destroyed-lifecycle` devenus inutiles
    - _Requirements: 4.1_
  - [ ] 3.2 Migrer le `v-model` custom de `ScanDialog.vue` (`value`/`input` → `modelValue`/`update:modelValue`)
    - Mettre à jour `emits` et les `$emit`
    - _Requirements: 4.2, 4.3_
  - [ ] 3.3 Migrer le `v-model` custom de `BookLookup.vue` (`value`/`input` → `modelValue`/`update:modelValue`)
    - _Requirements: 4.2, 4.3_
  - [ ] 3.4 Vérifier que `Home.vue` consomme toujours ces modales via `v-model` sans changement de template
    - _Requirements: 4.3_

- [ ] 4. Portage Vuetify 3 — composants simples (du moins risqué au plus risqué)
  - [ ] 4.1 Porter les formulaires simples : `Signin`, `Signup`, `PasswordForget`, `Options`, `Share`, `Users`, `Notfound`, `MultiBookEditor`
    - Valider props/slots renommés ; vérifier visuellement
    - _Requirements: 3.5_
  - [ ] 4.2 Porter `App.vue` (layout, `v-snackbar`, `v-dialog`, slot `#activator` du menu)
    - Convertir `#activator="{ on }"` → `{ props }` + `v-bind="props"`
    - Vérifier les watchers `error`/`success` (snackbars)
    - _Requirements: 3.4, 3.5_
  - [ ] 4.3 Porter `ScanDialog.vue` + `Scanner.vue` (markup/CSS + overlay) et valider caméra + arrêt des pistes
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 4.4 Porter `BookLookup.vue` et `BookDetails.vue` (`v-dialog`, `v-img` + `@error`, `v-card`, `v-chip`)
    - _Requirements: 3.5_

- [ ] 5. Portage Vuetify 3 — composants à risque
  - [ ] 5.1 Porter `BookEditor.vue` : `v-menu` + `#activator` + champs de date
    - Appliquer l'option A : remplacer `v-date-picker` par `v-text-field` éditable validé `YYYY-MM-DD`
    - Réutiliser les computed `publishedDate` / `addedDate` (getter/setter via `normalizeDate`)
    - _Requirements: 3.3, 3.4_
  - [ ]* 5.2 Vérifier via les tests de date que la normalisation reste identique après portage de l'éditeur
    - _Requirements: 1.2, 7.3_
  - [ ] 5.3 Porter `Home.vue` : `v-data-table` (headers, slots d'items, sélection, tri, pagination, expansion)
    - Revalider `v-model="selectedBooks"`, `#item.actions`, le slot d'expansion et le tri
    - _Requirements: 3.2_

- [ ] 6. Nettoyage et vérification finale
  - [ ] 6.1 Retirer les paquets morts restants et régénérer le lockfile
    - _Requirements: 2.1_
  - [ ] 6.2 Lint complet (config Vue 3) : 0 erreur
    - _Requirements: 4.4_
  - [ ] 6.3 Build de production sans erreur
    - _Requirements: 7.4_
  - [ ]* 6.4 Rejouer les tests de non-régression (phase 0) : résultats identiques
    - _Requirements: 7.3_
  - [ ] 6.5 Tests manuels de bout en bout
    - Connexion ; liste (tri/sélection) ; édition d'un livre (dates) ; loupe (recherche Internet) ; image cassée (fallback) ; scan → fiche → ajout ; image de fond figée
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3_
  - [ ] 6.6 Vérifier le déploiement (Firebase Hosting) et la PWA (service worker)
    - _Requirements: 6.1_

- [ ] 7. (Optionnel, étape séparée) Bascule vers Vite
  - [ ] 7.1 Convertir `vue.config.js` → `vite.config.js`, remplacer `webpack-plugin-vuetify` par `vite-plugin-vuetify`
    - _Requirements: 6.3_
  - [ ] 7.2 Renommer les variables d'env `VUE_APP_*` → `VITE_*` et adapter `process.env` → `import.meta.env` dans `initFirebase.js`
    - _Requirements: 6.3_
  - [ ] 7.3 Remplacer le plugin PWA Vue CLI par `vite-plugin-pwa`
    - _Requirements: 6.1_
