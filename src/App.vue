<template>
  <div>
    <div v-if="maps.length < maxMapsToShow">
      <select v-model.number="imageToAdd" name="images" id="images">
        <option value="">Select an image to add</option>
        <option v-for="image in images" :key="image.id" :value="image.id">{{image.instanceFilename}}</option>
      </select>
      <button @click="addMap">Add a map</button>
    </div>
    <p v-else>You can only have {{maxMapsToShow}} maps displayed</p>
    <div class="container">
      <explore v-for="map in maps" :key="map.id" @dragged="setMap" @mapIsLinked="linkMaps" @deleteMap="deleteMap" :mapView="mapView" :maps='maps' :currentMap="map" :lastEventMapId="lastEventMapId"></explore>
    </div>
  </div>
</template>

<script>
import Explore from './components/Explore'
import uuid from 'uuid'
import findIndex from 'lodash.findindex'
import axios from 'axios'

export default {
  name: 'app',
  components: {
    Explore,
  },
  data() {
    return {
      mapView: {
        mapCenter: [0, 0],
        mapZoom: 3,
        mapRotation: 0,
      },
      maxMapsToShow: 4,
      maps: [],
      lastEventMapId: null,
      apiBaseUrl: 'http://localhost:8085/api',
      images: [],
      projectId: '1493',
      imageToAdd: "",
      baseImage: '1577'
    }
  },
  methods: {
    imageIndex(imageId) {
      return findIndex(this.images, image => image.id == imageId);
    },
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
    },
    addMap() {
      if(this.maps.length < this.maxMapsToShow) {
        this.maps.push({id: uuid(), imageId: this.imageToAdd, linkedTo: "", data: this.images[this.imageIndex(this.imageToAdd)]});
      }
    },
    deleteMap(payload) {
      let index = findIndex(this.maps, (map) => {
        return map.id === payload;
      })
      this.maps.splice(index, 1);
    }
  },
  created() {
    axios.get(`${this.apiBaseUrl}/project/${this.projectId}/imageinstance.json`).then(data => {
      this.images = data.data.collection;
      this.maps.push({id: uuid(), imageId: this.baseImage, linkedTo: "", data: this.images[this.imageIndex(this.baseImage)]});
    })
    
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

