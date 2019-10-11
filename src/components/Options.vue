<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6" offset="3">
        <v-card style="opacity:.8">
          <v-card-title>
            <div class="flex-grow-1">Configuration</div>
          </v-card-title>

         </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      alert: false
    }
  },
  created () {
  },
  methods: {
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
