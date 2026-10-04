<template>
  <div :style="background">
    <v-row no-gutters style="background:white;opacity:0.9;">
        <v-col cols="10" offset="1" md="8" offset-md="1" class="py-3">
            <div class="detail-line">
              <span class="blue-grey--text text--lighten-2">ISBN&nbsp;:&nbsp;</span>{{ editedItem.uid }}
            </div>
            <div class="detail-line">
              <span class="blue-grey--text text--lighten-2">Titre&nbsp;:&nbsp;</span>{{ editedItem.title }}
            </div>
            <div v-if="editedItem.series" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Série&nbsp;:&nbsp;</span>{{ editedItem.series }}
            </div>
            <div v-if="editedItem.volume" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Volume&nbsp;:&nbsp;</span>{{ editedItem.volume }}
            </div>
            <div v-if="editedItem.author" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Auteur(s)&nbsp;:&nbsp;</span>{{ editedItem.author }}
            </div>
            <div v-if="editedItem.published" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Publié&nbsp;:&nbsp;</span>{{ editedItem.published }}
            </div>
            <div v-if="editedItem.publisher" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Editeur&nbsp;:&nbsp;</span>{{ editedItem.publisher }}
            </div>
            <div v-if="editedItem.edition" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Edition&nbsp;:&nbsp;</span>{{ editedItem.edition }}
            </div>
            <div v-if="editedItem.dateAdded" class="detail-line">
              <span class="blue-grey--text text--lighten-2">Date d'ajout&nbsp;:&nbsp;</span>{{ editedItem.dateAdded }}
            </div>
        </v-col>
        <v-col class="d-none d-md-block py-3" cols="2">
            <v-img
              v-if="editedItem.imageURL.toString() !== '' && !imageError"
              :src="editedItem.imageURL.toString()"
              aspect-ratio="1"
              class="grey lighten-2"
              @click.stop="openImage"
              @error="imageError = true"
            >
              <template #placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-row
              v-else-if="editedItem.imageURL.toString() !== '' && imageError"
              class="ma-0 grey lighten-2"
              align="center"
              justify="center"
              style="aspect-ratio:1"
              title="Image indisponible"
            >
              <div class="text-center grey--text">
                <v-icon color="grey">mdi-image-broken-variant</v-icon>
                <div class="caption">Image indisponible</div>
              </div>
            </v-row>
        </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    readonly: Boolean
  },
  data: function () {
    return {
      imageError: false
    }
  },
  computed: {
    background () {
      if (this.$store.state.currentBook.imageURL) {
        return 'background-image:url("' + this.$store.state.currentBook.imageURL.toString() + '");background-position:center;background-size:cover;'
      } else {
        return ''
      }
    },
    editedItem () {
      return this.$store.state.currentBook
    }
  },
  watch: {
    'editedItem.imageURL' () {
      // nouvelle image : on repart d'un etat sain pour reafficher le loader
      this.imageError = false
    }
  },
  methods: {
    openDetails () {
      window.open(this.$store.state.currentBook.detailsURL, '_blank')
    },
    openImage () {
      window.open(this.$store.state.currentBook.imageURL, '_blank')
    }
  }
}
</script>

<style scoped>
.detail-line {
  padding: 2px 0;
  line-height: 1.4;
}
</style>
