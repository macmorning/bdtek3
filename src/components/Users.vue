<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="8" xl="6" offset-lg="2" offset-xl="3">
        <v-card style="opacity:.8">
          <v-card-title>
            <div class="flex-grow-1">BDTek Users</div>
          </v-card-title>
            <v-data-table
              :loading="isLoading"
              loading-text="Loading... Please wait"
              :headers="headersUsers"
              :items="users"
              :items-per-page="100"
              :footer-props="{
                showFirstLastPage: false,
                itemsPerPageOptions: [100, 200, 500]
              }"
              item-key="userId"
              fixed-header
              class="elevation-1"
              :sort-by="['displayName']">
              <template v-slot:item.actions="{ item }">
                <a class="mr-2" :href="getLink(item.userId)"><v-icon>mdi-link-variant</v-icon></a>
              </template>
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
      alert: false,
      headersUsers: [
        {
          value: 'displayName',
          text: 'Name',
          minWidth: '20em'
        }, {
          value: 'actions',
          text: 'Link',
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
    getLink (userId) {
      return '/?uid=' + userId
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
