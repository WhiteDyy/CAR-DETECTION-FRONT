<!-- 主组件 -->
<template>
  <AppPage>
    <n-layout has-sider class="full-layout">
      <!-- 左侧 20% -->
      <n-layout-sider width="30%" content-style="padding: 5px;">
        <div class="card-container">
          <!-- 第一列 -->
          <div class="card-table">
            <div v-for="(item, index) in firstColumnData" :key="index" class="card-row">
              <div class="card-label">
                <div v-if="index === 0">
                  {{ item.label }}
                </div>
                <span v-else class="card-span">
                  {{ item.label }}
                </span>
              </div>
              <div class="names-column">
                <span v-for="(param, paramIndex) in item.values" :key="paramIndex" class="param-name">
                  {{ param.name }}
                </span>
              </div>
              <div class="values-column">
                <span v-for="(param, paramIndex) in item.values" :key="paramIndex" class="value-digit">
                  {{ param.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- 第二列 -->
          <div class="card-table">
            <div v-for="(item, index) in secondColumnData" :key="index" class="card-row">
              <div class="card-label">
                <span class="card-span">
                  {{ item.label }}
                </span>
              </div>
              <div class="names-column">
                <span v-for="(param, paramIndex) in item.values" :key="paramIndex" class="param-name">
                  {{ param.name }}
                </span>
              </div>
              <div class="values-column">
                <span v-for="(param, paramIndex) in item.values" :key="paramIndex" class="value-digit">
                  {{ param.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </n-layout-sider>

      <!-- 右侧 80% -->
      <n-layout class="right-container">
        <!-- 右侧上部 40% -->
        <n-layout-content content-style="padding: 5px;" class="upper-section">
          <div class="card-content">
            <!-- 卡片包裹标题和内容 -->
            <div class="card-wrapper">
              <div class="card-header">
                <div class="card-text">
                  <div class="title-text">
                    道岔图像
                  </div>
                  <div>道岔型号: {{ switchModel }}</div>
                  <div>公里标: {{ kilometerMark }}</div>
                </div>
              </div>
              <div class="svg-container">
                <img class="background" :src="trackImage" alt="Track Image">
              </div>
            </div>
          </div>
        </n-layout-content>

        <!-- 右侧下部 60% -->
        <n-layout-content content-style="padding: 5px;" class="lower-section">
          <div class="chart-container">
            <!-- 9个折线图，按照 3x3 布局 -->
            <div class="chart-row">
              <TrendChart
                :data="switchChartData" parameter="左高低" :color="colorMap['左高低']"
                :x-axis-data="switchXAxisData" title="左高低趋势"
              />
              <TrendChart
                :data="switchChartData" parameter="右高低" :color="colorMap['右高低']"
                :x-axis-data="switchXAxisData" title="右高低趋势"
              />
              <TrendChart
                :data="switchChartData" parameter="左轨向" :color="colorMap['左轨向']"
                :x-axis-data="switchXAxisData" title="左轨向趋势"
              />
            </div>
            <div class="chart-row">
              <TrendChart
                :data="switchChartData" parameter="右轨向" :color="colorMap['右轨向']"
                :x-axis-data="switchXAxisData" title="右轨向趋势"
              />
              <TrendChart
                :data="switchChartData" parameter="垂直磨耗" :color="colorMap['垂直磨耗']"
                :x-axis-data="switchXAxisData" title="垂直磨耗趋势"
              />
              <TrendChart
                :data="switchChartData" parameter="侧面磨耗" :color="colorMap['侧面磨耗']"
                :x-axis-data="switchXAxisData" title="侧面磨耗趋势"
              />
            </div>
            <div class="chart-row">
              <TrendChart
                :data="switchChartData" parameter="轨距" :color="colorMap['轨距']"
                :x-axis-data="switchXAxisData" title="轨距趋势"
              />
              <TrendChart
                :data="switchChartData" parameter="扭曲" :color="colorMap['扭曲']"
                :x-axis-data="switchXAxisData" title="扭曲趋势"
              />
              <TrendChart
                :data="switchChartData" parameter="曲线正矢" :color="colorMap['曲线正矢']"
                :x-axis-data="switchXAxisData" title="曲线正矢趋势"
              />
            </div>
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
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
const switchModel = ref('CZ-123') // 道岔型号
const kilometerMark = ref('K123+456') // 公里标
// 第一列数据
const firstColumnData = ref([
  { label: '道尺', values: [{ name: '', value: '值' }] },
  { label: 'S1', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S1', values: [{ name: '尖轨与基本轨的密贴', value: '100mm' }] },
  { label: 'S2', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S3', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S4', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S5', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S6', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S7', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S8', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S9', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S10', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },

])

const secondColumnData = ref([
  { label: 'S11', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S12', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S13', values: [{ name: '查照间隔', value: '100mm' }, { name: '护背距离', value: '50mm' }] },
  { label: 'S16', values: [{ name: '查照间隔', value: '100mm' }, { name: '护背距离', value: '50mm' }] },
  { label: 'S13', values: [{ name: '轨距', value: '100mm' }] },
  { label: 'S14', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S15', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: 'S16', values: [{ name: '轨距', value: '100mm' }] },
  { label: 'S17', values: [{ name: '轨距', value: '100mm' }, { name: '水平', value: '50mm' }] },
  { label: '无', values: [{ name: '滑床板与尖轨离缝', value: '100mm' }] },
  { label: '无', values: [{ name: '护轨轮缘槽宽度', value: '100mm' }] },
  { label: '无', values: [{ name: '辙叉咽喉部位', value: '100mm' }] },

])

// 左侧数据，values 是一个数组，可以有 1-3 个值
const leftData = ref([
  { label: '道尺', values: ['值'] },
  { label: 'S1', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S2', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S3', values: ['轨距:100mm'] },
  { label: 'S4', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S5', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S6', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S7', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S8', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S9', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S10', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S11', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S12', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S13', values: ['轨距:100mm'] },
  { label: 'S14', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S15', values: ['轨距:100mm', '水平:50mm'] },
  { label: 'S16', values: ['轨距:100mm'] },
  { label: 'S17', values: ['轨距:100mm', '水平:50mm'] },
])

// 解析数据，将 values 拆分为 name 和 value
const parsedLeftData = computed(() => {
  return leftData.value.map(item => ({
    label: item.label,
    values: item.values.map((value) => {
      if (value.includes(':')) {
        const [name, val] = value.split(':')
        return { name, value: val }
      }
      else {
        return { name: '', value } // 如果没有冒号，name 为空
      }
    }),
  }))
})

const trackImage = new URL('@/assets/images/switch.jpg', import.meta.url).href
// 参数列表

// 颜色映射
// const colorMap = {
//     "左高低": "#ff7f0e",
//     "右高低": "#ff7f0e",
//     "左轨向": "#1f77b4",
//     "右轨向": "#1f77b4",
//     "垂直磨耗": "#2ca02c",
//     "侧面磨耗": "#2ca02c",
//     "轨距": "#d62728",
//     "超高": "#9467bd",
//     "三角坑": "#8c564b"
// }

// X 轴数据（里程）
// 示例数据
// 初始数据
// 初始数据
const switchChartData = ref({
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

const colorMap = ref({
  左高低: '#ff7f0e',
  右高低: '#ff7f0e',
  左轨向: '#1f77b4',
  右轨向: '#1f77b4',
  垂直磨耗: '#2ca02c',
  侧面磨耗: '#2ca02c',
  轨距: '#d62728',
  扭曲: '#9467bd',
  曲线正矢: '#8c564b',
})

// 初始化 X 轴数据（里程）
const switchXAxisData = ref([])

// 定义随机范围
const ranges = {
  左高低: [1, 4],
  右高低: [1, 4],
  左轨向: [1, 2],
  右轨向: [1, 2],
  垂直磨耗: [0.5, 1],
  侧面磨耗: [0.5, 1],
  轨距: [1430, 1440],
  扭曲: [1, 2],
  曲线正矢: [115, 125],
}

// 生成随机值的辅助函数
const getRandomValue = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2))

// 初始化数据：生成 1000 个点
function initializeData() {
  const length = 1000 // 累计 1000 个点（500 米）
  switchXAxisData.value = Array.from(
    { length },
    (_, i) => (i * 0.5).toFixed(1), // 0.0 到 499.5
  )

  Object.keys(switchChartData.value).forEach((param) => {
    const [min, max] = ranges[param]
    switchChartData.value[param] = Array.from(
      { length },
      () => getRandomValue(min, max),
    )
  })
}

// 更新函数：追加新数据，移除旧数据，保持 1000 个点
function updateData() {
  const maxLength = 100 // 最大保留 1000 个点
  const lastMileage = Number.parseFloat(switchXAxisData.value[switchXAxisData.value.length - 1])
  const newMileage = (lastMileage + 0.5).toFixed(1)

  // 更新 X 轴
  if (switchXAxisData.value.length >= maxLength) {
    switchXAxisData.value.shift() // 移除最旧的
  }
  switchXAxisData.value.push(newMileage) // 添加最新的

  // 更新 Y 轴数据
  Object.keys(switchChartData.value).forEach((param) => {
    const [min, max] = ranges[param]
    const newValue = getRandomValue(min, max)
    if (switchChartData.value[param].length >= maxLength) {
      switchChartData.value[param].shift() // 移除最旧的
    }
    switchChartData.value[param].push(newValue) // 添加最新的
  })
}

// 定时器变量
let timer = null

// 组件挂载时初始化并启动定时器
onMounted(() => {
  initializeData() // 初始化 1000 个点
  timer = setInterval(() => {
    updateData() // 每秒更新
  }, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

// const chartData = ref({
//     "左高低": [],
//     "右高低": [],
//     "左轨向": [],
//     "右轨向": [],
//     "垂直磨耗": [],
//     "侧面磨耗": [],
//     "轨距": [],
//     "扭曲": [],
//     "曲线正矢": []
// })

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

// const switchChartData = ref({
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
  // simulateDataUpdate();
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

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upper-section {
  height: 40%;
  /* 减小上半部分高度 */
  overflow: auto;
  /* 超出内容可滚动 */
  display: flex;
  flex-direction: column;
}

.card-content {
  width: 100%;
  /* 占满父容器宽度 */
  height: 100%;
  /* 占满父容器高度 */
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
}

.card-wrapper {
  width: 100%;
  /* 卡片适配 card-content */
  height: 100%;
  /* 卡片适配 card-content */
  background-color: white;
  /* 卡片背景 */
  border-radius: 8px;
  /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  /* 阴影 */
  padding: 10px;
  /* 内边距 */
  display: flex;
  flex-direction: column;
  /* 垂直排列文字和图片 */
  position: relative;
  /* 用于定位文字 */
}

.card-header {
  position: absolute;
  /* 固定在左上角 */
  top: 10px;
  /* 距离顶部 */
  left: 10px;
  /* 距离左侧 */
  display: flex;
  align-items: flex-start;
  /* 顶部对齐 */
}

.card-text {
  background-color: white;
  /* 卡片背景 */
  padding: 8px 16px;
  /* 增加内边距 */
  border-radius: 6px;
  /* 圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 阴影 */
  display: flex;
  flex-direction: column;
  /* 垂直排列标题和参数 */
  gap: 8px;
  /* 行间距 */
}

.title-text {
  font-size: 18px;
  /* 标题字体稍大 */
  font-weight: 700;
  /* 标题更粗 */
  color: #333;
  /* 文字颜色 */
}

.card-text div {
  font-size: 16px;
  /* 参数字体 */
  font-weight: 600;
  /* 参数加粗 */
  color: #333;
  /* 文字颜色 */
}

.svg-container {
  width: 100%;
  /* 适配 card-wrapper */
  height: 100%;
  /* 适配 card-wrapper */
  display: flex;
  justify-content: center;
  align-items: center;
}

.background {
  width: 100%;
  /* 缩放到 svg-container 大小 */
  height: 100%;
  /* 缩放到 svg-container 大小 */
  object-fit: contain;
  /* 保持比例缩放 */
}

td {
  padding: 6px 8px;
  white-space: nowrap;
  /* 防止值换行 */
}

.card-container {
  display: flex;
  gap: 10px;
  height: 100%;
  padding: 5px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 50%;
  padding: 8px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card-row {
  display: flex;
  background: linear-gradient(90deg, #2196f3 20%, #1976d2 60%);

  color: #fff;
  border-radius: 6px;
  padding: 6px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  min-height: 60px;
  /* 保持最小高度 */
}

.card-label {
  flex: 0 0 40px;
  /* 固定宽度 */
  font-weight: 600;
  font-size: 18px;
  padding-left: 6px;
  display: flex;
  flex-direction: column;
  /* 垂直排列 */
  justify-content: center;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  white-space: nowrap;
}

.names-column {
  flex: 1;
  /* 均分剩余空间 */
  display: flex;
  flex-direction: column;
  /* 垂直排列 */
  gap: 6px;
  /* 参数之间的垂直间距 */
  justify-content: center;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
}

.values-column {
  flex: 1;
  /* 均分剩余空间 */
  display: flex;
  flex-direction: column;
  /* 垂直排列 */
  gap: 6px;
  /* 值之间的垂直间距 */
  justify-content: center;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
}

.param-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 800;
  white-space: normal;
  /* 允许换行 */
  max-width: 70px;
  /* 默认最大宽度，可调整 */
  word-break: break-word;
  /* 长词在边界处断开 */
  overflow-wrap: break-word;
  /* 增强换行控制 */
  text-align: center;
  /* 保持居中对齐 */
}

.value-digit {
  width: 80px;
  height: 30px;
  text-align: center;
  /* 水平居中（可选，配合 flex） */
  background-color: rgba(255, 255, 255, 0.95);
  color: #1565c0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  border-radius: 2px;
  padding: 0 4px;
  /* 移除垂直内边距，只保留水平内边距 */
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  /* 转换为 Flex 容器 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
}

/* Tag样式优化 */
.n-tag {
  background-color: rgba(255, 255, 255, 0.932) !important;
  width: 40px;
  padding: 1px 4px !important;
  border-radius: 10px !important;
  font-size: 12px !important;
  display: flex;
  /* 确保 tag 内部居中 */
  align-items: center;
  /* 垂直居中 */
  justify-content: center;
  background: #000;
  /* 水平居中 */
}

.card-span {
  background-color: white;
  /* 卡片背景为白色 */
  border-radius: 6px;
  /* 圆角 */
  padding: 4px 8px;
  /* 内边距，增加卡片感 */
  display: inline-flex;
  /* 确保内容居中且适应文字 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 添加阴影，增强卡片效果 */
  font-size: 18px;
  /* 默认字体大小，可调整 */
  color: #333;
  /* 文字颜色，可调整 */
  width: 50px;
}

.full-layout {
  height: 97vh;
}

.right-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lower-section {
  height: 60%;
  /* 下半部分高度 */
  overflow: hidden;
  /* 移除滚动条 */
  padding: 5px;
  /* 与 content-style 保持一致 */
}

.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 垂直排列行 */
  gap: 2px;
  /* 行间距 */
  justify-content: center;
  /* 垂直居中 */
}

.chart-row {
  display: flex;
  flex-direction: row;
  /* 水平排列列 */
  gap: 2px;
  /* 列间距 */
  /* 移除 flex: 1，让高度由图表决定 */
  justify-content: center;
  /* 水平居中 */
}

.trend-chart {
  width: 500px;
  /* 固定宽度，缩小尺寸 */
  height: 180px;
  /* 固定高度，缩小尺寸 */
  background-color: white;
  /* 图表背景 */
  border-radius: 8px;
  /* 圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 阴影 */
}
</style>
