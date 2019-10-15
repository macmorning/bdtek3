<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 xl2>
      <v-card class="elevation-12 text-center">
        <v-avatar class="blue-grey lighten-1">
          <v-icon class="white--text" top>mdi-lock</v-icon>
        </v-avatar>
        <v-card-text>
          <p>
            <a @click='goToGoogle'><h3>S'authentifier avec</h3>
              <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"/>
            </a>
          </p>
          <h3>Ou avec une adresse email</h3>
          <v-form @submit.prevent="userSignIn">
              <v-text-field
                name="email"
                label="Email"
                id="email"
                type="email"
                v-model="email"
                @keyup.enter="userSignIn"
                required></v-text-field>
              <v-text-field
                name="password"
                label="Mot de passe"
                id="password"
                type="password"
                v-model="password"
                @keyup.enter="userSignIn"
                required></v-text-field>
          </v-form>
          <a color="secondary" @click='goToSignUp'>S'enregistrer</a><br/>
          <a color="secondary" @click='goToReset'>Oubli de mot de passe</a><br/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue-grey lighten-1 white--text" type="submit" @click="userSignIn" :disabled="isLoading" :loading="isLoading">Se connecter</v-btn>
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
    },
    goToGoogle () {
      this.$store.dispatch('userSignInGoogle')
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
