<template>
  <div>
    <section>
      <h4>Review | Action selection</h4>
      <dl v-if="isSelected()">
        <dt>Annotation:</dt>
        <dd>{{featureId}}</dd>
        <dt>User</dt>
        <dd>{{featureUser}}</dd>
        <dt>Created:</dt>
        <dd>{{featureDate}}</dd>
        <dt>Term(s):</dt>
        <dd></dd>
      </dl>
      <button :disabled="this.featureSelectedData.reviewed" @click="acceptReview">Accept</button>
      <button :disabled="!this.featureSelectedData.reviewed" @click="rejectReview">Reject</button>
    </section>
  </div>
</template>

<script>
import humanDate from '../../helpers/humanDate'

export default {
    name:'Review',
    props: [
      'featureSelected',
      'featureSelectedData',
      'userLayers'
    ],
    computed: {
      featureId() {
        return this.isSelected() ? this.featureSelectedData.id : "";
      },
      featureUser() {
        return this.isSelected() ? this.displayName(this.featureSelectedData.user) : "";
      },
      featureDate() {
        return this.featureSelectedData.created ? humanDate(this.featureSelectedData.created) : "";
      },
    },
    methods: {
      isSelected() {
        return this.featureSelected != undefined;
      },
      displayName(userId) {
        let index = this.userLayers.findIndex(user => user.id == userId);
        return index < 0 ? "" : `${this.userLayers[index].lastname} ${this.userLayers[index].firstname} (${this.userLayers[index].username})`
      },
      acceptReview() {
        api.put(`/api/annotation/${this.featureId}/review.json`, {
          id:this.featureId,
          terms: this.featureSelectedData.term,
        }).then(() => {
          this.$emit('updateLayers', true)
        })
      },
      rejectReview() {
        api.delete(`/api/annotation/${this.featureSelectedData.parentIdent}/review.json`).then(() => {
          this.$emit('updateLayers', true)
        })
      }
    }
}
</script>

<style>

</style>
