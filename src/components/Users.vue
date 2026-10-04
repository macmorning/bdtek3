<template>
    <v-card>
      <v-toolbar color="blue-grey-lighten-1" density="comfortable">
        <v-btn icon title="fermer" @click="closeList"><v-icon>mdi-close</v-icon></v-btn>
        <v-toolbar-title>Utilisateurs de bdtek</v-toolbar-title>
      </v-toolbar>
      <v-card-title>
        <div class="flex-grow-1"></div>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Recherche"
            single-line
            hide-details
            clearable
            @click:clear="clearSearch"
          ></v-text-field>
      </v-card-title>
        <v-data-table
          :loading="isLoading"
          loading-text="chargement des utilisateurs"
          :headers="headersUsers"
          :items="users"
          :search="search"
          :items-per-page="20"
          item-value="userId"
          fixed-header
          class="elevation-1 users-list"
          :sort-by="[{ key: 'displayName', order: 'asc' }]"
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
          key: 'displayName',
          title: 'Surnom',
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
      return this.$store.state.usersLoading
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
    hop (event, { item }) {
      const row = item
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
