<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" xl="3">
        <v-card class="elevation-12 text-center">
          <v-avatar color="blue-grey-lighten-1">
            <v-icon class="text-white">mdi-lock</v-icon>
          </v-avatar>
          <v-card-text>
            <v-expansion-panels variant="popout">
              <v-expansion-panel>
                <v-expansion-panel-title>S'authentifier avec Google</v-expansion-panel-title>
                <v-expansion-panel-text class="my-5">
                  <v-btn class="bg-blue-grey-lighten-1 text-white" :disabled="isLoading" :loading="isLoading" @click="goToGoogle">Se connecter</v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
              <v-expansion-panel>
                <v-expansion-panel-title>Ou avec une adresse email</v-expansion-panel-title>
                <v-expansion-panel-text class="my-5">
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
                      append-icon="mdi-comment-question-outline"
                      @keyup.enter="userSignIn" @click:append="goToReset"
                    ></v-text-field>
                  </v-form>
                  <v-btn class="bg-blue-grey-lighten-1 text-white" type="submit" :disabled="isLoading" :loading="isLoading" @click="userSignIn">Se connecter</v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <p class="mt-8"><a style="cursor:pointer" @click="goToSignUp">Pas de compte ? S'enregistrer</a></p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
