<template>
    <v-row>
        <v-col cols="12">
            <v-row>
                <v-col cols="12">
                    <v-combobox
                      v-model="multiEdit.series"
                      :items="series"
                      label="Series"
                    ></v-combobox>
                </v-col>
                <v-col cols="12">
                    <v-text-field v-model="multiEdit.author" label="Author"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-combobox
                      v-model="multiEdit.publisher"
                      :items="publishers"
                      label="Publisher"
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
