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
        item-key="uid"
        show-select
        fixed-header
        multi-sort
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
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      search: '',
      alert: false,
      editedIndex: -1,
      editedItem: {
        uid: '',
        title: '',
        series: '',
        volume: '',
        author: '',
        published: '',
        publisher: ''
      },
      defaultItem: {
        uid: '',
        title: '',
        series: '',
        volume: '',
        author: '',
        published: '',
        publisher: ''
      },
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
          width: '5em'
        }, {
          value: 'author',
          text: 'Author(s)',
          width: '15em'
        }, {
          value: 'published',
          text: 'Published',
          width: '10em'
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
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
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
