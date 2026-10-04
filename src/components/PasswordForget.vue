<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" xl="2">
        <v-card class="elevation-12 text-center">
          <v-avatar color="blue-grey-lighten-1">
            <v-icon class="text-white">mdi-lock</v-icon>
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
            <v-btn class="bg-blue-grey-lighten-1 text-white" type="submit" @click="userResetPwd">Envoyer un lien</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
