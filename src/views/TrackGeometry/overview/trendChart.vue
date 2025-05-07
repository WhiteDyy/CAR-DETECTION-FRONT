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
  ScatterChart,
} from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { computed } from 'vue';
import VChart from 'vue-echarts';

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
]);

// 定义 props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  parameters: {
    type: Array,
    default: () => [],
  },
  colorMap: {
    type: Object,
    default: () => ({}),
  },
  xAxisData: {
    type: Array,
    default: () => [],
  },
  tagPositions: {
    type: Array,
    default: () => [],
  },
  sleeperPositions: {
    type: Array,
    default: () => [],
  },
  kmPositions: {
    type: Array,
    default: () => [],
  },
});


const generateMarkers = (tagPositions = [], sleeperPositions = [], kmPositions = []) => {
  const tagData = []; // 电子标签
  const sleeperData = []; // 轨枕
  const kmData = []; // 公里标

  tagPositions.forEach((mileage) => {
    tagData.push({
      // name: '电子标签',
      value: [mileage, 0], // 使用 [x, y] 格式，y 固定为 0
      symbolSize: 10,
      label: {
        show: true,
        position: 'bottom',
        formatter: `{@0}米` // 直接显示 mileage 值（value 数组的第一个元素）
      }
    });
  });



  // 轨枕
  // sleeperPositions.forEach((mileage) => {
  //   // 假设每0.625米一个轨枕（铁路常见间距），编号为里程除以间距
  //   const sleeperNumber = Math.floor(mileage / 0.625); // 需确认具体逻辑
  //   sleeperData.push({
  //     name: '轨枕',
  //     value: [mileage, 0], // 直接使用米
  //     symbolSize: 10,
  //     label: {
  //       show: true,
  //       position: 'top',
  //       formatter: `${sleeperNumber}`,
  //       color: '#666',
  //       fontSize: 12,
  //     },
  //   });
  // });

  // // 公里标
  // kmPositions.forEach((mileage) => {
  //   kmData.push({
  //     name: '公里标',
  //     value: [mileage, 0], // 直接使用米
  //     symbolSize: 10,
  //     label: {
  //       show: true,
  //       position: 'bottom',
  //       formatter: `${Math.floor(mileage)} m`, // 整数米
  //       color: '#333',
  //       fontWeight: 'bold',
  //       fontSize: 12,
  //     },
  //   });
  // });

  return { tagData, sleeperData, kmData };
};

// 示例数据：具体里程值（单位：毫米）
// const tagPositions = [10, 20, 30, 40, 50, 60, 70, 80, 90]; // 电子标签位置
// const sleeperPositions = [2, 4, 6, 8]; // 轨枕位置
// const kmPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 公里标位置

// 使用 props 传入的数据
const { tagData, sleeperData, kmData } = generateMarkers(
  props.tagPositions,
  props.sleeperPositions,
  props.kmPositions
);

 // 获取参数的上限值函数
//  function getUpperLimit(param) {
//     // 这里可以根据不同参数返回不同的上限值
//     const limitMap = {
//       '轨距': 1445, // 示例值
//       '水平': 10,   // 示例值
//       '方向': 15,   // 示例值
//       '高低': 12    // 示例值
//       // 添加其他参数的上限
//     };
//     return limitMap[param] || 100; // 默认值
//   }

//   // 获取参数的下限值函数
//   function getLowerLimit(param) {
//     // 这里可以根据不同参数返回不同的下限值
//     const limitMap = {
//       '轨距': 1425, // 示例值
//       '水平': -10,  // 示例值
//       '方向': -15,  // 示例值
//       '高低': -12   // 示例值
//       // 添加其他参数的下限
//     };
//     return limitMap[param] || -100; // 默认值
//   }

// const { tagData, sleeperData, kmData } = generateMarkers(tagPositions, sleeperPositions, kmPositions);


