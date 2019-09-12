import Vue from 'vue'
import Vuetify, {
  VCard,
  VToolbar
} from 'vuetify/lib'
import { Ripple } from 'vuetify/lib/directives'

Vue.use(Vuetify, {
  components: {
    VCard,
    VToolbar
  },
  directives: {
    Ripple
  }
})

const opts = {}

export default new Vuetify(opts)
