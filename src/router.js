import Vue from 'vue'
import Router from 'vue-router'
import firebase from './initFirebase'

const routerOptions = [
  { path: '/', component: 'Home' },
  { path: '/user/:uid', component: 'Home' },
  { path: '/signin', component: 'Signin' },
  { path: '/signup', component: 'Signup' },
  { path: '/reset', component: 'PasswordForget' },
  { path: '/scanner', component: 'Scanner' },
  { path: '*', component: 'Notfound' }
]

const routes = routerOptions.map(route => {
  return {
    ...route,
    component: () => import(`@/components/${route.component}.vue`)
  }
})

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes
})
const auth = firebase.auth;
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser
  if (requiresAuth && !isAuthenticated) {
    next('/signin')
  } else {
    next()
  }
})

export default router
