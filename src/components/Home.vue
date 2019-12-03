<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" xl="10" offset-xl="1">
        <v-card :style="opacity">
          <v-banner
              v-if="friendId"
              style="top:0px;"
              sticky
              single-line
              class="blue-grey lighten-1 white--text">
            <v-btn :disabled="!this.$store.state.user" class="white--text" text @click="backToHome" title="fermer"><v-icon>mdi-close</v-icon></v-btn>
            Liste de {{ friendName }}
            </v-banner>
          <v-banner
              v-if="cached"
              style="top:0px;"
              sticky
              single-line
              class="blue-grey lighten-1 white--text">
            <v-btn class="white--text" text @click="backToHome" title="version actuelle"><v-icon>mdi-close</v-icon></v-btn>
            Version locale du {{cachedBooksTime}}
          </v-banner>
          <v-card-title>
            <div class="flex-grow-1"></div>
              <v-combobox
                v-model="search"
                :items="series"
                append-icon="mdi-magnify"
                label="Recherche"
                append-outer-icon="mdi-window-close"
                @click:append-outer="clearSearch"
              ></v-combobox>
          </v-card-title>
            <v-data-table
              :loading="isLoading"
              loading-text="chargement de la collection"
              no-data-text="aucun livre dans cette collection"
              no-results-text="aucun livre ne correspond à cette recherche"
              :headers="headers"
              :items="books"
              :items-per-page="100"
              :search="search"
              item-key="uid"
              fixed-header
              multi-sort
              :mobile-breakpoint="1"
              class="elevation-1"
              :footer-props="{
                showFirstLastPage: (!$vuetify.breakpoint.xs && !$vuetify.breakpoint.sm),
                itemsPerPageOptions: [50, 100, 200, -1]
              }"
              :sort-by="['series', 'volume']"
              :show-select="!cached && !friendId && !$vuetify.breakpoint.xs && !$vuetify.breakpoint.sm"
              single-expand
              v-model="selectedBooks"
              :expanded="expanded"
              @click:row="expandRow">
              <template v-slot:loading>
                  <p>chargement de la collection</p>
                  <p v-if="!friendId && !cached && cachedBooksTime">chargement trop long ou hors connexion ?<br/>
                  <a v-on:click.stop="loadFromCache">cliquez ici pour charger la dernière version enregistrée le {{cachedBooksTime}}</a></p>
              </template>
              <template v-slot:item.actions="{ item }">
                <a v-if="item.detailsURL" class="mr-2" :href="item.detailsURL" v-on:click.stop="" target="_blank" title="ouvrir l'url"><v-icon>mdi-link-variant</v-icon></a>
                <v-icon
                  v-if="!cached && !friendId"
                  v-on:click.stop="deleteItem(item)"
                  title="supprimer"
                  class="mr-2"
                >
                  mdi-delete
                </v-icon>
                <v-icon
                  v-if="!cached && !friendId"
                  v-on:click.stop="editItem(item)"
                  title="modifier"
                >
                  mdi-pen
                </v-icon>
              </template>
              <template v-slot:expanded-item="{ headers }">
                <td class="expansion" :colspan="headers.length">
                    <v-banner
                      single-line
                      class="blue-grey lighten-1  white--text"
                      v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
                    <template v-slot:actions>
                      <a class="mr-6" v-if="currentBook.detailsURL" :href="currentBook.detailsURL" v-on:click.stop="" target="_blank" title="ouvrir l'url"><v-icon class="white--text">mdi-link-variant</v-icon></a>
                      <a class="mr-6 d-md-none" v-if="currentBook.imageURL" :href="currentBook.imageURL" v-on:click.stop="" target="_blank" title="afficher l'image"><v-icon class="white--text">mdi-file-image</v-icon></a>
                      <v-icon v-if="!cached && !friendId" class="white--text mr-6" text v-on:click.stop="deleteItem(currentBook)" title="supprimer">mdi-delete</v-icon>
                      <v-icon v-if="!cached && !friendId" class="white--text" text v-on:click.stop="editItem(currentBook)" title="modifier">mdi-pen</v-icon>
                    </template>
                  </v-banner>
                  <book-details/></td>
              </template>
            </v-data-table>
         </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogEdit">
      <v-card>
        <v-banner
        style="top:0px"
        sticky
        single-line
        class="blue-grey lighten-1  white--text">
        <v-btn class="white--text" text @click="close" title="fermer"><v-icon>mdi-close</v-icon></v-btn>
          {{ formTitle }}
          <template v-slot:actions>
            <v-btn :loading="book.needLookup == 1" v-if="!cached && !friendId" class="white--text" text @click="askLookup" title="rechercher les détails"><v-icon>mdi-magnify</v-icon></v-btn>
            <v-btn :disabled="book.needLookup == 1" v-if="!cached && !friendId" class="white--text" text @click="save" title="enregistrer"><v-icon>mdi-floppy</v-icon></v-btn>
          </template>
        </v-banner>
        <v-card-text>
          <v-container>
            <book-editor :readonly="!!friendId"/>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogNew" width="400px">
      <v-card>
        <v-banner
        style="top:0px"
        sticky
        single-line
        class="blue-grey lighten-1  white--text">
        <v-btn class='white--text' text @click='close' title='fermer'><v-icon>mdi-close</v-icon></v-btn>
          Nouveau livre
          <template v-slot:actions>
            <v-btn class='white--text' text @click='scanSwitch' title='scanner'><v-icon>mdi-barcode-scan</v-icon></v-btn>
            <v-btn class='white--text' text @click='saveNew' title='créer'><v-icon>mdi-floppy</v-icon></v-btn>
          </template>
        </v-banner>
        <v-card-text>
          <v-container>
            <v-text-field autofocus v-on:keyup.enter='saveNew' v-model='newBookUID' label='ISBN'></v-text-field>
          </v-container>
          <v-dialog v-model="dialogScan" width="690px">
            <v-card style="height: 500px;">
              <scanner v-if="dialogScan" :onDetected='scanDetected'/>
            </v-card>
          </v-dialog>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogMulti" width="600px">
      <v-card>
        <v-banner
        style="top:0px"
        sticky
        single-line
        class="blue-grey lighten-1  white--text">
        <v-btn class="white--text" text @click="close" title="fermer"><v-icon>mdi-close</v-icon></v-btn>
          Edition multiple
          <template v-slot:actions>
            <v-btn :disabled="!multiEdit.seriesBool && !multiEdit.authorBool && !multiEdit.publisherBool" class="white--text" text @click="saveMulti" title="enregistrer"><v-icon>mdi-floppy</v-icon></v-btn>
          </template>
        </v-banner>
        <v-card-text>
          <v-container>
            <multi-book-editor/>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-btn
      fab
      class="blue-grey lighten-1"
      dark
      fixed
      bottom
      right
      title="ajouter un livre"
      @click="newItem"
      v-if="!friendId && !cached && selectedBooks.length==0"
    ><v-icon>mdi-book-plus</v-icon>
    </v-btn>
      <v-btn
        fab
        class="blue-grey lighten-1"
        dark
        fixed
        bottom
        right
        title="édition multiple"
        v-if="!friendId && !cached && selectedBooks.length>0"
        @click="openMultiEdit">
     <v-badge
      color="cyan"
      left>
      <template v-slot:badge>
        {{ selectedBooks.length }}
      </template>
         <v-icon>mdi-pen</v-icon>
      </v-badge>
        </v-btn>
  </v-container>
