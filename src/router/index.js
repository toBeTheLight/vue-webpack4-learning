import Router from 'vue-router'
import Vue from 'vue'
const Index = () => import(/* webpackChunkName: "index" */ '../pages/Index.vue')
const Login = () => import(/* webpackChunkName: "login" */ '../pages/Login.vue')

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
    }
  ]
})
