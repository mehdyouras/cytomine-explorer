<template>
  <div>
      <dt>Name</dt>
      <dd>{{currentMap.data.instanceFilename}}</dd>
      <dt>Width</dt>
      <dd>{{currentMap.data.width}} pixels</dd>
      <dt>Height</dt>
      <dd>{{currentMap.data.height}} pixels</dd>
  </div>
</template>

<script>
export default {
  name: 'Informations',
  props: [
      'currentMap'
  ]
}
</script>
