<template>
    <v-container>
        <v-quagga :on-detected="onDetected" :reader-size="readerSize" :reader-types="readerTypes"></v-quagga>
    </v-container>
</template>

<script>
import Vue from 'vue'
import VueQuagga from 'vue-quaggajs'
Vue.use(VueQuagga)
export default {
  name: 'VueBarcode',
  props: {
    onDetected: Object
  },
  data () {
    return {
      readerSize: {
        width: 320,
        height: 240
      },
      readerTypes: ['ean_reader']
    }
  },
  methods: {
  }
}
</script>
