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
        <v-btn
          v-if="isAuthenticated"
          text
          title="utilisateurs"
          class="white--text"
          @click="users">
          <v-icon dark>mdi-account-multiple</v-icon>
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
                <v-btn title="options" text @click="options">
                  <v-icon class="mr-3">mdi-wrench</v-icon> options
                </v-btn>
              </v-list-item>
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
      v-model="optionsDialog"
      max-width="500"
    >
      <options v-on:close-dialog="closeOptions"/>
    </v-dialog>
    <v-dialog
      v-model="shareDialog"
      max-width="500"
    >
      <share v-on:close-dialog="closeShare"/>
    </v-dialog>
    <v-dialog
      v-model="usersDialog"
      max-width="700"
    >
      <users v-on:close-dialog="closeUsers"/>
    </v-dialog>
  </v-app>
</template>

<script>
import Options from '@/components/Options'
import Share from '@/components/Share'
import Users from '@/components/Users'
export default {
  components: {
    Options: Options,
    Share: Share,
    Users: Users
  },
  data () {
    return {
      appTitle: 'BDTek',
      maxImgNum: 10,
      snackSuccess: false,
      snackError: false,
      shareDialog: false,
      optionsDialog: false,
      usersDialog: false
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
          { title: 'Bibliothèque', path: '/', icon: 'mdi-book-multiple' }
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
    closeOptions () {
      this.optionsDialog = false
    },
    closeUsers () {
      this.usersDialog = false
    },
    closeShare () {
      this.shareDialog = false
    },
    share () {
      this.shareDialog = true
    },
    users () {
      this.usersDialog = true
    },
    options () {
      this.optionsDialog = true
    },
    userSignOut () {
      this.$store.dispatch('userSignOut')
    }
  }
}
</script>
