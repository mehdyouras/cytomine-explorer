<template>
  <div>
        <template v-for="term in terms">
            <input v-model="termsChecked" :value="term.id" type="checkbox" :id="'term-'+term.id" :key="'term-'+term.id">
            <label :key="'label-'+term.id" :for="'term-'+term.id">{{term.key}} ({{term.value}})</label>
        </template>

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
      'termsToShow'
  ],
  data() {
      return {
          terms: [],
          termsChecked: [],
          showWithNoTerm: true,
      }
  },
  computed: {
      termsId() {
          return this.terms.map(term => term.id);
      }
  },
  watch: {
      termsChecked(newValue) {
          this.$emit('showTerms', newValue);
      },
      showWithNoTerm(newValue) {
          this.$emit('showWithNoTerm', newValue);
      }
  },
  methods: {
      showAllTerms() {
          this.termsChecked = this.termsId;
      },
      hideAllTerms() {
          this.termsChecked = [];
      },
  },
  created() {
      api.get(`/api/project/1493/stats/term.json`).then(data => {
          this.terms = data.data.collection;
          this.termsChecked = this.termsId;
          this.$emit('showTerms', this.termsId);
      })
  }
}
</script>
