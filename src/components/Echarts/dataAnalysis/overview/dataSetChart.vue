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

import { markRaw } from 'vue';
import chartResize from "../../mixins/chart-resize";
export default {
  name: "dataSet",
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
        this.chart.setOption({
          legend: {
            x:'center',
            y:'bottom'
          },
          title:{
            show:true,
            text: '病害(数量)-线路分布',
            x:'center',
            y:'top',
            textStyle: {
              color: "white",
              fontSize: 16,
            }
          },
          dataset: {
            source: [
              ["product", "一号线", "二号线", "三号线"],
              ["钢轨裂纹", 43, 85, 93],
              ["钢轨剥离掉块", 83, 73, 55],
              ["钢轨波磨", 86, 65, 82],
              ["钢轨锈蚀", 72, 53, 39],
              ["扣件缺失", 43, 85, 93],
              ["扣件断裂", 83, 73, 55],
              ["轨枕断裂", 86, 65, 82],
              ["轨枕剥离掉块", 72, 53, 39],
              ["道床翻浆冒泥", 43, 85, 93],
              ["道床冻害", 83, 73, 55],
              ["道床裂纹", 86, 65, 82]
            ],
          },
          xAxis: { 
            name:"病害种类", 
            type: "category",
            axisLabel: {
              rotate: 25,
              color: "white",
              fontSize: 12,
            }
          },
          yAxis: {
            name:"病害数量",
            axisLabel: {
              color: "white",
              fontSize: 12
            }
          },
          // Declare several bar series, each will be mapped
          // to a column of dataset.source by default.
          series: [{ type: "bar" }, { type: "bar" }, { type: "bar" }],
        });
      } catch (e) {
        console.error('Error setting dataset chart options:', e);
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