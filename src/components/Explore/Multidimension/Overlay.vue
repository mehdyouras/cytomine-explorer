<template>
  <div>
      <h5>Overlay</h5>
      <label :for="'overlay-' + currentMap.id">Choose a channel to add as an overlay</label>
      <input v-model.number="sequenceSelected" type="number" :name="'overlay-' + currentMap.id" :id="'overlay-' + currentMap.id">
      <input v-model.number="sequenceSelected" type="range" step="1" min="1" :max="imageGroup.length">
      <button @click="addOverlay">Add as an overlay</button>
  </div>
</template>

<script>
import OlTile from 'ol/layer/tile';
import Zoomify from 'ol/source/zoomify';

export default {
    name: 'Overlay',
    props: [
        'currentMap',
        'imageSequence',
        'imageGroup',
        'imsBaseUrl',
        'filterUrl'
    ],
    data() {
        return {
            sequenceSelected: 1,
        }
    },
    methods: {
        addOverlay() {
            let layersArray = this.$openlayers.getMap(this.currentMap.id).getLayers().getArray();
            let vectorIndex = layersArray.findIndex(layer => layer.getType() == 'VECTOR');
            let imageToAdd = this.imageGroup[this.sequenceSelected - 1];

            let layerToAdd = new OlTile({
                source: new Zoomify({
                    url: `${this.filterUrl}${this.imsBaseUrl}image/tile?zoomify=${imageToAdd.model.fullPath}/&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${imageToAdd.model.mime}`,
                    size: [parseInt(imageToAdd.model.width), parseInt(imageToAdd.model.height)],
                    extent: [0, 0, parseInt(imageToAdd.model.width), parseInt(imageToAdd.model.height)],
                }),
                extent: [0, 0, parseInt(imageToAdd.model.width), parseInt(imageToAdd.model.height)],
            })

            layerToAdd.set('channel', this.sequenceSelected);

            if(vectorIndex > 0) {
                layersArray.splice(vectorIndex, 0, layerToAdd);
            } else {
                layersArray.push(layerToAdd);
            }

            this.overlayedLayer.push(imageToAdd);

            this.$openlayers.getMap(this.currentMap.id).setLayerGroup(new Group({layers: layersArray}))
            console.log(this.$openlayers.getMap(this.currentMap.id).getLayers().getArray())
        }
    }
}
</script>
