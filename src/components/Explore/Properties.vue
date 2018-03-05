<template>
  <div>
      <select v-model="colorSelected" name="property-color" id="property-color">
          <option v-for="color in colors" :key="color.value" :value="color.value">{{color.name}}</option>
      </select>
      <select v-model="propertySelected" name="properties" id="properties">
          <option value="">No key selected</option>
          <option v-for="property in properties" :key="property.key" :value="property">{{property.key}}</option>
      </select>
  </div>
</template>

<script>
export default {
    name: 'Properties',
    data() {
        return {
            properties: [],
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
                    value: 'ff6600',
                    name: 'Orange'
                },
                {
                    value: 'ffff00',
                    name: 'Yellow'
                },
                {
                    value: '0080000',
                    name: 'Green',
                },
                {
                    value: '0000ff',
                    name: 'Blue',
                },
                {
                    value: '800080',
                    name: 'Purple',
                },
                {
                    value: '000000',
                    name: 'Black',
                },
            ],
            colorSelected: '#ffffff',
        }
    },
    props: [
        'currentMap',
    ],
    created() {
        api.get(`/api/annotation/property/key.json?idImage=${this.currentMap.imageId}&user=true`).then(data => {
            this.properties = data.data.collection;
        })
    }
}
</script>

<style>

</style>
