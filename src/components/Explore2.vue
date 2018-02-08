<template>
    <div class="map">
        <div @mousemove="sendView" @mousewheel="sendView" :id="currentMap.id">
    </div>
    <label :for="'link-'+this.currentMap.id">Lier la carte</label>
    <select @change="sendLink" v-model="linkedTo" name="link" :id="'link-'+this.currentMap.id">
        <option value="">Choisir une carte</option>
        <option v-for="map in maps" v-if="map.id" :key="map.id" :value="map.id">{{map.id}}</option>
    </select>
    </div>
</template>

<script>
import uuid from 'uuid'
import _ from 'lodash'

export default {
  name: 'Explore',
  data () {
    return {
        linkedTo: "",
    }
  },
  props: [
    'mapView',
    'maps',
    'currentMap',
    'lastEventMapId',
  ],
  computed: {
      link() {
          return this.currentMap.linkedTo;
      },
      mapCenter() {
          return this.mapView.mapCenter;
      },
      mapZoom() {
          return this.mapView.mapZoom;
      }
  },
  watch: {
    // Watches these values
    mapCenter() {
        // Checks if the last event was on a linked map
        if(this.currentMap.linkedTo == this.lastEventMapId) {
            // Apply changes
            this.$openlayers.getView(this.currentMap.id).setCenter(this.mapCenter);
        }
    },
    mapZoom() {
        // Checks if the last event was on a linked map
        if(this.currentMap.linkedTo == this.lastEventMapId) {
            // Apply changes
            this.$openlayers.getView(this.currentMap.id).setZoom(this.mapZoom);
        }
    },
    link() {
        this.linkedTo = this.link;
    }
  },
  methods: {
    // Sends view infos
    sendView() {
        let payload = {
            mapId: this.currentMap.id,
            view: this.$openlayers.getView(this.currentMap.id),
        }
        this.$emit('dragged', payload);
    },
    sendLink() {
        let payload = [this.currentMap.id, this.linkedTo];
        this.$emit('mapIsLinked', payload);
    },
  },
  mounted() {
    // Init map
    this.$openlayers.init({
      element: this.currentMap.id,
      center: this.mapCenter,
      zoom: this.mapZoom,
      enableZoomButton: true,
      enablePan: true,
      enableMouseWheelZoom: true,
      enableDoubleClickZoom: true,
      enableScaleLine: true,  
    })
    // Adds layer
    this.$openlayers.addLayer({element: this.currentMap.id, name: 'Map', type: "OSM"})
  }
}

</script>

<style>
  .map {
    width: 50%;
  }
</style>
