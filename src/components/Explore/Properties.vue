<template>
  <div>
      <select @change="handleKey" v-model="colorSelected" name="property-color" id="property-color">
          <option v-for="color in colors" :key="color.value" :value="color.value">{{color.name}}</option>
      </select>
      <select @change="handleKey" v-model="propertySelected" name="properties" id="properties">
          <option value="">No key selected</option>
          <option v-for="property in propertiesAvailable" :key="property.key" :value="property">{{property.key}}</option>
      </select>
  </div>
</template>

<script>
import Text from 'ol/style/text';
import Fill from 'ol/style/fill';

export default {
    name: 'Properties',
    props: [
        'currentMap',
    ],
    data() {
        return {
            propertiesAvailable: [],
            propertySelected: "",
            colors: [
                {
                    value: '#ffffff',
                    name: 'White'
                },
                {
                    value: '#ff0000',
                    name: 'Red'
                },
                {
                    value: '#ff6600',
                    name: 'Orange'
                },
                {
                    value: '#ffff00',
                    name: 'Yellow'
                },
                {
                    value: '#0080000',
                    name: 'Green',
                },
                {
                    value: '#0000ff',
                    name: 'Blue',
                },
                {
                    value: '#800080',
                    name: 'Purple',
                },
                {
                    value: '#000000',
                    name: 'Black',
                },
            ],
            colorSelected: '#ffffff',
            keys: [],
        }
    },
    computed: {
        features() {
            let layers = this.$openlayers.getMap(this.currentMap.id).getLayers();
            let index = layers.getArray().findIndex(layer => layer.get('title') === 33)
            return layers.getArray()[index].getSource().getFeatures();
        },
    },
    methods: {
        handleKey() {         
            this.keys.map(key => {
                let index = this.features.findIndex(feature => feature.getId() == key.idAnnotation);
                let text = new Text({
                    font: '20px sans-serif',
                    fill: new Fill({
                        color: this.colorSelected,
                    }),
                    text: key.value,
                })
                this.features[index].getStyle().setText(text);
                this.$openlayers.getMap(this.currentMap.id).renderSync();
            })
        },
    },
    created() {
        api.get(`/api/annotation/property/key.json?idImage=${this.currentMap.imageId}&user=true`).then(data => {
            this.propertiesAvailable = data.data.collection;
        })
        api.get(`/api/user/33/imageinstance/1577/annotationposition.json?key=slot`).then(data => {
            this.keys = data.data.collection;
        })
    }
}
</script>

<style>

</style>
