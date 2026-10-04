import { createRouter, createWebHistory } from 'vue-router'
import firebase from './initFirebase'

const routerOptions = [
  { path: '/', component: 'Home' },
  { path: '/user/:uid', component: 'Home' },
  { path: '/signin', component: 'Signin' },
  { path: '/signup', component: 'Signup' },
  { path: '/reset', component: 'PasswordForget' },
  // Vue Router 4 : la route attrape-tout n'est plus '*' mais un parametre regex
  { path: '/:pathMatch(.*)*', component: 'Notfound' }
]

const routes = routerOptions.map(route => {
  return {
    ...route,
    component: () => import(`@/components/${route.component}.vue`)
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

const auth = firebase.auth
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
