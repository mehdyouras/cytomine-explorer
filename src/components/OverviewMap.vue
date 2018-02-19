<template>
  <div id="overview-map"></div>
</template>

<script>
import OverviewMap from 'ol/control/overviewmap'; 

export default {
  name: 'OverviewMap',
  data() {
      return {
          overviewMap: {},
          overviewMapCount: 0,
      }
  },
  props: [
      'lastEventMapId',
      'maps',
  ],
  watch: {
    maps() {
        if(this.overviewMapCount < 1) {
            this.initOverviewMap();
            this.overviewMapCount++
        }
    },
    lastEventMapId(newId, oldId) {
        if(newId !== oldId && oldId) {
            this.$openlayers.getMap(oldId).removeControl(this.overviewMap)
            this.initOverviewMap(newId);
        }   
    },
  },
  methods: {
      initOverviewMap(id = this.maps[0].id) {
        this.overviewMap = new OverviewMap({
            collapsed: false,
            target: "overview-map",
        })
        this.$openlayers.getMap(id).addControl(this.overviewMap);
      }
  },
}
</script>

<style>
    .ol-overviewmap .ol-overviewmap-box {
        border: 2px solid red;
      }
</style>

