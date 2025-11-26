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
  name: 'CircleChart',
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
      default: '250px',
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
      gaugeData: [
        {
          value: 100,
          name: '总消息',
          title: {
            offsetCenter: ['0%', '-58%'],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '-38%'],
          },
        },
        {
          value: 40,
          name: '已处理',
          title: {
            offsetCenter: ['0%', '-13%'],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '8%'],
          },
        },
        {
          value: 60,
          name: '待处理',
          title: {
            offsetCenter: ['0%', '32%'],
          },
          detail: {
            valueAnimation: true,
            offsetCenter: ['0%', '52%'],
          },
        },
      ],
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
      this.setOptions(this.gaugeData)
    },
    setOptions(gaugeData) {
      try {
        this.isChartUpdating = true
        this.chart.setOption({
          series: [
            {
              type: 'gauge',
              startAngle: 90,
              endAngle: -270,
              pointer: {
                show: false,
              },
              progress: {
                show: true,
                overlap: false,
                roundCap: true,
                clip: true,
                itemStyle: {
                  borderWidth: 1,
                  borderColor: '#464646',
                },
              },
              axisLine: {
              // 圆圈线粗细
                lineStyle: {
                  width: 30,
                },
              },
              splitLine: {
                show: false,
                distance: 0,
                length: 5,
              },
              axisTick: {
                show: false,
              },
              axisLabel: {
                show: false,
                distance: 50,
              },
              data: gaugeData,
              title: {
                show: true,
                fontSize: 14,
              },
              detail: {
                width: 45,
                height: 15,
                fontSize: 14,
                color: 'inherit',
                borderColor: 'inherit',
                borderRadius: 20,
                borderWidth: 1,
                formatter: '{value}%',
              },
              // 环形图半径
              radius: '100%',
              center: ['50%', '50%'], // 仪表盘位置
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
