<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="8" xl="6" offset-lg="2" offset-xl="3">
        <v-card>
          <v-banner
              style="top:0px"
              sticky
              single-line
              class="blue-grey lighten-1  white--text">
            <v-btn class="white--text" text @click="closeList" title="retour"><v-icon>mdi-backburger</v-icon></v-btn>
            BDTek Users
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
              loading-text="Chargement en cours, veuillez patienter"
              :headers="headersUsers"
              :items="users"
              :search="search"
              :items-per-page="100"
              :footer-props="{
                showFirstLastPage: false,
                itemsPerPageOptions: [100, 200, 500]
              }"
              @click:row="hop"
              item-key="userId"
              fixed-header
              class="elevation-1 users-list"
              :sort-by="['displayName']">
            </v-data-table>
         </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
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
  created () {
    this.$store.dispatch('fetchUsers')
  },
  methods: {
    clearSearch () {
      this.search = ''
    },
    getLink (userId) {
      return '/?uid=' + userId
    },
    hop (row) {
      this.$router.push('/?uid=' + row.userId + '&name=' + row.displayName)
    },
    closeList () {
      this.$router.push('/')
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
    }
  }
}
</script>