</template>

<script>
import BookDetails from '@/components/BookDetails'
import BookEditor from '@/components/BookEditor'
import MultiBookEditor from '@/components/MultiBookEditor'
import Scanner from '@/components/Scanner'
export default {
  components: {
    BookDetails: BookDetails,
    BookEditor: BookEditor,
    MultiBookEditor: MultiBookEditor,
    Scanner: Scanner
  },
  data () {
    return {
      search: '',
      scanArray: {},
      cached: false,
      newBookUID: null,
      alert: false,
      expanded: [],
      dialogEdit: false,
      dialogNew: false,
      dialogMulti: false,
      dialogScan: false,
      editedIndex: -1,
      headersSM: [
        {
          value: 'title',
          text: 'Titre'
        }, {
          value: 'series',
          text: 'Série'
        }, {
          value: 'volume',
          text: '#'
        }
      ],
      headersMD: [
        {
          value: 'uid',
          text: 'ISBN',
          minWidth: '20em'
        }, {
          value: 'title',
          text: 'Titre',
          minWidth: '20em'
        }, {
          value: 'series',
          text: 'Série'
        }, {
          value: 'volume',
          text: '#',
          width: '7em'
        }, {
          value: 'author',
          text: 'Auteur(s)',
          minWidth: '10em'
        }, {
          value: 'actions',
          text: 'Actions',
          width: '10em',
          align: 'end',
          filter: false,
          sortable: false
        }
      ],
      headersXL: [
        {
          value: 'uid',
          text: 'ISBN',
          minWidth: '20em'
        }, {
          value: 'title',
          text: 'Titre',
          minWidth: '20em'
        }, {
          value: 'series',
          text: 'Série'
        }, {
          value: 'volume',
          text: '#',
          width: '7em'
        }, {
          value: 'author',
          text: 'Auteur(s)',
          minWidth: '20em'
        }, {
          value: 'publisher',
          text: 'Editeur',
          minWidth: '10em'
        }, {
          value: 'published',
          text: 'Publié',
          width: '10em'
        }, {
          value: 'dateAdded',
          text: 'Ajouté',
          width: '10em'
        }, {
          value: 'actions',
          text: 'Actions',
          width: '10em',
          align: 'end',
          filter: false,
          sortable: false
        }
      ]
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
    backToHome () {
      this.cached = false
      this.$router.push('/')
    },
    expandRow (item) {
      if (item === this.expanded[0]) {
        this.expanded = []
      } else {
        this.expanded = [item]
        this.$store.commit('setCurrentBook', item)
      }
    },
    editItem (book) {
      this.expanded = []
      this.$store.commit('setCurrentBook', book)
      this.dialogEdit = true
    },
    newItem () {
      this.expanded = []
      this.$store.dispatch('currentBookClear')
      this.dialogNew = true
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
      this.dialogNew = false
      this.dialogMulti = false
      this.dialogScan = false
      this.scanArray = {}
      this.$store.dispatch('currentBookClear')
    },
    saveNew () {
      this.newBookUID = this.newBookUID.trim().replace(/\D/g, '')
      this.$store.dispatch('saveNewBook', this.newBookUID)
      close()
      setTimeout(() => {
        if (this.$store.state.currentBook.uid === this.newBookUID) {
          this.dialogEdit = true
        }
      }, 500)
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
    scanSwitch () {
      this.dialogScan = !this.dialogScan
    },
    scanDetected (data) {
      this.scanArray[data.codeResult.code] = (this.scanArray[data.codeResult.code] !== undefined ? this.scanArray[data.codeResult.code] + 1 : 1)
      if (this.scanArray[data.codeResult.code] >= 5) {
        this.dialogScan = false
        delete this.scanArray
        this.scanArray = {}
        this.newBookUID = data.codeResult.code
      }
    },
    askLookup () {
      if (confirm('Êtes-vous sûr de vouloir remplacer les informations actuelles par celles qui seront trouvées sur Internet ?')) {
        this.book.needLookup = 1
        this.$store.dispatch('currentBookSave')
      }
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
        return 'opacity:.8;'
      } else {
        return ''
      }
    },
    series () {
      return this.$store.state.series
    },
    headers () {
      if (this.$vuetify.breakpoint.xl) { return this.headersXL } else if (this.$vuetify.breakpoint.lg || this.$vuetify.breakpoint.md) { return this.headersMD } else { return this.headersSM }
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
    dialogNew (val) {
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
  }
}
</script>
