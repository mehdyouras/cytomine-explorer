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
    }
}
</script>

<style>

</style>
