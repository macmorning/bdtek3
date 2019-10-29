<template>
    <v-row>
        <v-col cols="10" offset="1" lg="8" offset-lg="1">
            <v-row>
              ISBN : {{editedItem.uid}}
            </v-row>
            <v-row>
              Titre : {{editedItem.title}}
            </v-row>
            <v-row v-if="editedItem.series">
              Série : {{editedItem.series}}
            </v-row>
            <v-row v-if="editedItem.volume">
              Volume : {{editedItem.volume}}
            </v-row>
            <v-row v-if="editedItem.author">
              Auteur(s) :  {{editedItem.author}}
            </v-row>
            <v-row v-if="editedItem.published">
              Publié : {{editedItem.published}}
            </v-row>
            <v-row v-if="editedItem.publisher">
              Editeur : {{editedItem.publisher}}
            </v-row>
            <v-row v-if="editedItem.edition">
              Edition : {{editedItem.edition}}
            </v-row>
            <v-row v-if="editedItem.dateAdded">
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
              v-on:click.stop="openImage"
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
