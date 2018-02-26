<template>
  <div>
      <ul>
          <li v-for="term in terms" :key="term.id">{{term.key}} ({{term.value}})</li>
      </ul>
  </div>
</template>

<script>
export default {
  name: 'Ontology',
  data() {
      return {
          terms: [],
      }
  },
  created() {
      api.get(`/api/project/1493/stats/term.json`).then(data => {
          this.terms = data.data.collection;
      })
  }
}
</script>
