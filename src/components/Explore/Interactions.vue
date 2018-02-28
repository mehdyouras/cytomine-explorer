<template>
  <div>
      <ul>
          <li><button @click="addInteraction('Select')">Select</button></li>
          <li><button @click="addInteraction('Point')">Point</button></li>
          <li><button @click="addInteraction('Line')">Line</button></li>
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
      <button @click="addLayer(layerToBeAdded)">Add</button>
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
import compact from 'lodash.compact'
import intersection from 'lodash.intersection'
import hexToRgb from '../../helpers/hexToRgb'

import WKT from 'ol/format/wkt';
import LayerVector from 'ol/layer/vector';
import SrcVector from 'ol/source/vector';
import Collection from 'ol/collection';
import Draw from 'ol/interaction/draw';
import Polygon from 'ol/geom/polygon';
import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Select from 'ol/interaction/select';

export default {
  name: 'Interactions',
  props: [
      'currentMap',
      'termsToShow',
      'showWithNoTerm',
      'allTerms'
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
          },
          featureSelected: new Collection(),
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
      },
      deepFeatureSelected() {
          return this.featureSelected.getArray()[0];
      },
  },
  watch: {
      termsToShow() {
        this.layersSelected.map(layer => {
            this.removeLayer(layer, false);
            this.addLayer(layer, false);
        });
      },
      showWithNoTerm() {
        this.layersSelected.map(layer => {
            this.removeLayer(layer, false);
            this.addLayer(layer, false);
        });
      },
      deepFeatureSelected(newValue) {
          this.$emit('featureSelected', newValue);
      },
  },
  methods: {
    layerIndex(array, toFind) {
        return array.findIndex(item => item.get('title') === toFind);
    },
    termIndex(array, toFind) {
        return array.findIndex(item => item.id == toFind);
    },
    addLayer(toAdd, addToSelected = true) {
        if(toAdd.id) {            
            api.get(`/api/annotation.json?&user=${toAdd.id}&image=${this.currentMap.imageId}&showWKT=true&showTerm=true`).then(data => {
                
                if(addToSelected) {
                    // Push added item to selected
                    this.layersSelected.push(toAdd);
                }

                let format = new WKT();
                let geoms = data.data.collection.map(element => {
                    let termsIntersection = intersection(this.termsToShow, element.term);
                    // Checks if element has no term && show annotations without terms is enabled 
                    // If false checks terms intersection
                    let isToShow = element.term.length == 0 && this.showWithNoTerm ? true : termsIntersection.length > 0;
                    if(isToShow) {  
                        // Sets the color specified by api if annotation has only one term
                        let fillColor = termsIntersection.length == 1 ? hexToRgb(this.allTerms[this.termIndex(this.allTerms, termsIntersection[0])].color, 0.5) : [204, 204, 204   , 0.5];
                        let feature = format.readFeature(element.location);
                        feature.setId(element.id);
                        feature.setStyle(new Style({
                            fill: new Fill({
                                color: fillColor,
                            }),
                            stroke: new Stroke({
                                color: [0,0,0, 0.5],
                                width: 3,
                            })
                        }))
                        return feature;
                    }
                })

                geoms = compact(geoms);

                let features = new Collection(geoms)

                // Create vector layer                
                this.vectorLayer = new LayerVector({
                    title: toAdd.id,  
                    source: new SrcVector({
                        features,
                    }),
                    extent : this.extent,
                })

                this.$openlayers.getMap(this.currentMap.id).addLayer(this.vectorLayer);
                
                // Clear field
                this.layerToBeAdded = {};                
            })

        }
    },
    userDisplayName(user) {
        return `${user.lastname} ${user.firstname} (${user.username})`
    },
    removeLayer(toRemove, removeFromSelected = true) {
        let index;

        if(removeFromSelected) {
            index = this.layersSelected.findIndex(layer => {
                return layer.id === toRemove.id;
            });
            // Removes the layer from the selected
            this.layersSelected.splice(index, 1);
        }

        // Removes layer from the map
        index = this.layerIndex(this.layersArray, toRemove.id);

        this.layersArray.splice(index, 1);
        this.$openlayers.getMap(this.currentMap.id).render();
    },
    addInteraction(interactionType, freehand = false ) {
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

        switch (interactionType) {
            case 'Select':
                this.removeInteraction();
                this.draw.interaction = new Select({
                    features: this.featureSelected,
                });
                currentMap.addInteraction(this.draw.interaction);
                return;
                break;
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
            case 'Line':
                type = "LineString"
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
