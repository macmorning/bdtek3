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
        <v-btn v-if="isAuthenticated" title="Déconnexion" class="white--text" text @click="userSignOut">
          <v-icon dark>mdi-exit-to-app</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <router-view id="root" :style="backgroundStyle"></router-view>
    </v-content>
    <v-snackbar
      v-model="snackError"
      bottom
      multi-line
      color="error"
      :timeout="6000"
    >
      {{ error }}
    </v-snackbar>
    <v-snackbar
      v-model="snackSuccess"
      bottom
      color="success"
      :timeout="3000"
    >
      {{ success }}
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      appTitle: 'BDTek v3',
      maxImgNum: 10,
      snackSuccess: false,
      snackError: false
    }
  },
  created () {
    if (localStorage.getItem('style.bgRandom') == null) {
      localStorage.setItem('style.bgRandom', true)
    }
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
    bgRandom () {
      return (localStorage.getItem('style.bgRandom') === 'true' || localStorage.getItem('style.bgRandom') === null)
    },
    imgNumber () {
      let num = ((Math.floor(Math.random() * Math.floor(this.maxImgNum))) + 1).toString().padStart(2, '0')
      return num
    },
    backgroundStyle () {
      if (this.bgRandom) {
        return {
          'background-position': 'center',
          'background-size': 'cover',
          'background-attachment': 'fixed',
          'min-height': '100%',
          'background-image': 'url(/img/' + this.imgNumber + '.png)'
        }
      } else {
        return {
          'background-color': '#eee'
        }
      }
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
    userSignOut () {
      this.$store.dispatch('userSignOut')
    }
  }
}
</script>
