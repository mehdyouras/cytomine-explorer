<template>
  <div>
    <div v-if="isReviewing">
    <input :id="'showReviewLayer-' + currentMap.id" type="checkbox" v-model="showReviewLayer">
    <label :for="'showReviewLayer-' + currentMap.id" >Display review layer</label>
    </div>
      <div class="btn-group" style="display:flex;">
        <select class="btn btn-default" v-model="layerToBeAdded" name="user-layer" id="user-layer">
            <option :value="{}">Choose an annotation layer</option>
            <option v-for="layer in layersToShow" :key="layer.id" :value="layer">{{userDisplayName(layer)}}</option>
        </select>
        <button class="btn btn-default" @click="addLayer(layerToBeAdded)">Add</button>
      </div>
      <ul class="list-group display-inline-block mt-4">
            <li class="list-group-item" v-for="layer in layersSelected" :key="layer.id">
                <input @click="toggleVisibility(layer)" v-model="layer.visible" type="checkbox" :name="'hide-layer-' + layer.id" :id="'hide-layer-' + layer.id">
                <label :for="'hide-layer-' + layer.id">Visible</label>
                <input @click="followUser(layer.id)" v-model="userToFollow" :disabled="isUserOnline(layer.id)" :value="layer.id" type="checkbox" :name="'follow-' + layer.id" :id="'follow-' + layer.id">
                <label :for="'follow-' + layer.id">Follow</label>

                {{userDisplayName(layer)}}
                <button class="btn btn-default" @click="removeLayer(layer.id)">
                    <span class="glyphicon glyphicon-remove"></span>
                    Remove
                </button>
            </li>
      </ul>
      <div>
          <label for="layers-opacity">Opacity</label>
          <input v-model.number="vectorLayersOpacity" min="0" max="1" step="0.01" type="range" name="layers-opacity" id="layers-opacity">
      </div>
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
import loadingstrategy from 'ol/loadingstrategy';

