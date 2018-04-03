<template>
  <div>
    <div @click="getMousePos" :id="'colormaps-' + currentMap.id"></div>
    <label for="">X:</label>
    <input v-model.number="xSelected" type="number" step="1" :max="[0, Math.pow(2, this.data.bitdepth) - 1]" :min="0">

    <label for="">Y:</label>
    <input  v-model.number="yValue" type="range" step="1" :max="255" :min="0">
    <span>{{yValue}}</span>
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
        },
        xSelected: 0,
        yValue: 0,
        yRange: [0, 255],
        traces: {
          r: {},
          g: {},
          b: {},
          l: {},
        },
        layout: {},
        datarevision: 0,
      }
    },
    computed: {
      xRange() {
        return this.data.bitdepth ? [0, Math.pow(2, this.data.bitdepth) - 1] : [0, Math.pow(2, 8) - 1]
      },
      graphDiv() {
        return document.getElementById(this.colormapId);
      },
      colormapId() {
        return `colormaps-${this.currentMap.id}`;
      },
      tracesArray() {
        return [this.traces.r, this.traces.g, this.traces.b];
      }
    },
    watch: {
      yValue() {
        let index = this.traces.b.x.findIndex(item => item == this.xSelected);
        if(index < 0) {
          this.traces.b.x.push(this.xSelected);
          this.traces.b.x = this.traces.b.x.sort((a, b) => {
              return a - b;
          });
          this.traces.b.y.splice(index, 0, this.yValue);
        } else {
          this.traces.b.y[index] = this.yValue;
        }

        this.layout.datarevision++;

        Plotly.update(this.colormapId, this.tracesArray, this.layout)
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
    },
    mounted() {
      this.traces.r = this.newTrace('red');
      this.traces.g = this.newTrace('green');
      this.traces.b = this.newTrace('blue');

      this.layout = {
        title: 'Colormaps',
        xaxis: {
          fixedrange: true,
        },
        yaxis: {
          fixedrange: true,
        },
        hovermode: 'closest',
        hoverdistance: -1,
        datarevision: this.datarevision,
      }

      Plotly.react(this.colormapId, this.tracesArray, this.layout, {displayModeBar: false});
    }
}
</script>