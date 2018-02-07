import Vue from 'vue'
import App from './App.vue'
import VueOpenLayers from 'vuejs-openlayers'

Vue.use(VueOpenLayers);

new Vue({
  el: '#app',
  render: h => h(App)
})
