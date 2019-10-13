<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="8" xl="6" offset-lg="2" offset-xl="3">
        <v-card style="opacity:.8">
          <v-banner
              style="top:0px;"
              sticky
              single-line
              class="blue-grey lighten-1  white--text">
            <v-btn class="white--text" text @click="closeOptions" title="back to home"><v-icon>mdi-backburger</v-icon></v-btn>
            Your preferences
            <template v-slot:actions>
              <v-btn class="white--text" text @click="saveOptions" title="save"><v-icon left>mdi-floppy</v-icon>Save</v-btn>
            </template>
            </v-banner>

          <v-card-text>
            <v-container>
                <v-text-field v-model="user.displayName" label="Displayed name"></v-text-field>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      user: {},
      alert: false
    }
  },
  created () {
    this.user = this.storedUser
  },
  methods: {
    closeOptions () {
      this.$router.push('/')
    },
    saveOptions () {
      this.$store.dispatch('userUpdate', this.user)
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
    storedUser () {
      return this.$store.state.user
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
