<template>
  <AppPage>
    <n-card>
      <template #header>
        <div class="track-info-container">
          <n-card size="small" class="track-info-card">
            <div class="track-info">
              <div class="info-item">
                <span class="info-label">线路类型:</span>
                <n-tag type="success" size="medium">
                  {{ trackType }}
                </n-tag>
              </div>
              <div class="info-item">
                <span class="info-label">线路名称:</span>
                <n-tag type="info" size="medium">
                  {{ trackModel }}
                </n-tag>
              </div>
              <div class="info-item">
                <span class="info-label">行别:</span>
                <n-tag type="warning" size="medium">
                  {{ trackDirection }}
                </n-tag>
              </div>

              <!-- 添加结束作业按钮 -->
              <div class="action-item">
                <n-button type="error" size="medium" :loading="endingJob" @click="handleEndJob">
                  结束作业
                </n-button>
              </div>
            </div>
          </n-card>
        </div>
      </template>

      <div v-show="currentTab === 'main'">
        <n-layout has-sider>
          <n-layout-sider content-style="padding: 0;" width="120px" class="parameter-sider">
            <div class="sider-content">
              <div
                v-for="(parameter, index) in parameterList" 
                :key="parameter" 
                class="parameter-item"
                :class="{ 'parameter-item-even': index % 2 === 0 }"
                :style="{ 
                  height: `${70 + 12}px`,
                  top: `${15 + (70 + 12) * index}px`,
                  '--param-color': colorMap[parameter]
                }"
                @mouseenter="handleParameterHover(parameter, true)"
                @mouseleave="handleParameterHover(parameter, false)"
              >
                <div class="parameter-color-bar" :style="{ backgroundColor: colorMap[parameter] }"></div>
                <div class="parameter-content">
                  <div class="parameter-name">{{ parameter }}</div>
                  <div v-if="getCurrentValue(parameter) !== null" class="parameter-value">
                    {{ formatValue(getCurrentValue(parameter)) }}
                  </div>
                </div>
              </div>
            </div>
          </n-layout-sider>
          <n-layout>
            <n-layout-content content-style="padding: 5px;">
              <TrendChart
                :data="chartData" :parameters="parameterList" :color-map="colorMap"
                :x-axis-data="xAxisData" :tag-positions="tagPositions" :not-merge="true"
                :sleeper-positions="sleeperPositions"
              />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </div>
    </n-card>
  </AppPage>
</template>

<script setup>
import { useTaskStore } from '@/store'
import SSEService from '@/utils/sse/sseService'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from './api'
import TrendChart from './trendChart.vue'
// tab切换状态
const currentTab = ref('main')

// 参数悬停状态
// 处理参数悬停
function handleParameterHover(_parameter, _isEnter) {
  // 预留：后续可在这里联动图表高亮
}

// 获取当前值（最后一个数据点）
function getCurrentValue(parameter) {
  const data = chartData.value[parameter]
  if (!data || data.length === 0) return null
  return data[data.length - 1]
}

// 格式化数值显示
function formatValue(value) {
  if (value === null || value === undefined) return '-'
  if (Math.abs(value) >= 1000) {
    return value.toFixed(0)
  } else if (Math.abs(value) >= 100) {
    return value.toFixed(0)
  } else if (Math.abs(value) >= 10) {
    return value.toFixed(1)
  } else if (Math.abs(value) >= 1) {
    return value.toFixed(2)
  } else {
    return value.toFixed(3)
  }
}

// 线路信息
const trackType = ref('正线')
const trackModel = ref('60kg/m')
const trackDirection = ref('上行')

// 参数列表
const parameterList = ref([
  '轨距',
  '轨距变化率',
  '左高低',
  '右高低',
  '左轨向',
  '右轨向',
  '水平',
  '三角坑',
])

// 颜色映射 - 使用更协调的配色方案
const colorMap = {
  轨距: '#FF6B6B',           // 珊瑚红
  轨距变化率: '#FF8E53',      // 橙红a
  左高低: '#4ECDC4',          // 青绿色
  右高低: '#45B7D1',          // 天蓝色
  左轨向: '#96CEB4',          // 薄荷绿
  右轨向: '#FFEAA7',          // 淡黄色
  水平: '#DDA15E',            // 金色
  三角坑: '#A8E6CF',          // 浅绿色
}

// 图表核心数据
const xAxisData = ref([])
const chartData = ref({
  轨距: [],
  轨距变化率: [],
  左高低: [],
  右高低: [],
  左轨向: [],
  右轨向: [],
  水平: [],
  三角坑: [],
})
const tagPositions = ref([])
const sleeperPositions = ref([])

