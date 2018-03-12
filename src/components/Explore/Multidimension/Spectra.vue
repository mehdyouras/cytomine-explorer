<template>
  <div>
      <h4>Spectra</h4>
      <div id="spectra"></div>
  </div>
</template>

<script>
import Plotly from 'plotly.js'

export default {
    name: 'Spectra',
    created() {
        api.get(`/api/imagegroupHDF5/82397/816/61/pixel.json`).then(data => {
            this.testData = data.data.spectra;
            new Plotly.newPlot('spectra', this.testData);
        })
    },
}
</script>