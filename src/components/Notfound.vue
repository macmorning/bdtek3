<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="8" xl="6" offset-lg="2" offset-xl="3">
        <v-card>
          <v-banner
              style="top:0px;"
              sticky
              single-line
              class="blue-grey lighten-1  white--text">
            <v-btn class="white--text" text @click="returnToHome" title="retour"><v-icon>mdi-backburger</v-icon></v-btn>
            Page non trouvée
            </v-banner>

          <v-card-text>
            <v-container>
              {{ url }}
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
      url: null
    }
  },
  created () {
    this.url = this.$route.fullPath
  },
  methods: {
    returnToHome () {
      this.$router.push('/')
    }
  }
}
</script>
