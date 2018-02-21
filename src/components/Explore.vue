<template>
    <div class="map">
        <div @mousemove="sendView" @mousewheel="sendView" :id="currentMap.id">
        </div>
        <label :for="'link-'+currentMap.id">Link the map</label>
        <select @change="sendLink" v-model="linkValue" name="link" :id="'link-'+currentMap.id">
            <option value="">Select a map</option>
            <template v-for="(map, index) in maps">
                <option v-if="index !== mapIndex" :key="map.id" :value="map.id">{{mapNames[index]}}</option>
            </template>
        </select>
        <div>
            <label :for="'original-filter-'+currentMap.id">Original</label>
            <input v-model="filterSelected" type="radio" :name="'filter-original-'+currentMap.id" :id="'filter-original-'+currentMap.id" value="">
            <div v-for="filter in filters" :key="filter.id">
                <label :for="'filter-'+filter.id+'-'+currentMap.id">{{filter.name}}</label>
                <input v-model="filterSelected" type="radio" :name="'filter-'+filter.id+'-'+currentMap.id" :id="'filter-'+filter.id+'-'+currentMap.id" :value="filter">
            </div>
        </div>
        <annotations :currentMap="currentMap"></annotations>
        <button @click="deleteMap">Delete the map</button>
    </div>
</template>

<script>
import Annotations from './Annotations';
import OlXYZ from 'ol/source/tileimage'
import OlTile from 'ol/layer/tile'
import proj from 'ol/proj';
import Projection from 'ol/proj/projection';
import TileGrid from 'ol/tilegrid/tilegrid';

export default {
  name: 'Explore',
  components: {
      Annotations,
  },
  data () {
    return {
        linkValue: "",
        mapNames: ['Panneau supérieur gauche', 'Panneau supérieur droit', 'Panneau inférieur gauche', 'Panneau inférieur droit'],
        imsBaseUrl: 'http://localhost-ims/',
        filterSelected: "",
    }
  },
  props: [
    'mapView',
    'maps',
    'currentMap',
    'lastEventMapId',
    'filters'
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
    mapIndex() {
        return this.maps.findIndex(map => map.id === this.currentMap.id);
    },
    filterUrl() {
        if(this.filterSelected !== "") {
            return `${this.imsBaseUrl}${this.filterSelected.baseUrl}`;
        } else {
            return "";
        }
    }
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
    },
    filterSelected() {
        //sets filter on change 
        this.$openlayers.setLayer({
            element: this.currentMap.id,
            type: 'XYZ',
            url:`${this.filterUrl}${this.imsBaseUrl}image/tile?zoomify=${this.currentMap.data.fullPath}/&tileGroup=0&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.currentMap.data.mime}`, 
        })
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
    // Sends which map is linked to this one to the parent
    sendLink() {
        let payload = [this.currentMap.id, this.linkValue];
        this.$emit('mapIsLinked', payload);
    },
    deleteMap() {
        this.$emit('deleteMap', this.currentMap.id);
    },
  },
  mounted() {
    let extent = [0, 0, parseInt(this.currentMap.data.width)+(8*256), parseInt(this.currentMap.data.height)];

    // Init map
    this.$openlayers.init({
      element: this.currentMap.id,
      center: [parseInt(this.currentMap.data.width)/2, parseInt(this.currentMap.data.height)/2],
      zoom: this.mapZoom,
      enableZoomButton: true,
      enablePan: true,
      enableMouseWheelZoom: true,
      enableDoubleClickZoom: true,
      enableScaleLine: true,
      minZoom: 2,
      projection: new Projection({
        code: 'EPSG:3857',
        extent,
      }),
    })

    // Adds layer
    let layer = new OlTile({
        source: new OlXYZ({
            url: `${this.filterUrl}${this.imsBaseUrl}image/tile?zoomify=${this.currentMap.data.fullPath}/&tileGroup=0&z={z}&x={x}&y={y}&channels=0&layer=0&timeframe=0&mimeType=${this.currentMap.data.mime}`,
        }),
        extent,    
    })
    this.$openlayers.getMap(this.currentMap.id).addLayer(layer)
    this.$openlayers.getView(this.currentMap.id).setMaxZoom(this.currentMap.data.depth);
  }
}

</script>

<style>
  .map {
    width: 100%;
    height: 100vh;
  }
</style>
