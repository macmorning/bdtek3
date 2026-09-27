# Requirements Document

## Introduction

Cette fonctionnalité permet à un utilisateur de l'application bdtek de scanner le code barre d'une BD ou d'un livre en magasin afin d'obtenir immédiatement une fiche de consultation synthétique, **sans ajouter l'œuvre à sa collection**.

La fiche regroupe les informations bibliographiques de base (titre, auteur, couverture, année de publication), l'état de la série (terminée ou en cours), et des avis issus de sites de référence (Sens Critique, Babelio).

L'action est entièrement non-destructive : aucune donnée n'est persistée en base à l'issue d'une simple consultation.

---

## Glossary

- **Application** : l'application web progressive bdtek3 (Vue 2 + Firebase).
- **Utilisateur** : toute personne authentifiée sur l'Application.
- **Scanner** : le composant de lecture de code barre basé sur ZXing (`Scanner.vue`).
- **ISBN** : le code numérique EAN-13 (ou UPC/EAN-8) identifiant un livre ou une BD, lu par le Scanner.
- **FicheScan** : la vue de consultation synthétique générée à partir d'un ISBN scanné.
- **ServiceBibliographique** : l'ensemble des sources d'information bibliographique interrogées (Open Library, Google Books).
- **ServiceAvis** : l'ensemble des sources d'avis et critiques interrogées (Sens Critique, Babelio).
- **Cloud Function** : la fonction serverless Firebase exécutée côté serveur pour les appels aux APIs externes.
- **Collection** : la bibliothèque personnelle de l'Utilisateur stockée dans Firebase Realtime Database.

---

## Requirements

### Requirement 1: Déclenchement du mode consultation depuis le scan

**User Story:** En tant qu'Utilisateur en magasin, je veux scanner le code barre d'une BD et accéder à une fiche de consultation, afin de me renseigner sur l'œuvre sans modifier ma Collection.

#### Acceptance Criteria

1. WHEN l'Utilisateur ouvre l'Application dans un contexte de consultation (route `/scan`), THE Application SHALL afficher le Scanner sans déclencher d'ajout à la Collection.
2. WHEN le Scanner lit un code barre valide (EAN-13, EAN-8, UPC-A) de façon stable (au moins 3 lectures consécutives identiques), THE Application SHALL naviguer automatiquement vers la FicheScan correspondant à l'ISBN détecté.
3. IF le Scanner ne parvient pas à accéder à la caméra de l'appareil, THEN THE Application SHALL afficher un message d'erreur explicite indiquant que la caméra est inaccessible.
4. THE Application SHALL permettre à l'Utilisateur non authentifié d'accéder au mode scan et à la FicheScan (lecture publique, sans écriture en base).

---

### Requirement 2: Génération et affichage de la FicheScan

**User Story:** En tant qu'Utilisateur, je veux voir une fiche synthétique de l'œuvre scannée, afin de disposer rapidement des informations essentielles pour prendre ma décision d'achat.

#### Acceptance Criteria

1. WHEN la FicheScan est demandée pour un ISBN donné, THE Application SHALL interroger le ServiceBibliographique et afficher les données suivantes dès qu'elles sont disponibles : titre, auteur(s), image de couverture, année de publication, éditeur, nom de la série (si applicable), numéro de volume (si applicable).
2. WHILE les données du ServiceBibliographique sont en cours de chargement, THE Application SHALL afficher un indicateur de chargement visible à la place des zones de données non encore reçues.
3. IF le ServiceBibliographique ne retourne aucune donnée pour l'ISBN fourni, THEN THE Application SHALL afficher un message indiquant que l'œuvre n'a pas été trouvée, tout en conservant l'ISBN affiché.
4. THE Application SHALL afficher le statut de la série (terminée / en cours / inconnu) dans la FicheScan lorsque cette information est disponible depuis le ServiceBibliographique.
5. WHEN la FicheScan est affichée, THE Application SHALL proposer un bouton permettant de revenir au Scanner sans modifier la Collection.

---

### Requirement 3: Affichage des avis de référence

**User Story:** En tant qu'Utilisateur, je veux voir les avis issus de sites spécialisés (Sens Critique, Babelio), afin de bénéficier d'un retour qualitatif sur l'œuvre avant d'acheter.

#### Acceptance Criteria

