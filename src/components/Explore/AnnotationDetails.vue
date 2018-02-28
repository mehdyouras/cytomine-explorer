<template>
  <div v-if="annotationIsClicked">
      <img :src="data.smallCropURL" alt="An image of the annotation area">
      <dl>
          <dt>Area</dt>
          <dd>{{data.area}} {{data.areaUnit}}</dd>
          <dt>Perimeter</dt>
          <dd>{{data.perimeter}} {{data.perimeterUnit}}</dd>
          <dt>User</dt>
          <dd></dd>
      </dl>
  </div>
</template>

<script>
import hexToRgb from '../../helpers/hexToRgb'

import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';

export default {
  name: 'AnnotationDetails',
  data() {
      return {
          annotationIsClicked: false,
          data: {},
      }
  },
  props: [
      'currentMap',
      'featureSelected'
  ],
  watch: {
    featureSelected(newFeature, oldFeature) {
        if(oldFeature === undefined || oldFeature.hasOwnProperty('id_')) {
            this.annotationIsClicked = false;
        }
        if(newFeature !== undefined) {
            api.get(`/api/annotation/${newFeature.getId()}.json`).then(data => {
                this.data = data.data;
                this.annotationIsClicked = true;
            })
        } else {
            this.annotationIsClicked = false;
        }
    }
  },
}
</script>
