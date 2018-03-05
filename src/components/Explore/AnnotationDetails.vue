<template>
  <div v-if="annotationIsClicked">
      <img :src="data.smallCropURL" alt="An image of the annotation area">
      <dl>
          <dt>Area</dt>
          <dd>{{data.area}} {{data.areaUnit}}</dd>
          <dt>Perimeter</dt>
          <dd>{{data.perimeter}} {{data.perimeterUnit}}</dd>
          <dt>Term(s)</dt>
          <dd v-for="term in data.term" :key="'term-'+term">{{displayTerm(term)}}</dd>
          <dt>User</dt>
          <dd>{{displayName(data.user)}}</dd>
      </dl>
  </div>
</template>

<script>
import hexToRgb from '../../helpers/hexToRgb'

import Style from 'ol/style/style';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';

export default {
  name: 'AnnotationDetails',
  data() {
      return {
          annotationIsClicked: false,
          data: {},
      }
  },
  props: [
      'currentMap',
      'featureSelected',
      'users',
      'terms',
  ],
  watch: {
    featureSelected(newFeature, oldFeature) {
        if(oldFeature === undefined || oldFeature.hasOwnProperty('id_')) {
            this.annotationIsClicked = false;
        }
        if(newFeature !== undefined) {
            api.get(`/api/annotation/${newFeature.getId()}.json`).then(data => {
                this.data = data.data;
                this.annotationIsClicked = true;
            })
        } else {
            this.annotationIsClicked = false;
        }
    }
  },
  methods: {
      displayName(userId) {
          let index = this.users.findIndex(user => user.id === userId);
          return `${this.users[index].lastname} ${this.users[index].firstname} (${this.users[index].username})`;
      },
      displayTerm(termId) {
          let index = this.terms.findIndex(term => term.id === termId);
          return this.terms[index].key;
      }
  },
}
</script>
