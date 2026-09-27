<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">

        <!-- Section bibliographique -->
        <v-card>
          <v-card-title class="blue-grey lighten-1 white--text">
            <v-btn icon dark title="retour à la bibliothèque" class="mr-2" @click="$router.push('/')">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            Fiche livre
          </v-card-title>

          <!-- Indicateur de chargement -->
          <v-card-text v-if="bioLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="blue-grey" size="48"></v-progress-circular>
            <div class="mt-3 grey--text">Chargement des informations bibliographiques…</div>
          </v-card-text>

          <!-- Erreur bibliographique -->
          <v-card-text v-else-if="bioError">
            <v-alert type="warning" outlined>
              Œuvre non trouvée
            </v-alert>
            <div class="mt-2 grey--text text--darken-1">
              <span class="font-weight-medium">ISBN :</span> {{ isbn }}
            </div>
            <div class="caption grey--text mt-1">{{ bioError }}</div>
          </v-card-text>

          <!-- Données bibliographiques -->
          <v-card-text v-else-if="bookInfo">
            <!-- Badge discret "deja dans la collection" -->
            <div v-if="alreadyInCollectionComputed" class="mb-2">
              <v-chip x-small color="info" outlined>
                <v-icon left x-small>mdi-check-circle</v-icon>
                Déjà dans votre collection
              </v-chip>
            </div>

            <v-row>
              <!-- Couverture -->
              <v-col v-if="bookInfo.imageURL" cols="4" sm="3" class="d-flex align-start">
                <v-img
                  :src="bookInfo.imageURL"
                  max-height="200"
                  contain
                  class="grey lighten-3 rounded"
                >
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-col>

              <!-- Détails -->
              <v-col :cols="bookInfo.imageURL ? 8 : 12" :sm="bookInfo.imageURL ? 9 : 12">
                <div class="title mb-1">{{ bookInfo.title }}</div>

                <div v-if="bookInfo.author" class="body-2 mb-1">
                  <span class="blue-grey--text text--lighten-2">Auteur(s) : </span>{{ bookInfo.author }}
                </div>
                <div v-if="bookInfo.published" class="body-2 mb-1">
                  <span class="blue-grey--text text--lighten-2">Année : </span>{{ bookInfo.published }}
                </div>
                <div v-if="bookInfo.publisher" class="body-2 mb-1">
                  <span class="blue-grey--text text--lighten-2">Éditeur : </span>{{ bookInfo.publisher }}
                </div>
                <div v-if="bookInfo.series" class="body-2 mb-1">
                  <span class="blue-grey--text text--lighten-2">Série : </span>{{ bookInfo.series }}
                </div>
                <div v-if="bookInfo.volume" class="body-2 mb-1">
                  <span class="blue-grey--text text--lighten-2">Volume : </span>{{ bookInfo.volume }}
                </div>
                <div class="caption grey--text mt-2">
                  <span class="blue-grey--text text--lighten-2">ISBN : </span>{{ isbn }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Section collection : bouton d'ajout -->
        <v-card
          v-if="(bookInfo || bioError) && isAuthenticated && !alreadyInCollectionComputed"
          class="mt-3"
        >
          <v-card-text>
            <v-btn color="blue-grey" dark @click="openAddDialog">
              <v-icon left>mdi-plus</v-icon>
              Ajouter à ma collection
            </v-btn>
            <v-alert v-if="addSuccess" type="success" outlined dense class="mt-2 mb-0">
              Livre ajouté à votre collection !
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Modale d'ajout : editeur pre-rempli -->
        <v-dialog v-model="addDialog" width="800px" scrollable>
          <v-card>
            <v-banner
              style="top:0px"
              sticky
              single-line
              class="blue-grey lighten-1 white--text"
            >
              <v-btn class="white--text" text title="fermer" @click="addDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              Ajouter à ma collection
              <template #actions>
                <v-btn class="white--text" text title="enregistrer" @click="confirmAdd">
                  <v-icon>mdi-floppy</v-icon>
                </v-btn>
              </template>
            </v-banner>
            <v-card-text>
              <v-container>
                <book-editor />
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Section liens externes vers les sites de critiques -->
        <v-card v-if="bookInfo || bioError" class="mt-3">
          <v-card-title class="blue-grey lighten-2 white--text subtitle-1">
            <v-icon left class="white--text">mdi-star-outline</v-icon>
            Rechercher des avis
          </v-card-title>
          <v-card-text>
            <div class="mb-2 caption grey--text">
              Consultez les avis sur les sites de référence :
            </div>
            <v-btn
              v-for="site in reviewSites"
              :key="site.name"
              small
              outlined
              color="blue-grey"
              class="mr-2 mb-2"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-icon left small>mdi-open-in-new</v-icon>
              {{ site.name }}
            </v-btn>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from '@/initFirebase'
import { onAuthStateChanged } from 'firebase/auth'
import BookEditor from '@/components/BookEditor'

export default {
  name: 'BookLookup',

  components: {
    BookEditor
  },

  data () {
    return {
      isbn: '',
      // Données bibliographiques
      bookInfo: null,
      bioLoading: true,
      bioError: null,
      // État collection
      addSuccess: false,
      addDialog: false
    }
  },

  computed: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    userBooks () {
      return this.$store.state.books
    },
    alreadyInCollectionComputed () {
      return this.userBooks && this.userBooks.some(b => b.uid === this.isbn)
    },
    /**
     * Liens de recherche directs vers les sites de critiques.
     * Utilise le titre + auteur si disponibles (meilleure pertinence),
     * sinon l'ISBN en repli.
     */
    reviewSites () {
      const query = this.searchQuery
      const q = encodeURIComponent(query)
      return [
        {
          name: 'SensCritique',
          url: `https://www.senscritique.com/search?query=${q}`
        },
        {
          name: 'CritiquesLibres',
          url: `https://www.critiqueslibres.com/i.php/search2?search=${q}`
        },
        {
          name: 'Manga-Sanctuary',
          url: `https://www.manga-sanctuary.com/recherche.php?keywords=${q}`
        }
      ]
    },
    searchQuery () {
      if (this.bookInfo && this.bookInfo.title) {
        const parts = [this.bookInfo.title]
        if (this.bookInfo.author) parts.push(this.bookInfo.author)
        return parts.join(' ')
      }
      return this.isbn
    }
  },

  created () {
    this.isbn = this.$route.params.isbn || ''
    this.loadBioData()
  },

  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  beforeDestroy () {
    if (this._bioController) {
      this._bioController.abort()
    }
    // Reset local state — no residual data
    this.bookInfo = null
    this.bioError = null
    this.bioLoading = false
    this.addSuccess = false
  },

  methods: {
    /**
     * Recupere le jeton d'identite Firebase de l'utilisateur courant.
     * Attend la resolution de l'etat d'auth si currentUser n'est pas encore pret.
     * @returns {Promise<string|null>}
     */
    getIdToken () {
      return new Promise((resolve) => {
        const user = firebase.auth.currentUser
        if (user) {
          user.getIdToken().then(resolve).catch(() => resolve(null))
          return
        }
        const unsubscribe = onAuthStateChanged(firebase.auth, (u) => {
          unsubscribe()
          if (!u) {
            resolve(null)
            return
          }
          u.getIdToken().then(resolve).catch(() => resolve(null))
        })
      })
    },

    /**
     * Pre-remplit le currentBook du store avec les infos recueillies puis
     * ouvre la modale d'edition (BookEditor).
     */
    openAddDialog () {
      const today = new Date()
      const dateAdded = today.getUTCFullYear() + '-' +
        (today.getUTCMonth() + 1).toString().padStart(2, '0') + '-' +
        today.getUTCDate().toString().padStart(2, '0')

      const info = this.bookInfo || {}
      this.$store.commit('setCurrentBook', {
        uid: this.isbn,
        title: info.title || '',
        series: info.series || '',
        volume: info.volume || '',
        author: info.author || '',
        imageURL: info.imageURL || '',
        publisher: info.publisher || '',
        published: info.published || '',
        detailsURL: info.detailsURL || '',
        edition: '',
        dateAdded,
        // 0 : ne pas relancer de lookup serveur qui ecraserait les champs edites
        needLookup: 0
      })
      this.addDialog = true
    },

    /**
     * Enregistre le livre (avec les champs eventuellement modifies) via Vuex,
     * puis ferme la modale et affiche la confirmation.
     */
    confirmAdd () {
      this.$store.dispatch('currentBookSave')
      this.addDialog = false
      this.addSuccess = true
    },

    /**
     * Charge les données bibliographiques via la Cloud Function getBookInfo,
     * qui utilise la même recherche unifiée (OL + Google Books) que le trigger
     * d'ajout fetchBookInformations. Cohérence garantie entre scan et ajout.
     */
    async loadBioData () {
      this.bioLoading = true
      this.bioError = null
      this.bookInfo = null

      this._bioController = new AbortController()

      try {
        const token = await this.getIdToken()
        const projectId = 'blazing-fire-8152'
        const region = 'us-central1'
        const url = `https://${region}-${projectId}.cloudfunctions.net/getBookInfo?isbn=${encodeURIComponent(this.isbn)}`
        const resp = await fetch(url, {
          signal: this._bioController.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })

        if (resp.status === 404) {
          this.bioError = 'Aucun résultat pour cet ISBN.'
          return
        }
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`)
        }

        const data = await resp.json()
        this.bookInfo = {
          isbn: data.isbn || this.isbn,
          title: data.title || '',
          author: data.author || '',
          imageURL: data.imageURL || '',
          publisher: data.publisher || '',
          published: data.published || '',
          series: data.series || null,
          volume: data.volume || null,
          detailsURL: data.detailsURL || '',
          source: data.source || 'unknown'
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.bioError = 'Erreur réseau lors de la récupération des informations : ' + (err.message || err)
        }
      } finally {
        this.bioLoading = false
      }
    }
  }
}
</script>
