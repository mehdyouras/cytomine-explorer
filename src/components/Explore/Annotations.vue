<template>
  <div>
      <ul>
          <li><button @click="addAnnotation('Point')">Point</button></li>
          <!-- <li><button @click="addAnnotation('')">Arrow</button></li> -->
          <li><button @click="addAnnotation('Rectangle')">Rectangle</button></li>
          <!-- <li><button @click="addAnnotation('')">Ellipse</button></li> -->
          <li><button @click="addAnnotation('Circle')">Circle</button></li>
          <li><button @click="addAnnotation('Polygon')">Polygon</button></li>
          <li><button @click="addAnnotation('Polygon', true)">Freehand</button></li>
      </ul>
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
import Draw from 'ol/interaction/draw';

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
          vectorLayer: {},
          drawInteraction: {},
          extent: [0, 0, parseInt(this.currentMap.data.width), parseInt(this.currentMap.data.height)],
      }
  },
  computed: {
      layersNotAdded() {
          return difference(this.userLayers, this.layersSelected);
      },
  },
  methods: {
    layerIndex(array, toFind) {
        return array.findIndex(item => item.get('title') === toFind);
    },
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
                this.vectorLayer = new LayerVector({
                    title: this.layerToBeAdded.id,  
                    source: new SrcVector({
                        features,
                    }),
                    extent : this.extent,
                })

                this.$openlayers.getMap(this.currentMap.id).addLayer(this.vectorLayer);
                
                // Clean field
                this.layerToBeAdded = {};                
                this.addAnnotation()
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

        index = this.layerIndex(layersArray, toRemove.id);

        layersArray.splice(index, 1);
        this.$openlayers.getMap(this.currentMap.id).render();
    },
    addAnnotation(geomType, freehand = false) {
        let source = this.vectorLayer.getSource();
        let geometryFunction;
        let type;
        switch (geomType) {
            case 'Rectangle':
                    geometryFunction = Draw.createBox();
                    type = 'circle';
                break;
        
            default:
                break;
        }
        this.drawInteraction = new Draw({
            source,
            type,
            geometryFunction,
            freehand,
        })
        this.$openlayers.getMap(this.currentMap.id).addInteraction(this.drawInteraction);
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
