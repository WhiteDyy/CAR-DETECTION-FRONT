<!-- <template>
  <div class="trend-chart">
    <VChart :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { computed } from 'vue';
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
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

const chartOption = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
    top: 10,
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  },
  tooltip: { trigger: 'axis' },
  grid: {
    left: '10%',
    right: '5%',
    top: '20%',
    bottom: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: props.xAxisData,
    axisLine: { show: true },
    axisTick: { show: true },
    splitLine: {
      show: true,
      lineStyle: { type: 'dashed', width: 1 },
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true,
      lineStyle: { type: 'dashed', width: 1 },
    },
  },
  series: [{
    name: `${props.parameter}-曲线`,
    type: 'line',
    data: props.data[props.parameter] || [],
    smooth: true,
    lineStyle: { width: 2, type: 'solid', color: props.color },
    symbol: 'none',
    animationDuration: 500,
  }],
}));
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 100%;
}
</style> -->

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
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

// Downsample data if too large
const maxDisplayPoints = 500; // Maximum points to display
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
      fontSize: 14, // Slightly smaller for performance
      fontWeight: 'bold',
    },
  },
  tooltip: {
    trigger: 'axis',
    confine: true, // Keep tooltip within chart
  },
  grid: {
    left: '5%', // Reduced margins for better space usage
    right: '5%',
    top: '15%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: chartData.value.xAxisData,
    axisLine: { show: true },
    axisTick: { show: false }, // Disable ticks for performance
    splitLine: {
      show: false, // Disable split lines for performance
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: false, // Disable split lines for performance
    },
  },
  series: [{
    name: `${props.parameter}-曲线`,
    type: 'line',
    data: chartData.value.seriesData,
    smooth: false, // Disable smoothing for performance
    lineStyle: { width: 1, color: props.color }, // Thinner line
    symbol: 'none', // No symbols for points
    animation: false, // Disable animation for large datasets
    large: true, // Enable ECharts large mode
    progressive: 500, // Incremental rendering
    progressiveThreshold: 1000, // Start progressive rendering at 1000 points
  }],
}));

// Optional: Log rendering performance (for debugging)
const onChartRendered = () => {
  // console.log(`Chart ${props.title} rendered`);
};
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 100%;
}
</style>