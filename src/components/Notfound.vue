<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="8" xl="6" offset-lg="2" offset-xl="3">
        <v-card>
          <v-toolbar color="blue-grey-lighten-1" density="comfortable">
            <v-btn icon title="retour" @click="returnToHome"><v-icon>mdi-backburger</v-icon></v-btn>
            <v-toolbar-title>Page non trouvée</v-toolbar-title>
          </v-toolbar>

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
