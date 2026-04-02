<template>
  <CommonPage>
    <div class="dashboard">
      <NAlert v-if="errorMessage" type="error" :title="errorMessage" />
      <div class="charts-container">
        <NGrid cols="s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" :x-gap="4" :y-gap="4">
          <NGi>
            <NCard class="chart-card">
              <div class="chart-actions">
                <n-button size="tiny" secondary @click="openEnlarge('groa')">
                  放大
                </n-button>
              </div>
              <LineChart
                :data="chartData" parameter="groa" color="rgb(255, 99, 132)" :x-axis-data="xAxisSequence"
                title="陀螺A" x-axis-name="里程" y-axis-name="角速度(°/s)" :y-axis-digits="4"
                :max-display-points="600"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <div class="chart-actions">
                <n-button size="tiny" secondary @click="openEnlarge('grob')">
                  放大
                </n-button>
              </div>
              <LineChart
                :data="chartData" parameter="grob" color="rgb(54, 162, 235)" :x-axis-data="xAxisSequence"
                title="陀螺B" x-axis-name="里程" y-axis-name="角速度(°/s)" :y-axis-digits="4"
                :max-display-points="600"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <div class="chart-actions">
                <n-button size="tiny" secondary @click="openEnlarge('dipmeter')">
                  放大
                </n-button>
              </div>
              <LineChart
                :data="chartData" parameter="dipmeter" color="rgb(75, 192, 192)" :x-axis-data="xAxisSequence"
                title="倾角仪" x-axis-name="里程" y-axis-name="角度/°"
                :max-display-points="600"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <div class="chart-actions">
                <n-button size="tiny" secondary @click="openEnlarge('encoder')">
                  放大
                </n-button>
              </div>
              <LineChart
                :data="chartData"
                :x-axis-data="xAxisSequence"
                :series-configs="encoderSeries"
                title="编码器" x-axis-name="时间" y-axis-name="脉冲数/次"
                :max-display-points="600"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <div class="chart-actions">
                <n-button size="tiny" secondary @click="openEnlarge('ultrasonic')">
                  放大
                </n-button>
              </div>
              <LineChart
                :data="chartData"
                :x-axis-data="mileageAxis"
                :series-configs="ultrasonicSeries"
                title="超声" x-axis-name="里程" y-axis-name="电压/V"
                :max-display-points="600"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <div class="chart-actions">
                <n-button size="tiny" secondary @click="openEnlarge('laser')">
                  放大
                </n-button>
              </div>
              <LineChart
                :data="chartData"
                :x-axis-data="mileageAxis"
                :series-configs="laserSeries"
                title="点激光" x-axis-name="里程" y-axis-name="电压/V"
                :max-display-points="600"
              />
            </NCard>
          </NGi>
        </NGrid>
      </div>

      <n-modal v-model:show="enlargeVisible" preset="card" :style="{ width: '92vw', maxWidth: '1200px' }">
        <template #header>
          {{ enlargeTitle }}
        </template>
        <div class="enlarge-chart">
          <LineChart
            v-bind="enlargeChartProps"
            :data="chartData"
            :x-axis-data="enlargeXAxisData"
            :show-data-zoom="true"
            :max-display-points="5000"
          />
        </div>
      </n-modal>

      <div class="device-status-grid">
        <div v-for="(device, index) in deviceStatusList" :key="index" class="device-card">
          <div class="device-header">
            <div class="device-info">
              <div class="device-title">
                {{ device.name }}
              </div>
              <div class="device-sub">
                <span class="mt-[15px]">{{ device.label }}</span>
                <!-- 状态切换时更新 label -->
                <n-switch
                  v-if="device.type != 'status'" v-model:value="device.online" :style="{
                    backgroundColor: device.online ? 'rgb(206, 23, 47)' : 'rgb(0, 0, 0)',
                    borderRadius: '16px',
                    transition: 'background-color 0.3s',
                  }" class="device-switch" @update:value="updateLabel(device)"
                />
              </div>
            </div>
            <img :src="device.icon" class="device-icon">
          </div>
        </div>
      </div>
      <!-- <div class="table-container">
        <h2>最新数据 (最近 5 包)</h2>
        <table>
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Gyro 1</th>
              <th>Gyro 2</th>
              <th>Dipmeter</th>
              <th>Accel X</th>
              <th>Accel Y</th>
              <th>Accel Z</th>
              <th>Encoder</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in latestData" :key="item.sequence + '-' + index">
              <td>{{ item.sequence }}</td>
              <td>{{ item.groa?.toFixed(2) }}</td>
              <td>{{ item.grob?.toFixed(2) }}</td>
              <td>{{ item.dipmeter?.toFixed(2) }}</td>
              <td>{{ item.ga?.toFixed(2) }}</td>
              <td>{{ item.gb?.toFixed(2) }}</td>
              <td>{{ item.gc?.toFixed(2) }}</td>
              <td>{{ item.cnt }}</td>
              <td>{{ item.startTime }}</td>
            </tr>
          </tbody>
        </table>
      </div> -->
    </div>
  </CommonPage>
