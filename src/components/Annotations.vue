<template>
  <div>
      <select v-model="layerToBeAdded" name="user-layer" id="user-layer">
          <option :value="{}">Choose an annotation layer</option>
          <option v-for="layer in layersNotAdded" :key="layer.id" :value="layer">{{userDisplayName(layer)}}</option>
      </select>
      <button @click="addLayer">Add</button>
      <ul>
            <li v-for="layer in layersSelected" :key="layer.id">
                {{userDisplayName(layer)}}
                <button @click="removeLayer(layer)">Remove</button>
            </li>
      </ul>
  </div>
</template>

<script>
import difference from 'lodash.difference'
import WKT from 'ol/format/wkt';
import LayerVector from 'ol/layer/vector';
import SrcVector from 'ol/source/vector';
import Collection from 'ol/collection';

export default {
  name: 'Annotations',
  props: [
      'currentMap',
  ],
  data() {
      return {
          userLayers: [],
          layerToBeAdded: {},
          layersSelected: [],
          annotationsIndex: [],
      }
  },
  computed: {
      layersNotAdded() {
          return difference(this.userLayers, this.layersSelected);
      },
  },
  methods: {
    addLayer() {
        if(this.layerToBeAdded.id) {            
            api.get(`/api/annotation.json?&user=${this.layerToBeAdded.id}&image=${this.currentMap.imageId}&showWKT=true`).then(data => {
                
                // Push added item to selected
                this.layersSelected.push(this.layerToBeAdded);

                let geoms = data.data.collection.map(element => {
                    return element.location;
                })

                let format = new WKT();
                let features = new Collection(
                    geoms.map(geom => {
                        return format.readFeature(geom);
                    })
                )

                // Create vector layer
                let extent = [0, 0, parseInt(this.currentMap.data.width), parseInt(this.currentMap.data.height)];
                
                let vector = new LayerVector({
                    title: this.layerToBeAdded.id,  
                    source: new SrcVector({
                        features,
                    }),
                    extent,
                })

                this.$openlayers.getMap(this.currentMap.id).addLayer(vector);
                
                // Clean field
                this.layerToBeAdded = {};                
            })

        }
    },
    userDisplayName(user) {
        return `${user.lastname} ${user.firstname} (${user.username})`
    },
    removeLayer(toRemove) {
        // Removes the layer from the selected
        let index = this.layersSelected.findIndex(layer => {
            return layer.id === toRemove.id;
        });
        this.layersSelected.splice(index, 1);

        // Removes layer from the map
        let layersArray = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();

        index = layersArray.findIndex(layer => {
            return layer.title === toRemove.id;
        })

        layersArray.splice(index, 1);
        this.$openlayers.getMap(this.currentMap.id).render();
    }
  },
  mounted() {
      api.get(`/api/project/1493/userlayer.json?image=${this.currentMap.imageId}`).then(data => {
            this.userLayers = data.data.collection;
        }
      )
      api.get(`/api/imageinstance/${this.currentMap.imageId}/annotationactions.json`).then(data => {
          this.annotationsIndex = data.data;
      })
  },
}
</script>
