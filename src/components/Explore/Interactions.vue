<template>
  <div>
      <ul>
          <li><button @click="removeInteraction">Select</button></li>
          <li><button @click="addInteraction('Point')">Point</button></li>
          <li><button @click="addInteraction('Arrow')">Arrow</button></li>
          <li><button @click="addInteraction('Rectangle')">Rectangle</button></li>
          <li><button @click="addInteraction('Ellipse')">Ellipse</button></li>
          <li><button @click="addInteraction('Circle')">Circle</button></li>
          <li><button @click="addInteraction('Polygon')">Polygon</button></li>
          <li><button @click="addInteraction('Polygon', true)">Freehand</button></li>
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
import Polygon from 'ol/geom/polygon';

export default {
  name: 'Interactions',
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
          draw: {
              layer: {},
              interaction: {},
          }
      }
  },
  computed: {
      layersNotAdded() {
          return difference(this.userLayers, this.layersSelected);
      },
      extent() {
          return [0, 0, parseInt(this.currentMap.data.width), parseInt(this.currentMap.data.height)];
      },
      layersArray() {
          return this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
      }
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

                let format = new WKT();
                let geoms = data.data.collection.map(element => {
                    let feature = format.readFeature(element.location);
                    feature.setId(element.id);
                    return feature;
                })

                let features = new Collection(geoms)

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
        index = this.layerIndex(this.layersArray, toRemove.id);

        this.layersArray.splice(index, 1);
        this.$openlayers.getMap(this.currentMap.id).render();
    },
    addInteraction(geomType, freehand = false ) {
        let currentMap = this.$openlayers.getMap(this.currentMap.id)

        this.removeInteraction();

        // Creates layer if not found
        if(this.layerIndex(this.layersArray, 'draw') < 0) {
            this.draw.layer = new LayerVector({
                title: 'draw',  
                source: new SrcVector(),
                extent: this.extent,
            })
            currentMap.addLayer(this.draw.layer);
        }
        // Adds interaction
        let source = this.draw.layer.getSource(),
            geometryFunction, type;

        switch (geomType) {
            case 'Rectangle':
                geometryFunction = Draw.createBox();    
                type = 'Circle';
                break;
            case 'Point':
                type = 'Point'
                break;
            case 'Circle':
                type = 'Circle'
                break;
            case 'Polygon':
                type = 'Polygon'
                break;
            case 'Ellipse':
                type = 'Circle'
                geometryFunction = function(coord, geometry) {
                    if (!geometry) {
                        geometry = new Polygon(null);
                    }
                    let originX = coord[0][0],
                        originY = coord[0][1],
                        mouseX = coord[1][0],
                        mouseY = coord[1][1],
                        newCoordinates = [],
                        deltaX = mouseX - originX,
                        deltaY = mouseY - originY,
                        centerX = originX + deltaX/2,
                        centerY = originY + deltaY/2;

                    for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 2*Math.PI/15 ) {
                        let xPos = centerX + (deltaX/2 * Math.sin(i)) + (deltaY/2 * Math.cos(i));
                        let yPos = centerY + (deltaX/2 * Math.cos(i)) + (deltaY/2 * Math.sin(i));
                            
                        newCoordinates.push([xPos, yPos]);
                    }
                    geometry.setCoordinates([newCoordinates]);
                    return geometry;
                }
                break;
            case 'Arrow':
                type = 'Circle'
                geometryFunction = function(coord, geometry) {
                    if (!geometry) {
                        geometry = new Polygon(null);
                    }
                    let size = 300;
                    let originX = coord[0][0];
                    let originY = coord[0][1];
                    let newCoordinates = [
                        coord[0],
                        [originX - size/2, originY - size/2],
                        [originX - size/4, originY - size/2],
                        [originX - size/4, originY - size*2],
                        [originX + size/4, originY - size*2],
                        [originX + size/4, originY - size/2],
                        [originX + size/2, originY - size/2],
                        coord[0],
                    ];
                    geometry.setCoordinates([newCoordinates]);
                    return geometry;
                }
                break;
        }
        this.draw.interaction = new Draw({
            source,
            type,
            geometryFunction,
            freehand,
        })
        currentMap.addInteraction(this.draw.interaction);
    },
    removeInteraction() {
        this.$openlayers.getMap(this.currentMap.id).removeInteraction(this.draw.interaction);
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