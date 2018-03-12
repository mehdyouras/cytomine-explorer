<template>
  <div>
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
import Collection from 'ol/collection';
import LayerVector from 'ol/layer/vector';
import SrcVector from 'ol/source/vector';
import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';

export default {
    name: 'AnnotationLayers',
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
        vectorLayer: {},
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
    },
    methods: {
        layerIndex(array, toFind) {
            return array.findIndex(item => item.get('title') === toFind);
        },
        termIndex(array, toFind) {
            return array.findIndex(item => item.id == toFind);
        },
        userDisplayName(user) {
            return `${user.lastname} ${user.firstname} (${user.username})`
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
            if(index < 0) return;
            
            this.layersArray.splice(index, 1);
            this.$openlayers.getMap(this.currentMap.id).render();
        },
    },
    mounted() {
        api.get(`/api/project/${this.currentMap.data.project}/userlayer.json?image=${this.currentMap.imageId}`).then(data => {
                this.userLayers = data.data.collection;
                this.$emit('userLayers', this.userLayers);
            })
        },
}
</script>

<style>

</style>
