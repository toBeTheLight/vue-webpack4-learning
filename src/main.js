import Vue from 'vue'
import App from './App.vue'
import router from './router/index'

import 'reset.css'
import api from './common/api'

api()
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
