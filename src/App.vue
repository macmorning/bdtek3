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
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      appTitle: 'BDTek v3'
    }
  },
  computed: {
    isAuthenticated () {
      return this.$store.getters.isAuthenticated
    },
    menuItems () {
      if (this.isAuthenticated) {
        return [
          { title: 'Home', path: '/home', icon: 'mdi-home' }
        ]
      } else {
        return [
          { title: 'Sign Up', path: '/signup', icon: 'mdi-face' },
          { title: 'Sign In', path: '/signin', icon: 'mdi-lock-open' }
        ]
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
