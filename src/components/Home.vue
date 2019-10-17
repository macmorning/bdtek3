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
            <v-btn class="white--text" text @click="backToUsers" title="retour"><v-icon>mdi-backburger</v-icon></v-btn>
            Liste de {{ friendName }}
            </v-banner>
          <v-card-title>
            <div class="flex-grow-1"></div>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Recherche"
                single-line
                hide-details
                append-outer-icon="mdi-window-close"
                @click:append-outer="clearSearch"
              ></v-text-field>
          </v-card-title>
            <v-data-table
              :loading="isLoading"
              loading-text="chargement en cours, veuillez patienter"
              :headers="headers"
              :items="books"
              :items-per-page="100"
              :search="search"
              item-key="uid"
              fixed-header
              multi-sort
              @click:row="editItem"
              :mobile-breakpoint="900"
              class="elevation-1"
              :footer-props="{
                showFirstLastPage: true,
                itemsPerPageOptions: [50, 100, 200, -1]
              }"
              :sort-by="['series', 'volume']"
              :show-select="!friendId"
              v-model="selectedBooks">
              <template v-slot:item.actions="{ item }">
                <a class="mr-2" :href="item.detailsURL" v-on:click.stop="" target="_blank" title="ouvrir l'url"><v-icon>mdi-link-variant</v-icon></a>
                <v-icon
                  v-if="!friendId"
                  v-on:click.stop="deleteItem(item)"
                  title="supprimer"
                >
                  mdi-delete
                </v-icon>
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
        <v-btn class="white--text" text @click="close" title="fermer"><v-icon>mdi-window-close</v-icon></v-btn>
          {{ formTitle }}
          <template v-slot:actions>
            <v-btn :loading="book.needLookup == 1" v-if="!friendId" class="white--text" text @click="askLookup" title="rechercher les détails"><v-icon>mdi-magnify</v-icon></v-btn>
            <v-btn :disabled="book.needLookup == 1" v-if="!friendId" class="white--text" text @click="save" title="enregistrer"><v-icon>mdi-floppy</v-icon></v-btn>
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
        <v-btn class='white--text' text @click='close' title='fermer'><v-icon>mdi-window-close</v-icon></v-btn>
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
        <v-btn class="white--text" text @click="close" title="fermer"><v-icon>mdi-window-close</v-icon></v-btn>
          Edition multiple
          <template v-slot:actions>
            <v-btn class="white--text" text @click="saveMulti" title="enregistrer"><v-icon>mdi-floppy</v-icon></v-btn>
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
      v-if="selectedBooks.length==0 && !friendId"
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
        v-if="selectedBooks.length>0 && !friendId"
        @click="multiEdit">
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
import BookEditor from '@/components/BookEditor'
import MultiBookEditor from '@/components/MultiBookEditor'
import Scanner from '@/components/Scanner'
export default {
  components: {
    BookEditor: BookEditor,
    MultiBookEditor: MultiBookEditor,
    Scanner: Scanner
  },
  data () {
    return {
      search: '',
      scanArray: {},
      newBookUID: null,
      alert: false,
      dialogEdit: false,
      dialogNew: false,
      dialogMulti: false,
      dialogScan: false,
      editedIndex: -1,
      headers: [
        {
          value: 'uid',
          text: 'ISBN',
          width: '12em'
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
          width: '15em'
        }, {
          value: 'publisher',
          text: 'Editeur',
          width: '12em'
        }, {
          value: 'dateAdded',
          text: 'Date d\'ajout',
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
    if (!this.$store.state.user && !this.friendId) {
      this.$router.push('/signin')
    } else {
      if (this.friendId !== undefined && this.friendId) {
        this.$store.dispatch('fetchFriendBooks', this.friendId)
      } else {
        this.$store.dispatch('initBooks')
      }
    }
  },
  methods: {
    clearSearch () {
      this.search = ''
    },
    backToUsers () {
      this.$router.push('/users')
    },
    onSearchItemSelected (item) {
      this.selectedSearchItem = item
    },
    editItem (book) {
      this.$store.commit('setCurrentBook', book)
      this.dialogEdit = true
    },
    newItem () {
      this.$store.dispatch('clearCurrentBook')
      this.dialogNew = true
    },
    multiEdit () {
      this.$store.dispatch('clearCurrentBook')
      this.dialogMulti = true
    },
    deleteItem (book) {
      confirm('Êtes-vous sûr de vouloir supprimer "' + book.title + '" ?') && this.$store.dispatch('deleteCurrentBook', book)
    },
    close () {
      this.dialogEdit = false
      this.dialogNew = false
      this.dialogMulti = false
      this.dialogScan = false
      this.scanArray = {}
      setTimeout(() => {
        this.$store.dispatch('clearCurrentBook')
      }, 100)
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
      if (this.selectedBooks.length < 5 || confirm('Êtes-vous certain de vouloir modifier les ' + this.selectedBooks.length + ' livres sélectionnés ?')) {
        setTimeout(() => {
          this.$store.dispatch('saveMultiBook')
          close()
        }, 100)
      }
    },
    save () {
      setTimeout(() => {
        this.$store.dispatch('saveCurrentBook')
      }, 100)
    },
    itemSelected (payload) {
      this.$store.commit('bookSelected', payload)
    },
    itemUnselectAll () {
      let payload = {
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
        this.$store.dispatch('saveCurrentBook')
      }
    }
  },
  computed: {
    friendId () {
      return this.$route.query.uid
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
      if (this.friendId !== undefined && this.friendId) {
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
    }
  }
}
</script>
