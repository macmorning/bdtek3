import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import router from '@/router'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    user: null,
    error: null,
    loading: false,
    books: []
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    setBooks (state, payload) {
      state.books = payload
    }
  },
  actions: {
    userSignUp ({ commit }, payload) {
      commit('setLoading', true)
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(firebaseUser => {
          commit('setUser', { email: firebaseUser.user.email })
          commit('setLoading', false)
          router.push('/home')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    userSignIn ({ commit }, payload) {
      commit('setLoading', true)
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(firebaseUser => {
          commit('setUser', { email: firebaseUser.user.email, uid: firebaseUser.user.uid })
          commit('setLoading', false)
          commit('setError', null)
          this.dispatch('fetchBooks', firebaseUser.user)
          router.push('/home')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    autoSignIn ({ commit }, payload) {
      commit('setUser', { email: payload.email, uid: payload.uid })
      this.dispatch('fetchBooks', payload)
    },
    userSignOut ({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
      router.push('/')
    },
    fetchBooks ({ commit }, payload) {
      commit('setLoading', true)

      firebase.database().ref(`bd/${payload.uid}`).limitToFirst(500).once('value').then(function (snapshot) {
        let booksArray = []
        let booksObject = snapshot.val()
        Object.keys(booksObject).forEach((key) => {
          // rattrage de données au cas où le livre aurait été créé sans l'attribut uid
          if (booksObject[key]['uid'] === undefined) {
            booksObject[key]['uid'] = key
          }
          booksArray.push(booksObject[key])
        })
        commit('setBooks', booksArray)
        commit('setLoading', false)
      })
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.user !== null && state.user !== undefined
    }
  }
})
