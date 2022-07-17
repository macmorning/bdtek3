<template>
    <v-card>
      <v-banner
          style="top:0px;"
          sticky
          single-line
          class="blue-grey lighten-1  white--text"
>
        <v-btn class="white--text" text title="fermer" @click="closeShare"><v-icon>mdi-close</v-icon></v-btn>
        Lien à partager
      </v-banner>
      <v-card-text>
        <v-container>
          <v-text-field ref="shareUrlField" readonly :value="shareUrl" append-outer-icon="mdi-clipboard-arrow-down" @click:append-outer="shareUrlCopy"></v-text-field>
        </v-container>
      </v-card-text>
    </v-card>
</template>

<script>
export default {
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
      this.$refs.shareUrlField.$refs.input.focus()
      this.$refs.shareUrlField.$refs.input.select()
      document.execCommand('copy')
      this.$store.commit('setSuccess', 'Lien copié dans le presse-papier')
    },
    closeShare () {
      this.$emit('close-dialog')
    }
  }
}
</script>
