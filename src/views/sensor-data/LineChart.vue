<template>
  <div class="trend-chart">
    <VChart :option="chartOption" autoresize @rendered="onChartRendered" />
    <!-- 异常或正常状态显示 -->
    <div class="status-indicator">
      <img v-if="hasAnomaly" src="/error.png" alt="Error" class="error-icon">
      <div v-else class="normal-card">
        正常
      </div>
    </div>
  </div>
</template>

<script setup>
import { LineChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'

const props = defineProps({
  data: { type: Object, required: true },
  parameter: { type: String, required: true },
  color: { type: String, required: true },
  xAxisData: { type: Array, default: () => [] },
  title: { type: String, default: '折线图' },
  xAxisName: { type: String, default: 'X Axis' },
  yAxisName: { type: String, default: 'Y Axis' },
})

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
])

const maxDisplayPoints = 100
const chartData = computed(() => {
  const rawData = props.data[props.parameter] || []
  const xAxis = props.xAxisData || []
  if (rawData.length <= maxDisplayPoints) {
    return { seriesData: rawData, xAxisData: xAxis }
  }
  const step = Math.ceil(rawData.length / maxDisplayPoints)
  const downsampledData = []
  const downsampledXAxis = []
  for (let i = 0; i < rawData.length; i += step) {
    downsampledData.push(rawData[i])
    downsampledXAxis.push(xAxis[i] || i)
  }
  return { seriesData: downsampledData, xAxisData: downsampledXAxis }
})

// 异常检测逻辑：仅判断数据是否存在
const hasAnomaly = computed(() => {
  const rawData = props.data[props.parameter]
  return !rawData || rawData.length === 0
})

const chartOption = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
    top: 10,
    textStyle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
  },
  grid: {
    left: '12%',
    right: '5%',
    top: '18%',
    bottom: '20%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: chartData.value.xAxisData,
    name: props.xAxisName,
    nameLocation: 'middle',
    nameGap: 5,
    nameTextStyle: {
      fontSize: 12,
      color: '#FFFFFF',
      padding: [5, 0, 0, 0],
    },
    axisLabel: {
      show: true,
      fontSize: 11,
      color: '#FFFFFF',
      rotate: 0,
      interval: 'auto',
      formatter: (value) => {
        // 如果数据点太多，只显示部分标签
        if (chartData.value.xAxisData.length > 50) {
          return value % Math.ceil(chartData.value.xAxisData.length / 10) === 0 ? value : ''
        }
        return value
      },
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#666666',
        width: 2,
        type: 'solid',
      },
      symbol: ['none', 'arrow'],
      symbolOffset: [0, 10],
    },
    axisTick: { show: true },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    name: props.yAxisName,
    nameLocation: 'end',
    nameGap: 25,
    nameTextStyle: {
      fontSize: 12,
      color: '#FFFFFF',
      padding: [0, 0, 0, 5],
    },
    axisLabel: {
      show: true,
      fontSize: 11,
      color: '#FFFFFF',
      formatter: (value) => {
        // 格式化数值显示，避免过长
        if (Math.abs(value) >= 1000) {
          return (value / 1000).toFixed(1) + 'k'
        }
        return value.toFixed(1)
      },
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: '#666666',
        width: 2,
        type: 'solid',
      },
      symbol: ['none', 'arrow'],
      symbolOffset: [0, 10],
    },
    splitLine: {
      show: false,
    },
  },
  series: [
    {
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
      showSymbol: false,
    },
  ],
  animation: false,
}))

function onChartRendered() {
  // console.warn(`Chart ${props.title} rendered`);
}
</script>

<style scoped>
.trend-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.status-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.error-icon {
  width: 24px;
  height: 24px;
}

.normal-card {
  background-color: #52cfc5; /* 修改为 RGB(82, 207, 197) 对应的十六进制 */
  color: #ffffff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
