<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
// 按需引入 引入 ECharts 主模块
import * as echarts from "echarts";
// 引入柱状图
import "echarts/lib/chart/line";
// 引入提示框和标题组件
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";

// 修复导入路径
import chartResize from "../../mixins/chart-resize";


import { markRaw } from 'vue';
export default {
  name: "LineChart",
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
    setOptions() {
      // 设置图表更新状态，防止在更新过程中触发resize
      // this.setChartUpdating(true);
      
      try {
        this.chart.setOption({
          tooltip: {
            trigger: "item", // 触发类型，默认为 'item'
            formatter: "本月的病害数量:{c}", // 提示框的内容格式化字符串，{b} 代表数据名称，{c} 代表数据值
            // 其他属性设置
          },
          title: {
            show: true,
            text: "病害(数量)-时间变化趋势",
            // text: '同一线路病害分布',
            x: "center",
            y: "top",
            textStyle: {
              color: "white",
              fontSize: 16,
            },
          },
          xAxis: {
            name: "日期",
            type: "category",
            data: [
              "2023-01",
              "2023-02",
              "2023-03",
              "2023-04",
              "2023-05",
              "2023-06",
              "2023-07",
              "2023-09",
              "2023-10",
              "2023-11",
              "2023-12",
            ],
            axisLabel: {
              rotate: 45,
              color: "white",
              fontSize: 12,
            },
          },
          yAxis: {
            name: "病害数量",
            type: "value",
            axisLabel: {
              formatter: "{value} 个",
              color: "white",
              fontSize: 12,
              // 其他属性设置
            },
            splitLine: {
              show: true,
            },
          },
          legend: {
            orient: "horizontal",
            x: "center", //可设定图例在左、右、居中
            y: "30", //可设定图例在上、下、居中
            padding: [0, 50, 0, 0], //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
            data: ["钢轨波磨", "轨枕裂纹", "翻浆冒泥", "道床裂纹"],
            textStyle: {
              color: "white",
              fontSize: 12,
            },
          },
          series: [
            {
              data: [55, 58, 61, 66, 76, 84, 90, 94, 98, 100, 122, 132],
              type: "line",
              smooth: false,
              label: {
                show: false,
                position: "top",
                fontSize: 10,
              },
            },
            {
              name: "钢轨波磨",
              data: [53, 55, 58, 62, 73, 75, 78, 85, 93, 115, 123, 130],
              type: "line",
              smooth: false,
            },
            {
              name: "轨枕裂纹",
              data: [35, 36, 40, 46, 56, 64, 70, 84, 88, 90, 102, 110],
              type: "line",
              smooth: false,
            },
            {
              name: "翻浆冒泥",
              data: [33, 35, 48, 52, 63, 65, 68, 75, 83, 95, 103, 112],
              type: "line",
              smooth: false,
            },
            {
              name: "道床裂纹",
              data: [25, 32, 15, 56, 33, 49, 55, 62, 71, 83, 91, 105],
              type: "line",
              smooth: false,
            },
          ],
        });
      } catch (e) {
        console.error('Error setting line chart options:', e);
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