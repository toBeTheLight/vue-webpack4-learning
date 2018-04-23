import Vue from 'vue'
import App from './App.vue'
import router from './router/index'

import 'reset.css'

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})