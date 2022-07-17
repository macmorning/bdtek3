import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import router from './router'
import store from './store'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import '@/style/Common'

const config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID
}
initializeApp(config)
Vue.config.productionTip = false

/* eslint-disable no-new */
const auth = getAuth();
const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    new Vue({
      el: '#app',
      vuetify,
      router,
      store,
      created () {
        if (firebaseUser) {
          store.dispatch('doSignIn', firebaseUser)
        }
      },
      render: h => h(App)
    })
    unsubscribe()
  })
