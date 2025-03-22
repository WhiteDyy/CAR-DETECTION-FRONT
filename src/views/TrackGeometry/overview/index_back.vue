<!-- 主组件 -->
<template>
  <AppPage show-footer>
    <n-card>
      <template #header>
        <!-- <div class="custom-title">正线</div> -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="custom-title">
            {{ currentTab === 'main' ? '正线' : '道岔' }}
          </div>
          <n-button type="primary" @click="toggleTab">
            切换到{{ currentTab === 'main' ? '道岔' : '正线' }}
          </n-button>
        </div>
      </template>
      <n-layout has-sider>
        <n-layout-sider content-style="padding: 5px;" width="100px">
          <div class="sider-content">
            <n-button
              v-for="parameter in parameterList" :key="parameter" :bordered="false"
              style="width: 80px; height: 40px;"
            >
              {{ parameter }}
            </n-button>
          </div>
        </n-layout-sider>
        <n-layout>
          <n-layout-content content-style="padding: 5px;">
            <TrendChart :data="chartData" :parameters="parameterList" :color-map="colorMap" :x-axis-data="xAxisData" />
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-card>
  </AppPage>
</template>

<script setup>
import { ref } from 'vue'
import TrendChart from './trendChart.vue' // 导入组件
// tab切换状态
const currentTab = ref('main')
// 切换tab的方法
function toggleTab() {
  currentTab.value = currentTab.value === 'main' ? 'switch' : 'main'
}

// 参数列表
const parameterList = ref([
  '左高低',
  '右高低',
  '左轨向',
  '右轨向',
  '垂直磨耗',
  '侧面磨耗',
  '轨距',
  '扭曲',
  '曲线正矢',
])

// 颜色映射
const colorMap = {
  左高低: '#ff7f0e',
  右高低: '#ff7f0e',
  左轨向: '#1f77b4',
  右轨向: '#1f77b4',
  垂直磨耗: '#2ca02c',
  侧面磨耗: '#2ca02c',
  轨距: '#d62728',
  超高: '#9467bd',
  三角坑: '#8c564b',
}

// X轴数据
const xAxisData = ['点位1', '点位2', '点位3']

// 图表数据
const chartData = ref({
  左高低: [2.5, 3.1, 2.8],
  右高低: [2.7, 2.9, 3.0],
  左轨向: [1.2, 1.5, 1.3],
  右轨向: [1.1, 1.4, 1.2],
  垂直磨耗: [0.8, 0.9, 0.85],
  侧面磨耗: [0.7, 0.8, 0.75],
  轨距: [1435, 1436, 1434],
  扭曲: [1.5, 1.6, 1.4],
  曲线正矢: [120, 122, 121],
})

// Dialog相关
const dialogVisible = ref(false)
const dialogTitle = ref('')

function openDialog(parameter) {
  dialogTitle.value = `${parameter} - 折线图`
  dialogVisible.value = true
}
</script>

<style scoped>
.sider-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 720px;
  padding-top: 42px;
  padding-bottom: 14px;
}

.custom-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 0px 0px;
}
</style>
