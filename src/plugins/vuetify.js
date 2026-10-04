import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

// En Vuetify 3, les composants/directives sont auto-importes via
// webpack-plugin-vuetify (voir vue.config.js). On ne declare donc ici
// que la configuration globale (jeu d'icones MDI).
export default createVuetify({
  icons: {
    defaultSet: 'mdi'
  },
  // En Vuetify 3 le variant par defaut des champs est 'filled' (fond grise).
  // On retablit le style facon Vuetify 2 : ligne simple + label flottant anime.
  defaults: {
    VTextField: { variant: 'underlined' },
    VCombobox: { variant: 'underlined' },
    VSelect: { variant: 'underlined' },
    VTextarea: { variant: 'underlined' },
    VAutocomplete: { variant: 'underlined' }
  }
})
