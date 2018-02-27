<template>
  <div>

  </div>
</template>

<script>
export default {
  name: 'AnnotationDetails',
  props: [
      'lastClick',
      'currentMap'
  ],
  watch: {
      lastClick(newCoord, oldCoord) {
          let featuresAtPixel = this.$openlayers.getMap(this.currentMap.id).getFeaturesAtPixel(newCoord);
          console.log(featuresAtPixel)
          if(featuresAtPixel === null) {
            return;
          } else  {
              console.log(featuresAtPixel[0].getId())
          }
      },
  },
}
</script>
