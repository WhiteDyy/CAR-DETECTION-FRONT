<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import * as echarts from "echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";

import chartResize from "../../mixins/chart-resize";

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
    chartData: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      chart: null,
      currentOption: null
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.safeUpdateChart(val);
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    this.destroyChart();
  },
  methods: {
    initChart() {
      try {
        // 确保DOM元素存在
        if (!this.$el) {
          setTimeout(() => this.initChart(), 100);
          return;
        }
        
        this.chart = echarts.init(this.$el);
        console.log('LineChart initialized successfully');
        
        // 添加图例点击事件监听
        this.chart.off('legendselectchanged');
        this.chart.on('legendselectchanged', (params) => {
          this.handleLegendSelect(params);
        });
        
        this.setOptions();
      } catch (e) {
        console.error('Error initializing line chart:', e);
        this.reinitWithDelay();
      }
    },
    
    destroyChart() {
      if (this.chart) {
        try {
          // 移除所有事件监听
          this.chart.off('legendselectchanged');
          this.chart.dispose();
        } catch (e) {
          console.warn('Error disposing line chart:', e);
        }
        this.chart = null;
      }
    },
    
    reinitWithDelay() {
      setTimeout(() => {
        this.reinitChart();
      }, 1000);
    },

    setOptions() {
      this.safeChartUpdate(() => {
        const option = this.getChartOption();
        this.currentOption = option;
        
        this.chart.setOption(option, {
          notMerge: false,
          lazyUpdate: true
        });
      });
    },
    
    safeUpdateChart(chartData) {
      this.safeChartUpdate(() => {
        const option = this.getChartOption(chartData);
        this.currentOption = option;
        
        this.chart.setOption(option, {
          notMerge: false,
          lazyUpdate: true
        });
      });
    },

    getChartOption(chartData) {
      // 使用传入的数据或默认数据
      const data = chartData || {};
      
      return {
        tooltip: {
          trigger: "item",
          formatter: "本月的病害数量:{c}",
        },
        title: {
          show: true,
          text: "病害(数量)-时间变化趋势",
          x: "center",
          y: "top",
        },
        xAxis: {
          name: "日期",
          type: "category",
          data: data.xAxisData || [
            "2023-01", "2023-02", "2023-03", "2023-04", "2023-05", 
            "2023-06", "2023-07", "2023-09", "2023-10", "2023-11", "2023-12"
          ],
          axisLabel: {
            rotate: 45,
            color: "black",
            fontSize: 12,
          },
        },
        yAxis: {
          name: "病害数量",
          type: "value",
          axisLabel: {
            formatter: "{value} 个",
            color: "black",
            fontSize: 12,
          },
          splitLine: {
            show: true,
          },
        },
        legend: {
          orient: "horizontal",
          x: "center",
          y: "30",
          padding: [0, 50, 0, 0],
          data: ["钢轨裂纹", "钢轨波磨", "轨枕裂纹", "翻浆冒泥", "道床裂纹"],
        },
        series: data.series || [
          {
            name: "钢轨裂纹",
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
      };
    },
    
    handleLegendSelect(params) {
      // 图例选择变化时的处理
      console.log('Legend selected:', params);
      
      // 延迟更新以避免冲突
      this.safeChartUpdate(() => {
        // 可以在这里根据图例选择状态更新图表
        // 例如过滤数据等
      });
    }
  },
};
</script>