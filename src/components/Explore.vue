<template>
  <div @mouseup="emitCenter()" class="map" :id="id">
  </div>
</template>

<script>
import Map from 'ol/map'
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import OSM from 'ol/source/osm';
import proj from 'ol/proj';
import uuid from 'uuid'

export default {
  name: 'Explore',
  data () {
    return {
        id: uuid(),
        center: null,
        map: {},
    }
  },
  props: [
    'mapCenter',
  ],
  watch: {
    mapCenter: function() {
      
    }
  },
  methods: {
    emitCenter() {
      console.log(this.map.getCenter());
      this.$emit('dragged', this.map.getValues());
    },
    setMap() {
      // this.center = this.mapCenter;
      
    }
  },
  mounted() {
    this.map = new Map({
      target: this.id,
      layers: [ 
        new TileLayer({
            source: new OSM()
          })
        ],
      view: new View({
        center: proj.fromLonLat(this.mapCenter),
        zoom: 4,
        setCenter: proj.fromLonLat(this.mapCenter),  
      }),
    })
  }
}

</script>

<style>
  .map {
    width: 50%;
  }
</style>