1. WHEN la FicheScan est affichée, THE Application SHALL interroger le ServiceAvis et présenter les avis disponibles (note, extrait de critique, source, lien vers la page source) pour au moins l'un des sites suivants : Sens Critique, Babelio.
2. WHILE les données du ServiceAvis sont en cours de chargement, THE Application SHALL afficher un indicateur de chargement dans la section avis, indépendamment du chargement des données bibliographiques.
3. IF aucun avis n'est disponible depuis les sources interrogées pour l'ISBN fourni, THEN THE Application SHALL afficher un message indiquant qu'aucun avis n'a été trouvé.
4. THE Application SHALL afficher chaque avis avec sa source identifiable (nom du site, logo ou libellé) afin que l'Utilisateur puisse distinguer l'origine de chaque critique.
5. WHERE le ServiceAvis retourne un lien vers la fiche de l'œuvre sur le site source, THE Application SHALL rendre ce lien cliquable et l'ouvrir dans un nouvel onglet.

---

### Requirement 4: Non-persistance et isolation de la consultation

**User Story:** En tant qu'Utilisateur, je veux que la consultation d'une fiche via scan n'affecte pas ma Collection ni mes données, afin de pouvoir me renseigner librement sans effet de bord.

#### Acceptance Criteria

1. THE Application SHALL ne procéder à aucune écriture dans la Collection de l'Utilisateur lors de l'affichage de la FicheScan.
2. THE Application SHALL ne conserver aucune donnée issue de la FicheScan dans le store Vuex après fermeture ou navigation hors de la FicheScan.
3. IF l'Utilisateur est authentifié et consulte une FicheScan pour un ISBN déjà présent dans sa Collection, THEN THE Application SHALL en informer l'Utilisateur par un indicateur visible dans la FicheScan (ex. : « Déjà dans votre collection »).
4. WHEN l'Utilisateur quitte la FicheScan, THE Application SHALL libérer toutes les ressources de la caméra précédemment utilisées par le Scanner.

---

### Requirement 5: Action d'ajout optionnel à la Collection depuis la FicheScan

**User Story:** En tant qu'Utilisateur authentifié, je veux pouvoir ajouter l'œuvre à ma Collection depuis la FicheScan si elle m'intéresse, afin de ne pas avoir à rescanner plus tard.

#### Acceptance Criteria

1. WHEN l'Utilisateur est authentifié et la FicheScan est affichée pour un ISBN absent de sa Collection, THE Application SHALL proposer un bouton « Ajouter à ma collection ».
2. WHEN l'Utilisateur clique sur « Ajouter à ma collection », THE Application SHALL enregistrer l'ISBN dans la Collection de l'Utilisateur selon le processus standard d'ajout (identique à `saveNewBook`), puis afficher une confirmation.
3. IF l'ISBN est déjà présent dans la Collection de l'Utilisateur, THEN THE Application SHALL désactiver le bouton « Ajouter à ma collection » et afficher l'indicateur « Déjà dans votre collection » (cf. Requirement 4.3).
4. WHERE l'Utilisateur n'est pas authentifié, THE Application SHALL masquer le bouton « Ajouter à ma collection » et afficher un lien vers la page de connexion.

---

### Requirement 6: Appel au ServiceAvis via Cloud Function

**User Story:** En tant que développeur, je veux que les appels aux sites d'avis (Sens Critique, Babelio) soient réalisés depuis une Cloud Function, afin d'éviter les problèmes de CORS et de protéger les éventuelles clés d'API.

#### Acceptance Criteria

1. THE Cloud Function SHALL exposer un endpoint appelable depuis l'Application pour récupérer les avis correspondant à un ISBN fourni en paramètre.
2. WHEN la Cloud Function reçoit un ISBN valide, THE Cloud Function SHALL interroger successivement les sources disponibles (Sens Critique, Babelio) et retourner un tableau d'avis structurés contenant : source, note (si disponible), extrait de critique (si disponible), URL de la fiche source.
3. IF une source du ServiceAvis est inaccessible ou retourne une erreur HTTP, THEN THE Cloud Function SHALL ignorer cette source, consigner l'erreur dans les logs, et retourner les avis des autres sources disponibles.
4. WHEN la Cloud Function reçoit un ISBN dont le format est invalide (non numérique, longueur différente de 8, 10 ou 13 chiffres), THEN THE Cloud Function SHALL retourner une erreur 400 avec un message descriptif sans effectuer de requête vers les sources.
