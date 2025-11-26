<template>
  <CommonPage>
    <div class="dashboard">
      <NAlert v-if="errorMessage" type="error" :title="errorMessage" />
      <div class="charts-container">
        <NGrid cols="s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" :x-gap="2" :y-gap="2">
          <NGi>
            <NCard class="chart-card">
              <LineChart
                :data="chartData" parameter="groa" color="rgb(255, 99, 132)" :x-axis-data="xAxisSequence"
                title="点头陀螺" x-axis-name="编码器值" y-axis-name="幅度/s"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <LineChart
                :data="chartData" parameter="grob" color="rgb(54, 162, 235)" :x-axis-data="xAxisSequence"
                title="摇头陀螺" x-axis-name="编码器值" y-axis-name="幅度/s"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <LineChart
                :data="chartData" parameter="dipmeter" color="rgb(75, 192, 192)" :x-axis-data="xAxisSequence"
                title="倾角仪" x-axis-name="编码器值" y-axis-name="度"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <LineChart
                :data="chartData" parameter="ga" color="rgb(255, 159, 64)" :x-axis-data="xAxisSequence"
                title="横向加速度" x-axis-name="编码器值" y-axis-name="m/s&sup2"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <LineChart
                :data="chartData" parameter="gb" color="rgb(153, 102, 255)" :x-axis-data="xAxisSequence"
                title="横移加速度" x-axis-name="编码器值" y-axis-name="m/s&sup2"
              />
            </NCard>
          </NGi>
          <NGi>
            <NCard class="chart-card">
              <LineChart
                :data="chartData" parameter="gc" color="rgb(255, 205, 86)" :x-axis-data="xAxisSequence"
                title="沉浮加速度" x-axis-name="编码器值" y-axis-name="m/s&#178"
              />
            </NCard>
          </NGi>
        </NGrid>
      </div>

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
import { NAlert, NCard, NGi, NGrid } from 'naive-ui'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import LineChart from './LineChart.vue'

const chartData = reactive({
  groa: [],
  grob: [],
  dipmeter: [],
  ga: [],
  gb: [],
  gc: [],
  cnt: [],
})
const sequence = ref([])
const xAxisSequence = ref([])
const latestData = ref([])
const maxPoints = 100
const errorMessage = ref('')

const updateCharts = debounce(() => {
  xAxisSequence.value = Array.from({ length: chartData.groa.length }, (_, i) => i + 1)
  chartData.groa = [...chartData.groa]
  chartData.grob = [...chartData.grob]
  chartData.dipmeter = [...chartData.dipmeter]
  chartData.ga = [...chartData.ga]
  chartData.gb = [...chartData.gb]
  chartData.gc = [...chartData.gc]
  chartData.cnt = [...chartData.cnt]
  xAxisSequence.value = [...xAxisSequence.value]
  latestData.value = [...latestData.value]
}, 200)

const deviceStatusList = ref([
  { name: '编码器1', label: '速度值：', icon: '/encoder.png', type: 'status', online: false },
  { name: '编码器2', label: '速度值：', icon: '/encoder.png', type: 'status', online: true },
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

function handleMessage(data) {
  errorMessage.value = ''
  console.log('查看传感器数据:', data)
  if (!data || typeof data.sequence !== 'number') {
    return
  }
  const parsedData = {
    sequence: data.sequence,
    ga: Number(data.ga) || 0,
    gb: Number(data.gb) || 0,
    gc: Number(data.gc) || 0,
    cnt: Number(data.cnt) || 0,
    dipmeter: Number(data.dipmeter) || 0,
    groa: Number(data.groa) || 0,
    grob: Number(data.grob) || 0,
    startTime: typeof data.startTime === 'string' ? data.startTime : new Date().toISOString(),
  }
  chartData.groa.push(parsedData.groa)
  chartData.grob.push(parsedData.grob)
  chartData.dipmeter.push(parsedData.dipmeter)
  chartData.ga.push(parsedData.ga)
  chartData.gb.push(parsedData.gb)
  chartData.gc.push(parsedData.gc)
  chartData.cnt.push(parsedData.cnt)
  sequence.value.push(parsedData.sequence)
  if (chartData.groa.length > maxPoints) {
    chartData.groa.shift()
    chartData.grob.shift()
    chartData.dipmeter.shift()
    chartData.ga.shift()
    chartData.gb.shift()
    chartData.gc.shift()
    chartData.cnt.shift()
    sequence.value.shift()
  }
  latestData.value.push(parsedData)
  if (latestData.value.length > 5) {
    latestData.value = latestData.value.slice(-5)
  }
  console.warn('表格数据长度:', latestData.value.length, 'chartData length:', chartData.groa.length)
  updateCharts()
}

function resetStateOnReconnect() {
  latestData.value = []
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
  padding: 10px;
  margin: auto;
  background-color: rgb(19, 21, 27);
}

.charts-container {
  border: 1px solid #ffffff;
  /* 白色边框包裹所有折线图 */
  padding: 10px;
  border-radius: 16px;
  /* 圆角边框 */
}

.chart-card {
  height: 300px;
  background-color: rgb(19, 27, 27);
  border: none;
  /* 移除单个卡片的边框 */
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
  grid-template-columns: repeat(7, 1fr);
  /* 每行 7 个卡片 */
  gap: 16px;
  padding: 20px;
  margin-top: 20px;
  background-color: rgb(32, 44, 51);
  border-radius: 14px;
  border: 1px solid #fffefd;
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