</template>

<script setup>
import CommonPage from '@/components/common/CommonPage.vue'
import SSEService from '@/utils/sse/sseService'
import { debounce } from 'lodash'
import { NAlert, NButton, NCard, NGi, NGrid, NModal } from 'naive-ui'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import LineChart from './LineChart.vue'

const chartData = reactive({
  groa: [],
  grob: [],
  dipmeter: [],
  // 编码器
  encoderLeft: [],
  encoderRight: [],
  encoderAlign: [],
  // 超声
  ultrasonicLeft: [],
  ultrasonicRight: [],
  // 点激光
  laserLeft: [],
  laserRight: [],
  // 辅助字段
  cnt: [],
  mileage: [],
})
const sequence = ref([])
const xAxisSequence = ref([])
const mileageAxis = ref([])
const latestData = ref([])
const errorMessage = ref('')

// 优化：只在数据长度变化时更新xAxisSequence，避免不必要的数组复制
const updateCharts = debounce(() => {
  const currentLength = chartData.groa.length
  if (xAxisSequence.value.length !== currentLength) {
    xAxisSequence.value = Array.from({ length: currentLength }, (_, i) => i + 1)
  }
  // 触发响应式更新，但避免不必要的数组复制
  // 由于chartData是reactive对象，直接修改数组元素会自动触发更新
}, 200)

const deviceStatusList = ref([
  
  { name: '激光传感器1', label: '离线状态', icon: '/laser.png', online: false },
  { name: '激光传感器2', label: '离线状态', icon: '/laser.png', online: false },
  { name: '激光传感器3', label: '离线状态', icon: '/laser.png', online: false },
  { name: '激光传感器4', label: '离线状态', icon: '/laser.png', online: false },
  { name: '激光传感器5', label: '离线状态', icon: '/laser.png', online: false },
  { name: '激光传感器6', label: '离线状态', icon: '/laser.png', online: false },
  { name: '电子标签读卡器', label: '在线状态', icon: '/rfid.png', online: true },
  { name: '轨枕计数传感器1', label: '在线状态', icon: '/track.png', online: true },
  { name: '轨枕计数传感器2', label: '在线状态', icon: '/track.png', online: true },
  { name: '线阵相机1', label: '在线状态', icon: '/camera.png', online: true },
  { name: '线阵相机2', label: '在线状态', icon: '/camera.png', online: true },
  { name: '线阵相机3', label: '在线状态', icon: '/camera.png', online: true },
  { name: '线阵相机4', label: '在线状态', icon: '/camera.png', online: true },
  { name: '线阵相机5', label: '在线状态', icon: '/camera.png', online: true },
  { name: '相机光源1', label: '离线状态', icon: '/light.png', online: false },
  { name: '相机光源2', label: '离线状态', icon: '/light.png', online: false },
  { name: '相机光源3', label: '离线状态', icon: '/light.png', online: false },
  { name: '相机光源4', label: '离线状态', icon: '/light.png', online: false },
  { name: '相机光源5', label: '离线状态', icon: '/light.png', online: false },
  // 可继续补充更多
])
function updateLabel(device) {
  // 根据在线状态更新 label
  device.label = device.online ? '在线状态' : '离线状态'
}
const sseUrl = '/api/sensor'
const sse = new SSEService(sseUrl)

