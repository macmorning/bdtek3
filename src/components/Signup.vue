<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 xl2>
      <v-card class="elevation-12 text-center">
        <v-avatar class="blue-grey lighten-1">
          <v-icon class="white--text" top>mdi-lock</v-icon>
        </v-avatar>
        <v-card-text>
          <p>
            <a v-on:click='goToGoogle'><h3>S'enregistrer avec</h3>
              <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"/>
            </a>
          </p>
          <h3>Ou avec une adresse email</h3>
          <v-form v-on:submit.prevent="userSignUp">
              <v-text-field
                name="email"
                label="Email"
                id="email"
                type="email"
                v-model="email"
                required></v-text-field>
              <v-text-field
                name="password"
                label="Mot de passe"
                id="password"
                type="password"
                v-model="password"
                required></v-text-field>
              <v-text-field
                name="confirmPassword"
                label="Confirmation du mdp"
                id="confirmPassword"
                type="password"
                v-model="passwordConfirm"
                :rules="[comparePasswords]"
                required
                ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue-grey lighten-1 white--text" type="submit"  @click="userSignUp" :disabled="isLoading" :loading="isLoading">S'enregistrer</v-btn>
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
