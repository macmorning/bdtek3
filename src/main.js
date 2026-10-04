import { createApp } from 'vue'
import vuetify from '@/plugins/vuetify'
import './registerServiceWorker'
import router from './router'
import store from './store'
import firebase from './initFirebase'
import { onAuthStateChanged } from 'firebase/auth'
import '@/style/common.scss'
import App from './App.vue'

const auth = firebase.auth

// On retarde le montage de l'app jusqu'a connaitre l'etat d'authentification,
// afin que le premier rendu dispose deja de l'utilisateur courant.
const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    store.dispatch('doSignIn', firebaseUser)
  }
  createApp(App)
    .use(router)
    .use(store)
    .use(vuetify)
    .mount('#app')
  unsubscribe()
})
