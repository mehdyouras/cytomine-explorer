<template>
  <div>
    <div :id="'colormaps-' + currentMap.id"></div>
    <select v-model="colorSelected">
      <option value="r">Red</option>
      <option value="g">Green</option>
      <option value="b">Blue</option>
      <option value="l">Luminance</option>
    </select>
    <label for="">X:</label>
    <input v-model.number="xSelected" type="number" step="1" :max="Math.pow(2, data.bitdepth) - 1" :min="0">
    <input v-model.number="xSelected" type="range" step="1" :max="Math.pow(2, data.bitdepth) - 1" :min="0">

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
        colorSelected: 'r',
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
        let trace = this.traces[this.colorSelected];
        let index = () => trace.x.findIndex(item => item == this.xSelected);
        
        if(index() < 0) {
          trace.x.push(this.xSelected);
          trace.x = trace.x.sort((a, b) => {
              return a - b;
          });
          trace.y.splice(index(), 0, this.yValue);
        } else {
          trace.y[index()] = this.yValue;
        }

        this.traces[this.colorSelected] = trace;
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
          x: this.data.bitdepth ? [0, Math.pow(2, this.data.bitdepth) - 1] : [0, Math.pow(2, 8) - 1],
          y: [0, 255],
          type: 'scatter',
          name: color[0].toUpperCase() + color.substr(1),
          line: {
            color: lineColor,
          }
        }
      },
      setValueToEdit(data) {
        let xCoordinate = Math.round(data.points[0].xaxis.p2l(data.event.layerX - data.points[0].xaxis._offset));
        this.xSelected = xCoordinate;
      }
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
      this.graphDiv.on('plotly_click', (data) => this.setValueToEdit(data));
    }
}
</script>