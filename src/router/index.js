import Router from 'vue-router'
import Vue from 'vue'
import Index from '../pages/Index.vue'
import Login from '../pages/Login.vue'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/index',
      name: 'index',
      component: Index
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '*',
      redirect: '/index'
    },
  ]
})