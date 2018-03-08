<template>
  <div v-if="imageInAGroup">
      <h4>Multidimension</h4>
  </div>
</template>

<script>
export default {
    name: 'Multidimension',
    props: [
        'currentMap'
    ],
    data() {
        return {
            imageInAGroup: false,
            imageSequence: [],
            imageGroup: [],
        }
    },
    created() {
        api.get(`/api/imageinstance/${this.currentMap.imageId}/imagesequence.json`).then(data => {
            if(data.data) {
                this.imageInAGroup = true
                this.imageSequence = data.data;
            }
        })
        api.get(`/api/project/${this.currentMap.data.project}/imagegroup.json`).then(data => {
            if(data.data.collection) {
                this.imageGroup = data.data.collection;
            }
        })
    }
}
</script>