// ========== 模拟数据（用于展示，调试完成后可删除或注释） ==========
const useMockData = ref(true) // 设置为 false 可关闭模拟数据

// if (useMockData.value) {
//   // 生成模拟里程数据（0-1000米，每0.1米一个点）
//   const mockMileage = []
//   for (let i = 0; i <= 1000; i += 0.1) {
//     mockMileage.push(Number(i.toFixed(1)))
//   }
//   xAxisData.value = mockMileage

//   // 生成模拟参数数据
//   const generateMockData = (baseValue, amplitude, frequency, offset = 0) => {
//     return mockMileage.map((mileage, index) => {
//       const value = baseValue + 
//         amplitude * Math.sin((mileage + offset) * frequency) +
//         amplitude * 0.3 * Math.sin((mileage + offset) * frequency * 2.5) +
//         (Math.random() - 0.5) * amplitude * 0.2
//       return Number(value.toFixed(2))
//     })
//   }

//   chartData.value = {
//     轨距: generateMockData(1435, 3, 0.01), // 1435mm ± 3mm
//     轨距变化率: generateMockData(0, 0.5, 0.02), // ±0.5 mm/m
//     左高低: generateMockData(0, 2, 0.015), // ±2mm
//     右高低: generateMockData(0, 2, 0.018), // ±2mm
//     左轨向: generateMockData(0, 1.5, 0.012), // ±1.5mm
//     右轨向: generateMockData(0, 1.5, 0.014), // ±1.5mm
//     水平: generateMockData(0, 1, 0.016), // ±1mm
//     三角坑: generateMockData(0, 0.8, 0.013), // ±0.8mm
//   }

//   // 生成模拟轨枕和标签位置
//   sleeperPositions.value = []
//   tagPositions.value = []
  
//   for (let i = 0; i <= 1000; i += 0.6) { // 每0.6米一个轨枕
//     sleeperPositions.value.push({
//       mileage: Number(i.toFixed(1)),
//       displayId: Math.floor(i / 0.6) + 1,
//       uniqueId: `sleeper-${i}`,
//     })
//   }

//   for (let i = 0; i <= 1000; i += 100) { // 每100米一个标签
//     tagPositions.value.push({
//       mileage: Number(i.toFixed(1)),
//       id: Math.floor(i / 100) + 1,
//     })
//   }
// }
// ========== 模拟数据结束 ==========

// 计数器与里程状态

// let intervalId

// let currentMileageInDecimeters = 0
// let tagCounter = 1
// let sleeperDisplayCounter = 1; // 用于显示的、会重置的序号
let sleeperUniqueCounter = 1 // 用于内部的、永不重置的唯一ID

/**
 * 更新所有图表数据，并维持滑动窗口
 * @param {object} newData - 当前时刻的曲线图数据
 * @param {object|null} newTag - 当前时刻可能生成的新标签
 * @param {object|null} newSleeper - 当前时刻可能生成的新轨枕
 */
function updateChartData(newData, newTag, newSleeper) {
  const maxDataPoints = 100

  // 1. 推入新数据
  xAxisData.value.push(newData.mileage)
  for (const param of parameterList.value) {
    // 在父组件中，应使用原始的 parameterList 值作为 key
    const hasValue = Object.prototype.hasOwnProperty.call(newData, param)
    chartData.value[param].push(hasValue ? newData[param] : null)
  }
  if (newTag) {
    tagPositions.value.push(newTag)
  }
  if (newSleeper) {
    sleeperPositions.value.push(newSleeper)
  }

  // 2. 维持窗口大小，当数据超出最大点数时，从左侧移出旧数据
  if (xAxisData.value.length > maxDataPoints) {
    xAxisData.value.shift()
    for (const param of parameterList.value) {
      chartData.value[param].shift()
    }

    const visibleStartMileage = xAxisData.value[0]

    // --- START: FIX #1 ---
    // **【修复1】** 使用 while 循环替代 if，确保清理所有滑出范围的标记点
    while (tagPositions.value.length > 0 && tagPositions.value[0].mileage < visibleStartMileage) {
      tagPositions.value.shift()
    }
    while (sleeperPositions.value.length > 0 && sleeperPositions.value[0].mileage < visibleStartMileage) {
      sleeperPositions.value.shift()
    }
    // --- END: FIX #1 ---
  }
}

// --- SSE 连接与数据处理 ---
const sseUrl = '/api/geometry/live'
// 2. 【实例化】创建SSE服务实例，指向您的新接口
const sse = new SSEService(sseUrl)