// 计算图表配置
const chartOption = computed(() => {
  const gridHeight = 64;
  const gridSpacing = 16;
  const markerGridHeight = 40;

  // 主网格（折线图） + 标记网格
  const grids = props.parameters.map((_, index) => ({
    left: '2%',
    right: '3%',
    top: 5 + (gridHeight + gridSpacing) * index,
    height: gridHeight,
  })).concat({
    left: '2%',
    right: '3%',
    top: 5 + (gridHeight + gridSpacing) * props.parameters.length,
    height: markerGridHeight,
  });

  // X 轴配置
  const xAxis = props.parameters.map((_, index) => ({
    type: 'category',
    gridIndex: index,
    data: props.xAxisData,
    axisLine: { show: index === props.parameters.length - 1 }, // 仅最后一个显示轴线
    axisTick: { show: true, alignWithLabel: true }, // 刻度与标签对齐
    splitLine: { show: true, lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 } },
    axisLabel: {
      show: index === props.parameters.length - 1, // 仅最后一个显示标签

    },
  })).concat({
    type: 'category',
    gridIndex: props.parameters.length,
    data: props.xAxisData,
    axisLine: { show: true },
    axisTick: { show: true, alignWithLabel: true },
    axisLabel: {
      show: true,
      formatter: (value) => {

        if (value % 1000 === 0) {
          return `K${value / 1000}`; // 1000米 -> K1
        }
        return '';
      },
      color: '#333',
      fontWeight: 'bold'
    },
    axisPointer: {
      label: {
        formatter: ({ value }) => {
          const km = Math.floor(value / 1000000);
          const meters = (value % 1000000) / 1000;
          return `K${km}+${meters.toFixed(3)}`;
        }
      }
    }
  });



  const yAxis = props.parameters.map((_, index) => ({
    type: 'value',
    gridIndex: index,
    splitLine: { show: true, lineStyle: { type: index % 2 === 0 ? 'dashed' : 'solid', width: 2 } },
  })).concat({
    type: 'value',
    gridIndex: props.parameters.length,
    show: false, // 标记区域无Y轴显示
    min: -1, // 可选：设置范围以包含符号
    max: 1
  });

  // 主图表系列（折线图）
  const series = props.parameters.map((param, index) => ({
    name: `${param}-曲线`,
    type: 'line',
    xAxisIndex: index,
    yAxisIndex: index,
    data: props.data[param] || [],
    smooth: true,
    lineStyle: { width: 2, type: 'solid', color: props.colorMap[param] },
    symbol: 'none',
  }));





  series.push({
    name: '轨枕',
    type: 'scatter',
    xAxisIndex: props.parameters.length,
    yAxisIndex: props.parameters.length,
    symbol: 'rect',
    symbolRotate: 90,
    symbolSize: [20, 10],
    itemStyle: { color: '#666' },
    data: sleeperData,
    z: 2,
    symbolOffset: [0, 0],

  });

  series.push({
    name: '电子标签',
    type: 'scatter',
    xAxisIndex: props.parameters.length,
    yAxisIndex: props.parameters.length,
    symbol: 'triangle',
    symbolSize: 15,
    itemStyle: { color: '#f00' },
    data: tagData,
    z: 3,
    symbolOffset: [0, 0]
  });


  return {
    tooltip: {
      trigger: 'item',
      // formatter: (params) => {
      //   if (params.seriesName.includes('曲线')) {
      //     return `${params.seriesName}<br/>里程: K${Math.floor(params.value[0] / 1000000)}+${((params.value[0] % 1000000) / 1000).toFixed(3)}<br/>值: ${params.value[1]}`;
      //   }
      //   const km = Math.floor(params.value / 1000000);
      //   const meters = (params.value % 1000000) / 1000;
      //   return `${params.seriesName}<br/>里程: K${km}+${meters.toFixed(3)}`;
      // }
    },
    grid: grids,
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      label: {
        formatter: ({ value }) => {
          const km = Math.floor(value / 1000000);
          const meters = (value % 1000000) / 1000;
          return `K${km}+${meters.toFixed(3)}`;
        }
      }
    },
    xAxis,
    yAxis,
    series,
    legend: {
      data: props.parameters.map(p => `${p}-曲线`).concat(['轨枕', '电子标签', '公里标']),
      bottom: 0,
    },
  };
});
</script>

<style scoped>
.trend-chart {
  height: 920px;
}
</style>