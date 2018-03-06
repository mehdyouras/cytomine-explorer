<template>
  <div>
      <select @change="handleKey" v-model="colorSelected" name="property-color" id="property-color">
          <option v-for="color in colors" :key="color.value" :value="color.value">{{color.name}}</option>
      </select>
      <select @change="handleKey" v-model="propertySelected" name="properties" id="properties">
          <option value="">No key selected</option>
          <option v-for="property in propertiesToShow" :key="property.key" :value="property">{{property.key}}</option>
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
        'layersSelected',
    ],
    data() {
        return {
            propertiesAvailable: [],
            propertySelected: "",
            propertiesToShow: [],
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
                    value: '#008000',
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
            colorSelected: '#000000',
            keys: [],
        }
    },
    computed: {
        features() {
            let layers = this.$openlayers.getMap(this.currentMap.id).getLayers();
            let index = layers.getArray().findIndex(layer => layer.get('title') === 33)
            return layers.getArray()[index].getSource() ? layers.getArray()[index].getSource().getFeatures() : null;
        },
    },
    watch: {
        layersSelected(newValue) {
           this.propertiesToShow = newValue === [] ? [] : this.propertiesAvailable;
        }
    },
    methods: {
        handleKey() {
            this.removeKeys(); 
            this.layersSelected.map(layer => {
                api.get(`/api/user/${layer.id}/imageinstance/1577/annotationposition.json?key=${this.propertySelected.key}`).then(data => {
                    this.keys = data.data.collection;
                    this.keys.map(key => {
                        let index = this.features.findIndex(feature => feature.getId() == key.idAnnotation);
                        let text = new Text({
                            font: '24px sans-serif',
                            fill: new Fill({
                                color: this.colorSelected,
                            }),
                            text: key.value,
                            overflow: true,
                        })
                        this.features[index].getStyle().setText(text);
                    })
                    this.$openlayers.getMap(this.currentMap.id).render();
                })
            })        
        },
        removeKeys() {
            this.features.map(feature => feature.getStyle().setText(new Text({text: ""})));
        }
    },
    created() {
        api.get(`/api/annotation/property/key.json?idImage=${this.currentMap.imageId}&user=true`).then(data => {
            this.propertiesAvailable = data.data.collection;
        })
    }
}
</script>

<style>

</style>
