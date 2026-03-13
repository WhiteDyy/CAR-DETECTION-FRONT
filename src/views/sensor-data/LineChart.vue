<template>
  <div class="trend-chart">
    <VChart :option="chartOption" autoresize @rendered="onChartRendered" />
    <!-- 异常或正常状态显示 -->
    <!-- <div class="status-indicator">
      <img v-if="hasAnomaly" src="/error.png" alt="Error" class="error-icon">
      <div v-else class="normal-card">
        正常
      </div>
    </div> -->
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
  // 单系列模式下使用的字段名
  parameter: { type: String, default: '' },
  // 单系列模式下使用的颜色
  color: { type: String, default: '#3b82f6' },
  xAxisData: { type: Array, default: () => [] },
  title: { type: String, default: '折线图' },
  xAxisName: { type: String, default: 'X Axis' },
  yAxisName: { type: String, default: 'Y Axis' },
  /**
   * Y 轴刻度小数位数，默认保留 1 位
   */
  yAxisDigits: { type: Number, default: 1 },
  /**
   * 最大展示点数（超过后做下采样），用于“累加数据”场景防止渲染过重
   */
  maxDisplayPoints: { type: Number, default: 300 },
  /**
   * 是否显示 dataZoom（放大弹窗里建议开启）
   */
  showDataZoom: { type: Boolean, default: false },
  /**
   * 多系列配置：
   * [{ key: 'encoderLeft', name: '编码器左', color: '#ff6384' }, ...]
   * 如果传入该配置，则忽略 parameter/color，按多系列模式渲染
   */
  seriesConfigs: {
    type: Array,
    default: () => [],
  },
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

// 统一的抽样逻辑，同时支持单系列和多系列
const chartData = computed(() => {
  const xAxis = props.xAxisData || []
  const isMulti = props.seriesConfigs && props.seriesConfigs.length > 0
  const maxDisplayPoints = Number.isFinite(props.maxDisplayPoints) ? props.maxDisplayPoints : 300

  if (!isMulti) {
    const rawData = props.data[props.parameter] || []
    if (rawData.length <= maxDisplayPoints) {
      return { seriesData: { [props.parameter]: rawData }, xAxisData: xAxis }
    }
    const step = Math.ceil(rawData.length / maxDisplayPoints)
    const downsampledData = []
    const downsampledXAxis = []
    for (let i = 0; i < rawData.length; i += step) {
      downsampledData.push(rawData[i])
      downsampledXAxis.push(xAxis[i] || i)
    }
    return { seriesData: { [props.parameter]: downsampledData }, xAxisData: downsampledXAxis }
  }

  // 多系列模式：以第一个系列的数据长度为基准进行下采样
  const firstKey = props.seriesConfigs[0].key
  const firstSeries = props.data[firstKey] || []
  if (firstSeries.length <= maxDisplayPoints) {
    const seriesData = {}
    for (const cfg of props.seriesConfigs) {
      seriesData[cfg.key] = props.data[cfg.key] || []
    }
    return { seriesData, xAxisData: xAxis }
  }

  const step = Math.ceil(firstSeries.length / maxDisplayPoints)
  const downsampledXAxis = []
  const seriesData = {}
  for (const cfg of props.seriesConfigs) {
    seriesData[cfg.key] = []
  }

  for (let i = 0; i < firstSeries.length; i += step) {
    downsampledXAxis.push(xAxis[i] || i)
    for (const cfg of props.seriesConfigs) {
      const src = props.data[cfg.key] || []
      seriesData[cfg.key].push(src[i])
    }
  }

  return { seriesData, xAxisData: downsampledXAxis }
})

// 异常检测逻辑：仅判断数据是否存在
const hasAnomaly = computed(() => {
  if (props.seriesConfigs && props.seriesConfigs.length > 0) {
    return props.seriesConfigs.every(cfg => {
      const rawData = props.data[cfg.key]
      return !rawData || rawData.length === 0
    })
  }
  const rawData = props.data[props.parameter]
  return !rawData || rawData.length === 0
})

const chartOption = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
    // 标题更贴近顶部，给折线留更多空间
    top: 6,
    textStyle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
  },
  grid: {
    // 进一步收紧左右和顶部留白，让折线区更大
    left: '6%',
    right: '3%',
    top: '14%',
    // 底部再收一点，但仍保留足够空间给刻度和坐标名称
    // 开启 dataZoom slider 时，需要更大的底部空间
    bottom: props.showDataZoom ? '28%' : '20%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: chartData.value.xAxisData,
    name: props.xAxisName,
    nameLocation: 'middle',
    // 将坐标名称与刻度再拉开一些，避免遮挡
    nameGap: 18,
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
      // 适当下移刻度标签，避免紧贴坐标名称
      margin: 6,
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
  dataZoom: props.showDataZoom
    ? [
        { type: 'inside', xAxisIndex: 0, throttle: 50 },
        {
          type: 'slider',
          xAxisIndex: 0,
          height: 18,
          bottom: 4,
          borderColor: 'rgba(255,255,255,0.25)',
          fillerColor: 'rgba(82, 207, 197, 0.25)',
          handleStyle: { color: 'rgba(255,255,255,0.6)' },
          textStyle: { color: 'rgba(255,255,255,0.8)' },
        },
      ]
    : undefined,
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
        const digits = Number.isFinite(props.yAxisDigits) ? props.yAxisDigits : 1
        return Number(value).toFixed(digits)
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
  legend: props.seriesConfigs && props.seriesConfigs.length > 0
    ? {
        show: true,
        top: 30,
        textStyle: {
          color: '#FFFFFF',
          fontSize: 11,
        },
      }
    : undefined,
  series: (props.seriesConfigs && props.seriesConfigs.length > 0)
    ? props.seriesConfigs.map(cfg => ({
        name: cfg.name,
        type: 'line',
        data: chartData.value.seriesData[cfg.key] || [],
        smooth: false,
        lineStyle: { width: 1, color: cfg.color || props.color },
        symbol: 'none',
        animation: false,
        large: true,
        progressive: 500,
        progressiveThreshold: 100,
        showSymbol: false,
      }))
    : [
        {
          name: `${props.parameter}-曲线`,
          type: 'line',
          data: chartData.value.seriesData[props.parameter] || [],
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
