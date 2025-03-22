<!-- TrendChart.vue -->
<template>
  <div class="trend-chart">
    <VChart :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import {
  BarChart,
  LineChart,
  PieChart,
} from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import {
  UniversalTransition,
} from 'echarts/features'
import {
  CanvasRenderer,
} from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'

// 定义 props
const props = defineProps({
  // 图表数据
  data: {
    type: Object,
    required: true,
  },
  // 参数列表
  parameters: {
    type: Array,
    default: () => [],
  },
  // 颜色映射
  colorMap: {
    type: Object,
    default: () => ({}),
  },
  // X轴数据
  xAxisData: {
    type: Array,
    default: () => [],
  },
})

// 注册 ECharts 组件
use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  PieChart,
])

// 计算图表配置
const chartOption = computed(() => {
  const gridHeight = 64
  const gridSpacing = 16
  const grids = props.parameters.map((_, index) => ({
    left: '2%',
    right: '3%',
    top: 10 + (gridHeight + gridSpacing) * index,
    height: gridHeight,
  }))

  const xAxis = props.parameters.map((_, index) => ({
    type: 'category',
    gridIndex: index,
    data: props.xAxisData,
    axisLine: { show: index === props.parameters.length - 1 },
    axisTick: { show: index === props.parameters.length - 1 },
    splitLine: { // 所有图表显示网格线
      show: true,
      lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 },
    },
  }))

  const yAxis = props.parameters.map((_, index) => ({
    type: 'value',
    gridIndex: index,
    splitLine: { // 每个 Y 轴都显示网格线
      show: true,
      lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 },
    },
  }))

  const series = props.parameters.map((param, index) => ({
    name: `${param}-曲线`,
    type: 'line',
    xAxisIndex: index,
    yAxisIndex: index,
    data: props.data[param] || [],
    smooth: true,
    lineStyle: { width: 2, type: 'solid', color: props.colorMap[param] },
    symbol: 'none', // 不显示数据点
  }))

  return {
    tooltip: { trigger: 'axis' },
    grid: grids,
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    xAxis,
    yAxis,
    series,
  }
})
</script>

<style scoped>
.trend-chart {
  height: 790px;
}
</style>