/**
 * 3. 【定义】处理从SSE接收到的每一条消息
 * @param {object} point - 后端推送的 TrackDataPointDto 对象
 */
// const handleSseMessage = (point) => {
//     // 将后端数据格式转换为前端需要的格式
//     const newData = {
//         mileage: point.mileage,
//         ...point.measurements, // 将 measurements 对象平铺到 newData 中
//     };
//     console.warn('Received SSE data:', newData);

//     let newTag = null;
//     if (point.tag) {
//         newTag = {
//             mileage: point.mileage,
//             id: point.tag.id,
//         };
//     }

//     let newSleeper = null;
//     if (point.sleeper) {
//         newSleeper = {
//             mileage: point.mileage,
//             displayId: point.sleeper.displayId,
//             uniqueId: `sleeper-${sleeperUniqueCounter++}`, // 前端维护唯一ID
//         };
//     }

//     // 调用已有的函数来更新图表状态，这里什么都不用改
//     updateChartData(newData, newTag, newSleeper);
// };
function getFirstNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }
  return null
}

function parseTrackGeometry(rawTrackGeometry) {
  if (!rawTrackGeometry) return {}
  if (typeof rawTrackGeometry === 'string') {
    try {
      return JSON.parse(rawTrackGeometry)
    }
    catch {
      return {}
    }
  }
  if (typeof rawTrackGeometry === 'object') {
    return rawTrackGeometry
  }
  return {}
}

function getLsfValue(point, trackGeometry) {
  const rawLsf = point?.lsf01_level ?? point?.lsf01Level
  if (Array.isArray(rawLsf)) {
    return getFirstNumber(rawLsf[0], trackGeometry.left_super)
  }
  return getFirstNumber(rawLsf, trackGeometry.left_super)
}

function buildChartDataFromPoint(point) {
  const sensorData = point?.sensor_data || point?.sensorData || {}
  const trackGeometry = parseTrackGeometry(point?.track_geometry || point?.trackGeometry)
  const wearValues = point?.wear_values || point?.wearValues || {}

  const mileage = getFirstNumber(trackGeometry.mileage, sensorData.mileage)

  return {
    mileage,
    轨距: getFirstNumber(point?.tdf01_gauge, point?.tdf01Gauge),
    左高低: getLsfValue(point, trackGeometry),
    右高低: getFirstNumber(trackGeometry.right_super),
    左轨向: getFirstNumber(trackGeometry.left_versine),
    右轨向: getFirstNumber(trackGeometry.right_versine),
    水平: getFirstNumber(sensorData.dipmeter),
  }
}

function buildTagFromPoint(point, mileage) {
  const sensorData = point?.sensor_data || point?.sensorData || {}
  const tagId = getFirstNumber(sensorData.codee40, sensorData.codee40_a, sensorData.codee41, sensorData.codee42)
  if (mileage === null || tagId === null) return null

  return {
    mileage,
    id: tagId,
  }
}

function buildSleeperFromPoint(point, mileage) {
  const sensorData = point?.sensor_data || point?.sensorData || {}
  const sleeperValue = getFirstNumber(sensorData.sleeper)
  if (mileage === null || sleeperValue === null) return null

  return {
    mileage,
    displayId: Number(sleeperValue.toFixed(3)),
    uniqueId: `sleeper-${sleeperUniqueCounter++}`,
  }
}

function handleSseMessage(point) {
  const newData = buildChartDataFromPoint(point)

  if (newData.mileage === null) {
    console.warn('Received SSE data without valid mileage, skipped:', point)
    return
  }

  const newTag = buildTagFromPoint(point, newData.mileage)
  const newSleeper = buildSleeperFromPoint(point, newData.mileage)

  // 调用已有的函数来更新图表状态
  updateChartData(newData, newTag, newSleeper)
}
const router = useRouter()
const endingJob = ref(false)
async function handleEndJob() {
  const taskStore = useTaskStore()

  endingJob.value = true
  try {
    // 1. 从Pinia获取当前任务
    const currentTask = taskStore.getCurrentTask()
    if (!currentTask) {
      throw new Error('没有找到进行中的任务')
    }
    // 调用结束作业API
    const response = await api.stopCurrentJob(currentTask)
    if (response.code !== 0) {
      throw new Error(`结束作业失败: ${response.message}`)
    }
    else {
      // 2. 清除当前任务状态
      taskStore.clearCurrentTask()
      $message.success('作业已成功结束')
      router.push('/taskmanage/task-list')
    }

    // 这里可以添加结束后的其他逻辑，如刷新数据等
  }
  catch (error) {
    $message.error(`结束作业失败: ${error.message}`)
  }
  finally {
    endingJob.value = false
  }
}

