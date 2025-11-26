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
import 'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/dataset'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/transform'

export default {
  name: 'BarChart',
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
      required: false,
    },
  },
  data() {
    return {
      // Echarts实例
      chart: null,
      isChartUpdating: false,
      cate: ['设备预警', , '病害预警', '系统异常'],
      // 数据值，顺序和Y轴的名字一一对应
      barData: [10, 40, 25],
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
    setOptions({ cate, barData } = {}) {
      try {
        this.isChartUpdating = true
        this.chart.setOption({
        // title: {
        //   text: "合格率排行榜top10",
        //   show:false
        // },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          // 图表位置
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '5%',
            containLabel: true,
          },
          // X轴
          xAxis: {
            type: 'value',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            // 不显示X轴刻度线和数字
            splitLine: { show: false },
            axisLabel: { show: false },
          },
          yAxis: {
            type: 'category',
            data: cate,
            // 升序
            inverse: true,
            splitLine: { show: false },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            // key和图间距
            offset: 10,
            // 动画部分
            animationDuration: 300,
            animationDurationUpdate: 300,
            fontSize: 5,
          },
          series: [
            {
            // 柱状图自动排序，排序自动让Y轴名字跟着数据动
              realtimeSort: true,
              name: '数量',
              type: 'bar',
              data: barData,
              barWidth: 14,
              barGap: 10,
              smooth: true,
              valueAnimation: true,
              // Y轴数字显示部分
              label: {
                show: true,
                position: 'right',
                valueAnimation: true,
                offset: [5, -2],
                color: '#333',
                fontSize: 13,
              },
              itemStyle: {
              // 颜色样式部分
                borderRadius: 7,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#3977E6' },
                  { offset: 1, color: '#37BBF8' },
                ]),
              },
            },
          ],
          // 动画部分
          animationDuration: 0,
          animationDurationUpdate: 3000,
          animationEasing: 'linear',
          animationEasingUpdate: 'linear',
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
