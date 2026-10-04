# Requirements Document

## Introduction

Cette spec décrit la migration de l'application bdtek3 depuis Vue 2.7 vers Vue 3, en incluant la mise à jour de tout l'écosystème dépendant (Vue Router, Vuex, Vuetify) et de l'outillage de build. L'objectif est une migration **à iso-fonctionnalité** : aucune régression visible pour l'utilisateur, et préservation stricte de la logique métier déjà stabilisée (normalisation des dates, stabilisation du scan, synchronisation des modales, image de fond figée).

La bibliothèque de scan ZXing (`@zxing/library`) est **conservée** afin de garder le scan fonctionnel sur les navigateurs ne supportant pas l'API native `BarcodeDetector` (iOS/Safari, Firefox, desktop sans décodeur système).

---

## Glossary

- **Application** : l'application web progressive bdtek3.
- **Cœur Vue** : le trio Vue + Vue Router + Vuex qui pilote l'application.
- **Vuetify** : la bibliothèque de composants UI (passage de la v2 à la v3).
- **Logique métier pure** : les fonctions indépendantes du framework (`normalizeDate`, `todayISO`, `stabilizeBarcode`).
- **Build** : la chaîne de compilation/bundling (Vue CLI 5 / webpack aujourd'hui).
- **Firebase** : le backend (Auth + Realtime Database) et les Cloud Functions, non concernés par le changement de version de Vue.
- **Composant modal** : un composant exposant une ouverture/fermeture via `v-model` (ScanDialog, BookLookup).

---

## Requirements

### Requirement 1: Préservation du comportement fonctionnel

**User Story:** En tant qu'utilisateur, je veux que l'application se comporte exactement comme avant la migration, afin de ne subir aucune régression.

#### Acceptance Criteria

1. WHEN l'Application est lancée après migration THEN l'Application SHALL afficher la bibliothèque, permettre la connexion, l'édition d'un livre, le scan, et l'ajout, de manière identique à la version Vue 2.
2. WHEN un livre est édité et enregistré THEN l'Application SHALL normaliser les dates au format `YYYY-MM-DD` avec le même comportement qu'avant migration.
3. WHEN un code barre est scanné THEN l'Application SHALL appliquer la même logique de stabilisation (3 lectures identiques) qu'avant migration.
4. WHEN l'image de fond aléatoire est activée THEN l'Application SHALL figer une image pour toute la session de page, comme avant migration.

### Requirement 2: Migration du cœur Vue

**User Story:** En tant que développeur, je veux que Vue, Vue Router et Vuex soient migrés vers leurs versions compatibles Vue 3, afin de disposer d'une base technique à jour.

#### Acceptance Criteria

1. WHEN l'Application démarre THEN le Cœur Vue SHALL être initialisé via `createApp` (et non `new Vue`).
2. WHEN le routeur est initialisé THEN il SHALL utiliser `createRouter` + `createWebHistory` (Vue Router 4).
3. WHEN le store est initialisé THEN il SHALL utiliser `createStore` (Vuex 4), sans référence à `Vue.use(Vuex)`.
4. WHEN le store est migré THEN l'import `import Vue from 'vue'` devenu inutile SHALL être retiré.
5. WHEN les gardes de navigation s'exécutent THEN la logique `requiresAuth` SHALL rester fonctionnellement identique.

### Requirement 3: Migration de Vuetify 2 vers Vuetify 3

**User Story:** En tant qu'utilisateur, je veux que l'interface Vuetify fonctionne sous Vuetify 3, afin de bénéficier de la version supportée.

#### Acceptance Criteria

1. WHEN Vuetify est initialisé THEN il SHALL l'être via `createVuetify` (et non `new Vuetify` / `Vue.use`).
2. WHEN une vue contenant un `v-data-table` est affichée THEN le tableau SHALL conserver colonnes, tri, sélection multiple et slots d'items équivalents.
3. WHEN l'éditeur de livre est ouvert THEN les champs de date SHALL rester éditables et produire des valeurs au format `YYYY-MM-DD`.
4. WHEN un composant utilise un slot `#activator` THEN l'activateur SHALL être correctement lié selon l'API Vuetify 3.
5. WHEN une modale (`v-dialog`) est ouverte ou fermée THEN son comportement SHALL rester identique.

### Requirement 4: Adaptation des composants aux conventions Vue 3

**User Story:** En tant que développeur, je veux que les composants respectent les conventions Vue 3, afin d'éviter les API dépréciées.

#### Acceptance Criteria

1. WHEN un composant déclare un cycle de vie de destruction THEN il SHALL utiliser `beforeUnmount` (et non `beforeDestroy`).
2. WHEN un Composant modal expose son état d'ouverture THEN il SHALL utiliser `modelValue` / `update:modelValue` (convention `v-model` Vue 3).
3. WHEN un Composant modal est utilisé par un parent via `v-model` THEN l'intégration côté parent SHALL rester inchangée dans le template.
4. WHEN le linter est exécuté THEN la configuration SHALL cibler les règles Vue 3 et ne SHALL remonter aucune erreur.

### Requirement 5: Préservation du scan multi-moteur (ZXing conservé)

**User Story:** En tant qu'utilisateur sur iOS, Firefox ou un desktop sans décodeur natif, je veux pouvoir continuer à scanner, afin de ne pas perdre une fonctionnalité clé.

#### Acceptance Criteria

1. WHEN `BarcodeDetector` natif est disponible THEN le Scanner SHALL l'utiliser en priorité.
2. WHEN `BarcodeDetector` natif est indisponible THEN le Scanner SHALL basculer sur le moteur ZXing.
3. WHEN la modale de scan est fermée ou démontée THEN le Scanner SHALL libérer toutes les pistes caméra, quel que soit le moteur utilisé.
4. WHEN `@zxing/library` est chargé sous Vue 3 THEN il SHALL fonctionner sans adaptation spécifique au framework.

### Requirement 6: Préservation de l'intégration Firebase

**User Story:** En tant qu'utilisateur, je veux que l'authentification et les données continuent de fonctionner, afin de conserver ma collection.

#### Acceptance Criteria

1. WHEN l'Application démarre THEN l'initialisation Firebase SHALL rester fonctionnellement identique.
2. WHEN l'état d'authentification est connu THEN le montage de l'Application SHALL continuer d'être retardé jusqu'à cet état (comportement actuel de `main.js`).
3. IF le Build bascule vers Vite THEN les variables d'environnement `VUE_APP_*` SHALL être renommées en `VITE_*` et lues via `import.meta.env`.
4. WHEN les Cloud Functions sont déployées THEN elles SHALL rester inchangées (hors périmètre de la migration front).

### Requirement 7: Non-régression vérifiable

**User Story:** En tant que développeur, je veux des garde-fous automatiques sur la logique métier pure, afin de détecter toute régression pendant la migration.

#### Acceptance Criteria

1. WHEN la phase préparatoire est terminée THEN la Logique métier pure (`normalizeDate`, `todayISO`, `stabilizeBarcode`) SHALL être couverte par des tests unitaires.
2. WHEN `stabilizeBarcode` est testée THEN elle SHALL être extraite dans un module importable indépendant du composant.
3. WHEN les tests sont exécutés avant et après migration THEN ils SHALL produire des résultats identiques.
4. WHEN le build de production est lancé après chaque phase majeure THEN il SHALL se terminer sans erreur.
