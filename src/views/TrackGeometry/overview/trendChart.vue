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

// 注册 ECharts 组件
use([
    TooltipComponent, GridComponent, LegendComponent, BarChart, LineChart,
    ScatterChart, CanvasRenderer, UniversalTransition, PieChart,
]);

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

    const gridHeight = 64
    const gridSpacing = 16
    const markerGridHeight = 40

    // 2. 【数据过滤】根据当前可视范围，过滤出需要显示的标记点
    const visibleStartMileage = props.xAxisData[0];
    const visibleEndMileage = props.xAxisData[props.xAxisData.length - 1];

    const tagData = props.tagPositions
        .filter(p => p.mileage >= visibleStartMileage && p.mileage <= visibleEndMileage)
        .map(tag => ({
            name: `电子标签 ${tag.id}`,
            // 3. 【Y轴分离】将Y值设为 0.5，使其显示在标记区域上半部分
            value: [tag.mileage, 0],
            id: tag.id,
        }));

    const sleeperData = props.sleeperPositions
        .filter(p => p.mileage >= visibleStartMileage && p.mileage <= visibleEndMileage)
        .map(sleeper => ({
            name: `轨枕 ${sleeper.id}`,
            // 3. 【Y轴分离】将Y值设为 -0.5，使其显示在标记区域下半部分
            value: [sleeper.mileage, 0],
            id: sleeper.id,
        }));

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
        });

    const xAxis = props.parameters
        .map((_, index) => ({
            type: 'category', gridIndex: index, data: props.xAxisData,
            axisLine: { show: index === props.parameters.length - 1 },
            axisTick: { show: true, alignWithLabel: true },
            splitLine: { show: true, lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 } },
            axisLabel: { show: index === props.parameters.length - 1 },
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
                formatter: (value) => (value % 1000 === 0 ? `K${value / 1000}` : ''),
                color: '#333', fontWeight: 'bold',
            },
            axisPointer: {
                label: {
                    formatter: ({ value }) => `K${Math.floor(value / 1000)}+${value % 1000}`,
                },
            },
        });

    const yAxis = props.parameters
        .map((_, index) => ({
            type: 'value', gridIndex: index,
            splitLine: { show: true, lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 } },
        }))
        .concat({
            type: 'value', gridIndex: props.parameters.length,
            show: false, min: -1, max: 1,
        });

    const series = props.parameters.map((param, index) => ({
        name: `${param}-曲线`, type: 'line', xAxisIndex: index, yAxisIndex: index,
        data: props.data[param] || [], smooth: true,
        lineStyle: { width: 2, type: 'solid', color: props.colorMap[param] },
        symbol: 'none',
    }));

    series.push({
        name: '轨枕', type: 'scatter',
        xAxisIndex: props.parameters.length, yAxisIndex: props.parameters.length,
        symbol: 'rect', symbolRotate: 90, symbolSize: [10, 10],
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
    });

    series.push({
        name: '电子标签', type: 'scatter',
        xAxisIndex: props.parameters.length, yAxisIndex: props.parameters.length,
        symbol: 'triangle', symbolSize: 15,
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
    });

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