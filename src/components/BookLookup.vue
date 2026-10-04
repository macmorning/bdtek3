<template>
  <v-dialog
    :model-value="modelValue"
    max-width="800px"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar color="blue-grey-lighten-1" density="comfortable">
        <v-btn icon title="fermer" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Fiche livre</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <!-- Section bibliographique -->
        <v-card>
          <!-- Indicateur de chargement -->
          <v-card-text v-if="bioLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="blue-grey" size="48"></v-progress-circular>
            <div class="mt-3 text-grey">Chargement des informations bibliographiques…</div>
          </v-card-text>

          <!-- Erreur bibliographique -->
          <v-card-text v-else-if="bioError">
            <v-alert type="warning" variant="outlined">
              Œuvre non trouvée
            </v-alert>
            <div class="mt-2 text-grey-darken-1">
              <span class="font-weight-medium">ISBN :</span> {{ isbn }}
            </div>
            <div class="text-caption text-grey mt-1">{{ bioError }}</div>
          </v-card-text>

          <!-- Données bibliographiques -->
          <v-card-text v-else-if="bookInfo">
            <!-- Badge discret "deja dans la collection" -->
            <div v-if="alreadyInCollectionComputed" class="mb-2">
              <v-chip size="x-small" color="info" variant="outlined">
                <v-icon start size="x-small">mdi-check-circle</v-icon>
                Déjà dans votre collection
              </v-chip>
            </div>

            <v-row>
              <!-- Couverture -->
              <v-col v-if="bookInfo.imageURL" cols="4" sm="3" class="d-flex align-start">
                <v-img
                  v-if="!coverError"
                  :src="bookInfo.imageURL"
                  max-height="200"
                  contain
                  class="bg-grey-lighten-3 rounded"
                  @error="coverError = true"
                >
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
                <v-row
                  v-else
                  class="ma-0 bg-grey-lighten-3 rounded text-center"
                  align="center"
                  justify="center"
                  style="min-height:120px;width:100%"
                  title="Image indisponible"
                >
                  <div class="text-grey">
                    <v-icon color="grey">mdi-image-broken-variant</v-icon>
                    <div class="text-caption">Image indisponible</div>
                  </div>
                </v-row>
              </v-col>

              <!-- Détails -->
              <v-col :cols="bookInfo.imageURL ? 8 : 12" :sm="bookInfo.imageURL ? 9 : 12">
                <div class="text-h6 mb-1">{{ bookInfo.title }}</div>

                <div v-if="bookInfo.author" class="text-body-2 mb-1">
                  <span class="text-blue-grey-lighten-2">Auteur(s) : </span>{{ formatAuthor(bookInfo.author) }}
                </div>
                <div v-if="bookInfo.published" class="text-body-2 mb-1">
                  <span class="text-blue-grey-lighten-2">Année : </span>{{ bookInfo.published }}
                </div>
                <div v-if="bookInfo.publisher" class="text-body-2 mb-1">
                  <span class="text-blue-grey-lighten-2">Éditeur : </span>{{ bookInfo.publisher }}
                </div>
                <div v-if="bookInfo.series" class="text-body-2 mb-1">
                  <span class="text-blue-grey-lighten-2">Série : </span>{{ bookInfo.series }}
                </div>
                <div v-if="bookInfo.volume" class="text-body-2 mb-1">
                  <span class="text-blue-grey-lighten-2">Volume : </span>{{ bookInfo.volume }}
                </div>
                <div class="text-caption text-grey mt-2">
                  <span class="text-blue-grey-lighten-2">ISBN : </span>{{ isbn }}
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
            <v-btn color="blue-grey" @click="openAddDialog">
              <v-icon start>mdi-plus</v-icon>
              Ajouter à ma collection
            </v-btn>
            <v-alert v-if="addSuccess" type="success" variant="outlined" density="compact" class="mt-2 mb-0">
              Livre ajouté à votre collection !
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Modale d'ajout : editeur pre-rempli -->
        <v-dialog v-model="addDialog" width="800px" scrollable>
          <v-card>
            <v-toolbar color="blue-grey-lighten-1" density="comfortable">
              <v-btn icon title="fermer" @click="addDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Ajouter à ma collection</v-toolbar-title>
              <template #append>
                <v-btn icon title="enregistrer" @click="confirmAdd">
                  <v-icon>mdi-floppy</v-icon>
                </v-btn>
              </template>
            </v-toolbar>
            <v-card-text>
              <v-container>
                <book-editor />
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Section liens externes vers les sites de critiques -->
        <v-card v-if="bookInfo || bioError" class="mt-3">
          <v-card-title class="bg-blue-grey-lighten-2 text-white text-subtitle-1">
            <v-icon start class="text-white">mdi-star-outline</v-icon>
            Rechercher des avis
          </v-card-title>
          <v-card-text>
            <div class="mb-2 text-caption text-grey">
              Consultez les avis sur les sites de référence :
            </div>
            <v-btn
              v-for="site in reviewSites"
              :key="site.name"
              size="small"
              variant="outlined"
              color="blue-grey"
              class="mr-2 mb-2"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-icon start size="small">mdi-open-in-new</v-icon>
              {{ site.name }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import firebase from '@/initFirebase'
import { onAuthStateChanged } from 'firebase/auth'
import BookEditor from '@/components/BookEditor'
import { normalizeDate, todayISO } from '@/utils/date'
import { formatAuthor } from '@/utils/author'

export default {
  name: 'BookLookup',

  components: {
    BookEditor
  },

  props: {
    // v-model : etat ouvert/ferme de la modale (convention Vue 3)
    modelValue: {
      type: Boolean,
      default: false
    },
    // ISBN du livre a afficher
    isbn: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue'],

  data () {
    return {
      // Données bibliographiques
      bookInfo: null,
      bioLoading: true,
      bioError: null,
      // true si la couverture n'a pas pu etre chargee (lien mort, site injoignable)
      coverError: false,
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

  watch: {
    modelValue (open) {
      if (open && this.isbn) {
        // Ouverture de la modale : (re)charger la fiche du livre scanne
        this.addDialog = false
        this.addSuccess = false
        this.loadBioData()
      } else if (!open) {
        // Fermeture : annuler toute requete en cours et nettoyer
        if (this._bioController) {
          this._bioController.abort()
        }
      }
    }
  },

  beforeUnmount () {
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
    formatAuthor,
    closeDialog () {
      this.$emit('update:modelValue', false)
    },

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
      const dateAdded = todayISO()

      const info = this.bookInfo || {}
      this.$store.commit('setCurrentBook', {
        uid: this.isbn,
        title: info.title || '',
        series: info.series || '',
        volume: info.volume || '',
        author: info.author || '',
        imageURL: info.imageURL || '',
        publisher: info.publisher || '',
        published: normalizeDate(info.published),
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
      this.coverError = false
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
          published: normalizeDate(data.published),
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
