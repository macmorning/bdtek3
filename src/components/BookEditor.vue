<template>
    <v-row>
        <v-col cols="12" md="6" lg="8">
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.title" label="Title"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.series" label="Series"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.volume" label="Volume"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.volume" label="Author"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.published" label="Published"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.publisher" label="Publisher"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.edition" label="Edition"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.detailsURL" label="External link" append-outer-icon="mdi-link-variant" @click:append-outer="openDetails"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.imageURL" label="Image URL" append-outer-icon="mdi-link-variant" @click:append-outer="openImage"></v-text-field>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12" md="6" lg="4">
            <v-img
            :src="editedItem.imageURL"
            position="center"
            contain
            max-height="500"
            @click="openImage"
            ></v-img>
        </v-col>
    </v-row>
</template>

<script>
export default {
  data: function () {
    return {
    }
  },
  methods: {
    openDetails () {
        window.open(this.$store.state.currentBook.detailsURL, '_blank');
    },
    openImage () {
        window.open(this.$store.state.currentBook.imageURL, '_blank');
    }
  },
  computed: {
    error () {
      return this.$store.state.error
    },
    isLoading () {
      return this.$store.state.loading
    },
    editedItem () {
      return this.$store.state.currentBook
    }
  },
  watch: {
    editedItem (value) {
      if (value) {
        console.log(value)
      }
    }
  }
}
</script>