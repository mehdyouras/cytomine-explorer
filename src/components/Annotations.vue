<template>
  <div>
      <select v-model="layerToBeAdded" name="user-layer" id="user-layer">
          <option :value="{}">Choose an annotation layer</option>
          <option v-for="layer in layersNotAdded" :key="layer.id" :value="layer">{{layer.lastname}} {{layer.firstname}} ({{layer.username}})</option>
      </select>
      <button @click="addLayer">Add</button>
  </div>
</template>

<script>
import difference from 'lodash.difference'

export default {
  name: 'Annotations',
  props: [
      'currentMap'
  ],
  data() {
      return {
          userLayers: [],
          layerToBeAdded: {},
          layersSelected: [],
      }
  },
  computed: {
      layersNotAdded() {
          return difference(this.userLayers, this.layersSelected);
      }
  },
  methods: {
      addLayer() {
          this.layersSelected.push(this.layerToBeAdded);
          this.layerToBeAdded = {};
      }
  },
  mounted() {
      api.get(`/api/project/1493/userlayer.json?image=${this.currentMap.imageId}`).then(data => {
            this.userLayers = data.data.collection;
        }
      )
  },
}
</script>
