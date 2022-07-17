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
                      v-model="multiEdit.series"
                      :disabled="!multiEdit.seriesBool"
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
                      v-model="multiEdit.author"
                      :disabled="!multiEdit.authorBool"
                      label="Auteur(s)"
>
                    </v-text-field>
                </v-col>
                <v-col cols="1">
                    <v-checkbox
                      v-model="multiEdit.publisherBool"
                    ></v-checkbox>
                </v-col>
                <v-col cols="11">
                    <v-combobox
                      v-model="multiEdit.publisher"
                      :disabled="!multiEdit.publisherBool"
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
  },
  methods: {
  }
}
</script>
