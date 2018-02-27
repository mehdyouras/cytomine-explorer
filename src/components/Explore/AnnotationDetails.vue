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
export default {
  name: 'AnnotationDetails',
  data() {
      return {
          annotationIsClicked: false,
          data: {},
      }
  },
  props: [
      'lastClick',
      'currentMap'
  ],
  watch: {
      lastClick(newCoord, oldCoord) {
          let featuresAtPixel = this.$openlayers.getMap(this.currentMap.id).getFeaturesAtPixel(newCoord);
          if(featuresAtPixel === null) {
            this.annotationIsClicked = false;
          } else  {
              api.get(`/api/annotation/${featuresAtPixel[0].getId()}.json`).then(data => {
                  this.data = data.data;
                  this.annotationIsClicked = true;
              })
          }
      },
  },
}
</script>
