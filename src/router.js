import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase/app'
import 'firebase/auth'

const routerOptions = [
  { path: '/', component: 'Home', meta: { requiresAuth: true } },
  { path: '/options', component: 'Options', meta: { requiresAuth: true } },
  { path: '/users', component: 'Users', meta: { requiresAuth: true } },
  { path: '/signin', component: 'Signin' },
  { path: '/signup', component: 'Signup' },
  { path: '/reset', component: 'PasswordForget' },
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

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = firebase.auth().currentUser
  if (requiresAuth && !isAuthenticated) {
    next('/signin')
  } else {
    next()
  }
})

export default router