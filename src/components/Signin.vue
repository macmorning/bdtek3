<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 xl2>
      <v-card class="elevation-12 text-center">
        <v-avatar class="blue-grey lighten-1">
          <v-icon class="white--text" top>mdi-lock</v-icon>
        </v-avatar>
        <v-card-text>
          <v-form v-on:submit.prevent="userSignIn">
              <v-text-field
                name="email"
                label="Email"
                id="email"
                type="email"
                v-model="email"
                v-on:keyup.enter="userSignIn"
                required></v-text-field>
              <v-text-field
                name="password"
                label="Password"
                id="password"
                type="password"
                v-model="password"
                v-on:keyup.enter="userSignIn"
                required></v-text-field>
          </v-form>
          <a color="secondary" v-on:click='goToSignUp'>Sign up!</a><br/>
          <a color="secondary" v-on:click='goToReset'>Forgot password?</a>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue-grey lighten-1 white--text" type="submit" @click="userSignIn" :disabled="isLoading">Sign In</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import router from '@/router'
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
      if (!this.$store.isLoading) {
        this.$store.dispatch('userSignIn', { email: this.email, password: this.password })
      }
    },
    goToReset () {
      router.push('/reset')
    },
    goToSignUp () {
      router.push('/signup')
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
