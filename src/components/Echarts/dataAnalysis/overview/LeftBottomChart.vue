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

import { markRaw } from 'vue';
import chartResize from "../../mixins/chart-resize";
export default {
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
      default: "350px",
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
      //下钻数据
      drilldownData: [],
      //横轴数据
      xData: [],
      seriesData: [],
      objData: {},
      mockData: {
        total: 4,
        rows: [
          {
            location: ["钢轨表面", "扣件", "轨枕", "道床"],
          },
          {
            type: [
              {
                groupId: "钢轨表面",
                value: "0",
              },
              {
                groupId: "扣件",
                value: "1",
              },
              {
                groupId: "轨枕",
                value: "2",
              },
              {
                groupId: "道床",
                value: "1",
              },
            ],
          },
          {
            drilldownData: [
              {
                dataGroupId: "钢轨表面",
                data: [
                  ["钢轨裂纹", 0],
                  ["钢轨剥离掉块", 0],
                  ["钢轨波磨", 0],
                  ["钢轨锈蚀", 0],
                ],
              },
              {
                dataGroupId: "扣件",
                data: [
                  ["扣件缺失", 1],
                  ["扣件断裂", 0],
                ],
              },
              {
                dataGroupId: "轨枕",
                data: [
                  ["轨枕断裂", 0],
                  ["轨枕丢失", 0],
                  ["轨枕裂纹", 1],
                  ["轨枕掉块", 1],
                ],
              },
              {
                dataGroupId: "道床",
                data: [
                  ["道床翻浆冒泥", 1],
                  ["道床冻害", 0],
                  ["道床裂纹", 0],
                ],
              },
            ],
          },
        ],
        code: 200,
        msg: "查询成功",
      },
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
  created() {
    // this.getList();
  },
  mounted() {
    /* 图表初始化 */
    this.$nextTick(() => {
      this.getList();
      this.initChart();
      this.clickFun();
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
    getList() {
      console.log("请求数据");
      let obj = JSON.parse(JSON.stringify(this.mockData.rows));
      this.xData = obj[0].location;
      this.seriesData = obj[1].type;
      this.drilldownData = obj[2].drilldownData;
      //等后端请求到数据，再进行渲染
      this.setOptions(this.xData, this.seriesData);
      // getDrillDownChartData().then((response) => {
      //   console.log("请求数据");
      //   let obj = JSON.parse(JSON.stringify(response.rows));
      //   this.xData = obj[0].location;
      //   this.seriesData = obj[1].type;
      //   this.drilldownData = obj[2].drilldownData;
      //   //等后端请求到数据，再进行渲染
      //   this.setOptions(this.xData, this.seriesData);
      // });
    },
    initChart() {
      console.log("初始化echarts");
      this.chart = markRaw(echarts.init(this.$el));
      //父组件传值
      // this.setOptions(this.chartData);
      //解构父组件传的对象
      // { xData, seriesData } = {}
    },
    setOptions(xData, seriesData) {
      console.log("进入setOption方法");
      this.chart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        xAxis: {
          data: xData,
          axisTick: {
            alignWithLabel: true,
          },
          splitLine: { show: false },
        },
        grid: {
          top: "20%",
          left: "0%",
          right: "0%",
          bottom: "0%",
          containLabel: true,
        },
        yAxis: {},
        dataGroupId: "",
        animationDurationUpdate: 500,
        series: {
          type: "bar",
          id: "sales",
          data: seriesData,
          barWidth: "20%",
          universalTransition: {
            enabled: true,
            divideShape: "clone",
          },
          itemStyle: {
            label: {
              show: true, //开启显示
              position: "top", //在上方显示
              textStyle: {
                //数值样式
                color: "black",
                fontSize: 16,
              },
            },
            color: function (params) {
              // 给出颜色组
              var colorList = [
                "#7cb5ec",
                "#f15c80",
                "#90ed7d",
                "#91e8e1",
                "#8085e9",
              ];
              return colorList[params.dataIndex];
            },
          },
        },
      });
    },

    changeBar(event) {
      console.log("触发了点击事件", event);
      let that = this;
      this.drilldownData = this.drilldownData;
      if (event.data) {
        var subData = this.drilldownData.find(function (data) {
          return data.dataGroupId === event.data.groupId;
        });
        if (!subData) {
          return;
        }
        this.chart.setOption({
          //修改X轴内容
          xAxis: {
            data: subData.data.map(function (item) {
              return item[0];
            }),
          },

          series: {
            type: "bar",
            id: "sales",
            dataGroupId: subData.dataGroupId,
            data: subData.data.map(function (item) {
              return item[1];
            }),
            universalTransition: {
              enabled: true,
              divideShape: "clone",
            },
          },
          //点击返回上一级
          graphic: [
            {
              type: "text",
              left: 50,
              top: 20,
              style: {
                text: "Back",
                fontSize: 18,
              },
              onclick: function () {
                that.setOptions(that.xData, that.seriesData);
              },
            },
          ],
        });
      }
    },
    clickFun() {
      this.chart.on("click", this.changeBar);
    },
  },
};
</script>