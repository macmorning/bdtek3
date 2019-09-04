<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" xl="10" offset-xl="1">
        <v-card>
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
              show-select
              item-key="uid"
              fixed-header
              multi-sort
              :mobile-breakpoint="900"
              class="elevation-1"
              :footer-props="{
                showFirstLastPage: true,
                itemsPerPageOptions: [20, 50, 100, 200, -1]
              }"
              group-by="series"
              :sort-by="['series', 'volume']"
            >

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
              <v-dialog v-model="dialog" fullscreen hide-overlay>
                <template v-slot:activator="{ on }">
                  <v-btn
                    fab
                    class="blue-grey lighten-1"
                    dark
                    fixed
                    bottom
                    right
                    v-on="on"
                  ><v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-banner
                  style="top:0px"
                  sticky
                  single-line
                  class="blue-grey lighten-1  white--text">
                    {{ formTitle }}
                    <template v-slot:actions>
                      <v-btn class="white--text" text @click="close">Cancel</v-btn>
                      <v-btn class="white--text" text @click="save">Save</v-btn>
                    </template>
                  </v-banner>
                  <v-card-text>
                    <v-container>
                      <book-editor></book-editor>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-dialog>
        </v-card>
      </v-col>
    </v-row>
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
      alert: false,
      dialog: false,
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
    editItem (book) {
      this.$store.commit('setCurrentBook', book)
      this.dialog = true
    },

    deleteItem (book) {
      confirm('Are you sure you want to delete this item?') && this.$store.dispatch('deleteCurrentBook',book)
    },

    close () {
      this.dialog = false
      this.$store.dispatch('clearCurrentBook')
    },

    save () {
      this.$store.dispatch('saveCurrentBook')
      this.close()
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
      return this.currentBook.title === "" ? 'New Book' : this.currentBook.title
    }
  },
  watch: {
    books (value) {
      if (value) {
        console.log(value)
      }
    },
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
    dialog (val) {
      val || this.close()
    }
  }
}
</script>