function appendPoint(parsedData) {
  // 添加数据
  chartData.groa.push(parsedData.groa)
  chartData.grob.push(parsedData.grob)
  chartData.dipmeter.push(parsedData.dipmeter)
  chartData.encoderLeft.push(parsedData.encoderLeft)
  chartData.encoderRight.push(parsedData.encoderRight)
  chartData.encoderAlign.push(parsedData.encoderAlign)
  chartData.ultrasonicLeft.push(parsedData.ultrasonicLeft)
  chartData.ultrasonicRight.push(parsedData.ultrasonicRight)
  chartData.laserLeft.push(parsedData.laserLeft)
  chartData.laserRight.push(parsedData.laserRight)
  chartData.cnt.push(parsedData.cnt)
  chartData.mileage.push(parsedData.mileage)
  sequence.value.push(parsedData.sequence)

  // 更新最新数据（保留最近5条）
  latestData.value.push(parsedData)
  if (latestData.value.length > 5) {
    latestData.value.shift()
  }
}

function parsePoint(data) {
  if (!data || typeof data.sequence !== 'number') {
    return null
  }
  return {
    sequence: Number(data.sequence) || 0,
    // 编码器（当前协议：右=codee40，左=codee42，对齐=codee41）
    encoderRight: Number(data.codee40) || 0,
    encoderLeft: Number(data.codee42) || 0,
    encoderAlign: Number(data.codee41) || 0,
    // 超声：gaccel_2 -> 右, gaccel_3 -> 左
    ultrasonicRight: Number(data.gaccel_2) || 0,
    ultrasonicLeft: Number(data.gaccel_3) || 0,
    // 点激光：gaccel_0 -> 右, gaccel_1 -> 左
    laserRight: Number(data.gaccel_0) || 0,
    laserLeft: Number(data.gaccel_1) || 0,
    cnt: Number(data.codee40 ?? data.cnt) || 0,
    dipmeter: Number(data.dipmeter) || 0,
    // 新协议 groa/grob 已是 float，直接展示
    groa: Number(data.groa) || 0,
    grob: Number(data.grob) || 0,
    mileage: Number(data.length ?? data.mileage) || 0,
    startTime: typeof data.time === 'string' ? data.time : new Date().toISOString(),
  }
}

function handleMessage(data) {
  try {
    errorMessage.value = ''
    // 后端可能按批次发送（数组）或单条发送（对象），两种都兼容
    const points = Array.isArray(data) ? data : [data]
    for (const point of points) {
      const parsed = parsePoint(point)
      if (parsed) {
        appendPoint(parsed)
      }
    }
    
    // 更新X轴序列（时间序号）
    updateCharts()

    // 更新里程X轴（直接使用里程值）
    const currentLength = chartData.mileage.length
    if (mileageAxis.value.length !== currentLength) {
      mileageAxis.value = chartData.mileage.slice()
    }
  } catch (error) {
    console.error('处理传感器数据时出错:', error)
    errorMessage.value = '数据处理错误，请检查数据格式'
  }
}

function resetStateOnReconnect() {
  // 重连时清空最新数据，但保留图表数据以便连续显示
  latestData.value = []
  errorMessage.value = ''
}

const encoderSeries = [
  { key: 'encoderLeft', name: '编码器左', color: 'rgb(255, 159, 64)' },
  { key: 'encoderRight', name: '编码器右', color: 'rgb(255, 205, 86)' },
]

const ultrasonicSeries = [
  { key: 'ultrasonicLeft', name: '超声左', color: 'rgb(153, 102, 255)' },
  { key: 'ultrasonicRight', name: '超声右', color: 'rgb(99, 132, 255)' },
]

const laserSeries = [
  { key: 'laserLeft', name: '点激光左', color: 'rgb(75, 192, 192)' },
  { key: 'laserRight', name: '点激光右', color: 'rgb(255, 99, 132)' },
]

