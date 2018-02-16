<template>
  <div id="overview-map"></div>
</template>

<script>
import OverviewMap from 'ol/control/overviewmap'; 

export default {
  name: 'OverviewMap',
  props: [
      'lastEventMapId',
      'maps',
  ],
  mounted() {
      console.log(this.maps)
      this.$openlayers.getMap(this.lastEventMapId).addControl(new OverviewMap({
          collapsed: false,
          target: "overview-map",
      }))
  },
}
</script>
