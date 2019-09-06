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
    success: null,
    loading: false,
    books: [],
    series: [],
    publishers: [],
    currentBook: {},
    defaultBook: {
      uid: '',
      title: '',
      series: '',
      author: '',
      dataAdded: '',
      edition: '',
      published: '',
      publisher: '',
      computedOrderField: '',
      detailsURL: '',
      imageURL: ''
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    setSuccess (state, payload) {
      state.success = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    setBooks (state, payload) {
      state.books = payload
    },
    setSeries (state, payload) {
      if (payload.length > 1) {
        payload.sort()
      }
      state.series = payload
    },
    setPublishers (state, payload) {
      if (payload.length > 1) {
        payload.sort()
      }
      state.publishers = payload
    },
    setCurrentBook (state, payload) {
      state.currentBook = Object.assign({}, payload)
    },
    removeBook (state, payload) {
      // trouver la position du livre modifié dans le tableau des livres actuel
      let pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
      let book = payload.val()

      if (pos > -1 && state.books[pos].uid === book.uid) {
        delete state.books.splice(pos, 1)
      }
    },
    addBook (state, payload) {
      let pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
      console.log(payload.key + " / " + pos)
      if (pos === -1) {
        state.books.push(payload)
      }
    },
    updateBook (state, payload) {
      // trouver la position du livre modifié dans le tableau des livres actuel
      let pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
      let book = payload.val()
      if (pos > -1 && state.books[pos].uid === book.uid) {
        state.books[pos] = Object.assign(state.books[pos], book)
      }
    },
    resetBooks (state) {
      state.currentBook = {}
      state.books = []
      state.publishers = []
      state.series = []
    }
  },
  actions: {
    userSignUp ({ commit }, payload) {
      commit('setLoading', true)
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(firebaseUser => {
          commit('setUser', { email: firebaseUser.user.email })
          commit('setLoading', false)
          router.push('/')
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
          this.dispatch('initBooks', firebaseUser.user)
          router.push('/')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    autoSignIn ({ commit }, payload) {
      commit('setUser', { email: payload.email, uid: payload.uid })
      router.push('/')
      this.dispatch('initBooks', payload)
    },
    userSignOut ({ commit }) {
      firebase.auth().signOut()
      commit('resetBooks')
      commit('setUser', null)
      router.push('/Signin')
    },
    initBooks ({ commit }, payload) {
      commit('setLoading', true)

      firebase.database().ref(`bd/${payload.uid}`).orderByChild('computedOrderField').limitToFirst(1000).on('child_added', (snapshot) => {
        let book = snapshot.val()

        if (book['uid'] === undefined) {
          book['uid'] = snapshot.key
        }
        commit('addBook', book)
      })

      firebase.database().ref(`bd/${payload.uid}`).on('child_removed', (snapshot) => {
        commit('removeBook', snapshot)
      })
      firebase.database().ref(`bd/${payload.uid}`).on('child_changed', (snapshot) => {
        commit('updateBook', snapshot)
      })
      commit('setLoading', false)
    },
    deleteCurrentBook ({ commit }, book) {
      if (book !== undefined && book.uid !== undefined && book.uid !== '') {
        commit('setLoading', true)
        firebase.database().ref(`bd/${this.state.user.uid}/${book.uid}`).remove().then(() => {
          commit('setSuccess', 'Book removed')
        })
          .catch((error) => {
            commit('setError', 'Book not removed: ' + error.message)
          })
          .finally(() => {
            commit('setLoading', false)
          })
      }
    },
    clearCurrentBook ({ commit }) {
      commit('setCurrentBook', this.defaultBook)
    },
    saveCurrentBook ({ commit }) {
      let book = this.state.currentBook
      if (book !== undefined && book.uid !== undefined && book.uid !== '') {
        commit('setLoading', true)
        book.computedOrderField = (book.series ? book.series + (book.volume ? '_' + book.volume.toString().padStart(4, '0') : '') : '') + '_' + book.title
        firebase.database().ref(`bd/${this.state.user.uid}/${book.uid}`).update(book).then(() => {
          commit('setSuccess', 'Book saved')
        })
          .catch((error) => {
            commit('setError', 'Book not saved: ' + error.message)
          })
          .finally(() => {
            commit('setLoading', false)
          })
      }
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.user !== null && state.user !== undefined
    }
  }
})
