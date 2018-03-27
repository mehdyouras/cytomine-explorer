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
        let id = this.featureSelectedData.parentIdent ? this.featureSelectedData.parentIdent : this.featureId;
        api.put(`/api/annotation/${id}/review.json`, {
          id:this.featureId,
          terms: this.featureSelectedData.term,
        }).then(data => {
          this.featureSelected.getStyle().getStroke().setColor([91, 183, 91]);
          this.featureSelected.changed();
          this.$emit('featureSelectedData', data.data.reviewedannotation);
        })
      },
      rejectReview() {
        let id = this.featureSelectedData.parentIdent;
        api.delete(`/api/annotation/${id}/review.json`).then(data => {
          this.featureSelected.getStyle().getStroke().setColor([189, 54, 47]);
          this.featureSelected.changed();
          api.get(`/api/annotation/${id}.json`).then(data => {
            this.$emit('featureSelectedData', data.data);
          })
        })
      }
    }
}
</script>

<style>

</style>
