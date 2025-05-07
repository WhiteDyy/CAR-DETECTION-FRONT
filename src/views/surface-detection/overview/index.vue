<template>
  <AppPage show-footer>
    <div class="stats-container">
      <n-flex :wrap="false" justify="space-between" align="center">
        <n-card class="stats-card">
          <n-statistic label="病害检测总数">
            1,234,123
          </n-statistic>
        </n-card>
        <n-card class="stats-card">
          <n-statistic label="设备总数">
            10台
          </n-statistic>
        </n-card>
        <n-card class="stats-card">
          <n-statistic label="设备运行总时长">
            1000h
          </n-statistic>
        </n-card>
        <n-card class="stats-card">
          <n-statistic label="设备运行总里程">
            1000km
          </n-statistic>
        </n-card>
        <n-card class="stats-card">
          <n-statistic label="设备运行总里程">
            1000km
          </n-statistic>
        </n-card>
      </n-flex>
    </div>

    <n-card class="mt-12" title="实时病害图像" segmented>
      <div class="card-container">
        <!-- 第一个div：图像相关信息描述列表 -->
        <div class="info-list">
          <n-statistic label="当前时间" :value="currentTime">
            <template #prefix>
              <n-icon class="i-mdi:clock-outline text-blue-500" />
            </template>
          </n-statistic>
          <n-statistic label="当前位置" :value="currentPosition">
            <template #prefix>
              <n-icon class="i-mdi:map-marker-outline text-blue-500" />
            </template>
            <template #suffix>
              公里
            </template>
          </n-statistic>
          <n-statistic label="当前速度" :value="currentSpeed">
            <template #prefix>
              <n-icon class="i-mdi:speedometer text-blue-500" />
            </template>
            <template #suffix>
              公里/小时
            </template>
          </n-statistic>
          <n-statistic label="采集时间" :value="captureTime">
            <template #prefix>
              <n-icon class="i-mdi:timer-outline text-blue-500" />
            </template>
          </n-statistic>
          <n-statistic label="采集位置" :value="capturePosition">
            <template #prefix>
              <n-icon class="i-mdi:pin-outline text-blue-500" />
            </template>
            <template #suffix>
              公里
            </template>
          </n-statistic>
          <n-statistic label="采集速度" :value="captureSpeed">
            <template #prefix>
              <n-icon class="i-mdi:car text-blue-500" />
            </template>
            <template #suffix>
              公里/小时
            </template>
          </n-statistic>
        </div>

        <!-- 第二个div：图像和公里标示意图 -->
        <div class="image-container">
          <n-image :src="imageSrc" alt="overview" preview class="full-image" />
        </div>

        <!-- 第三个div：当前检测任务信息 -->
        <div class="task-info">
          <n-statistic label="起点公里标" :value="startKm">
            <template #prefix>
              <n-icon class="i-mdi:skip-previous-outline text-green-500" />
            </template>
            <template #suffix>
              公里
            </template>
          </n-statistic>
          <n-statistic label="终点公里标" :value="endKm">
            <template #prefix>
              <n-icon class="i-mdi:skip-next-outline text-green-500" />
            </template>
            <template #suffix>
              公里
            </template>
          </n-statistic>
          <n-statistic label="已行驶里程/总里程" :value="traveledDistance">
            <template #prefix>
              <n-icon class="i-mdi:road-variant text-green-500" />
            </template>
            <template #suffix>
              / {{ totalDistance }} 公里
            </template>
          </n-statistic>
          <n-statistic label="已采集数据总量" :value="totalDataCollected">
            <template #prefix>
              <n-icon class="i-mdi:cloud-download-outline text-orange-500" />
            </template>
            <template #suffix>
              MB
            </template>
          </n-statistic>
          <n-statistic label="已采集图片数量" :value="imageCount">
            <template #prefix>
              <n-icon class="i-mdi:image-outline text-orange-500" />
            </template>
            <template #suffix>
              张
            </template>
          </n-statistic>
          <n-statistic label="已检测到的病害数量" :value="defectCount">
            <template #prefix>
              <n-icon class="i-mdi:alert-circle-outline text-red-500" />
            </template>
            <template #suffix>
              个
            </template>
          </n-statistic>
        </div>
      </div>
    </n-card>
    <n-card>
      <div class="h-200">
        <VChart :option="trendOption" autoresize />
      </div>
    </n-card>
  </AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'

import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

const userStore = useUserStore()

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  PieChart,
])

const trendOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#666',
        type: 'dashed',
      },
    },
    formatter: (params) => {
      const data = params[0]
      return `${data.name}: ${data.value} 条消息`
    },
  },
  legend: {
    top: '2%',
    data: ['消息数量'],
  },
  grid: {
    left: '5px',
    right: '5px',
    top: '30px',
    bottom: '5px',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: [], // 初始为空，动态更新
      axisPointer: {
        type: 'shadow',
      },
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        interval: 1, // 每 5 分钟显示一个标签
        rotate: 45,
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: '消息数量 (条)',
      min: 0,
      max: 1000,
      interval: 200,
      axisLabel: {
        formatter: '{value}',
      },
    },
  ],
  series: [
    {
      name: '消息数量',
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#1890ff',
        width: 2,
      },
      itemStyle: {
        color: '#1890ff',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0)' },
          ],
        },
      },
      data: [], // 初始为空，动态更新
    },
  ],
})
const skillOption = {
  tooltip: {
    trigger: 'item',
    formatter({ name, value }) {
      return `${name} ${value}%`
    },
  },
  legend: {
    left: 'center',
  },
  series: [
    {
      top: '12%',
      type: 'pie',
      radius: ['35%', '90%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 36,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 38.5, name: 'Vue' },
        { value: 37.0, name: 'JavaScript' },
        { value: 6.5, name: 'CSS' },
        { value: 6.2, name: 'HTML' },
        { value: 1.8, name: 'Other' },
      ],
    },
  ],
}

const message = $message
// 图片路径（假设为静态资源）
const imageSrc = new URL('@/assets/images/test.jpg', import.meta.url).href
// 计算图片路径
// const imageSrc = computed(() => new URL('@/assets/images/test.jpg', import.meta.url).href);

// 控制模态框显示
const isModalVisible = ref(false)

// 点击图片显示详情
function showDetail() {
  isModalVisible.value = true
}

// 定义响应式数据
const currentTime = ref('2025-03-05 14:30:00')
const currentPosition = ref(45)
const currentSpeed = ref(80)
const captureTime = ref('2025-03-05 14:29:50')
const capturePosition = ref(44.8)
const captureSpeed = ref(78)
const detectionResult = ref('裂缝')
// const imageSrc = ref("https://example.com/image.jpg");
const startKm = ref(0)
const endKm = ref(100)
const traveledDistance = ref(45)
const totalDistance = ref(100)
const totalDataCollected = ref(256)
const imageCount = ref(120)
const defectCount = ref(5)

// 计算当前设备位置的百分比
const currentLeft = computed(() => {
  const totalDistanceKm = endKm.value - startKm.value
  const positionRatio = (currentPosition.value - startKm.value) / totalDistanceKm
  return positionRatio * 100 // 返回百分比
})

// 更新图表数据的函数
function updateChart() {
  const now = new Date()
  const minutes = []
  const data = []

  // 生成最近 30 分钟的时间点和示例数据
  for (let i = 29; i >= 0; i--) {
    const time = new Date(now - i * 60 * 1000) // 向前推算 29 分钟
    const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`
    minutes.push(timeStr)
    data.push(Math.floor(Math.random() * 600) + 50) // 随机生成 50-650 之间的消息数量
  }

  // 更新 trendOption
  trendOption.value.xAxis[0].data = minutes
  trendOption.value.series[0].data = data
}

// 组件挂载时初始化图表并设置定时更新
onMounted(() => {
  updateChart() // 初始加载数据
  const interval = setInterval(updateChart, 60000) // 每分钟更新一次
  onUnmounted(() => clearInterval(interval)) // 组件卸载时清理定时器
})
</script>

<style scoped>
.stats-container {
  width: 100%;
}

.stats-card {
  flex: 1;
  /* 每个卡片平均分配宽度 */
  min-width: 200px;
  /* 最小宽度 */
  margin-right: 5px;
  /* 卡片间距 */
  text-align: center;
  /* 内容居中 */
}

.stats-card:last-child {
  margin-right: 0;
  /* 最后一个卡片无右边距 */
}

/* 横向布局样式 */
.card-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  /* 三个div之间的间距 */
}

/* 第一个div：信息列表 */
.info-list {
  flex: 1;
  /* 自适应宽度 */
  min-width: 200px;
  /* 最小宽度，避免过于压缩 */
}

/* 第二个div：图像容器 */
.image-container {
  flex: 3;
  /* 图像占更大比例 */
  display: flex;
  justify-content: center;
  /* 图像居中 */
  align-items: center;
  min-width: 500px;
}

.full-image {
  max-width: 100%;
  /* 图像自适应容器宽度 */
  height: auto;
}

/* 第三个div：任务信息 */
.task-info {
  flex: 1;
  /* 自适应宽度 */
  min-width: 200px;
  /* 最小宽度，避免过于压缩 */
}

/* 设置图标基础样式 */
.n-icon {
  font-size: 20px;
  /* 统一大小 */
  margin-right: 8px;
}

/* 确保 SVG 颜色生效 */
.n-icon svg {
  fill: currentColor;
}
</style>
