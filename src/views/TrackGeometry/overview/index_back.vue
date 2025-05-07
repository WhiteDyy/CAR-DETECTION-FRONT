<!-- 主组件 -->
<template>
  <AppPage show-footer>
    <n-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="custom-title">
            {{ currentTab === 'main' ? '正线' : '道岔' }}
          </div>
          <n-button type="primary" @click="toggleTab">
            切换到{{ currentTab === 'main' ? '道岔' : '正线' }}
          </n-button>
        </div>
      </template>
      <div v-show="currentTab === 'main'">
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
              <TrendChart
                :data="chartData" :parameters="parameterList" :color-map="colorMap"
                :x-axis-data="xAxisData"
              />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </div>
      <!-- 道岔内容 -->
      <div v-show="currentTab === 'switch'">
        <n-card class="main-card">
          <div class="card-content">
            <div class="flex-container">
              <n-table :bordered="false" size="small" class="left-table">
                <tbody>
                  <tr v-for="(item, index) in leftData" :key="index">
                    <td>
                      <div v-if="index === 0">
                        参数
                      </div>
                      <n-tag v-if="index > 0" :bordered="false" type="info">
                        {{ item.label }}
                      </n-tag>
                    </td>
                    <td v-for="(value, valueIndex) in item.values" :key="valueIndex">
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </n-table>

              <!-- 中间图片 -->
              <div class="svg-container">
                <img class="background" :src="trackImage" alt="Track Image">
              </div>

              <n-table :bordered="false" size="small" class="right-table">
                <tbody>
                  <tr v-for="(item, index) in rightData" :key="index">
                    <td>
                      <div v-if="index === 0">
                        参数
                      </div>
                      <n-tag v-if="index > 0" :bordered="false" type="info">
                        {{ item.label }}
                      </n-tag>
                    </td>
                    <td v-for="(value, valueIndex) in item.values" :key="valueIndex">
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </div>
          </div>
        </n-card>

        <n-layout has-sider>
          <n-layout-sider content-style="padding: 5px;" width="100px">
            <div class="sider-content">
              <n-button
                v-for="parameter in switchParameterList" :key="parameter" :bordered="false"
                style="width: 80px; height: 40px;"
              >
                {{ parameter }}
              </n-button>
            </div>
          </n-layout-sider>
          <n-layout>
            <n-layout-content content-style="padding: 5px;">
              <TrendChart
                :data="switchChartData" :parameters="switchParameterList" :color-map="colorMap"
                :x-axis-data="switchXAxisData"
              />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </div>
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

// 左侧数据，values 是一个数组，可以有 1-3 个值
const leftData = ref([
  { label: '参数', values: ['值'] }, // 1 个值
  { label: 'S1 前顺坡终点', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S2 尖轨尖部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S3 尖轨中部', values: ['轨距:100mm'] },
  { label: 'S4 尖轨跟端直股', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S5 尖轨跟端曲股', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S6 导曲线直股前部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S7 导曲线曲股前部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S8 导曲线直股中部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S9 导曲线曲股中部', values: ['轨距:100mm', '水平:50mm'] },
])

// 右侧数据
const rightData = ref([
  { label: '参数', values: ['值'] },
  { label: 'S10 导曲线直股后部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S11 导曲线曲股后部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S12 辙叉曲股前部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S13 辙叉曲股中部', values: ['轨距:100mm', '查照距离:50mm', '护背间距:50mm'] },
  { label: 'S14 辙叉曲股后部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S15 辙叉直股前部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S16 辙叉直股中部', values: ['轨距:100mm', '查照距离:50mm', '护背间距:50mm'] },
  { label: 'S17 辙叉直股后部', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S18 尖轨密贴', values: ['轨距:100mm', '滑床板与尖轨离缝:50mm'] },
])

const trackImage = new URL('@/assets/images/switch.jpg', import.meta.url).href
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

const switchParameterList = ref([
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

// X 轴数据（里程）
const xAxisData = ref([])

// 图表数据（Y 值）
const chartData = ref({
  左高低: [],
  右高低: [],
  左轨向: [],
  右轨向: [],
  垂直磨耗: [],
  侧面磨耗: [],
  轨距: [],
  扭曲: [],
  曲线正矢: [],
})

// 更新图表数据的函数
function updateChartData(newData) {
  // 添加 X 轴数据
  xAxisData.value.push(newData.mileage)

  // 添加各参数的 Y 值
  chartData.value['左高低'].push(newData.lHl)
  chartData.value['右高低'].push(newData.hHl)
  chartData.value['左轨向'].push(newData.lTd)
  chartData.value['右轨向'].push(newData.hTd)
  chartData.value['垂直磨耗'].push(newData.abrasion)
  chartData.value['侧面磨耗'].push(newData.abrasion)
  chartData.value['轨距'].push(newData.track)
  chartData.value['扭曲'].push(newData.twist || null) // 如果没有对应字段，可设为 null
  chartData.value['曲线正矢'].push(newData.curve || null) // 如果没有对应字段，可设为 null
}

// 示例：模拟数据更新
function simulateDataUpdate() {
  const sampleData = [
    { mileage: 1, lHl: 2.5, hHl: 2.7, lTd: 1.2, hTd: 1.1, abrasion: 0.8, track: 1435, twist: 1.5, curve: 120 },
    { mileage: 2, lHl: 3.1, hHl: 2.9, lTd: 1.5, hTd: 1.4, abrasion: 0.9, track: 1436, twist: 1.6, curve: 122 },
    { mileage: 3, lHl: 2.8, hHl: 3.0, lTd: 1.3, hTd: 1.2, abrasion: 0.85, track: 1434, twist: 1.4, curve: 121 },
  ]
  sampleData.forEach(data => updateChartData(data))
}

const switchXAxisData = [1, 2, 3]

// 图表数据
// const chartData = ref({
//     "左高低": [2.5, 3.1, 2.8],
//     "右高低": [2.7, 2.9, 3.0],
//     "左轨向": [1.2, 1.5, 1.3],
//     "右轨向": [1.1, 1.4, 1.2],
//     "垂直磨耗": [0.8, 0.9, 0.85],
//     "侧面磨耗": [0.7, 0.8, 0.75],
//     "轨距": [1435, 1436, 1434],
//     "扭曲": [1.5, 1.6, 1.4],
//     "曲线正矢": [120, 122, 121]
// })

const switchChartData = ref({
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

// 初始化 Canvas 上下文
onMounted(() => {
  // 初始化时模拟数据
  simulateDataUpdate()
})
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

n-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  /* 示例高度，可根据需要调整 */
  width: 100%;
}

.main-card {
  margin: 6px;
  /* 卡片外边距 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 6px;
  /* 内部间距 */
}

.flex-container {
  display: flex;
  justify-content: space-between;
  /* 左右靠边，中间拉伸 */
  align-items: flex-start;
  /* 顶部对齐 */
  gap: 16px;
  /* 元素间距 */
  width: 100%;
}

.left-table,
.right-table {
  width: auto;
  /* 自适应内容宽度 */
  min-width: 200px;
  /* 最小宽度，防止过窄 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  text-align: center;
}

.svg-container {
  flex: 1;
  /* 图片容器占据剩余空间 */
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  /* 图片最大宽度 */
}

.background {
  width: 100%;
  /* 图片宽度自适应容器 */
  max-width: 800px;
  /* 保持最大宽度限制 */
  height: auto;
}

td {
  padding: 6px 8px;
  white-space: nowrap;
  /* 防止值换行 */
}
</style>
