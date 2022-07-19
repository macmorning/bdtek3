<template>
    <v-card>
      <v-banner
          style="top:0px"
          sticky
          single-line
          class="blue-grey lighten-1  white--text"
>
        <v-btn class="white--text" text title="fermer" @click="closeList"><v-icon>mdi-close</v-icon></v-btn>
        Utilisateurs de bdtek
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
          loading-text="chargement des utilisateurs"
          :headers="headersUsers"
          :items="users"
          :search="search"
          :items-per-page="20"
          :footer-props="{
            showFirstLastPage: false,
            itemsPerPageOptions: [20, 50, 100]
          }"
          item-key="userId"
          fixed-header
          class="elevation-1 users-list"
          :sort-by="['displayName']"
          @click:row="hop"
>
        </v-data-table>
      </v-card>
</template>

<script>
export default {
  emits: ['close-dialog'],
  data () {
    return {
      search: '',
      alert: false,
      headersUsers: [
        {
          value: 'displayName',
          text: 'Surnom',
          minWidth: '20em'
        }
      ]
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
    },
    users () {
      return this.$store.state.users
    }
  },
  created () {
    this.$store.dispatch('fetchUsers')
  },
  methods: {
    clearSearch () {
      this.search = ''
    },
    hop (row) {
      if (this.$route.params.uid === undefined || this.$route.params.uid !== row.userId) {
        this.$router.push('/user/' + row.userId + '?name=' + row.displayName)
      }
      this.closeList()
    },
    closeList () {
      this.$emit('close-dialog')
    }
  }
}
</script>
