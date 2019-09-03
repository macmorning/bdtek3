<template>
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
        :items-per-page="40"
        :search="search"
        show-select
        item-key="uid"
        fixed-header
        multi-sort
        class="elevation-1"
        :footer-props="{
          showFirstLastPage: true,
          itemsPerPageOptions: [20, 50, 100, 200, -1]
        }"
        group-by="series"
        :sort-by="['series', 'volume']"
      >

        <template v-slot:item.actions="{ item }">
          <a class="mr-2" :href="item.detailsURL" target="_blank"><v-icon small>mdi-link-variant</v-icon></a>
          <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
        <v-dialog v-model="dialog">
          <template v-slot:activator="{ on }">
            <v-btn
              fab
              color="primary"
              dark
              absolute
              top
              right
              v-on="on"
            ><v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <book-editor></book-editor>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
  </v-card>
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
          text: 'Title'
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
          text: 'Actions',
          value: 'actions',
          sortable: false
        }
      ]
    }
  },
  created () {
  },
  methods: {
    editItem (item) {
      this.$store.commit('setCurrentBook', item)
      this.editedIndex = this.books.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.books.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.books.splice(index, 1)
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.books[this.editedIndex], this.editedItem)
      } else {
        this.books.push(this.editedItem)
      }
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
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
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
