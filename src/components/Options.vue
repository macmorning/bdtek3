<template>
    <v-card>
      <v-banner
          style="top:0px;"
          sticky
          single-line
          class="blue-grey lighten-1  white--text"
>
        <v-btn class="white--text" text title="fermer" @click="closeOptions"><v-icon>mdi-close</v-icon></v-btn>
        Vos préférences
        <template #actions>
          <v-btn class="white--text" text title="enregistrer" @click="saveOptions"><v-icon>mdi-floppy</v-icon></v-btn>
        </template>
      </v-banner>

      <v-card-text>
        <v-container>
            <v-text-field v-model="displayName" label="Surnom" hint="C'est sous ce nom que vous apparaissez dans la liste des utilisateurs." persistent-hint></v-text-field>
            <v-switch v-model="visibleToAll" label="Profil visible de tous" hint="Détermine si votre profil est public ou non. Même dans le cas contraire, tout le monde peut voir à votre bibliothèque à condition d'avoir l'url correcte." persistent-hint></v-switch>
            <v-switch v-model="bgRandom" label="Images de fond aléatoires" hint="Paramètre enregistré localement." persistent-hint></v-switch>
        </v-container>
      </v-card-text>
    </v-card>
</template>

<script>
export default {
  emits: ['close-dialog'],
  data () {
    return {
      user: {},
      displayName: '',
      visibleToAll: false,
      bgRandom: false,
      alert: false
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
    },
    storedUser () {
      return this.$store.state.user
    },
    storedOptions () {
      return this.$store.state.options
    }
  },
  created () {
    this.user = this.storedUser
    this.displayName = this.storedUser.displayName
    this.visibleToAll = this.storedUser.visibleToAll
    this.bgRandom = this.storedOptions.bgRandom
  },
  methods: {
    closeOptions () {
      this.$emit('close-dialog')
    },
    saveOptions () {
      this.user.displayName = this.displayName
      this.user.visibleToAll = this.visibleToAll
      this.$store.dispatch('userUpdate', this.user)
      this.$store.commit('setOptionBgRandom', this.bgRandom)
      this.closeOptions()
    }
  }
}
</script>
