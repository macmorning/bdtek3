<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4 xl2>
      <v-card class="elevation-12 text-center">
        <v-avatar class="blue-grey lighten-1">
          <v-icon class="white--text" top>mdi-lock</v-icon>
        </v-avatar>
        <v-card-text>
          <v-form @submit.prevent="userResetPwd">
              <v-text-field
                id="email"
                v-model="email"
                name="email"
                label="Email"
                type="email"
                required
></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue-grey lighten-1 white--text" type="submit" @click="userResetPwd">Envoyer un lien</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data () {
    return {
      email: ''
    }
  },
  computed: {
    isLoading () {
      return this.$store.state.loading
    }
  },
  watch: {
  },
  methods: {
    userResetPwd () {
      this.$store.dispatch('userResetPwd', { email: this.email })
    }
  }
}
</script>
