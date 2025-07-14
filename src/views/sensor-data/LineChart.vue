<template>
  <div class="trend-chart">
    <VChart :option="chartOption" autoresize @rendered="onChartRendered" />
  </div>
</template>

<script setup>
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  MarkLineComponent,
  DataZoomComponent 
} from 'echarts/components';
import { use } from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, ref } from 'vue';
import VChart from 'vue-echarts';

const props = defineProps({
  data: { type: Object, required: true },
  parameter: { type: String, required: true },
  color: { type: String, required: true },
  xAxisData: { type: Array, default: () => [] },
  title: { type: String, default: '折线图' },
});

use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

// Downsample data if too large
const maxDisplayPoints = 100; // Maximum points to display
const chartData = computed(() => {
  const rawData = props.data[props.parameter] || [];
  const xAxis = props.xAxisData || [];
  if (rawData.length <= maxDisplayPoints) {
    return { seriesData: rawData, xAxisData: xAxis };
  }

  // Simple downsampling: take every nth point
  const step = Math.ceil(rawData.length / maxDisplayPoints);
  const downsampledData = [];
  const downsampledXAxis = [];
  for (let i = 0; i < rawData.length; i += step) {
    downsampledData.push(rawData[i]);
    downsampledXAxis.push(xAxis[i] || i);
  }
  return { seriesData: downsampledData, xAxisData: downsampledXAxis };
});

const chartOption = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
    top: 10,
    textStyle: {
      fontSize: 14,
      fontWeight: 'bold',
    },
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
  },
  grid: {
    left: '5%',
    right: '5%',
    top: '15%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: chartData.value.xAxisData,
    axisLine: { show: true },
    axisTick: { show: false },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: false,
    },
  },
  series: [{
    name: `${props.parameter}-曲线`,
    type: 'line',
    data: chartData.value.seriesData,
    smooth: false,
    lineStyle: { width: 1, color: props.color },
    symbol: 'none',
    animation: false,
    large: true,
    progressive: 500,
    progressiveThreshold: 100,
    showSymbol: false, // 优化大数据量
  }],
  dataZoom: [{ // 支持缩放
    type: 'slider',
    start: Math.max(0, (chartData.value.seriesData.length - 100) / chartData.value.seriesData.length * 100),
    end: 100,
  }],
  animation: false, // 提高渲染性能
}));

const onChartRendered = () => {
  // console.warn(`Chart ${props.title} rendered`);
};
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 100%;
}
</style>