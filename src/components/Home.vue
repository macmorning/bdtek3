<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" xl="10" offset-xl="1">
        <v-card :style="opacity">
          <v-toolbar v-if="friendId" color="blue-grey-lighten-1" density="comfortable">
            <v-btn :disabled="!$store.state.user" icon title="fermer" @click="backToHome"><v-icon>mdi-close</v-icon></v-btn>
            <v-toolbar-title>Liste de {{ friendName }}</v-toolbar-title>
          </v-toolbar>
          <v-toolbar v-if="cached" color="blue-grey-lighten-1" density="comfortable">
            <v-btn icon title="version actuelle" @click="backToHome"><v-icon>mdi-close</v-icon></v-btn>
            <v-toolbar-title>Version locale du {{ cachedBooksTime }}</v-toolbar-title>
          </v-toolbar>
          <v-card-title>
            <div class="flex-grow-1"></div>
              <v-combobox
                v-model="search"
                :items="series"
                prepend-inner-icon="mdi-magnify"
                label="Recherche"
                clearable
                @click:clear="clearSearch"
              ></v-combobox>
          </v-card-title>
            <v-data-table
              v-model="selectedBooks"
              v-model:expanded="expanded"
              :loading="isLoading"
              loading-text="chargement de la collection"
              no-data-text="aucun livre dans cette collection"
              no-results-text="aucun livre ne correspond à cette recherche"
              :headers="headers"
              :items="books"
              :items-per-page="100"
              :search="search"
              item-value="uid"
              fixed-header
              multi-sort
              :mobile-breakpoint="1"
              class="elevation-1"
              :items-per-page-options="[
                { value: 50, title: '50' },
                { value: 100, title: '100' },
                { value: 200, title: '200' },
                { value: -1, title: 'Tous' }
              ]"
              :sort-by="[{ key: 'series', order: 'asc' }, { key: 'volume', order: 'asc' }]"
              :show-select="!cached && !friendId && !$vuetify.display.xs && !$vuetify.display.sm"
              :row-props="rowProps"
              @click:row="expandRow"
>
              <template #loading>
                  <p>chargement de la collection</p>
                  <p v-if="!friendId && !cached && cachedBooksTime">
chargement trop long ou hors connexion ?<br />
                  <a @click.stop="loadFromCache">cliquez ici pour charger la dernière version enregistrée le {{ cachedBooksTime }}</a>
</p>
              </template>
              <template #item.author="{ item }">
                {{ formatAuthor(item.author) }}
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex align-center justify-end">
                  <a v-if="item.detailsURL" class="mr-2 d-inline-flex text-decoration-none" :href="item.detailsURL" target="_blank" title="ouvrir l'url" @click.stop="">
                    <v-icon color="grey-darken-1">mdi-link-variant</v-icon>
                  </a>
                  <v-icon
                    v-if="!cached && !friendId"
                    title="supprimer"
                    color="grey-darken-1"
                    class="mr-2"
                    @click.stop="deleteItem(item)"
                  >
                    mdi-delete
                  </v-icon>
                  <v-icon
                    v-if="!cached && !friendId"
                    title="modifier"
                    color="grey-darken-1"
                    @click.stop="editItem(item)"
                  >
                    mdi-pen
                  </v-icon>
                </div>
              </template>
              <template #expanded-row="{ columns }">
                <tr class="expansion-row">
                  <td class="expansion" :colspan="columns.length">
                    <v-sheet class="expansion-panel expansion-panel--enter ma-2 rounded elevation-4 border-s-lg" color="blue-grey-lighten-5">
                      <v-toolbar
                        v-if="$vuetify.display.xs || $vuetify.display.sm"
                        color="blue-grey-lighten-1"
                        density="compact"
                      >
                        <v-spacer></v-spacer>
                        <a v-if="currentBook.detailsURL" class="mr-6 d-inline-flex text-decoration-none" :href="currentBook.detailsURL" target="_blank" title="ouvrir l'url" @click.stop=""><v-icon class="text-white">mdi-link-variant</v-icon></a>
                        <a v-if="currentBook.imageURL" class="mr-6 d-md-none d-inline-flex text-decoration-none" :href="currentBook.imageURL" target="_blank" title="afficher l'image" @click.stop=""><v-icon class="text-white">mdi-file-image</v-icon></a>
                        <v-icon v-if="!cached && !friendId" class="text-white mr-6" title="supprimer" @click.stop="deleteItem(currentBook)">mdi-delete</v-icon>
                        <v-icon v-if="!cached && !friendId" class="text-white mr-4" title="modifier" @click.stop="editItem(currentBook)">mdi-pen</v-icon>
                      </v-toolbar>
                      <book-details />
                    </v-sheet>
                  </td>
                </tr>
              </template>
            </v-data-table>
         </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogEdit">
      <v-card>
        <v-toolbar color="blue-grey-lighten-1" density="comfortable">
          <v-btn icon title="fermer" @click="close"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
          <template #append>
            <v-btn v-if="!cached && !friendId" :loading="book.needLookup == 1" icon title="rechercher les détails" @click="askLookup"><v-icon>mdi-magnify</v-icon></v-btn>
            <v-btn v-if="!cached && !friendId" :disabled="book.needLookup == 1" icon title="enregistrer" @click="save"><v-icon>mdi-floppy</v-icon></v-btn>
          </template>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <book-editor :readonly="!!friendId" />
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogMulti" width="600px">
      <v-card>
        <v-toolbar color="blue-grey-lighten-1" density="comfortable">
          <v-btn icon title="fermer" @click="close"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title>Edition multiple</v-toolbar-title>
          <template #append>
            <v-btn :disabled="!multiEdit.seriesBool && !multiEdit.authorBool && !multiEdit.publisherBool" icon title="enregistrer" @click="saveMulti"><v-icon>mdi-floppy</v-icon></v-btn>
          </template>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <multi-book-editor />
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <scan-dialog v-model="dialogScan" @detected="onScanDetected" />

    <book-lookup v-model="dialogLookup" :isbn="lookupIsbn" />
    <v-btn
      v-if="!friendId && !cached && selectedBooks.length==0"
      icon
      size="large"
      color="blue-grey-lighten-1"
      position="fixed"
      location="bottom right"
      class="ma-4"
      style="bottom:16px;right:16px;"
      title="scanner un livre"
      @click="dialogScan = true"
    >
      <v-icon>mdi-barcode-scan</v-icon>
    </v-btn>
    <v-btn
      v-if="!friendId && !cached && selectedBooks.length>0"
      icon
      size="large"
      color="blue-grey-lighten-1"
      position="fixed"
      location="bottom right"
      class="ma-4"
      style="bottom:16px;right:16px;"
      title="édition multiple"
      @click="openMultiEdit"
    >
      <v-badge color="cyan" location="top start" :content="selectedBooks.length">
        <v-icon>mdi-pen</v-icon>
      </v-badge>
    </v-btn>
  </v-container>
