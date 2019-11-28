<template>
    <v-row>
        <v-col cols="12">
            <v-row>
                <v-col cols="1">
                    <v-checkbox
                      v-model="multiEdit.seriesBool"
                    ></v-checkbox>
                </v-col>
                <v-col cols="11">
                    <v-combobox
                      :disabled="!multiEdit.seriesBool"
                      v-model="multiEdit.series"
                      :items="series"
                      label="Série"
                    ></v-combobox>
                </v-col>
                <v-col cols="1">
                    <v-checkbox
                      v-model="multiEdit.authorBool"
                    ></v-checkbox>
                </v-col>
                <v-col cols="11">
                    <v-text-field
                      :disabled="!multiEdit.authorBool"
                      v-model="multiEdit.author"
                      label="Auteur(s)">
                    </v-text-field>
                </v-col>
                <v-col cols="1">
                    <v-checkbox
                      v-model="multiEdit.publisherBool"
                    ></v-checkbox>
                </v-col>
                <v-col cols="11">
                    <v-combobox
                      :disabled="!multiEdit.publisherBool"
                      v-model="multiEdit.publisher"
                      :items="publishers"
                      label="Editeur"
                    ></v-combobox>
                </v-col>
            </v-row>
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
  },
  computed: {
    multiEdit () {
      return this.$store.state.multiEdit
    },
    series () {
      return this.$store.state.series
    },
    publishers () {
      return this.$store.state.publishers
    }
  }
}
</script>
