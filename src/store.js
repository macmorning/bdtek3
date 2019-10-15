import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import router from '@/router'

Vue.use(Vuex)

export default new Vuex.Store({
  data () {
    return {
    }
  },
  state: {
    users: [],
    user: null,
    error: null,
    success: null,
    loading: false,
    friendBooks: [],
    books: [],
    series: [],
    publishers: [],
    currentBook: {},
    selectedBooks: [],
    multiEdit: {
      series: null,
      author: null,
      publisher: null
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
    setSelectedBooks (state, payload) {
      state.selectedBooks = payload
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
      if (pos === -1) {
        state.books.push(payload)
        if (state.series.indexOf(payload.series) === -1) {
          state.series.push(payload.series)
          state.series.sort()
        }
        if (state.publishers.indexOf(payload.publisher) === -1) {
          state.publishers.push(payload.publisher)
          state.publishers.sort()
        }
      }
    },
    updateBook (state, payload) {
      // trouver la position du livre modifié dans le tableau des livres actuel
      let pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
      let book = payload.val()
      if (pos > -1 && state.books[pos].uid === book.uid) {
        state.books[pos] = Object.assign(state.books[pos], book)
      }
      if (state.currentBook['uid'] === book['uid']) {
        state.currentBook = Object.assign(state.currentBook, book)
      }
    },
    resetBooks (state) {
      state.currentBook = {}
      state.books = []
      state.publishers = []
      state.series = []
    },
    setUsers (state, payload) {
      state.users = []
      for (let key in payload) {
        if (payload[key].visibleToAll === undefined || payload[key].visibleToAll === true) {
          state.users.push({
            userId: key,
            displayName: payload[key].displayName
          })
        }
      }
    },
    setFriendBooks (state, payload) {
      state.friendBooks = []
      for (let key in payload) {
        payload[key].uid = key
        state.friendBooks.push(payload[key])
      }
    }
  },
  actions: {
    userResetPwd ({ commit }, payload) {
      commit('setLoading', true)
      firebase.auth().sendPasswordResetEmail(payload.email)
        .then(() => {
          commit('setLoading', false)
          commit('setSuccess', 'Email envoyé')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    userSignUp ({ commit }, payload) {
      commit('setLoading', true)
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(firebaseUser => {
          let defaultDisplayName = firebaseUser.user.email.substring(0, firebaseUser.user.email.indexOf('@'))
          firebase.auth().currentUser.updateProfile({ displayName: defaultDisplayName })
          firebase.database().ref(`bd/${firebaseUser.user.uid}`).set(true).then(() => {
            commit('setUser', { email: firebaseUser.user.email, uid: firebaseUser.user.uid, displayName: defaultDisplayName })
            commit('setSuccess', 'Votre compte a été créé. Bienvenue !')
            router.push('/')
          })
            .catch(error => {
              commit('setError', error.message)
            })
        })
        .catch(error => {
          commit('setError', error.message)
        })
        .finally(() => {
          commit('setLoading', false)
        })
    },
    userSignIn ({ dispatch, commit }, payload) {
      commit('setLoading', true)
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password).then(firebaseUser => {
        dispatch('autoSignIn', firebaseUser.user)
        commit('setError', null)
        setTimeout(() => {
          router.push('/')
        }, 100)
      })
        .catch(error => {
          commit('setError', error.message)
        }).finally(() => {
          commit('setLoading', false)
        })
    },
    userSignInGoogle ({ dispatch, commit }) {
      commit('setLoading', true)
      let provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(provider).then((firebaseUser) => {
        dispatch('autoSignIn', firebaseUser.user)
        commit('setError', null)
        setTimeout(() => {
          router.push('/')
        }, 100)
      }).catch(error => {
        commit('setError', error.message)
      }).finally(() => {
        commit('setLoading', false)
      })
    },
    autoSignIn ({ commit }, payload) {
      let user = { uid: payload.uid, email: payload.email, displayName: payload.displayName, photoURL: payload.photoURL }
      commit('setUser', user)
      firebase.database().ref(`users/${payload.uid}`).once('value').then((snapshot) => {
        Object.assign(user, snapshot.val())
        if (user.visibleToAll === undefined) {
          user.visibleToAll = true
        }
        commit('setUser', user)
      })
    },
    userSignOut ({ commit }) {
      firebase.auth().signOut()
      commit('resetBooks')
      commit('setUser', null)
      commit('setSelectedBooks', [])
      router.push('/Signin')
    },
    userUpdate ({ commit }, payload) {
      commit('setUser', payload)
      firebase.auth().currentUser.updateProfile({ displayName: payload.displayName }).then(() => {
        commit('setSuccess', 'Vos préférences sont enregistrées')
        firebase.database().ref(`users/${payload.uid}`).update({ displayName: payload.displayName, visibleToAll: payload.visibleToAll })
      }).catch((error) => {
        commit('setError', 'Vos préférences n\'ont pas été enregistrées : ' + error.message)
      })
    },
    fetchUsers ({ commit }, payload) {
      commit('setLoading', true)
      firebase.database().ref(`users`).orderByChild('displayName').once('value').then((snapshot) => {
        commit('setLoading', false)
        commit('setUsers', snapshot.val())
      })
    },
    fetchFriendBooks ({ commit }, uid) {
      commit('setLoading', true)
      firebase.database().ref(`bd/${uid}`).orderByChild('computedOrderField').limitToFirst(1000).once('value').then((snapshot) => {
        commit('setLoading', false)
        commit('setFriendBooks', snapshot.val())
      })
    },
    initBooks ({ commit }) {
      console.log(this.state.user)
      if (this.state.books.length > 0) {
        return false
      }
      commit('setLoading', true)
      let uid = this.state.user.uid
      firebase.database().ref(`bd/${uid}`).orderByChild('computedOrderField').limitToFirst(1000).on('child_added', (snapshot) => {
        let book = snapshot.val()
        if (book['uid'] === undefined) {
          book['uid'] = snapshot.key
        }
        commit('addBook', book)
      })

      firebase.database().ref(`bd/${uid}`).on('child_removed', (snapshot) => {
        commit('removeBook', snapshot)
      })
      firebase.database().ref(`bd/${uid}`).on('child_changed', (snapshot) => {
        commit('updateBook', snapshot)
      })
      commit('setLoading', false)
    },
    deleteCurrentBook ({ commit }, book) {
      if (book !== undefined && book.uid !== undefined && book.uid !== '') {
        commit('setLoading', true)
        firebase.database().ref(`bd/${this.state.user.uid}/${book.uid}`).remove().then(() => {
          commit('setSuccess', 'Livre retiré')
        })
          .catch((error) => {
            commit('setError', 'Livre non retiré : ' + error.message)
          })
          .finally(() => {
            commit('setLoading', false)
          })
      }
    },
    clearCurrentBook ({ commit }) {
      commit('setCurrentBook', {})
    },
    saveMultiBook ({ commit }) {
      this.state.selectedBooks.forEach((book) => {
        if (book.uid) {
          book.series = (this.state.multiEdit.series !== null ? this.state.multiEdit.series : book.series)
          book.publisher = (this.state.multiEdit.publisher !== null ? this.state.multiEdit.publisher : book.publisher)
          book.author = (this.state.multiEdit.author !== null ? this.state.multiEdit.author : book.author)
          commit('setCurrentBook', book)
          this.dispatch('saveCurrentBook')
        }
      })
    },
    saveNewBook ({ commit }, uid) {
      if (uid === undefined || !uid) {
        return false
      }
      let pos = this.state.books.map(function (e) { return e.uid }).indexOf(uid)
      if (pos > -1) {
        commit('setError', 'Un livre portant cette référence est déjà dans votre bibliothèque')
        return false
      }
      commit('setLoading', true)
      let book = {}
      book.uid = uid
      book.series = null
      book.needLookup = 1
      book.dateAdded = new Date().getUTCFullYear() + '-' + (new Date().getUTCMonth() + 1).toString().padStart(2, '0') + '-' + new Date().getUTCDate().toString().padStart(2, '0')
      try {
        firebase.database().ref(`bd/${this.state.user.uid}/${uid}`).set(book).then(() => {
          commit('setSuccess', 'Livre ajouté')
          commit('setCurrentBook', book)
        })
          .catch((error) => {
            commit('setError', 'Livre non ajouté : ' + error.message)
          })
          .finally(() => {
            commit('setLoading', false)
          })
      } catch (e) {
        commit('setError', 'Livre non ajouté : ' + e)
        commit('setLoading', false)
      }
    },
    saveCurrentBook ({ commit }) {
      let book = this.state.currentBook
      if (book === undefined || book.uid === undefined || !book.uid) {
        return false
      }
      commit('setLoading', true)
      book.computedOrderField = (book.series ? book.series + (book.volume ? '_' + book.volume.toString().padStart(4, '0') : '') : '') + '_' + book.title
      firebase.database().ref(`bd/${this.state.user.uid}/${book.uid}`).update(book).then(() => {
        commit('setSuccess', 'Livre enregistré')
      })
        .catch((error) => {
          commit('setError', 'Livre non enregistré: ' + error.message)
        })
        .finally(() => {
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
