<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
// 按需引入 引入 ECharts 主模块
import * as echarts from "echarts/lib/echarts";
// 引入柱状图
import "echarts/lib/chart/line";
import "echarts/lib/chart/pie";
// 引入提示框和标题组件
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";

import chartResize from "../../mixins/chart-resize";
export default {
  name: "pieLineChart",
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
      this.chart = echarts.init(this.$el);
      this.setOptions(this.chartData);
    },
    setOptions({ days, data1, data2 } = {}) {
      // 设置图表更新状态，防止在更新过程中触发resize
      // this.setChartUpdating(true);
      
      try {
        this.chart.setOption({
          title: {
            show: true,
            text: "同一线路-病害(数量)分布",
            // text: '同一线路病害分布',
            x: "center",
            y: "top",
          },
          legend: {
            show: true,
            orient: "horizontal",
            x:'center',
            y:'bottom',
            //padding: [20, 0, 0, 0], //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
          },
          tooltip: {
            trigger: "axis",
            showContent: false,
          },
          dataset: [
            {
              source: [
                ["product", "站点1", "站点2", "站点3", "站点4", "站点5", "站点6"],
                ["钢轨裂纹", 56, 82, 88, 70, 53, 85],
                ["钢轨剥离掉块", 51, 51, 55, 53, 73, 68],
                ["钢轨波磨", 23, 62, 34, 36, 45, 32],
                ["钢轨锈蚀", 25, 37, 41, 18, 33, 49],
                ["扣件缺失", 51, 82, 88, 70, 53, 85],
                ["扣件断裂", 33, 51, 55, 53, 73, 68],
                ["轨枕断裂", 40, 62, 69, 36, 45, 32],
                ["轨枕剥离掉块", 25, 37, 41, 18, 33, 49],
                ["翻浆冒泥", 51, 51, 55, 53, 73, 68],
                ["道床冻害", 45, 35, 57, 36, 85, 32],
                ["道床裂纹", 25, 32, 15, 56, 33, 49],
              ]
            }
          ],
          xAxis: {
            name: "测试线路",
            type: "category",
            boundaryGap: false, // 刻度线与数据点居中对齐
            axisLabel: {
              color: "black",
              fontSize: 12
            }
          },
          yAxis: {
            name: "病害数量",
            axisLabel: {
              color: "black",
              fontSize: 12
            }
          },
          grid: { 
            bottom: "15%", 
            top: "50%" 
          },
          series: [
            {
              name: "钢轨裂纹",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "钢轨剥离掉块",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "钢轨波磨",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "钢轨锈蚀",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "扣件缺失",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "扣件断裂",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "轨枕断裂",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "轨枕剥离掉块",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "翻浆冒泥",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "道床冻害",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              name: "道床裂纹",
              type: "line",
              smooth: false,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              type: "pie",
              id: "pie",
              radius: "30%",
              center: ["50%", "25%"],
              emphasis: {
                focus: "self",
              },
              label: {
                formatter: "{b}: {@站点1} ({d}%)",
              },
              encode: {
                itemName: "product",
                value: "站点1",
                tooltip: "站点1",
              },
            },
          ],
        });
      } catch (e) {
        console.error('Error setting pie-line chart options:', e);
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