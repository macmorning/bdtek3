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
              <v-expansion-panel-header>S'enregistrer avec Google</v-expansion-panel-header>
              <v-expansion-panel-content class="my-5">
                <v-btn class="blue-grey lighten-1 white--text" :disabled="isLoading" :loading="isLoading" @click="goToGoogle">Se connecter</v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>Ou avec une adresse email</v-expansion-panel-header>
              <v-expansion-panel-content class="my-5">
                <v-form @submit.prevent="userSignUp">
                    <v-text-field
                      id="email"
                      v-model="email"
                      name="email"
                      label="Email"
                      type="email"
                      required
></v-text-field>
                    <v-text-field
                      id="password"
                      v-model="password"
                      name="password"
                      label="Mot de passe"
                      type="password"
                      required
></v-text-field>
                    <v-text-field
                      id="confirmPassword"
                      v-model="passwordConfirm"
                      name="confirmPassword"
                      label="Confirmation du mot de passe"
                      type="password"
                      :rules="[comparePasswords]"
                      required
                      ></v-text-field>
                </v-form>
                <v-btn class="blue-grey lighten-1 white--text" type="submit" :disabled="isLoading" :loading="isLoading" @click="userSignUp">S'enregistrer</v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      email: '',
      displayName: '',
      password: '',
      passwordConfirm: '',
      alert: false
    }
  },
  computed: {
    comparePasswords () {
      return this.password === this.passwordConfirm ? true : 'Les mots de passe ne correspondent pas'
    },
    isLoading () {
      return this.$store.state.loading
    },
    error () {
      return this.$store.state.error
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
    userSignUp () {
      if (this.comparePasswords !== true) {
        return
      }
      this.$store.dispatch('userSignUp', { email: this.email, password: this.password })
    },
    goToGoogle () {
      this.$store.dispatch('userSignInGoogle')
    }
  }
}
</script>
