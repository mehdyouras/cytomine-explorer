<template>
  <div>
      <ul class="container">
          <li class="img-box" v-for="annotation in annotations" :key="annotation.id"><img class="annot-img" :src="annotation.smallCropURL" alt=""></li>
      </ul>
  </div>
</template>

<script>
export default {
  name: 'Annotations',
  data() {
      return {
          annotations: [],
      }
  },
  props: [
      'currentMap'
  ],
  created() {
      api.get(`/api/annotation.json?&image=${this.currentMap.imageId}&reviewed=false`).then(data => {
          this.annotations = data.data.collection;
      })
  }
}
</script>

<style scoped>
    .img-box {
        width: 100px;
        height: 100px;
    }
    .annot-img {
        max-width: 90px;
    }
    .container {
        display: flex;
        list-style: none;
    }
</style>