</template>

<script>
import BookDetails from '@/components/BookDetails'
import BookEditor from '@/components/BookEditor'
import MultiBookEditor from '@/components/MultiBookEditor'
import ScanDialog from '@/components/ScanDialog'
import BookLookup from '@/components/BookLookup'
import { formatAuthor } from '@/utils/author'
export default {
  components: {
    BookDetails: BookDetails,
    BookEditor: BookEditor,
    MultiBookEditor: MultiBookEditor,
    ScanDialog: ScanDialog,
    BookLookup: BookLookup
  },
  data () {
    return {
      search: '',
      cached: false,
      alert: false,
      expanded: [],
      dialogEdit: false,
      dialogMulti: false,
      dialogScan: false,
      dialogLookup: false,
      lookupIsbn: '',
      editedIndex: -1,
      headersSM: [
        {
          key: 'uid',
          title: 'ISBN',
          headerProps: { class: 'd-none' },
          cellProps: { class: 'd-none' }
        }, {
          key: 'title',
          title: 'Titre'
        }, {
          key: 'series',
          title: 'Série'
        }, {
          key: 'volume',
          title: '#'
        }, {
          key: 'author',
          title: 'Auteur(s)',
          headerProps: { class: 'd-none' },
          cellProps: { class: 'd-none' }
        }
      ],
      headersMD: [
        {
          key: 'uid',
          title: 'ISBN',
          minWidth: '20em'
        }, {
          key: 'title',
          title: 'Titre',
          minWidth: '20em'
        }, {
          key: 'series',
          title: 'Série'
        }, {
          key: 'volume',
          title: '#',
          width: '7em'
        }, {
          key: 'author',
          title: 'Auteur(s)',
          minWidth: '10em'
        }, {
          key: 'actions',
          title: 'Actions',
          width: '10em',
          align: 'end',
          sortable: false
        }
      ],
      headersXL: [
        {
          key: 'uid',
          title: 'ISBN',
          minWidth: '20em'
        }, {
          key: 'title',
          title: 'Titre',
          minWidth: '20em'
        }, {
          key: 'series',
          title: 'Série'
        }, {
          key: 'volume',
          title: '#',
          width: '7em'
        }, {
          key: 'author',
          title: 'Auteur(s)',
          minWidth: '20em'
        }, {
          key: 'publisher',
          title: 'Editeur',
          minWidth: '10em'
        }, {
          key: 'published',
          title: 'Publié',
          width: '10em'
        }, {
          key: 'dateAdded',
          title: 'Ajouté',
          width: '10em'
        }, {
          key: 'actions',
          title: 'Actions',
          width: '10em',
          align: 'end',
          sortable: false
        }
      ]
    }
  },
  computed: {
    cachedBooks () {
      return JSON.parse(localStorage.getItem('collection.books'))
    },
    cachedBooksTime () {
      return localStorage.getItem('collection.booksLastSaved')
    },
    friendId () {
      return this.$route.params.uid
    },
    friendName () {
      return (this.$route.query.name || 'unknown')
    },
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
    },
    books () {
      if (this.cached) {
        return this.cachedBooks
      } else if (this.friendId !== undefined && this.friendId) {
        return this.$store.state.friendBooks
      } else {
        return this.$store.state.books
      }
    },
    currentBook () {
      return this.$store.state.currentBook
    },
    formTitle () {
      return this.currentBook.title === '' ? 'New Book' : this.currentBook.title
    },
    selectedBooks: {
      get: function () {
        return this.$store.state.selectedBooks
      },
      set: function (payload) {
        this.$store.commit('setSelectedBooks', payload)
      }
    },
    book () {
      return this.$store.state.currentBook
    },
    bgRandom () {
      return this.$store.state.options.bgRandom
    },
    opacity () {
      if (this.bgRandom) {
        return 'opacity:.9;'
      } else {
        return ''
      }
    },
    series () {
      return this.$store.state.series
    },
    headers () {
      if (this.$vuetify.display.xl) { return this.headersXL } else if (this.$vuetify.display.lg || this.$vuetify.display.md) { return this.headersMD } else { return this.headersSM }
    },
    multiEdit () {
      return this.$store.state.multiEdit
    }
  },
  watch: {
    error (value) {
      if (value) {
        this.alert = true
      }
    },
    alert (value) {
      if (!value) {
        this.$store.commit('setError', null)
      }
    },
    dialogEdit (val) {
      val || this.close()
    },
    dialogMulti (val) {
      val || this.close()
    },
    $route (to, from) {
      if (to.params.uid !== undefined && to.params.uid !== from.params.uid) {
        this.init()
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      if (!this.$store.state.user && !this.friendId) {
        this.$router.push('/signin')
      } else {
        if (this.friendId !== undefined && this.friendId) {
          this.$store.dispatch('fetchFriendBooks', this.friendId)
        } else if (!this.cached) {
          this.$store.dispatch('initBooks')
        }
      }
    },
    loadFromCache () {
      this.cached = true
    },
    clearSearch () {
      this.search = ''
    },
    setSearch (value) {
      this.search = value
    },
    backToHome () {
      this.cached = false
      this.$router.push('/')
    },
    formatAuthor,
    // Classe conditionnelle sur la ligne dont le detail est deploye,
    // pour relier visuellement la ligne a son panneau d'expansion.
    rowProps ({ item }) {
      return item.uid === this.expanded[0] ? { class: 'row-expanded' } : {}
    },
    expandRow (event, { item }) {
      // En Vuetify 3, expanded contient les cles (uid), pas les objets.
      if (item.uid === this.expanded[0]) {
        this.expanded = []
      } else {
        this.expanded = [item.uid]
        this.$store.commit('setCurrentBook', item)
      }
    },
    editItem (book) {
      this.expanded = []
      this.$store.commit('setCurrentBook', book)
      this.dialogEdit = true
    },
    openMultiEdit () {
      this.expanded = []
      this.$store.dispatch('currentBookClear')
      this.dialogMulti = true
    },
    deleteItem (book) {
      this.expanded = []
      confirm('Êtes-vous sûr de vouloir supprimer "' + book.title + '" ?') && this.$store.dispatch('currentBookDelete', book)
    },
    close () {
      this.dialogEdit = false
      this.dialogMulti = false
      this.$store.dispatch('currentBookClear')
    },
    saveMulti () {
      if (confirm('Êtes-vous certain de vouloir modifier les ' + this.selectedBooks.length + ' livres sélectionnés ?')) {
        setTimeout(() => {
          this.$store.dispatch('saveMultiBook')
          this.dialogMulti = false
        }, 100)
      }
    },
    save () {
      setTimeout(() => {
        this.$store.dispatch('currentBookSave')
        this.dialogEdit = false
      }, 100)
    },
    itemSelected (payload) {
      this.$store.commit('bookSelected', payload)
    },
    itemUnselectAll () {
      const payload = {
        value: false
      }
      this.$store.commit('bookSelectedAll', payload)
    },
    askLookup () {
      if (confirm('Êtes-vous sûr de vouloir remplacer les informations actuelles par celles qui seront trouvées sur Internet ?')) {
        this.book.needLookup = 1
        this.$store.dispatch('currentBookSave')
      }
    },
    onScanDetected (isbn) {
      this.dialogScan = false
      this.lookupIsbn = isbn
      // Ouvrir la fiche livre en modale (le watch de BookLookup declenche le chargement)
      this.dialogLookup = true
    }
  }
}
</script>
