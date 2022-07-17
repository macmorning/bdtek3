import Vue from 'vue'
import vuetify from '@/plugins/vuetify'
import './registerServiceWorker'
import router from './router'
import store from './store'
import firebase from './initFirebase'
import { onAuthStateChanged } from 'firebase/auth'
import '@/style/Common'
import App from './App.vue'

Vue.config.productionTip = false;
// Vue.use(vuetify);
/* eslint-disable no-new */
const auth = firebase.auth;
/*const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    new Vue({
      vuetify,
      router,
      store,
      created () {
        if (firebaseUser) {
          store.dispatch('doSignIn', firebaseUser);
        }
      },
      render: h => h(App)
    }).$mount('#app')
    unsubscribe();
  });*/

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
