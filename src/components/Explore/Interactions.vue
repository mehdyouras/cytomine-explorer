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
            <li><button @click="addInteraction('MagicWand')">MagicWand</button></li>
            <li><button @click="addInteraction('Polygon', true)">Freehand</button></li>
            <li><button @click="addInteraction('Union', true)">Union</button></li>
            <li><button @click="addInteraction('Difference', true)">Difference</button></li>
            <li><button @click="addInteraction('Ruler')">Ruler</button></li>
            <template v-if="featureSelected.getArray()[0]">
                <li><button @click="addInteraction('Fill')">Fill</button></li>
                <li><button @click="addInteraction('Edit')">Edit</button></li>
                <li><button @click="addInteraction('Rotate')">Rotate</button></li>
                <li><button @click="addInteraction('Resize')">Resize</button></li>
                <li><button @click="addInteraction('Drag')">Drag</button></li>
                <li><button @click="addInteraction('Remove')">Remove</button></li>
            </template>
        </ul>
  </div>
</template>

<script>
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
import Translate from 'ol/interaction/translate';
import Modify from 'ol/interaction/modify';
import Rotate from 'ol-rotate-feature';

export default {
  name: 'Interactions',
  props: [
      'currentMap',
      'vectorLayersOpacity',
  ],
  data() {
      return {
          draw: {
              layer: {},
              interaction: {},
          },
          featureSelected: new Collection(),
      }
  },
  computed: {
      extent() {
          return [0, 0, parseInt(this.currentMap.data.width), parseInt(this.currentMap.data.height)];
      },
      layersArray() {
          return this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
      },
      currentUserLayer() {
          let index = this.layersArray.findIndex(layer => layer.get('title') == this.currentMap.user.id);
          return this.layersArray[index];
      },
      deepFeatureSelected() {
          return this.featureSelected.getArray()[0];
      },
      featureSelectedId() {
          return this.featureSelected.getArray()[0].getId();
      }
  },
  watch: {
      deepFeatureSelected(newFeature, oldFeature) {
        this.$emit('featureSelected', newFeature);

        if(oldFeature !== undefined && oldFeature.hasOwnProperty('id_')) {
            let color = oldFeature.getStyle().getFill().getColor();
            if(color.length > 3) {
                color.splice(color.length - 1, 1);
            }
            oldFeature.getStyle().setStroke(
                new Stroke({
                    color: [0, 0, 0],
                    width: 3,
                })  
            )
            oldFeature.changed();
        }
        if(newFeature !== undefined) {
            let color = newFeature.getStyle().getFill().getColor();
            color[3] = this.vectorLayersOpacity + 0.3;
            newFeature.getStyle().setStroke(
                new Stroke({
                    color: [0, 0, 255, this.vectorLayersOpacity + 0.3],
                    width: 3,
                }) 
            )
            newFeature.changed();
        }
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
    addInteraction(interactionType, freehand = false ) {
        let currentMap = this.$openlayers.getMap(this.currentMap.id)

        this.removeInteraction();

        // Creates layer if not found
        if(this.currentUserLayer == undefined && this.layerIndex(this.layersArray, 'draw') < 0) {
            this.draw.layer = new LayerVector({
                title: 'draw',  
                source: new SrcVector(),
                extent: this.extent,
            })
            currentMap.addLayer(this.draw.layer);
        } else if(this.currentUserLayer != undefined) {
            this.draw.layer = this.currentUserLayer;
        }
        // Adds interaction
        let source = this.draw.layer.getSource(),
            geometryFunction, type;
        switch (interactionType) {
            case 'Select':
                // this.removeInteraction();
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
            case 'Edit':
                this.draw.interaction = new Modify({
                    features: this.featureSelected,
                });
                currentMap.addInteraction(this.draw.interaction);
                return;
                break;
            case 'Drag':
                this.draw.interaction = new Translate({
                    features: this.featureSelected,
                })
                currentMap.addInteraction(this.draw.interaction);
                return;
                break;
            case 'Remove':
                let userId = this.featureSelected.getArray()[0].get('user');
                let layerIndex = this.layersArray.findIndex(layer => layer.get('title') == userId);
                let featureIndex = this.layersArray[layerIndex].getSource().getFeatures().findIndex(feature => feature.getId() == this.featureSelectedId)

                this.layersArray[layerIndex].getSource().removeFeature(this.layersArray[layerIndex].getSource().getFeatures()[featureIndex]);
                this.featureSelected.getArray().splice(0, 1);
                api.delete(`/api/annotation/${this.featureSelectedId}.json`);
                this.addInteraction('Select');
                return;
                break;
            case 'Resize':

                return;
                break;
            case 'Fill':
                api.put(`/api/annotation/${this.featureSelectedId}.json?&fill=true`, {fill: true, id: this.featureSelectedId}).then(data => {
                    let format = new WKT();
                    let newCoordinates = format.readFeature(data.data.data.annotation.location).getGeometry().getCoordinates()[0];
                    let userId = this.featureSelected.getArray()[0].get('user');
                    let layerIndex = this.layersArray.findIndex(layer => layer.get('title') == userId);
                    let featureIndex = this.layersArray[layerIndex].getSource().getFeatures().findIndex(feature => feature.getId() == this.featureSelectedId)

                    this.layersArray[layerIndex].getSource().getFeatures()[featureIndex].getGeometry().setCoordinates([newCoordinates]);
                })
                this.addInteraction('Select');
                return;
                break;
            case 'Rotate':
                this.draw.interaction = new Rotate({
                    features: this.featureSelected,
                })
                this.draw.interaction.on('rotateend', evt => {
                    let format = new WKT();
                    let newCoordinates = format.writeFeature(this.featureSelected.getArray()[0]);
                    api.get(`/api/annotation/${this.featureSelectedId}.json`).then(data => {
                        data.data.location = newCoordinates;
                        api.put(`api/annotation/${this.featureSelectedId}.json`, data.data);
                    })
                })
                currentMap.addInteraction(this.draw.interaction);
                return;
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
}
</script>
