import Vue from 'vue'
import App from './App.vue'
import VueOpenLayers from 'vuejs-openlayers'
import Axios from 'axios';

window.api = Axios.create({
  baseUrl: 'http://localhost:8085/',
})

Vue.use(VueOpenLayers);

new Vue({
  el: '#app',
  render: h => h(App)
})
