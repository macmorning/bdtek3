<template>
  <v-app>
    <v-app-bar app class="blue-grey lighten-1">
      <v-toolbar-title>
        <router-link to="/" tag="span" style="cursor: pointer"  class="white--text">
          {{ appTitle }}
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          text
          :title="item.title"
          class="white--text"
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path">
          <v-icon dark>{{ item.icon }}</v-icon>
        </v-btn>
         <v-menu
            v-if="isAuthenticated"
            bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                class="white--text"
                dark
                icon
                v-on="on"
              ><v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <v-btn title="partage" text @click="share">
                  <v-icon class="mr-3">mdi-share</v-icon> partage
                </v-btn>
              </v-list-item>
              <v-list-item>
                <v-btn title="déconnexion" text @click="userSignOut">
                  <v-icon class="mr-3">mdi-exit-to-app</v-icon> déconnexion
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>

      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <router-view id="root" :style="backgroundStyle"></router-view>
    </v-content>
    <v-snackbar
      v-model="snackError"
      bottom
      left
      multi-line
      color="error"
      :timeout="6000"
    >
      {{ error }}
    </v-snackbar>
    <v-snackbar
      v-model="snackSuccess"
      bottom
      left
      color="success"
      :timeout="3000"
    >
      {{ success }}
    </v-snackbar>
    <v-dialog
      v-model="shareDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Lien à partager</v-card-title>
        <v-card-text>
          <v-text-field ref='shareUrlField' readonly :value='shareUrl' append-outer-icon="mdi-clipboard-arrow-down" @click:append-outer="shareUrlCopy"></v-text-field>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      appTitle: 'BDTek',
      maxImgNum: 10,
      snackSuccess: false,
      snackError: false,
      shareDialog: false
    }
  },
  created () {
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    success () {
      return this.$store.state.success
    },
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    menuItems () {
      if (this.isAuthenticated) {
        return [
          { title: 'Bibliothèque', path: '/', icon: 'mdi-book-multiple' },
          { title: 'Options', path: '/options', icon: 'mdi-wrench' },
          { title: 'Utilisateurs', path: '/users', icon: 'mdi-account-multiple' }
        ]
      } else {
        return [
          { title: 'Connexion', path: '/signin', icon: 'mdi-lock-open' }
        ]
      }
    },
    backgroundStyle () {
      if (this.$store.state.options.bgRandom) {
        return {
          'background-position': 'center',
          'background-size': 'cover',
          'background-attachment': 'fixed',
          'background-image': 'url(/img/' + this.imgNumber + '.webp)',
          'min-height': '100%'
        }
      } else {
        return {
          'background-color': '#fafafa',
          'min-height': '100%'
        }
      }
    },
    imgNumber () {
      let num = ((Math.floor(Math.random() * Math.floor(this.maxImgNum))) + 1).toString().padStart(2, '0')
      return num
    },
    shareUrl () {
      if (!this.$store.state.user) { return false }
      let userId = this.$route.query.uid ? this.$route.query.uid : this.$store.state.user.uid
      let userName = this.$route.query.uid && this.$route.query.name ? this.$route.query.name : this.$store.state.user.displayName
      return (window.location.origin + '/?uid=' + userId + '&name=' + userName)
    }
  },
  watch: {
    error (value) {
      this.snackError = false
      if (value) {
        this.snackError = true
      }
    },
    success (value) {
      this.snackSuccess = false
      if (value) {
        this.snackSuccess = true
      }
    },
    snackError (value) {
      if (!value) {
        this.$store.commit('setError', null)
      }
    },
    snackSuccess (value) {
      if (!value) {
        this.$store.commit('setSuccess', null)
      }
    }
  },
  methods: {
    share () {
      this.shareDialog = true
    },
    shareUrlCopy () {
      this.$refs.shareUrlField.$refs.input.focus()
      this.$refs.shareUrlField.$refs.input.select()
      document.execCommand('copy')
      this.$store.commit('setSuccess', 'Lien copié dans le presse-papier')
    },
    userSignOut () {
      this.$store.dispatch('userSignOut')
    }
  }
}
</script>
