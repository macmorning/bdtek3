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
      console.log("removeBook")
      console.log(payload)
    },
    addBook (state, payload) {
      state.books.push(payload)
    },
    updateBook (state, payload) {
      // trouver la position du livre modifié dans le tableau des livres actuel
      let pos = state.books.map(function(e) { return e.uid }).indexOf(payload.key)
      console.log(state.books[pos].title)
      if (pos > -1) {
        state.books[pos].title = payload.val().title
      }
      console.log(state.books[pos].title)
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
          this.dispatch('initBooks', firebaseUser.user)
          router.push('/home')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    autoSignIn ({ commit }, payload) {
      commit('setUser', { email: payload.email, uid: payload.uid })
      router.push('/home')
      this.dispatch('initBooks', payload)
    },
    userSignOut ({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
      router.push('/')
    },
    initBooks ({ commit }, payload) {
      commit('setLoading', true)

      firebase.database().ref(`bd/${payload.uid}`).orderByChild('computedOrderField').limitToFirst(1000).on('child_added', (snapshot) => {
        let book = snapshot.val()
        
        if (book['uid'] === undefined) {
            book['uid'] = snapshot.key
        }
        commit('addBook', book);

        /*let seriesArray = [...new Set(Object.keys(booksObject).map(key => booksObject[key].series))]
        seriesArray = seriesArray.filter(el => el)
        seriesArray.sort()
        let publishersArray = [...new Set(Object.keys(booksObject).map(key => booksObject[key].publisher))]
        publishersArray = publishersArray.filter(el => el)
        publishersArray.sort()
        commit('setBooks', booksArray)
        commit('setSeries', seriesArray)
        commit('setPublishers', publishersArray)*/
      })

      firebase.database().ref(`bd/${payload.uid}`).on("child_removed", (snapshot) => {
        commit('removeBook', snapshot)
      })
      firebase.database().ref(`bd/${payload.uid}`).on("child_changed", (snapshot) => {
        commit('updateBook', snapshot)
      })
      commit('setLoading', false)
    },
    deleteCurrentBook ({ commit }, book) {
      if (book !== undefined && book.uid !== undefined && book.uid !== '') {
        commit('setLoading', true)
        firebase.database().ref(`bd/${this.state.user.uid}/${book.uid}`).remove().then(() => {
          console.log('Remove succeeded.')
        })
          .catch((error) => {
            console.log('Remove failed: ' + error.message)
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
        book.computedOrderField = (book.series ? book.series + (book.volume ? '_' + book.volume.padStart(4, '0') : '') : '') + '_' + book.title
        firebase.database().ref(`bd/${this.state.user.uid}/${book.uid}`).update(book).then(() => {
          console.log('Update succeeded.')
        })
          .catch((error) => {
            console.log('Update failed: ' + error.message)
          })
          .finally(() => {
            commit('setCurrentBook', this.defaultBook)
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
