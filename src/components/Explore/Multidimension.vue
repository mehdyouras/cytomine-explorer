<template>
  <div v-if="imageInAGroup">
      <h4>Multidimension</h4>
      <p>Picture is in position</p>
      <dl>
          <dt>c:</dt>
          <dd>{{imageSequence.channel}}</dd>
          <dt>z:</dt>
          <dd>{{imageSequence.zStack}}</dd>
          <dt>s:</dt>
          <dd>{{imageSequence.slice}}</dd>
          <dt>t:</dt>
          <dd>{{imageSequence.time}}</dd>
      </dl>
      <input v-model.number="sequenceSelected" min="1" :max="imageGroup.length" type="number" name="channel-select" id="channel-select">
      <button @click="selectImageSequence">Select</button>
      <spectra></spectra>
  </div>
</template>

<script>
import Spectra from './Multidimension/Spectra'

import OlTile from 'ol/layer/tile';
import Zoomify from 'ol/source/zoomify';
import Group from 'ol/layer/group';

export default {
    name: 'Multidimension',
    components: {
        Spectra,
    },
    props: [
        'currentMap',
        'imsBaseUrl',
        'filterUrl',
    ],
    data() {
        return {
            imageInAGroup: false,
            imageSequence: [],
            imageGroup: [],
            sequenceSelected: "",
        }
    },
    methods: {
        selectImageSequence() {
            this.imageSequence = this.imageGroup[this.sequenceSelected - 1];
            this.$emit('imageHasChanged', this.imageGroup[this.sequenceSelected - 1].model);

            let layer = new OlTile({
                source: new Zoomify({
                    url: `${this.filterUrl}${this.imsBaseUrl}image/tile?zoomify=${this.currentMap.data.fullPath}/&tileGroup={TileGroup}&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.currentMap.data.mime}`,
                    size: [this.currentMap.data.width, this.currentMap.data.height],
                    extent: [0, 0, this.currentMap.data.width, this.currentMap.data.height],
                }),
                extent: [0, 0, this.currentMap.data.width, this.currentMap.data.height],
            })
            
            this.$openlayers.getMap(this.currentMap.id).setLayerGroup(new Group({layers: [layer]}));
        }
    },
    created() {
        api.get(`/api/imageinstance/${this.currentMap.imageId}/imagesequence.json`).then(data => {
            if(data.data) {
                this.imageInAGroup = true
                this.imageSequence = data.data;
                api.get(`/api/imagegroup/${this.imageSequence.imageGroup}/imagesequence.json`).then(data => {
                    if(data.data.collection) {
                        this.imageGroup = data.data.collection.sort((a, b) => {
                            return a.channel - b.channel;
                        });
                        let index = this.imageGroup.findIndex(image => {
                            return image.image == this.currentMap.imageId;
                        }) 
                        this.sequenceSelected = index + 1;
                    }
                })
            }
        })
    }
}
</script>