export default {
    name: 'AnnotationLayers',
    props: [
        'currentMap',
        'termsToShow',
        'showWithNoTerm',
        'allTerms',
        'updateLayers',
        'isReviewing',
        'onlineUsers'
    ],
    data() {
      return {
        userLayers: [],
        layerToBeAdded: {},
        layersSelected: [],
        vectorLayer: {},
        reviewedLayer: {},
        vectorLayersOpacity: 0.3,
        annotationIndex: {},
        userToFollow: [],
        intervalId: '',
        showReviewLayer: true,
        toAdd: {},
      }
    },
    computed: {
      layersNotAdded() {
        return difference(this.userLayers, this.layersSelected).sort((a, b) => {
            if(!a.algo && !b.algo) {
                if(a.lastname < b.lastname) return -1;
                if(a.lastname > b.lastname) return 1;
                return 0;
            }
        }).filter(item => !item.algo);
      },
      algoNotAdded() {
          return difference(this.userLayers, this.layersSelected).sort((a, b) => {
              if(a.algo && b.algo) {
                if(a.softwareName < b.softwareName || a.created < b.created) return -1;
                if(a.softwareName > b.softwareName || a.created > b.created) return 1;
                return 0;
            }
          }).filter(item => item.algo);
      },
      layersToShow() {
          return this.layersNotAdded.concat(this.algoNotAdded);
      },
      extent() {
          return [0, 0, parseInt(this.currentMap.data.width), parseInt(this.currentMap.data.height)];
      },
      layersArray() {
          return this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
      },
      bbox() {
          return this.$openlayers.getView(this.currentMap.id).calculateExtent().join();
      }
    },
    watch: {
        layersSelected(newValue) {
            this.$emit('layersSelected', newValue)
        },
        termsToShow() {
            this.layersSelected.map(layer => {
                this.removeLayer(layer.id, false);
                this.addLayer(layer, false);
            });
        },
        showWithNoTerm() {
            this.layersSelected.map(layer => {
                this.removeLayer(layer.id, false);
                this.addLayer(layer, false);
            });
        },
        vectorLayersOpacity(newValue) {
            this.$emit('vectorLayersOpacity', newValue)
            this.layersArray.map(layer => {
                if(layer.getType() === "VECTOR") {
                    layer.setOpacity(newValue);
                }
            })
        },
        updateLayers(newValue) {
            if(newValue == true) {
                if(this.isReviewing && this.showReviewLayer) {
                    this.removeLayer(this.reviewedLayer.get('title'), false);
                }
                this.layersSelected.map(layer => {
                    this.removeLayer(layer.id, false)
                    this.addLayer(layer, false)
                })
                this.$emit('updateLayers', false);
            }
        },
        annotationIndex(newValue, oldValue) {
            if(newValue.countAnnotation != oldValue.countAnnotation || newValue.countReviewedAnnotation != oldValue.countReviewedAnnotation) {
                this.$emit('updateLayers', true)
            }
        },
        showReviewLayer() {
            this.$emit('updateLayers', true);
        }
    },
    methods: {
        layerIndex(array, toFind) {
            return array.findIndex(item => item.get('title') === toFind);
        },
        termIndex(array, toFind) {
            return array.findIndex(item => item.id == toFind);
        },
        userDisplayName(user) {
            if(user.algo) {
                return `${user.softwareName} (${user.size}) (${user.username})`; 
            } else if(user.lastname == undefined && user.firstname == undefined) {
                return `${user.username} (${user.size})`;
            } 
            else {
                return `${user.lastname} ${user.firstname} (${user.size}) (${user.username})`;
            }
        },
        vectorLoader(extent, resolution, projection) {
            api.get(`/api/annotation.json?&user=${this.toAdd.id}&image=${this.currentMap.imageId}&showWKT=true&showTerm=true&notReviewedOnly=${this.isReviewing}&kmeans=true&bbox=${extent.join(',')}`).then(data => {
                let geoms = this.createFeatures(data.data.collection, this.toAdd.id);
                if(this.addToSelected) {
                    // Push added item to selected
                    this.toAdd.visible = true;
                    this.toAdd.size = data.data.size;
                    let index = this.layersSelected.findIndex(layer => layer.id == this.toAdd.id);
                    if(index >= 0) return;
                    this.layersSelected.push(this.toAdd);
                }
                this.loadFeatures(geoms);
            })
        },
        reviewLoader(extent, resolution, projection) {
            api.get(`/api/imageinstance/${this.currentMap.imageId}/annotationindex.json`).then(data => {
                data.data.collection.map(user => {
                    if(user.countReviewedAnnotation > 0) {
                        api.get(`/api/annotation.json?&user=${user.user}&image=${this.currentMap.imageId}&roi=false&notReviewedOnly=true&reviewed=true&showWKT=true&showTerm=true&kmeans=true&bbox=${extent.join(',')}`).then(resp => {
                            let collection = resp.data.collection;
                            let geoms = this.createFeatures(collection, user.user, true);
                            this.loadFeatures(geoms, true)
                        })
                    }
                })
            })
        },
        loadFeatures(collection, areReviewed = false) {
            if(areReviewed) {
                this.reviewedLayer.getSource().addFeatures(collection);
            } else {
                this.vectorLayer.getSource().addFeatures(collection);
            }
        },
        addLayer(toAdd, addToSelected = true) {
            this.addToSelected = addToSelected;
            if(toAdd.id) {
                this.toAdd = toAdd;
                if(this.isReviewing && this.showReviewLayer) {
                    this.reviewedLayer = this.createVectorLayer('reviewed', this.reviewLoader);
                }
                this.vectorLayer = this.createVectorLayer(this.toAdd.id, this.vectorLoader);

                this.layerToBeAdded = {};
            }
        },
        createFeatures(collection, userId, areReviewed = false) {
            let format = new WKT();
            let test = collection.map(element => {
                let termsIntersection = intersection(this.termsToShow, element.term);
                // Checks if element has no term && show annotations without terms is enabled 
                // If false checks terms intersection
                let isToShow = element.term.length == 0 && this.showWithNoTerm ? true : termsIntersection.length > 0;
                if(isToShow) {  
                    // Sets the color specified by api if annotation has only one term
                    let fillColor = termsIntersection.length == 1 ? hexToRgb(this.allTerms[this.termIndex(this.allTerms, termsIntersection[0])].color) : [204, 204, 204];
                    let feature = format.readFeature(element.location);
                    feature.setId(element.id);
                    feature.set('user', userId);
                    let strokeColor;
                    if(this.isReviewing) {
                        strokeColor = areReviewed ? [91, 183, 91] : [189, 54, 47];
                    } else {
                        strokeColor = [0, 0, 0]
                    }
                    feature.setStyle(new Style({
                        fill: new Fill({
                            color: fillColor,
                        }),
                        stroke: new Stroke({
                            color: strokeColor,
                            width: 3,
                        }),
                    }))
                    return feature;
                }
            })
            return compact(test);
        },
        createVectorLayer(title, loader) {
            let layer = new LayerVector({
                title,  
                source: new SrcVector({
                    strategy: loadingstrategy.bbox,
                    loader,
                }),
                extent : this.extent,
            })
            layer.setOpacity(this.vectorLayersOpacity);
            this.$openlayers.getMap(this.currentMap.id).addLayer(layer);
            return layer;
        },
        removeLayer(toRemoveId, removeFromSelected = true) {
            let index;

            if(removeFromSelected) {
                index = this.layersSelected.findIndex(layer => {
                    return layer.id === toRemoveId;
                });
                // Removes the layer from the selected
                this.layersSelected.splice(index, 1);
            }

            // Removes layer from the map
            index = this.layerIndex(this.layersArray, toRemoveId);
            if(index < 0) return;
            
            this.layersArray.splice(index, 1);
            this.$openlayers.getMap(this.currentMap.id).render();
        },
        toggleVisibility(layer) {
            let index = this.layerIndex(this.layersArray, layer.id);
            this.layersArray[index].setVisible(!layer.visible);
        },
        getAnnotationIndex() {
            api.get(`/api/imageinstance/${this.currentMap.imageId}/annotationindex.json`).then(data => {
                this.annotationIndex = data.data.collection[0];
            })
        },
        followUser(userId) {
            let index = this.userToFollow.findIndex(user => user == userId);

            if(index > 0) {
                this.userToFollow = [];
                clearInterval(this.intervalId);
            } else {
                this.userToFollow = [userId];
                this.intervalId = setInterval(this.setUserPosition, 1000);
            }
        },
        setUserPosition() {
            api.get(`/api/imageinstance/${this.currentMap.imageId}/position/${this.userToFollow[0]}.json`).then(data => {
                let {x, y, zoom} = data.data;
                this.$openlayers.getView(this.currentMap.id).setCenter([x, y]);
                this.$openlayers.getView(this.currentMap.id).setZoom(zoom);
            })
        },
        isUserOnline(userId) {
            let index = this.onlineUsers.findIndex(user => user.id == userId);
            return index > 0 ? false : true;
        },
    },
    mounted() {
        api.get(`/api/project/${this.currentMap.data.project}/userlayer.json?image=${this.currentMap.imageId}`).then(data => {
            this.userLayers = data.data.collection;
            this.$emit('userLayers', this.userLayers);
            api.get(`/api/project/${this.currentMap.data.project}/defaultlayer.json`).then(data => {
                if(data.data.collection[0]) {
                    data.data.collection.map(layer => {
                        let index = this.userLayers.findIndex(user => user.id == layer.user);
                        this.addLayer(this.userLayers[index]);
                    });
                } else {
                    this.addLayer(this.currentMap.user);
                }
            })
        })
        setInterval(this.getAnnotationIndex, 5000)
    }
}
</script>

<style>
    .display-inline-block {
        display: inline-block;
    }
</style>
