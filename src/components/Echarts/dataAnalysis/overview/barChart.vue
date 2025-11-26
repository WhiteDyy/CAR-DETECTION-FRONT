<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
// 按需引入 引入 ECharts 主模块
import * as echarts from "echarts";
// 引入柱状图
import "echarts/lib/chart/bar";
// 引入提示框和标题组件
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/dataset";
import "echarts/lib/component/grid";
import "echarts/lib/component/legend";

// 修复导入路径
import { markRaw } from 'vue';
import chartResize from "../../mixins/chart-resize";
export default {
  name: "barChart",
  mixins: [chartResize],
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "450px",
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
    };
  },
  watch: {
    /* 如果图表数据是后台获取的，监听父组件中的数据变化，重新触发Echarts */
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      },
    },
  },
  mounted() {
    /* 图表初始化 */
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    /* 释放图表实例 */
    this.chart.dispose();
    /* dispose 会释放内部占用的一些资源和事件绑定，但是解除实例的引用我们是做不到的，所以需要重新赋值为null */
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = markRaw(echarts.init(this.$el));
      this.setOptions(this.chartData);
    },
    setOptions({ days, data1, data2 } = {}) {
      // 设置图表更新状态，防止在更新过程中触发resize
      // this.setChartUpdating(true);
      
      try {
        // 使用更简单的配置方式避免数据转换错误
        this.chart.setOption({
          title: {
            show: true,
            text: "总病害数量统计",
            x: "center",
            y: "top",
          },
          dataset: {
            dimensions: ["name", "score"],
            source: [
              ["钢轨裂纹", 221],
              ["钢轨剥离掉块", 200],
              ["钢轨波磨 ", 502],
              ["钢轨锈蚀", 190],
              ["轨枕裂纹", 370],
              ["轨枕剥离掉块", 250],
              ["扣件丢失", 100],
              ["扣件断裂", 1300],
              ["道床裂纹", 71],
              ["道床翻浆倒泥", 360],
              ["道床冻害", 67],
            ],
          },
          xAxis: {
            name:"病害种类",
            type: "category",
            axisLabel: { 
              interval: 0, 
              rotate: 30,
              color: "black",
              fontSize: 12
            },
          },
          yAxis: {
            name:"病害总数量",
            axisLabel: {
              color: "black",
              fontSize: 12
            }
          },
          series: [
            {
              type: "bar",
              encode: { 
                x: "name", 
                y: "score" 
              },
              itemStyle: {
                color: function (params) {
                  // 给出颜色组
                  var colorList = [
                    "#f45145",
                    "#f46463",
                    "#f47781",
                    "#f58a9f",
                    "#f59dbd",
                    "#e1a1c4",
                    "#cda5cc",
                    "#b9a9d4",
                    "#a5addc",
                    "#91b1e4",
                    "#7cb5ec",
                  ];
                  return colorList[params.dataIndex];
                },
              },
            }
          ],
        });
      } catch (e) {
        console.error('Error setting bar chart options:', e);
      } finally {
        // 更新完成后重置状态
        this.$nextTick(() => {
          // this.setChartUpdating(false);
        });
      }
    },
  },
};
</script>