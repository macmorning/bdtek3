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
          class="white--text"
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path">
          <v-icon left dark>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
        <v-btn v-if="isAuthenticated" class="white--text" text @click="userSignOut">
          <v-icon left>mdi-exit-to-app</v-icon>
          Sign Out
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-content>
      <router-view id="root" :style="{'background-position': 'center','background-size': 'cover','background-attachment': 'fixed','min-height': '100%','background-image':'url(/img/' + imgNumber + '.png)'}"></router-view>
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
          { title: 'Home', path: '/', icon: 'mdi-home' }
        ]
      } else {
        return [
          { title: 'Sign Up', path: '/signup', icon: 'mdi-face' },
          { title: 'Sign In', path: '/signin', icon: 'mdi-lock-open' }
        ]
      }
    },
    imgNumber () {
      let num = ((Math.floor(Math.random() * Math.floor(this.maxImgNum)))+1).toString().padStart(2, '0')
      return num
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
