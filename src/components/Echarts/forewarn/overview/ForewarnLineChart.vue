<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
// 按需引入 引入 ECharts 主模块
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import chartResize from '../../mixins/chart-resize'
// 引入柱状图
import 'echarts/lib/chart/line'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/legend'

export default {
  name: 'LineChart',
  mixins: [chartResize],
  props: {
    className: {
      type: String,
      default: 'chart',
    },
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '260px',
    },
    // 父组件传递过来的图表数据
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Echarts实例
      chart: null,
      isChartUpdating: false,
    }
  },
  watch: {
    /* 如果图表数据是后台获取的，监听父组件中的数据变化，重新触发Echarts */
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      },
    },
  },
  mounted() {
    /* 图表初始化 */
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeUnmount() {
    if (!this.chart) {
      return
    }
    /* 释放图表实例 */
    this.chart.dispose()
    /* dispose 会释放内部占用的一些资源和事件绑定，但是解除实例的引用我们是做不到的，所以需要重新赋值为null */
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = markRaw(echarts.init(this.$el))
      this.setOptions(this.chartData)
    },

    setOptions({ categoryData, data } = {}) {
      try {
        this.isChartUpdating = true
        this.chart.setOption({
          title: {
            show: false,
            text: 'Stacked Line',
          },
          tooltip: {
            trigger: 'axis',
            show: true,
          },
          legend: {
            data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],
            show: false,
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '5%',
            containLabel: true,
          },
          toolbox: {
            feature: {
              saveAsImage: {},
            },
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLabel: {
              interval: 0,
              rotate: 45, // 文字逆时针旋转45°
              show: false,
            },
            data: categoryData,
          },
          yAxis: {
            type: 'value',
          },
          series: data,
          notMerge: false,
        }, true)
      }
      catch (e) {
        console.error('ECharts 更新失败:', e)
      }
      finally {
        this.isChartUpdating = false
      }
    },
  },
}
</script>
