<template>
    <v-row>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.uid" label="ISBN" readonly></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.title" label="Titre" :readonly="readonly"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
            <v-combobox
              v-model="editedItem.series"
              :items="series"
              label="Série"
              :readonly="readonly"
            ></v-combobox>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.volume" label="Volume" :readonly="readonly"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.author" label="Auteur(s)" :readonly="readonly"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.imageURL" :readonly="readonly" label="Image" append-outer-icon="mdi-link-variant" @click:append-outer="openImage"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field
            v-if="readonly"
            v-model="editedItem.published"
            label="Date de publication"
            prepend-icon="mdi-calendar"
            readonly
          ></v-text-field>
          <v-menu
            v-if="!readonly"
            v-model="publishedMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on }">
              <v-text-field
                v-model="editedItem.published"
                label="Date de publication"
                prepend-icon="mdi-calendar"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="editedItem.published" @input="publishedMenu = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" lg="6">
            <v-combobox
              v-model="editedItem.publisher"
              :items="publishers"
              label="Editeur"
              :readonly="readonly"
            ></v-combobox>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.edition" :readonly="readonly" label="Détails sur l'édition"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field
            v-if="readonly"
            v-model="editedItem.dateAdded"
            label="Date d'ajout"
            prepend-icon="mdi-calendar"
            readonly
          ></v-text-field>
          <v-menu
            v-if="!readonly"
            v-model="dateAddedMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on }">
              <v-text-field
                v-model="editedItem.dateAdded"
                label="Date d'ajout"
                prepend-icon="mdi-calendar"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="editedItem.dateAdded" @input="dateAddedMenu = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.detailsURL" :readonly="readonly" label="Lien externe" append-outer-icon="mdi-link-variant" @click:append-outer="openDetails"></v-text-field>
        </v-col>
    </v-row>
</template>

<script>
export default {
  props: {
    readonly: Boolean
  },
  data: function () {
    return {
      publishedMenu: false,
      dateAddedMenu: false
    }
  },
  computed: {
    editedItem () {
      return this.$store.state.currentBook
    },
    series () {
      return this.$store.state.series
    },
    publishers () {
      return this.$store.state.publishers
    }
  },
  watch: {
    editemItem (val) {
      console.log(val)
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
