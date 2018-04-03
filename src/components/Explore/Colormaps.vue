<template>
  <div>
    <div @mousedown="test2" :id="'colormaps-' + currentMap.id"></div>
  </div>
</template>

<script>
import Plotly from 'plotly.js/lib/core';

export default {
    name: 'Colormaps',
    props: [
      'currentMap'
    ],
    data() {
      return {
        data: {
          bitdepth: 10,
          colorspace: 'rgb',
        }
      }
    },
    computed: {
      xRange() {
        return this.data.bitdepth ? Array.from(Array(Math.pow(2, this.data.bitdepth)).keys()) : Array.from(Array(Math.pow(2, 8)).keys())
      },
      yRange() {
        return Array.from(Array(256).keys())
      },
      graphDiv() {
        return document.getElementById('colormaps-' + this.currentMap.id);
      }
    },
    methods: {
      newTrace(color) {
        let lineColor;
        switch (color) {
          case 'red':
            lineColor = 'rgb(255, 0, 0)';
            break;
          case 'green':
            lineColor = 'rgb(0, 255, 0)';
            break;
          case 'blue':
            lineColor = 'rgb(0, 0, 255)';
            break;
          default:
            lineColor = 'rgb(135, 135, 135)';
            color = 'gray';
            break;
        }
        return {
          x: this.xRange,
          y: this.yRange,
          type: 'scatter',
          name: color[0].toUpperCase() + color.substr(1),
          line: {
            color: lineColor,
          }
        }
      },
      test(data) {
        console.log('click', data)
      },
      test2(evt) {
        console.log(evt)
      }
    },
    mounted() {
      let traceR = this.newTrace('red');
      let traceG = this.newTrace('green');
      let traceB = this.newTrace('blue');

      let layout = {
        title: 'Colormaps',
        xaxis: {
          fixedrange: true,
        },
        yaxis: {
          fixedrange: true,
        },
      }

      let data = [traceR, traceG, traceB];
      Plotly.newPlot(`colormaps-${this.currentMap.id}`, data, layout, {displayModeBar: false});
      this.graphDiv.on('plotly_click', (data) => this.test(data));
      // this.graphDiv.addEventListener('mousedown', console.log('yo'))
    }
}
</script>