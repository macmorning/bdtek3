<template>
    <v-container>
        <v-quagga :onDetected="onDetected" :readerSize="readerSize" :readerTypes="readerTypes"></v-quagga>
    </v-container>
</template>

<script>
import Vue from 'vue'
import VueQuagga from 'vue-quaggajs'
Vue.use(VueQuagga)
export default {
  props: ['onDetected'],
  name: 'VueBarcode',
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
