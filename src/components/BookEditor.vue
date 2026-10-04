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
            <v-text-field v-model="editedItem.imageURL" :readonly="readonly" label="Image" append-icon="mdi-link-variant" @click:append="openImage"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field
            v-model="publishedDate"
            label="Date de publication"
            prepend-icon="mdi-calendar"
            :readonly="readonly"
            placeholder="AAAA-MM-JJ"
            :rules="dateRules"
            @blur="normalizePublished"
          ></v-text-field>
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
            v-model="addedDate"
            label="Date d'ajout"
            prepend-icon="mdi-calendar"
            :readonly="readonly"
            placeholder="AAAA-MM-JJ"
            :rules="dateRules"
            @blur="normalizeAdded"
          ></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
            <v-text-field v-model="editedItem.detailsURL" :readonly="readonly" label="Lien externe" append-icon="mdi-link-variant" @click:append="openDetails"></v-text-field>
        </v-col>
    </v-row>
</template>

<script>
import { normalizeDate } from '../utils/date'

export default {
  props: {
    readonly: Boolean
  },
  data: function () {
    return {
      // Saisie brute locale des dates (edition libre, normalisee au blur)
      publishedDate: '',
      addedDate: '',
      // Validation du format de date : vide accepte, sinon YYYY-MM-DD strict
      dateRules: [
        v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Format attendu : AAAA-MM-JJ'
      ]
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
    // (Re)initialise la date locale quand la valeur du store change
    // (changement de livre, ou resultat de la recherche Internet via la loupe).
    // On n'ecrase pas la saisie en cours : la data locale ne suit le store que
    // lorsque ce dernier change reellement.
    'editedItem.published': {
      immediate: true,
      handler (val) {
        this.publishedDate = normalizeDate(val)
      }
    },
    'editedItem.dateAdded': {
      immediate: true,
      handler (val) {
        this.addedDate = normalizeDate(val)
      }
    }
  },
  methods: {
    // Normalisation differee : uniquement a la perte de focus, pas a chaque frappe.
    normalizePublished () {
      const n = normalizeDate(this.publishedDate)
      this.publishedDate = n
      this.editedItem.published = n
    },
    normalizeAdded () {
      const n = normalizeDate(this.addedDate)
      this.addedDate = n
      this.editedItem.dateAdded = n
    },
    openDetails () {
      window.open(this.$store.state.currentBook.detailsURL, '_blank')
    },
    openImage () {
      window.open(this.$store.state.currentBook.imageURL, '_blank')
    }
  }
}
</script>
