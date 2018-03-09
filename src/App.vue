<template>
  <div>
    <div v-if="maps.length < maxMapsToShow">
      <select v-model.number="imageToAdd" name="images" id="images">
        <option value="">Select an image to add</option>
        <option v-for="image in images" :key="image.id" :value="image.id">{{image.instanceFilename}}</option>
      </select>
      <button @click="addMap(imageToAdd)">Add a map</button>
    </div>
    <p v-else>You can only have {{maxMapsToShow}} maps displayed</p>
    <overview-map :lastEventMapId="lastEventMapId" :maps="maps"></overview-map>  
    <div class="container">
      <explore v-for="map in maps" :key="map.id" @changeImage="updateMap" @dragged="setMap" @mapIsLinked="linkMaps" @deleteMap="deleteMap" @updateOverviewMap="updateOverviewMap" :mapView="mapView" :maps='maps' :currentMap="map" :lastEventMapId="lastEventMapId" :filters="filters"></explore>
    </div>
  </div>
</template>

<script>
import Explore from './components/Explore'
import OverviewMap from './components/OverviewMap'

import uuid from 'uuid'

export default {
  name: 'app',
  components: {
    Explore,
    OverviewMap
  },
  data() {
    return {
      mapView: {
        mapCenter: [0, 0],
        mapZoom: 2,
        mapRotation: 0,
      },
      maxMapsToShow: 4,
      maps: [],
      lastEventMapId: null,
      images: [],
      projectId: '82029',
      imageToAdd: "",
      baseImage: '82224',
      filters: [],
    }
  },
  methods: {
    imageIndex(imageId) {
      return this.images.findIndex(image => image.id == imageId);
    },
    mapIndex(mapId) {
      return this.maps.findIndex(map => map.id == mapId)
    },
    setMap(payload) {
      this.mapView = {
        mapCenter: payload.view.getCenter(),
        mapResolution: payload.view.getResolution(),
        mapRotation: payload.view.getRotation(),
      }
      this.lastEventMapId = payload.mapId;
    },
    linkMaps(payload) {
      // Removes last linked map
      let index = this.maps.findIndex((map) => {
        return map.linkedTo === payload[0];
      })
      if(index !== -1) {
        this.maps[index].linkedTo = "";
      }

      // Finds map index
      index = this.mapIndex(payload[0])
      // Links maps
      this.maps[index].linkedTo = payload[1];

      index = this.mapIndex(payload[1])
      this.maps[index].linkedTo = payload[0];
    },
    addMap(imageId = this.imageToAdd, id = uuid()) {
      if(this.maps.length < this.maxMapsToShow) {
        this.maps.push({
          id,
          imageId,
          linkedTo: "",
          data: this.images[this.imageIndex(imageId)]
        })
      }
    },
    deleteMap(payload) {
      let index = this.maps.findIndex(map => {
        return map.id === payload;
      })
      this.maps.splice(index, 1);
    },
    updateOverviewMap() {
      this.lastEventMapId = 'reload';
    },
    updateMap(payload) {
      let index = this.maps.findIndex(map => map == payload.old);
      this.maps[index].data = payload.new;
      this.maps[index].imageId = payload.new.id;
    }
  },
  created() {
    api.get(`api/project/${this.projectId}/imageinstance.json`).then(data => {
      let id = uuid();
      this.lastEventMapId = id;
      this.images = data.data.collection;
      this.projectId = this.images[0].project;
      this.addMap(this.baseImage, id);
    })

    api.get(`api/project/${this.projectId}/imagefilterproject.json`).then(data => {
      this.filters = data.data.collection;
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

