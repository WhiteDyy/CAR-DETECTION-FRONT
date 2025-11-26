<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
// 多环型图
// 按需引入 引入 ECharts 主模块
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import chartResize from '../../mixins/chart-resize'
// 引入环形
import 'echarts/lib/chart/gauge'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

export default {
  name: 'PieChart',
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
      type: Array,
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
    setOptions(dataObj) {
      try {
        this.isChartUpdating = true
        this.chart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}:({d}%)',
          },
          legend: {
            top: 'bottom',
          },
          toolbox: {
            show: true,
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              restore: { show: true },
              saveAsImage: { show: true },
            },
          },
          series: [
            {
              name: '预警消息次数',
              type: 'pie',
              radius: [50, 80],
              center: ['50%', '50%'],
              roseType: 'area',
              itemStyle: {
                borderRadius: 10,
              },
              data: dataObj,
            },
          ],
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
