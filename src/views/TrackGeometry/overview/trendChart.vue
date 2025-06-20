<template>
    <div class="trend-chart" :style="{ height: chartHeight }">
        <VChart :option="chartOption" autoresize />
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

// 注册 ECharts 组件
use([
    TooltipComponent, GridComponent, LegendComponent, BarChart, LineChart,
    ScatterChart, CanvasRenderer, UniversalTransition, PieChart,
])

// 定义 props
const props = defineProps({
    data: { type: Object, required: true },
    parameters: { type: Array, default: () => [] },
    colorMap: { type: Object, default: () => ({}) },
    xAxisData: { type: Array, default: () => [] },
    tagPositions: { type: Array, default: () => [] },   // Receives [{ mileage, id }]
    sleeperPositions: { type: Array, default: () => [] }, // Receives [{ mileage, id }]
})

// 计算图表配置
const chartOption = computed(() => {
    const gridHeight = 64
    const gridSpacing = 16
    const markerGridHeight = 40

    // --- START: MODIFIED SECTION ---
    // Generate marker data reactively inside the computed property
    const tagData = props.tagPositions.map(tag => ({
        name: `电子标签 ${tag.id}`,
        value: [tag.mileage, 0], // Use mileage for X-axis position
        id: tag.id, // Pass id for the label formatter
    }))

    const sleeperData = props.sleeperPositions.map(sleeper => ({
        name: `轨枕 ${sleeper.id}`,
        value: [sleeper.mileage, 0],
        id: sleeper.id,
    }))
    // --- END: MODIFIED SECTION ---

    const grids = props.parameters
        .map((_, index) => ({
            left: '2%', right: '3%',
            top: 20 + (gridHeight + gridSpacing) * index,
            height: gridHeight,
        }))
        .concat({
            left: '2%', right: '3%',
            top: 15 + (gridHeight + gridSpacing) * props.parameters.length,
            height: markerGridHeight,
        })

    const xAxis = props.parameters
        .map((_, index) => ({
            type: 'category', gridIndex: index, data: props.xAxisData,
            axisLine: { show: index === props.parameters.length - 1 },
            axisTick: { show: true, alignWithLabel: true },
            splitLine: { show: true, lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 } },
            axisLabel: { show: index === props.parameters.length - 1 },
        }))
        .concat({
            type: 'category', gridIndex: props.parameters.length, data: props.xAxisData,
            axisLine: { show: true },
            axisTick: { show: true, alignWithLabel: true },
            axisLabel: {
                show: true,
                formatter: (value) => (value % 1000 === 0 ? `K${value / 1000}` : ''),
                color: '#333', fontWeight: 'bold',
            },
            axisPointer: {
                label: {
                    formatter: ({ value }) => `K${Math.floor(value / 1000)}+${value % 1000}`,
                },
            },
        })

    const yAxis = props.parameters
        .map((_, index) => ({
            type: 'value', gridIndex: index,
            splitLine: { show: true, lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 } },
        }))
        .concat({
            type: 'value', gridIndex: props.parameters.length,
            show: false, min: -1, max: 1,
        })

    const series = props.parameters.map((param, index) => ({
        name: `${param}-曲线`, type: 'line', xAxisIndex: index, yAxisIndex: index,
        data: props.data[param] || [], smooth: true,
        lineStyle: { width: 2, type: 'solid', color: props.colorMap[param] },
        symbol: 'none',
    }))

    // --- START: MODIFIED SERIES SECTION ---
    series.push({
        name: '轨枕', type: 'scatter',
        xAxisIndex: props.parameters.length, yAxisIndex: props.parameters.length,
        symbol: 'rect', symbolRotate: 90, symbolSize: [10, 10],
        itemStyle: { color: '#666' },
        data: sleeperData, // Use dynamically generated data
        z: 2,
        label: { // Add label configuration
            show: true,
            position: 'bottom',
            formatter: params => `${params.data.id}`, // Display the 'id'
            color: '#666',
            fontSize: 12,
        },
    })

    series.push({
        name: '电子标签', type: 'scatter',
        xAxisIndex: props.parameters.length, yAxisIndex: props.parameters.length,
        symbol: 'triangle', symbolSize: 15,
        itemStyle: { color: '#f00' },
        data: tagData, // Use dynamically generated data
        z: 3,
        label: { // Add label configuration
            show: true,
            position: 'bottom',
            formatter: params => `${params.data.id}`, // Display the 'id'
        },
    })
    // --- END: MODIFIED SERIES SECTION ---

    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        grid: grids,
        axisPointer: {
            link: [{ xAxisIndex: 'all' }],
            label: { formatter: ({ value }) => `K${Math.floor(value / 1000)}+${value % 1000}` },
        },
        xAxis, yAxis, series,
        legend: {
            data: props.parameters.map(p => `${p}-曲线`).concat(['轨枕', '电子标签']),
            bottom: 0,
        },
    }
})

const chartHeight = computed(() => {
    const gridHeight = 64, gridSpacing = 16, markerGridHeight = 40
    const topOffset = 5, legendHeight = 40, extraPadding = 20
    return `${(props.parameters.length * (gridHeight + gridSpacing)) + markerGridHeight + topOffset + legendHeight + extraPadding}px`
})

</script>
