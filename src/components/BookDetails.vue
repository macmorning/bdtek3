<template>
    <v-row>
        <v-col cols="10" offset="1" md="8" offset-md="1">
            <v-row>
              <span class="blue-grey--text text--lighten-2">ISBN&nbsp;:&nbsp;</span>{{editedItem.uid}}
            </v-row>
            <v-row>
              <span class="blue-grey--text text--lighten-2">Titre&nbsp;:&nbsp;</span>{{editedItem.title}}
            </v-row>
            <v-row v-if="editedItem.series">
              <span class="blue-grey--text text--lighten-2">Série&nbsp;:&nbsp;</span>{{editedItem.series}}
            </v-row>
            <v-row v-if="editedItem.volume">
              <span class="blue-grey--text text--lighten-2">Volume&nbsp;:&nbsp;</span>{{editedItem.volume}}
            </v-row>
            <v-row v-if="editedItem.author">
              <span class="blue-grey--text text--lighten-2">Auteur(s)&nbsp;:&nbsp;</span>{{editedItem.author}}
            </v-row>
            <v-row v-if="editedItem.published">
              <span class="blue-grey--text text--lighten-2">Publié&nbsp;:&nbsp;</span>{{editedItem.published}}
            </v-row>
            <v-row v-if="editedItem.publisher">
              <span class="blue-grey--text text--lighten-2">Editeur&nbsp;:&nbsp;</span>{{editedItem.publisher}}
            </v-row>
            <v-row v-if="editedItem.edition">
              <span class="blue-grey--text text--lighten-2">Edition&nbsp;:&nbsp;</span>{{editedItem.edition}}
            </v-row>
            <v-row v-if="editedItem.dateAdded">
              <span class="blue-grey--text text--lighten-2">Date d'ajout&nbsp;:&nbsp;</span>{{editedItem.dateAdded}}
            </v-row>
        </v-col>
        <v-col class="d-none d-md-block" cols="2">
            <v-card flat tile class="d-flex"><img
              v-lazyload
              src="/img/loading.gif"
              aspect-ratio="1"
              :v-if="editedItem.imageURL"
              :data-src="editedItem.imageURL ? editedItem.imageURL.toString() : ''"
              data-err="/img/not_found.webp"
              position="center"
              max-height="200px"
              v-on:click.stop="openImage"
              style="cursor:pointer;"
            /></v-card>
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