// --- 组件生命周期 ---

onMounted(() => {
  // 4. 【挂载】在组件挂载后，开始监听SSE事件并启动连接
  console.warn('Connecting to SSE endpoint: /geometry/live')

  // 监听名为 "geometry-data" 的事件 (与后端控制器中定义的事件名一致)
  sse.addEventListener('geometry-data', handleSseMessage)

  // (可选) 监听连接成功的事件，方便调试
  sse.addEventListener('connected', (event) => {
    console.warn('SSE connection successful:', event.data)
  })

  sse.start()
})

onUnmounted(() => {
  // 5. 【卸载】在组件销毁时，停止SSE服务并移除监听器，防止内存泄漏
  console.warn('Disconnecting from SSE endpoint.')
  sse.removeEventListener('geometry-data', handleSseMessage)
  sse.stop()
})

/**
 * 生成当前时刻的数据点
 */
// function generateDataPoint() {
//     const currentMileageInMeters = currentMileageInDecimeters / 10.0
//     const isTagLocation = (currentMileageInDecimeters > 0 && currentMileageInDecimeters % 100 === 0)
//     const isSleeperLocation = (currentMileageInDecimeters > 0 && currentMileageInDecimeters % 6 === 0)

//     let newTag = null
//     let newSleeper = null

//     if (isTagLocation) {
//         newTag = { mileage: currentMileageInMeters, id: tagCounter++ };
//         // 【修改2】重置的是“显示序号”计数器
//         sleeperDisplayCounter = 1;
//     }

//     if (isSleeperLocation) {
//         // 【修改3】生成新的数据结构，包含两个ID
//         newSleeper = {
//             mileage: currentMileageInMeters,
//             displayId: sleeperDisplayCounter++,
//             // uniqueId可以是一个纯数字，或加上前缀以保证更强的唯一性
//             uniqueId: `sleeper-${sleeperUniqueCounter++}`,
//         };
//     }

//     // 准备要更新的曲线图数据 (注意key的大小写要与parameterList一致)
//     const chartPointData = {
//         mileage: currentMileageInMeters,
//         轨距: 1435 + Math.round(Math.random() * 4 - 2),
//         轨距变化率: Math.random() * 0.2 - 0.1,
//         左高低: 2 + Math.random() * 2,
//         右高低: 2 + Math.random() * 2,
//         左轨向: 1 + Math.random() * 1,
//         右轨向: 1 + Math.random() * 1,
//         水平: Math.random() * 2 - 1,
//         三角坑: Math.random() * 0.5,

//     updateChartData(chartPointData, newTag, newSleeper)
//     currentMileageInDecimeters += 1
// }

// onMounted(() => {
//     // 注意定时器速度调整为100ms，以匹配0.1米的步进单位
//     intervalId = setInterval(generateDataPoint, 1000)
// })

// onUnmounted(() => {
//     clearInterval(intervalId)
// })
</script>

<style scoped>
.parameter-sider {
  position: relative;
  background: linear-gradient(to right, #fafafa 0%, #ffffff 100%);
  border-right: 1px solid #e8e8e8;
}

.sider-content {
  position: relative;
  height: 100%;
}

.parameter-item {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  align-items: stretch;
  box-sizing: border-box;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.6);
}

.parameter-item-even {
  background-color: rgba(250, 250, 250, 0.6);
}

.parameter-item:hover {
  background-color: rgba(245, 245, 245, 0.9);
  border-left-color: var(--param-color);
  transform: translateX(2px);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
}

.parameter-color-bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--param-color);
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.parameter-item:hover .parameter-color-bar {
  opacity: 1;
  width: 5px;
}

.parameter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 6px;
  gap: 4px;
}

.parameter-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.parameter-item:hover .parameter-name {
  color: var(--param-color);
  font-weight: 600;
}

.parameter-value {
  font-size: 11px;
  color: #666;
  font-weight: 400;
  text-align: center;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: rgba(0, 0, 0, 0.03);
  padding: 2px 6px;
  border-radius: 3px;
  min-width: 50px;
  transition: all 0.3s ease;
}

.parameter-item:hover .parameter-value {
  color: var(--param-color);
  background: rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

/* Styles below were not used by active elements and are kept for reference if needed */
.custom-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 0px 0px;
}

.track-info-container {
  margin-bottom: 16px;
}

.track-info-card {
  background-color: #f9f9f9;
  border-radius: 8px;
}

.track-info {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 4px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #666;
}
</style>
