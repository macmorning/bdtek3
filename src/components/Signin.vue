<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 xl3>
      <v-card class="elevation-12 text-center">
        <v-avatar class="blue-grey lighten-1">
          <v-icon class="white--text" top>mdi-lock</v-icon>
        </v-avatar>
        <v-card-text>
          <v-expansion-panels popout>
            <v-expansion-panel>
              <v-expansion-panel-header>S'authentifier avec Google</v-expansion-panel-header>
              <v-expansion-panel-content class="my-5">
                <v-btn class="blue-grey lighten-1 white--text" :disabled="isLoading" :loading="isLoading" @click="goToGoogle">Se connecter</v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Ou avec une adresse email</v-expansion-panel-header>
              <v-expansion-panel-content class="my-5">
                <v-form @submit.prevent="userSignIn">
                  <v-text-field
                    id="email"
                    v-model="email"
                    name="email"
                    label="Email"
                    type="email"
                    required
                    @keyup.enter="userSignIn"
></v-text-field>
                  <v-text-field
                    id="password"
                    v-model="password"
                    name="password"
                    label="Mot de passe"
                    type="password"
                    required
                    append-outer-icon="mdi-comment-question-outline"
                    @keyup.enter="userSignIn" @click:append-outer="goToReset"
                  ></v-text-field>
                </v-form>
                <v-btn class="blue-grey lighten-1 white--text" type="submit" :disabled="isLoading" :loading="isLoading" @click="userSignIn">Se connecter</v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <p class="mt-8"><a color="secondary" @click="goToSignUp">Pas de compte ? S'enregistrer</a></p>
</v-card-text>
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
  }
}
</script>
