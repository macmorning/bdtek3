<template id="app-template">
  <v-app>
    <v-app-bar app class="blue-grey lighten-1">
      <v-toolbar-title>
        <router-link to="/" style="cursor: pointer" class="white--text">
          {{ appTitle }}
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          v-for="item in menuItems"
          :key="item.title"
          text
          :title="item.title"
          class="white--text"
          :to="item.path"
>
          <v-icon dark>{{ item.icon }}</v-icon>
        </v-btn>
        <v-btn
          v-if="isAuthenticated"
          text
          title="utilisateurs"
          class="white--text"
          @click="users"
>
          <v-icon dark>mdi-account-multiple</v-icon>
        </v-btn>
         <v-menu
            v-if="isAuthenticated"
            bottom
>
            <template #activator="{ on }">
              <v-btn
                class="white--text"
                dark
                icon
                v-on="on"
              >
<v-icon>mdi-dots-vertical</v-icon>
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

    <v-main>
      <router-view id="root" :style="backgroundStyle"></router-view>
    </v-main>
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
      <options @close-dialog="closeOptions" />
    </v-dialog>
    <v-dialog
      v-model="shareDialog"
      max-width="500"
    >
      <share @close-dialog="closeShare" />
    </v-dialog>
    <v-dialog
      v-model="usersDialog"
      max-width="700"
    >
      <users @close-dialog="closeUsers" />
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
      // Image de fond figee pour toute la session de page (jusqu'au prochain reload).
      // null tant qu'elle n'a pas encore ete tiree.
      bgImage: null,
      // true une fois qu'une couverture de la bibliotheque a ete retenue :
      // empeche tout nouveau tirage ensuite.
      bgLockedToCover: false,
      snackSuccess: false,
      snackError: false,
      shareDialog: false,
      optionsDialog: false,
      usersDialog: false
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
          'background-image': 'url(' + this.bgImage + ')',
          'min-height': '100%'
        }
      } else {
        return {
          'background-color': '#fafafa',
          'min-height': '100%'
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
    },
    // Des que les livres arrivent, on fige une couverture (une seule fois).
    '$store.state.books.length' (len) {
      if (len > 0 && !this.bgLockedToCover) {
        this.setBackgroundFromCover()
      }
    }
  },
  created () {
    // Image de fond figee pour toute la session de page.
    // On pose d'abord une image par defaut (au cas ou les livres ne chargent pas),
    // puis le watch sur books la remplace par une couverture des qu'elles arrivent.
    this.bgImage = this.defaultImage()
    if (this.$store.state.books.length > 0) {
      this.setBackgroundFromCover()
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
    },
    getRandomNumber (max) {
      return Math.floor(Math.random() * Math.floor(max)) + 1
    },
    // Une des images statiques /img/NN.webp (fallback quand aucune couverture).
    defaultImage () {
      return '/img/' + this.getRandomNumber(this.maxImgNum).toString().padStart(2, '0') + '.webp'
    },
    // Tente de retourner l'URL d'une couverture non vide de la bibliotheque,
    // ou null si aucune n'est trouvee apres quelques essais.
    pickCover () {
      const books = this.$store.state.books
      for (let iterations = 0; iterations < 5; iterations++) {
        const randURL = books[this.getRandomNumber(books.length) - 1].imageURL
        if (randURL) {
          return randURL
        }
      }
      return null
    },
    // Fige une couverture comme image de fond, definitivement pour la session.
    setBackgroundFromCover () {
      const cover = this.pickCover()
      if (cover) {
        this.bgImage = cover
        this.bgLockedToCover = true
      }
    }
  }
}
</script>
