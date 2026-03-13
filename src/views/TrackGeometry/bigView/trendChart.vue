<!-- TrendChart.vue -->
<template>
  <div class="trend-chart">
    <VChart :option="chartOption" autoresize />
  </div>
</template>

<script setup>
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent, // 新增标题组件
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'

// 定义 props
const props = defineProps({
  data: { type: Object, required: true },
  parameter: { type: String, required: true }, // 改为单个参数
  color: { type: String, required: true }, // 改为单个颜色
  xAxisData: { type: Array, default: () => [] },
  title: { type: String, default: '折线图' }, // 新增标题属性
})

// 注册 ECharts 组件
use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent, // 注册标题组件
  LineChart,
  CanvasRenderer,
  UniversalTransition,
])

// 计算图表配置
const chartOption = computed(() => {
  return {
    title: {
      text: props.title, // 显示传入的标题
      left: 'center', // 标题居中
      top: 10, // 标题距离顶部
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: { trigger: 'axis' },
    grid: {
      left: '10%',
      right: '5%',
      top: '20%', // 留出标题空间
      // 加大底部留白，防止刻度遮挡横坐标名称
      bottom: '22%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: {
        margin: 6,
      },
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
  }
})
</script>

<style scoped>
.trend-chart {
  width: 250px;
  /* 与外部一致 */
  height: 150px;
  /* 与外部一致 */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
