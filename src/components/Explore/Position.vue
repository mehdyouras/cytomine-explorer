<template>
  <div>
      <div>
        magnitude: unknown    
      </div>
      <div>
          x: , y:
      </div>
  </div>
</template>

<script>
export default {
  name: 'Position',
  props: [
      'currentMap'
  ],
  created() {
      this.$openlayers.getMap(currentMap.id).addControl();
  },
}
</script>
