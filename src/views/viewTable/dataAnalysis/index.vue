<template>
  <div class="app-container">
    <n-grid :x-gap="5" :y-gap="5" class="chart-grid">
      <!-- 你的网格内容 -->
      <n-gi span="12">
        <n-card :segmented="false" :body-style="{ padding: '5px', height: '100%' }">
          <line-chart />
        </n-card>
      </n-gi>
      <n-gi span="12">
        <n-card :segmented="false" :body-style="{ padding: '5px', height: '100%' }">
          <pie-line />
        </n-card>
      </n-gi>
      <n-gi span="12">
        <n-card :segmented="false" :body-style="{ padding: '5px', height: '100%' }">
          <data-set />
        </n-card>
      </n-gi>
      <n-gi span="12">
        <n-card :segmented="false" :body-style="{ padding: '5px', height: '100%' }">
          <bar-chart />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script>
import { NGrid, NGi, NCard } from 'naive-ui'
import Search from "./topBar/search.vue"
import dataSet from "../../../components/Echarts/dataAnalysis/overview/dataSetChart.vue";
import LineChart from "../../../components/Echarts/dataAnalysis/overview/lineChart.vue"
import BarChart from "../../../components/Echarts/dataAnalysis/overview/barChart.vue"
import leftBottom from "../../../components/Echarts/dataAnalysis/overview/LeftBottomChart.vue";
import PieLine from "../../../components/Echarts/dataAnalysis/overview/pieLineChart.vue"

export default {
  components: {
    Search,
    dataSet,
    LineChart,
    BarChart,
    leftBottom,
    PieLine
  },
  mounted() {
    this.$nextTick(() => {
      this.enableScroll();
    });
  },
  methods: {
    enableScroll() {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow-y: auto;
  padding: 10px;
}

.chart-grid {
  min-height: 100%;
}
</style>

<style>
/* 全局样式修复 */
html, body {
  height: 100%;
  overflow: auto;
}
</style>