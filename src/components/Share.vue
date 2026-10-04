<template>
    <v-card>
      <v-toolbar color="blue-grey-lighten-1" density="comfortable">
        <v-btn icon title="fermer" @click="closeShare"><v-icon>mdi-close</v-icon></v-btn>
        <v-toolbar-title>Lien à partager</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-text-field readonly :model-value="shareUrl" append-icon="mdi-clipboard-arrow-down" @click:append="shareUrlCopy"></v-text-field>
        </v-container>
      </v-card-text>
    </v-card>
</template>

<script>
export default {
  emits: ['close-dialog'],
  data () {
    return {
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
    },
    shareUrl () {
      if (!this.$store.state.user) { return false }
      const userId = this.friendId ? this.friendId : this.$store.state.user.uid
      const userName = this.friendId && this.friendName ? this.friendName : this.$store.state.user.displayName
      return (window.location.origin + '/user/' + userId + '?name=' + userName)
    },
    friendId () {
      return this.$route.params.uid
    },
    friendName () {
      return (this.$route.query.name || 'unknown')
    }
  },
  methods: {
    shareUrlCopy () {
      const url = this.shareUrl
      if (!url) { return }
      navigator.clipboard.writeText(url)
        .then(() => {
          this.$store.commit('setSuccess', 'Lien copié dans le presse-papier')
        })
        .catch(() => {
          this.$store.commit('setError', 'Impossible de copier le lien')
        })
    },
    closeShare () {
      this.$emit('close-dialog')
    }
  }
}
</script>
