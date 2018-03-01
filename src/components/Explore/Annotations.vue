<template>
  <div>
      <button @click="filter = 'all'">All</button>
      <button @click="filter = term.id" v-for="term in terms" :key="term.id">{{term.key}}</button>
      <ul class="container">
        <li class="img-box" v-for="annotation in annotationsToShow" :key="annotation.id">
            <popper>
                <div class="popper" trigger="hover" :options="{placement: 'top'}">
                    <h4>Annotation details</h4>
                    <dl>
                        <dt>Created by</dt>
                        <dd v-if="annotation.user !== undefined">{{userById(annotation.user)}}</dd>
                        <dt>Date</dt>
                        <dd>{{humanDate(annotation.created)}}</dd>
                        <template v-if="annotation.userByTerm[0]">
                            <dt>Term associated</dt>
                            <dd v-for="term in annotation.userByTerm" :key="term.id">
                                <span v-for="user in term.user" :key="user">{{userById(user)}}</span> has associated {{termById(term.term)}}
                            </dd>
                        </template>
                    </dl>
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
          filter: 'all',
      }
  },
  props: [
      'currentMap',
      'users',
      'terms'
  ],
  computed: {
      annotationsToShow() {
          switch (this.filter) {
            case 'all':
                return this.annotations;
            break;
            default:
                return this.annotations.filter(annotation => {
                    return annotation.term.findIndex(term => term == this.filter) < 0 ? false : true;
                });
            break;
          }
      }
  },
  methods: {
      userById(userId) {
            let index = this.users.findIndex(user => user.id === userId);
            return index < 0 ? null : `${this.users[index].lastname} ${this.users[index].firstname} (${this.users[index].username})`
      },
      termById(termId) {
          let index = this.terms.findIndex(term => term.id === termId);
          return index < 0 ? null : this.terms[index].key
      },
      humanDate(date) {
          date = new Date(date).toISOString();
          date = date.replace('T', ' ');
          date = date.substring(0, date.indexOf('.'));
          return date;
      }
  },
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

