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
                <button @click="removeFromSelected(layer)">Remove</button>
            </li>
      </ul>
  </div>
</template>

<script>
import difference from 'lodash.difference'
import WKT from 'ol/format/wkt';
import LayerVector from 'ol/layer/vector';
import SrcVector from 'ol/source/vector';


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
      }
  },
  methods: {
    addLayer() {
        if(this.layerToBeAdded.id) {            
            api.get(`/api/annotation.json?&user=${this.layerToBeAdded.user}&image=${this.currentMap.imageId}&showWKT=true`).then(data => {
                // Push added item to selected
                this.layersSelected.push(this.layerToBeAdded);

                let geoms = data.data.collection.map(element => {
                    return element.location;
                })

                let format = new WKT({splitCollection: true});
                let features = geoms.map(geom => {
                    return format.readFeature(geom)
                })

                // Create vector layer
                let vector = new LayerVector({
                    name: this.layerToBeAdded.id,  
                    source: new SrcVector({
                        features,
                    }),
                })
                
                // this.$emit('addLayer', {features, name: this.layerToBeAdded.id});

                this.$openlayers.getMap(this.currentMap.id).addLayer(vector);
                
                // Clean field
                this.layerToBeAdded = {};
                
                console.log(this.$openlayers.getLayers(this.currentMap.id));
            })

        }
    },
    userDisplayName(user) {
        return `${user.lastname} ${user.firstname} (${user.username})`
    },
    removeFromSelected(toRemove) {
        let index = this.layersSelected.findIndex(layer => {
            return layer.id === toRemove.id;
        });
        this.layersSelected.splice(index, 1);
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
