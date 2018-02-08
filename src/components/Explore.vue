<template>
    <div class="map">
        <div @mousemove="sendView" @mousewheel="sendView" :id="currentMap.id">
        </div>
        <label :for="'link-'+this.currentMap.id">Lier la carte</label>
        <select @change="sendLink" v-model="linkValue" name="link" :id="'link-'+this.currentMap.id">
            <option value="">Choisir une carte</option>
            <option v-for="(map, index) in maps" v-if="map.id" :key="map.id" :value="map.id">{{mapNames[index]}}</option>
        </select>
        <button @click="deleteMap">Supprimer la carte</button>
    </div>
</template>

<script>
export default {
  name: 'Explore',
  data () {
    return {
        linkValue: "",
        mapNames: ['Panneau supérieur gauche', 'Panneau supérieur droit', 'Panneau inférieur gauche', 'Panneau inférieur droit'],
    }
  },
  props: [
    'mapView',
    'maps',
    'currentMap',
    'lastEventMapId',
  ],
  computed: {
    linkedTo() {
        return this.currentMap.linkedTo;
    },
    mapCenter() {
        return this.mapView.mapCenter;
    },
    mapZoom() {
        return this.mapView.mapZoom;
    },
    mapRotation() {
        return this.mapView.mapRotation;
    },
  },
  watch: {
    // Watches these values
    mapCenter() {
        // Checks if the last event was on a linked map
        if(this.currentMap.linkedTo == this.lastEventMapId) {
            // Apply changes
            this.$openlayers.getView(this.currentMap.id).setCenter(this.mapCenter);
        }
    },
    mapZoom() {
        // Checks if the last event was on a linked map
        if(this.currentMap.linkedTo == this.lastEventMapId) {
            // Apply changes
            this.$openlayers.getView(this.currentMap.id).setZoom(this.mapZoom);
        }
    },
    mapRotation() {
        // Checks if the last event was on a linked map
        if(this.currentMap.linkedTo == this.lastEventMapId) {
            // Apply changes
            this.$openlayers.getView(this.currentMap.id).setRotation(this.mapRotation);
        }
    },
    linkedTo() {
        // Sets the local value to the value sent by the parent
        this.linkValue = this.currentMap.linkedTo;
    }
  },
  methods: {
    // Sends view infos
    sendView() {
        let payload = {
            mapId: this.currentMap.id,
            view: this.$openlayers.getView(this.currentMap.id),
        }
        this.$emit('dragged', payload);
    },
    sendLink() {
        let payload = [this.currentMap.id, this.linkValue];
        this.$emit('mapIsLinked', payload);
    },
    deleteMap() {
        this.$emit('deleteMap', this.currentMap.id);
    }
  },
  mounted() {
    // Init map
    this.$openlayers.init({
      element: this.currentMap.id,
      center: this.mapCenter,
      zoom: this.mapZoom,
      enableZoomButton: true,
      enablePan: true,
      enableMouseWheelZoom: true,
      enableDoubleClickZoom: true,
      enableScaleLine: true,  
    })
    // Adds layer
    this.$openlayers.addLayer({element: this.currentMap.id, name: 'Map', type: "OSM"})
  }
}

</script>

<style>
  .map {
    width: 50%;
  }
</style>
