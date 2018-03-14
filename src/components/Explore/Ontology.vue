<template>
  <div>
        <ul>
            <li v-for="term in terms" :key="'term-'+term.id">
                <input type="checkbox" :name="'term-'+term.id" :id="'term-'+term.id">
                <label :for="'term-'+term.id">{{term.key}} ({{term.value}})</label>
                <label :for="'show-term-'+term.id">Show</label>
                <input v-model="visibleTerms" :value="term.id" type="checkbox" :id="'show-term-'+term.id">
            </li>
        </ul>

        <input v-model="showWithNoTerm" type="checkbox" name="showNoTermAnnotation" id="showNoTermAnnotation">
        <label for="showNoTermAnnotation">Show annotations without terms</label>

        <button @click="showAllTerms">Show all</button>
        <button @click="hideAllTerms">Hide all</button>
  </div>
</template>

<script>
export default {
  name: 'Ontology',
  props: [
      'featureSelected',
  ],
  data() {
      return {
          terms: [],
          visibleTerms: [],
          showWithNoTerm: true,
      }
  },
  computed: {
      termsId() {
          return this.terms.map(term => term.id);
      },
      featureSelectedId() {
          return this.featureSelected.getId();
      }
  },
  watch: {
      visibleTerms(newValue) {
          this.$emit('showTerms', newValue);
      },
      showWithNoTerm(newValue) {
          this.$emit('showWithNoTerm', newValue);
      }
  },
  methods: {
      showAllTerms() {
          this.visibleTerms = this.termsId;
          this.showWithNoTerm = true;
      },
      hideAllTerms() {
          this.visibleTerms = [];
          this.showWithNoTerm = false;
      },
  },
  created() {
      api.get(`/api/project/1493/stats/term.json`).then(data => {
          this.terms = data.data.collection;
          this.visibleTerms = this.termsId;
          this.$emit('showTerms', this.termsId);
          this.$emit('allTerms', this.terms);
      })
  }
}
</script>
