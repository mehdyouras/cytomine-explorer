<template>
  <div>
      <ul class="container">
        <li class="img-box" v-for="annotation in annotations" :key="annotation.id">
            <popper>
                <div class="popper" trigger="hover" :options="{placement: 'right'}">
                    <p>test</p>
                </div>
                <div slot="reference">
                    <img class="annot-img" :src="annotation.smallCropURL" alt="">
                </div>
            </popper>
        </li>
      </ul>
  </div>
</template>

<script>
import Popper from 'vue-popperjs';

export default {
  name: 'Annotations',
  components: {
      Popper,
  },
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
        max-height: 90px;
    }
    .container {
        display: flex;
        list-style: none;
    }
</style>

