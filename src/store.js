import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        user: null,
        error: null,
        loading: false
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
        }
    },
    getters: {}
})
