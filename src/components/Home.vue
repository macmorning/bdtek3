<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" xl="10" offset-xl="1">
        <v-card style="opacity:.8">
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
              :mobile-breakpoint="900"
              class="elevation-1"
              :footer-props="{
                showFirstLastPage: true,
                itemsPerPageOptions: [20, 50, 100, 200, -1]
              }"
              :sort-by="['series', 'volume']"
            ><!--   group-by="series"            show-select -->

              <template v-slot:item.actions="{ item }">
                <a class="mr-2" :href="item.detailsURL" target="_blank"><v-icon>mdi-link-variant</v-icon></a>
                <v-icon
                  class="mr-2"
                  @click="editItem(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  @click="deleteItem(item)"
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
        <v-btn class="white--text" text @click="close"><v-icon>mdi-arrow-left-bold</v-icon></v-btn>
          {{ formTitle }}
          <template v-slot:actions>
            <v-btn class="white--text" text @click="save"><v-icon left>mdi-floppy</v-icon>Save</v-btn>
          </template>
        </v-banner>
        <v-card-text>
          <v-container>
            <book-editor></book-editor>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogNew" width="400">
      <v-card>
        <v-banner
        style="top:0px"
        sticky
        single-line
        class="blue-grey lighten-1  white--text">
        <v-btn class="white--text" text @click="close"><v-icon>mdi-arrow-left-bold</v-icon></v-btn>
          New book
          <template v-slot:actions>
            <v-btn class="white--text" text @click="saveNew"><v-icon left>mdi-floppy</v-icon>Create</v-btn>
          </template>
        </v-banner>
        <v-card-text>
          <v-container>
            <v-row>
                <v-col>
                    <v-text-field v-model="newBookUID" label="ISBN"></v-text-field>
                </v-col>
            </v-row>
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
    ><v-icon>mdi-plus</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import BookEditor from '@/components/BookEditor'
export default {
  components: {
    BookEditor: BookEditor
  },
  data () {
    return {
      search: '',
      newBookUID: null,
      alert: false,
      dialogEdit: false,
      dialogNew: false,
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
  },
  methods: {
    onCountryInputChange (query) {
      if (query.trim().length === 0) {
        return null
      }
      // return the matching countries as an array
      return this.countries.filter((country) => {
        return country.toLowerCase().includes(query.toLowerCase())
      })
    },
    onCountrySelected (item) {
      this.selectedCountry = item
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
    deleteItem (book) {
      confirm('Are you sure you want to delete "' + book.title + '"?') && this.$store.dispatch('deleteCurrentBook', book)
    },

    close () {
      this.dialogEdit = false
      this.dialogNew = false
      setTimeout(() => {
        this.$store.dispatch('clearCurrentBook')
      }, 100)
    },
    saveNew () {
      this.$store.dispatch('saveNewBook', this.newBookUID)
      close()
      this.dialogEdit = true
    },
    save () {
      setTimeout(() => {
        this.$store.dispatch('saveCurrentBook')
      }, 100)
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
    },
    books () {
      return this.$store.state.books
    },
    currentBook () {
      return this.$store.state.currentBook
    },
    formTitle () {
      return this.currentBook.title === '' ? 'New Book' : this.currentBook.title
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
    }
  }
}
</script>