const enlargeVisible = ref(false)
const enlargeKey = ref('')

const enlargeTitle = computed(() => {
  const map = {
    groa: '陀螺A（放大）',
    grob: '陀螺B（放大）',
    dipmeter: '倾角仪（放大）',
    encoder: '编码器（放大）',
    ultrasonic: '超声（放大）',
    laser: '点激光（放大）',
  }
  return map[enlargeKey.value] || '折线图（放大）'
})

const enlargeXAxisData = computed(() => {
  if (enlargeKey.value === 'ultrasonic' || enlargeKey.value === 'laser') return mileageAxis.value
  return xAxisSequence.value
})

const enlargeChartProps = computed(() => {
  switch (enlargeKey.value) {
    case 'groa':
      return { parameter: 'groa', color: 'rgb(255, 99, 132)', title: '陀螺A', xAxisName: '里程', yAxisName: '角速度(/s²)', yAxisDigits: 4 }
    case 'grob':
      return { parameter: 'grob', color: 'rgb(54, 162, 235)', title: '陀螺B', xAxisName: '里程', yAxisName: '角速度(/s²)', yAxisDigits: 4 }
    case 'dipmeter':
      return { parameter: 'dipmeter', color: 'rgb(75, 192, 192)', title: '倾角仪', xAxisName: '里程', yAxisName: '角度/°' }
    case 'encoder':
      return { seriesConfigs: encoderSeries, title: '编码器', xAxisName: '时间', yAxisName: '脉冲数/次' }
    case 'ultrasonic':
      return { seriesConfigs: ultrasonicSeries, title: '超声', xAxisName: '里程', yAxisName: '电压/V' }
    case 'laser':
      return { seriesConfigs: laserSeries, title: '点激光', xAxisName: '里程', yAxisName: '电压/V' }
    default:
      return { parameter: 'groa', color: 'rgb(255, 99, 132)', title: '陀螺A', xAxisName: '里程', yAxisName: '角速度(/s²)', yAxisDigits: 4 }
  }
})

function openEnlarge(key) {
  enlargeKey.value = key
  enlargeVisible.value = true
}

onMounted(() => {
  console.warn('Mounting, adding SSE listener')
  sse.addEventListener('sensor-data', handleMessage)
  sse.addEventListener('reconnect', resetStateOnReconnect)
  sse.start()
})

onUnmounted(() => {
  console.warn('Unmounting, removing SSE listener')
  sse.removeEventListener('sensor-data', handleMessage)
  sse.removeEventListener('reconnect', resetStateOnReconnect)
  sse.stop()
})
</script>

<style scoped>
.dashboard {
  padding: 6px 10px;
  margin: auto;
  background-color: rgb(19, 21, 27);
}

.charts-container {
  border: 1px solid #ffffff;
  /* 白色边框包裹所有折线图 */
  padding: 6px 8px;
  border-radius: 12px;
  /* 圆角边框 */
}

.chart-card {
  height: 340px;
  min-height: 340px;
  background-color: rgb(19, 27, 27);
  border: none;
  /* 移除单个卡片的边框 */
  overflow: hidden;
  position: relative;
}

.chart-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.enlarge-chart {
  height: 70vh;
}

.table-container {
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background: #4caf50;
  color: white;
}

tr:nth-child(even) {
  background: #f2f2f2;
}

.device-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  /* 响应式布局，最小宽度160px */
  gap: 16px;
  padding: 20px;
  margin-top: 20px;
  background-color: rgb(32, 44, 51);
  border-radius: 14px;
  border: 1px solid #fffefd;
}

@media (max-width: 768px) {
  .device-status-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

.device-card {
  background: rgb(47, 99, 98);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.993);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-title {
  font-weight: bold;
  font-size: 15px;
}

.device-sub {
  font-size: 13px;
  color: #d0d0d0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-switch {
  margin-left: 60px;
  /* 确保开关和label之间的距离 */
  border-radius: 16px;
  /* 圆角 */
  margin-top: 15px;
}

.device-icon {
  width: 28px;
  height: 28px;
  margin-top: -40px;
}
</style>
