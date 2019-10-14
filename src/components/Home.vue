<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" xl="10" offset-xl="1">
        <v-card style="opacity:.8">
          <v-banner
              v-if="friendId"
              style="top:0px;"
              sticky
              single-line
              class="blue-grey lighten-1  white--text">
            <v-btn class="white--text" text @click="backToUsers" title="back to users"><v-icon>mdi-backburger</v-icon></v-btn>
            Viewing list of {{ friendName }}
            </v-banner>
          <v-card-title>
            <div class="flex-grow-1"></div>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
          </v-card-title>
            <v-data-table
              :loading="isLoading"
              loading-text="Loading... Please wait"
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
              @item-selected="itemSelected"
              @toggle-select-all="itemSelectedAll">
              <template v-slot:item.actions="{ item }">
                <a class="mr-2" :href="item.detailsURL" v-on:click.stop="" target="_blank"><v-icon>mdi-link-variant</v-icon></a>
                <v-icon
                  v-if="!friendId"
                  v-on:click.stop="deleteItem(item)"
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
        <v-btn class="white--text" text @click="close" title="close"><v-icon>mdi-window-close</v-icon></v-btn>
          {{ formTitle }}
          <template v-slot:actions>
            <v-btn :loading="book.needLookup == 1" v-if="!friendId" class="white--text" text @click="save" title="save"><v-icon left>mdi-floppy</v-icon>Save</v-btn>
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
        <v-btn class='white--text' text @click='close' title='close'><v-icon>mdi-window-close</v-icon></v-btn>
          New book
          <template v-slot:actions>
            <v-btn class='white--text' text @click='scanSwitch' title='scan'><v-icon>mdi-barcode-scan</v-icon></v-btn>
            <v-btn class='white--text' text @click='saveNew' title='create'><v-icon>mdi-floppy</v-icon></v-btn>
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
        <v-btn class="white--text" text @click="close" title="close"><v-icon>mdi-window-close</v-icon></v-btn>
          Multi edit
          <template v-slot:actions>
            <v-btn class="white--text" text @click="saveMulti" title="save"><v-icon left>mdi-floppy</v-icon>Save</v-btn>
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
      @click="newItem"
      v-if="!showMultiEditButton && !friendId"
    ><v-icon>mdi-plus</v-icon>
    </v-btn>
   <v-btn
      fab
      class="blue-grey lighten-1"
      dark
      fixed
      bottom
      right
      @click="multiEdit"
      v-if="showMultiEditButton && !friendId"
    ><v-icon>mdi-pen</v-icon>
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
          text: 'Title',
          minWidth: '20em'
        }, {
          value: 'series',
          text: 'Series'
        }, {
          value: 'volume',
          text: '#',
          width: '7em'
        }, {
          value: 'author',
          text: 'Author(s)',
          width: '15em'
        }, {
          value: 'publisher',
          text: 'Publisher',
          width: '12em'
        }, {
          value: 'dateAdded',
          text: 'Added',
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
    }

    if (this.friendId !== undefined && this.friendId) {
      this.$store.dispatch('fetchFriendBooks', this.friendId)
    } else {
      this.$store.dispatch('initBooks')
    }
  },
  methods: {
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
      confirm('Are you sure you want to delete "' + book.title + '"?') && this.$store.dispatch('deleteCurrentBook', book)
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
      setTimeout(() => {
        this.$store.dispatch('saveMultiBook')
        close()
      }, 100)
    },
    save () {
      setTimeout(() => {
        this.$store.dispatch('saveCurrentBook')
      }, 100)
    },
    itemSelected (payload) {
      this.$store.commit('bookSelected', payload)
    },
    itemSelectedAll (payload) {
      console.log(payload)
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
    showMultiEditButton () {
      return this.$store.state.selected
    },
    book () {
      return this.$store.state.currentBook
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
