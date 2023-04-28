import Vue from 'vue'
import Vuex from 'vuex'
import firebase from './initFirebase'
import { sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider, updateProfile } from 'firebase/auth'
import { ref, set, remove, off, onValue, query, orderByChild, get } from 'firebase/database'
import router from '@/router'

const auth = firebase.auth;
const database = firebase.database;
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
      seriesBool: false,
      author: null,
      authorBool: false,
      publisher: null,
      publisherBool: false
    },
    options: {
      bgRandom: true
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
      const pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
      const book = payload.val()

      if (pos > -1 && state.books[pos].uid === book.uid) {
        delete state.books.splice(pos, 1)
      }
    },
    setBooks (state, payload) {
      state.books = payload
      state.books.forEach((book) => {
        if (state.series.indexOf(book.series) === -1) {
          state.series.push(book.series)
          state.series.sort()
        }
        if (state.publishers.indexOf(book.publisher) === -1) {
          state.publishers.push(book.publisher)
          state.publishers.sort()
        }
      })
    },
    addBook (state, payload) {
      const pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
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
      const pos = state.books.map(function (e) { return e.uid }).indexOf(payload.key)
      const book = payload.val()
      if (pos > -1 && state.books[pos].uid === book.uid) {
        state.books[pos] = Object.assign(state.books[pos], book)
      }
      if (state.currentBook.uid === book.uid) {
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
      for (const key in payload) {
        if (payload[key].visibleToAll === undefined || payload[key].visibleToAll === true) {
          state.users.push({
            userId: key,
            displayName: payload[key].displayName
          })
        }
      }
    },
    setFriendBooks (state, payload) {
      state.friendBooks = payload
    },
    setOptionBgRandom (state, payload) {
      if (payload === undefined) {
        state.options.bgRandom = (localStorage.getItem('style.bgRandom') === 'true' || localStorage.getItem('style.bgRandom') === null)
      } else {
        localStorage.setItem('style.bgRandom', payload)
        state.options.bgRandom = payload
      }
    }
  },
  actions: {
    userResetPwd ({ commit }, payload) {
      commit('setLoading', true)
      sendPasswordResetEmail(auth, payload.email)
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
      createUserWithEmailAndPassword(auth, payload.email, payload.password)
        .then(firebaseUser => {
          const defaultDisplayName = firebaseUser.user.email.substring(0, firebaseUser.user.email.indexOf('@'))
          updateProfile(auth, { displayName: defaultDisplayName })
          const createdUserBdRef = ref(database, `bd/${firebaseUser.user.uid}`);
          onValue(createdUserBdRef, (snapshot) => {
            set(ref(database, `bd/${firebaseUser.user.uid}`), true);
            commit('setUser', { email: firebaseUser.user.email, uid: firebaseUser.user.uid, displayName: defaultDisplayName })
            commit('setSuccess', 'Votre compte a été créé. Bienvenue !')
            router.push('/')
          }).catch(error => {
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
      signInWithEmailAndPassword(auth, payload.email, payload.password).then(firebaseUser => {
        dispatch('doSignIn', firebaseUser.user)
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
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: "select_account"
      })
      signInWithPopup(auth, provider).then((firebaseUser) => {
        dispatch('doSignIn', firebaseUser.user)
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
    doSignIn ({ commit }, payload) {
      const user = { uid: payload.uid, email: payload.email, displayName: payload.displayName, photoURL: payload.photoURL }
      commit('setOptionBgRandom')
      commit('setUser', user)
      const userInfo = ref(database, `users/${payload.uid}`)
      onValue(userInfo, (snapshot) => {
        Object.assign(user, snapshot.val())
        if (user.visibleToAll === undefined) {
          user.visibleToAll = true
        }
        commit('setUser', user)
      })
    },
    userSignOut ({ commit }) {
      off(ref(database, `bd/${this.state.user.uid}`))
      signOut(auth)
      commit('resetBooks')
      commit('setUser', null)
      commit('setSelectedBooks', [])
      router.push('/signin')
    },
    userUpdate ({ commit }, payload) {
      commit('setUser', payload)
      updateProfile(auth.currentUser, { displayName: payload.displayName }).then(() => {
        commit('setSuccess', 'Vos préférences sont enregistrées')
        set(ref(database, `users/${payload.uid}`), { displayName: payload.displayName, visibleToAll: payload.visibleToAll })
      }).catch((error) => {
        commit('setError', 'Vos préférences n\'ont pas été enregistrées : ' + error.message)
      })
    },
    fetchUsers ({ commit }, payload) {
      commit('setLoading', true)
      get(query(ref(database,'users'),orderByChild('displayName'))).then((snapshot) => {
        commit('setLoading', false)
        commit('setUsers', snapshot.val())
      })
    },
    fetchFriendBooks ({ commit }, uid) {
      commit('setLoading', true)
      get(query(ref(database,`bd/${uid}`),orderByChild('computedOrderField'))).then((snapshot) => {
        const booksObj = snapshot.val()
        const booksArray = []
        if (booksObj !== null) {
          for (const [key, book] of Object.entries(booksObj)) {
            if (book.uid === undefined) {
              book.uid = key
            }
            booksArray.push(book)
          }
        }
        commit('setFriendBooks', booksArray)
      }).catch((error) => {
        commit('setError', 'Liste non chargée : ' + error.message)
      }).finally(() => {
        commit('setLoading', false)
      })
    },
    initBooks ({ dispatch, commit }) {
      if (!this.state.user) {
        commit('setError', 'Une erreur s\'est produite, veuillez rafraîchir la page')
        return false
      }
      if (this.state.books.length > 0) {
        return false
      }

      let newItems = false

      commit('setLoading', true)
      const uid = this.state.user.uid
      const booksRef = query(ref(database, `bd/${uid}`), orderByChild('computedOrderField'))
      onValue(booksRef, (snapshot) => {
        const booksObj = snapshot.val()
        const booksArray = []
        for (const [key, book] of Object.entries(booksObj)) {
          if (book.uid === undefined) {
            book.uid = key
          }
          booksArray.push(book)
        }
        commit('setBooks', booksArray)
        dispatch('cacheBooks')
        newItems = true
        commit('setLoading', false)
      })

      /*database.ref(`bd/${uid}`).orderByChild('computedOrderField').limitToFirst(1000).on('child_added', (snapshot) => {
        if (!newItems) { return }
        const book = snapshot.val()
        if (book.uid === undefined) {
          book.uid = snapshot.key
        }
        commit('addBook', book)
        this.dispatch('cacheBooks')
      })

      database.ref(`bd/${uid}`).on('child_removed', (snapshot) => {
        commit('removeBook', snapshot)
        this.dispatch('cacheBooks')
      })
      database.ref(`bd/${uid}`).on('child_changed', (snapshot) => {
        commit('updateBook', snapshot)
        this.dispatch('cacheBooks')
      })*/
    },
    currentBookDelete ({ commit }, book) {
      if (book !== undefined && book.uid !== undefined && book.uid !== '') {
        commit('setLoading', true)
        remove(ref(database, `bd/${this.state.user.uid}/${book.uid}`)).then(() => {
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
    currentBookClear ({ commit }) {
      commit('setCurrentBook', {})
    },
    currentBookSave ({ commit }) {
      const book = this.state.currentBook
      if (book === undefined || book.uid === undefined || !book.uid) {
        return false
      }
      commit('setLoading', true)
      book.computedOrderField = (book.series ? book.series + (book.volume ? '_' + book.volume.toString().padStart(4, '0') : '') : '') + '_' + book.title
      set(ref(database, `bd/${this.state.user.uid}/${book.uid}`), book).then(() => {
        commit('setSuccess', 'Livre enregistré')
      })
        .catch((error) => {
          commit('setError', 'Livre non enregistré: ' + error.message)
        })
        .finally(() => {
          commit('setLoading', false)
        })
    },
    saveMultiBook ({ commit }) {
      this.state.selectedBooks.forEach((book) => {
        if (book.uid) {
          book.series = (this.state.multiEdit.seriesBool ? this.state.multiEdit.series : book.series)
          book.publisher = (this.state.multiEdit.publisherBool ? this.state.multiEdit.publisher : book.publisher)
          book.author = (this.state.multiEdit.authorBool ? this.state.multiEdit.author : book.author)
          commit('setCurrentBook', book)
          this.dispatch('currentBookSave')
        }
      })
    },
    saveNewBook ({ commit }, uid) {
      if (uid === undefined || !uid) {
        return false
      }
      const pos = this.state.books.map(function (e) { return e.uid }).indexOf(uid)
      if (pos > -1) {
        commit('setError', 'Un livre portant cette référence est déjà dans votre bibliothèque')
        return false
      }
      commit('setLoading', true)
      const book = {}
      book.uid = uid
      book.title = uid
      book.series = null
      book.needLookup = 1
      book.dateAdded = new Date().getUTCFullYear() + '-' + (new Date().getUTCMonth() + 1).toString().padStart(2, '0') + '-' + new Date().getUTCDate().toString().padStart(2, '0')
      try {
        set(ref(database, `bd/${this.state.user.uid}/${uid}`), book).then(() => {
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
    async cacheBooks () {
      localStorage.setItem('collection.books', JSON.stringify(this.state.books))
      const currentTime = new Date()
      localStorage.setItem('collection.booksLastSaved', currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1).toString().padStart(2, '0') + '-' + currentTime.getDate().toString().padStart(2, '0') + ' ' + currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0'))
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.user !== null && state.user !== undefined
    }
  }
})
