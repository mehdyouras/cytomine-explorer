<template>
  <div class="container">
    <explore v-for="map in maps" :key="map.id" @dragged="setMap" @mapIsLinked="linkMaps" :mapView="mapView" :maps='maps' :currentMap="map" :lastEventMapId="lastEventMapId"></explore>
  </div>
</template>

<script>
import Explore from './components/Explore'
import uuid from 'uuid'
import findIndex from 'lodash.findindex'

export default {
  name: 'app',
  components: {
    Explore,
  },
  data() {
    return {
      mapView: {
        mapCenter: [37.41, 8.82],
        mapZoom: 3,
        mapRotation: 0,
      },
      mapsToShow: 4,
      maps: [],
      lastEventMapId: null,
    }
  },
  methods: {
    setMap(payload) {
      this.mapView = {
        mapCenter: payload.view.getCenter(),
        mapZoom: payload.view.getZoom(),
        mapRotation: payload.view.getRotation(),
      }
      this.lastEventMapId = payload.mapId;
    },
    linkMaps(payload) {
      // Removes last linked map
      let index = findIndex(this.maps, (map) => {
        return map.linkedTo === payload[0];
      })
      if(index !== -1) {
        this.maps[index].linkedTo = "";
      }

      // Finds map index
      index = findIndex(this.maps, (map) => {
        return map.id === payload[0];
      })
      // Links maps
      this.maps[index].linkedTo = payload[1];

      index = findIndex(this.maps, (map) => {
        return map.id === payload[1];
      })
      this.maps[index].linkedTo = payload[0];
    }
  },
  created() {
    for (let index = 0; index < this.mapsToShow; index++) {
      let id = uuid();
      this.maps.push({id: id, linkedTo: ""});
    }
  },
}
</script>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
</style>

