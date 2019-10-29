<template>
    <v-row>
        <v-col cols="10" offset="1" lg="8" offset-lg="1">
            <v-row>
              ISBN : {{editedItem.uid}}
            </v-row>
            <v-row>
              Titre : {{editedItem.title}}
            </v-row>
            <v-row>
              Série : {{editedItem.series}}
            </v-row>
            <v-row>
              Volume : {{editedItem.volume}}
            </v-row>
            <v-row>
              Auteur(s) :  {{editedItem.author}}
            </v-row>
            <v-row>
              Publié : {{editedItem.published}}
            </v-row>
            <v-row>
              Editeur : {{editedItem.publisher}}
            </v-row>
            <v-row>
              Edition : {{editedItem.edition}}
            </v-row>
            <v-row>
              Date d'ajout : {{editedItem.dateAdded}}
            </v-row>
        </v-col>
        <v-col cols="10" lg="2" offset="1" offset-lg="0">
            <v-img
              :v-if="editedItem.imageURL"
              :src="editedItem.imageURL ? editedItem.imageURL.toString() : ''"
              position="center"
              max-height="200px"
              class="elevation-3"
              @click="openImage"
              style="cursor:pointer;"
            >
            </v-img>
        </v-col>
    </v-row>
</template>

<script>
export default {
  props: ['readonly'],
  data: function () {
    return {
    }
  },
  methods: {
    openDetails () {
      window.open(this.$store.state.currentBook.detailsURL, '_blank')
    },
    openImage () {
      window.open(this.$store.state.currentBook.imageURL, '_blank')
    }
  },
  computed: {
    editedItem () {
      return this.$store.state.currentBook
    }
  }
}
</script>
