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
                    <v-text-field v-model="editedItem.author" label="Author"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="publishedMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="editedItem.published"
                        label="Published"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="editedItem.published" @input="publishedMenu = false"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.publisher" label="Publisher"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-text-field v-model="editedItem.edition" label="Edition"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="dateAddedMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    full-width
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="editedItem.dateAdded"
                        label="Added"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="editedItem.dateAdded" @input="dateAddedMenu = false"></v-date-picker>
                  </v-menu>
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
            :v-if="editedItem.imageURL"
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
      publishedMenu: false,
      dateAddedMenu: false
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
