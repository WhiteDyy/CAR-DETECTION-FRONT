<template>
     <div class="trend-chart" :style="{ height: chartHeight }">
    <VChart :option="chartOption" autoresize :not-merge="props.notMerge" />
  </div>
</template>

<script setup>
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'

// 定义 props
const props = defineProps({
  data: { type: Object, required: true },
  parameters: { type: Array, default: () => [] },
  colorMap: { type: Object, default: () => ({}) },
  xAxisData: { type: Array, default: () => [] },
  tagPositions: { type: Array, default: () => [] },
  sleeperPositions: { type: Array, default: () => [] },
  notMerge: { type: Boolean, default: false },
})

// 注册 ECharts 组件
use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  ScatterChart,
  CanvasRenderer,
  UniversalTransition,
  PieChart,
])

// 计算图表配置
const chartOption = computed(() => {
  // 1. 【守护条件】防止在初始化数据不足时渲染错误的图表
  if (!props.xAxisData || props.xAxisData.length < 2) {
    return {
      title: {
        text: '正在等待数据...',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 },
      },
    }
  }

  // 优化后的尺寸配置
  const gridHeight = 70
  const gridSpacing = 12
  const markerGridHeight = 45
  const leftOffset = '100px' // 与左侧按钮区域对齐

  // 2. 【数据过滤】根据当前可视范围，过滤出需要显示的标记点
  const visibleStartMileage = props.xAxisData[0]
  const visibleEndMileage = props.xAxisData[props.xAxisData.length - 1]

  const tagData = props.tagPositions
    .filter(p => p.mileage >= visibleStartMileage && p.mileage <= visibleEndMileage)
    .map(tag => ({
      name: `电子标签 ${tag.id}`,
      value: [tag.mileage, 0],
      id: tag.id,
    }))

  const sleeperData = props.sleeperPositions
    .filter(p => p.mileage >= visibleStartMileage && p.mileage <= visibleEndMileage)
    .map(sleeper => ({
      name: `轨枕 ${sleeper.uniqueId}`,
      value: [sleeper.mileage, 0],
      id: sleeper.displayId,
    }))

  // 优化网格配置：添加背景色区分，与左侧对齐
  const grids = props.parameters
    .map((_, index) => ({
      left: leftOffset,
      right: '3%',
      top: 15 + (gridHeight + gridSpacing) * index,
      height: gridHeight,
      backgroundColor: index % 2 === 0 ? 'rgba(250, 250, 250, 0.5)' : 'rgba(255, 255, 255, 0.8)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      borderType: 'solid',
    }))
    .concat({
      left: leftOffset,
      right: '3%',
      top: 15 + (gridHeight + gridSpacing) * props.parameters.length,
      height: markerGridHeight,
      backgroundColor: '#f9f9f9',
      borderColor: '#e8e8e8',
      borderWidth: 1,
    })

  const xAxis = props.parameters
    .map((_, index) => ({
      type: 'category',
      gridIndex: index,
      data: props.xAxisData,
      axisLine: { 
        show: index === props.parameters.length - 1,
        lineStyle: { color: '#d0d0d0', width: 1 }
      },
      axisTick: { 
        show: index === props.parameters.length - 1,
        alignWithLabel: true,
        lineStyle: { color: '#d0d0d0' }
      },
      splitLine: { show: false }, // 移除网格线
      axisLabel: { 
        show: index === props.parameters.length - 1,
        color: '#666',
        fontSize: 11,
        margin: 8,
      },
    }))
    .concat({
      // 4. 【坐标轴修正】确保标记区域的X轴是数值轴(value)，并精确设置其范围
      type: 'value',
      gridIndex: props.parameters.length,
      // 【重要】移除 data 属性，因为它不适用于 value 类型的轴
      // data: props.xAxisData,
      min: visibleStartMileage,
      max: visibleEndMileage,
      axisLine: { show: true },
      axisTick: { show: true, alignWithLabel: true },
      splitLine: { show: false },
      axisLabel: {
        show: true,
        formatter: value => (value % 1000 === 0 ? `K${value / 1000}` : ''),
        color: '#333',
        fontWeight: 'bold',
      },
      axisPointer: {
        label: {
          formatter: ({ value }) => `K${Math.floor(value / 1000)}+${value % 1000}`,
        },
      },
    })

  const yAxis = props.parameters
    .map((param, index) => ({
      type: 'value',
      gridIndex: index,
      splitLine: { show: false }, // 移除网格线
      axisLine: {
        show: true,
        lineStyle: { color: '#d0d0d0', width: 1 }
      },
      axisTick: {
        show: true,
        lineStyle: { color: '#d0d0d0' }
      },
      axisLabel: {
        show: true,
        color: '#666',
        fontSize: 11,
        margin: 8,
        // 显示原始值，不简写
        formatter: (value) => {
          // 根据数值大小决定小数位数
          if (Math.abs(value) >= 1000) {
            return value.toFixed(0)
          } else if (Math.abs(value) >= 100) {
            return value.toFixed(0)
          } else if (Math.abs(value) >= 10) {
            return value.toFixed(1)
          } else if (Math.abs(value) >= 1) {
            return value.toFixed(2)
          } else {
            return value.toFixed(3)
          }
        }
      },
      scale: true, // 自动缩放以适应数据范围
    }))
    .concat({
      type: 'value',
      gridIndex: props.parameters.length,
      show: false,
      min: -1,
      max: 1,
    })

  const series = props.parameters.map((param, index) => {
    const color = props.colorMap[param] || '#5470c6'
    return {
      name: param,
      type: 'line',
      xAxisIndex: index,
      yAxisIndex: index,
      data: props.data[param] || [],
      smooth: 0.3, // 优化平滑度
      lineStyle: { 
        width: 2.5,
        type: 'solid', 
        color: color,
      },
      symbol: 'none',
      emphasis: {
        focus: 'series',
        lineStyle: {
          width: 3.5,
        },
      },
      // 添加渐变色填充
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: color + '30' }, // 30% 透明度
            { offset: 1, color: color + '05' }   // 5% 透明度
          ],
        },
      },
      animationDuration: 1000,
      animationEasing: 'cubicOut',
    }
  })

  series.push({
    name: '轨枕',
    type: 'scatter',
    xAxisIndex: props.parameters.length,
    yAxisIndex: props.parameters.length,
    symbol: 'rect',
    symbolRotate: 90,
    symbolSize: [10, 10],
    itemStyle: { color: '#666' },
    // 使用过滤后的数据
    data: sleeperData,
    z: 2,
    label: {
      show: true,
      position: 'bottom',
      formatter: params => `${params.data.id}`,
      color: '#666',
      fontSize: 12,
    },
  })

  series.push({
    name: '电子标签',
    type: 'scatter',
    xAxisIndex: props.parameters.length,
    yAxisIndex: props.parameters.length,
    symbol: 'triangle',
    symbolSize: 15,
    itemStyle: { color: '#f00' },
    // 使用过滤后的数据
    data: tagData,
    z: 3,
    label: {
      show: true,
      // 5. 【标签定位】将标签置于图标上方，防止与下方的轨枕图标重叠
      position: 'bottom',
      formatter: params => `${params.data.id}`,
    },
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: {
          color: '#999',
          width: 1,
          type: 'dashed'
        },
        label: {
          backgroundColor: '#6a7985',
          color: '#fff',
          padding: [4, 8],
          borderRadius: 4,
        }
      },
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: '#333',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      padding: [8, 12],
      formatter: (params) => {
        if (Array.isArray(params)) {
          let result = `里程: ${params[0].axisValue}<br/>`
          params.forEach(item => {
            if (item.seriesName !== '轨枕' && item.seriesName !== '电子标签') {
              const value = item.value != null ? item.value : '-'
              result += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: <strong>${value}</strong><br/>`
            }
          })
          return result
        }
        return ''
      },
    },
    grid: grids,
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      label: { 
        formatter: ({ value }) => {
          const km = Math.floor(value / 1000)
          const m = Math.floor(value % 1000)
          return `K${km}+${m}`
        },
        backgroundColor: '#6a7985',
        color: '#fff',
        padding: [4, 8],
      },
    },
    xAxis,
    yAxis,
    series,
    legend: {
      data: props.parameters.concat(['轨枕', '电子标签']),
      bottom: 5,
      itemWidth: 25,
      itemHeight: 14,
      itemGap: 15,
      textStyle: {
        color: '#666',
        fontSize: 12,
      },
      selectedMode: true,
    },
  }
})

const chartHeight = computed(() => {
  const gridHeight = 70; const gridSpacing = 12; const markerGridHeight = 45
  const topOffset = 10; const legendHeight = 35; const extraPadding = 30
  return `${(props.parameters.length * (gridHeight + gridSpacing)) + markerGridHeight + topOffset + legendHeight + extraPadding}px`
})
</script>
