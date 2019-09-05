<template>
  <v-row>
    <v-col cols="12" lg="8" offset-lg="2" xl="6" offset-xl="3">
      <v-card style="opacity:.8">
        <form @submit.prevent="userSignIn">
          <v-row>
            <v-col cols="10" offset="1">
              <v-text-field
                name="email"
                label="Email"
                id="email"
                type="email"
                v-model="email"
                required></v-text-field>
            </v-col>
            <v-col cols="10" offset="1">
              <v-text-field
                name="password"
                label="Password"
                id="password"
                type="password"
                v-model="password"
                required></v-text-field>
            </v-col>
            <v-col cols="10" offset="1">
              <v-btn color="primary" type="submit" :disabled="isLoading">Sign In</v-btn>
            </v-col>
          </v-row>
        </form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data () {
    return {
      email: '',
      password: '',
      alert: false
    }
  },
  methods: {
    userSignIn () {
      this.$store.dispatch('userSignIn', { email: this.email, password: this.password })
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
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
