<template>
  <div>
      <div>
        <dt>Name</dt>
        <dd>{{currentMap.data.instanceFilename}}</dd>
        <dt>Width</dt>
        <dd>{{currentMap.data.width}} pixels</dd>
        <dt>Height</dt>
        <dd>{{currentMap.data.height}} pixels</dd>
      </div>
      <div>
        <ul>
          <li><a :href="`#tabs-image-${currentMap.data.project}-${currentMap.imageId}-0`">Explore</a></li>
          <li><a :href="`#tabs-review-${currentMap.data.project}-${currentMap.imageId}-`">Review</a></li>
          <li><a :href="`#tabs-reviewdash-${currentMap.data.project}-${currentMap.imageId}-null-null`">Review (Cyto)</a></li>
          <li><a  href="#">Validate image</a></li>
          <li><a href="#">Copy image and annotations</a></li>
          <li><a href="#">Import user annotations</a></li>
          <li><a href="#">Description</a></li>
          <li><a :href="`/api/imageinstance/${currentMap.imageId}/download`">Download</a></li>
          <li><a href="#">Rename</a></li>
          <li><a href="#">Delete</a></li>
          <li><a href="#">More info</a></li>
        </ul>
      </div>
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
