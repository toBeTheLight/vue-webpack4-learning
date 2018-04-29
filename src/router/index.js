import Router from 'vue-router'
import Vue from 'vue'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/index',
      name: 'index',
      component: () => import('../pages/Index.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Login.vue')
    },
    {
      path: '*',
      redirect: '/index'
    }
  ]
})