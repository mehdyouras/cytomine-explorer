<template>
  <div>
      <h4>Spectra</h4>
      <div id="spectra"></div>
  </div>
</template>

<script>
import Plotly from 'plotly.js/lib/core';

export default {
    name: 'Spectra',
    props: [
        'imageSequence',
        'imageGroup',
    ],
    data() {
        return {
            hdf5: {},
            yAxis: [],
        }
    },
    computed: {
        xAxis() {
            let xAxis = [];
            this.imageGroup.map((image, index) => xAxis.push(index + 1))
            return xAxis;
        }
    },
    created() {
        api.get(`/api/imagegroup/${this.imageSequence.imageGroup}/imagegroupHDF5.json`).then(data => {
            this.hdf5 = data.data;
            api.get(`/api/imagegroupHDF5/${this.hdf5.id}/816/61/pixel.json`).then(response => {
                this.yAxis = response.data.spectra;
                let trace = {
                    x: this.xAxis,
                    y: this.yAxis,
                    type: 'scatter',
                }
                new Plotly.newPlot('spectra', [trace]);
            })
        })
    },
}
</script>