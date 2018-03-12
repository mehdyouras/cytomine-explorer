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
            spectra: {},
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
    methods: {
        updateSpectra(newdata) {
            let trace = {
                y: newData,
                type: 'scatter',
            };
            let layout = {
                xaxis: {
                    range: [0, this.imageGroup.length],
                }
            }
            Plotly.newPlot('spectra', [trace], layout)
        },
    },
    created() {
        api.get(`/api/imagegroup/${this.imageSequence.imageGroup}/imagegroupHDF5.json`).then(data => {
            this.hdf5 = data.data;
            api.get(`/api/imagegroupHDF5/${this.hdf5.id}/816/61/pixel.json`).then(response => {
                this.yAxis = response.data.spectra;
                let trace = {
                    y: this.yAxis,
                    type: 'scatter',
                }
                let layout = {
                    xaxis: {
                        range: [0, this.imageGroup.length],
                    }
                }
                new Plotly.newPlot('spectra', [trace], layout);
            })
        })
    },
}
</script>