<template>
  <AppPage show-footer>
    <n-space vertical :size="16" class="mt-12">
      <!-- 实时状态卡片 - 改为横向展示 -->
      <n-card title="实时状态" segmented>
        <n-space justify="center" algin="center" vertical :size="16">
          <n-space algin="center">
            <n-statistic label="当前时间" :value="currentTime">
              <template #prefix>
                <n-icon class="i-mdi:clock-outline text-blue-500" />
              </template>
            </n-statistic>
          </n-space>
        </n-space>
        <div>
          <template v-if="currentImage">
            <img :src="currentImage" alt="Current Image" style="max-width: 100%; height: auto;" @error="handleImageError">
          </template>
          <template v-else>
            <div class="image-placeholder">
              <p>等待图像数据...</p>
            </div>
          </template>
        </div>
      </n-card>

      <n-row :gutter="16">
        <!-- 左侧位置展示卡片 -->
        <n-col :span="6" style="width: 200px;">
          <n-card title="当前检测位置" segmented class="position-card">
            <div class="position-container">
              <div class="ruler-container">
                <img
                  src="@/assets/images/group.png" alt="Ruler" class="ruler-image"
                >
                <img
                  src="@/assets/images/polygon.png" alt="Pointer" class="pointer-image" :style="{
                    top: `${pointerPosition}%`,
                  }"
                >
                <!-- 显示当前里程信息（跟随游标） -->
                <div class="mileage-info" :style="{ top: `${pointerPosition}%` }">
                  <div class="mileage-value">
                    {{ formatMileage(currentMileage) }}
                  </div>
                </div>
              </div>
              <div class="position-labels">
                <span class="start-label">起点: {{ formatMileage(startMileage) }}</span>
                <span class="end-label">终点: {{ formatMileage(endMileage) }}</span>
              </div>
            </div>
          </n-card>
        </n-col>

        <!-- 图像卡片 -->
        <n-col :span="18">
          <n-space vertical :size="16" style="height: 100%;">
            <n-card title="实时检测图像" segmented class="image-card" ref="imageCardRef">
              <div class="image-wrapper">
                <template v-if="currentImage">
                  <img :src="currentImage" alt="Current Image" class="detection-image" @error="handleImageError">
                  <p class="image-path">当前图片: {{ currentImage }}</p>
                </template>
                <template v-else>
                  <div class="image-placeholder">
                    <p>当前暂无图像</p>
                  </div>
                </template>
              </div>
            </n-card>
            <n-card title="病害统计 (当前图像)" segmented>
              <table class="defect-table">
                <colgroup>
                  <col style="width: 120px;">
                </colgroup>
                <tbody>
                  <tr v-for="(row, index) in defectsTableData" :key="index" :style="rowStyle(index)">
                    <th v-if="index === 0" rowspan="4" style="background-color: rgb(19, 21, 27)">
                      钢轨病害
                    </th>
                    <th v-if="index === 1" rowspan="4" style="background-color: rgb(19, 21, 27)">
                      扣件病害
                    </th>
                    <th v-if="index === 2" rowspan="4" style="background-color: rgb(19, 21, 27)">
                      轨枕病害
                    </th>
                    <th v-if="index === 3" rowspan="4" style="background-color: rgb(19, 21, 27)">
                      道床病害
                    </th>

                    <td>{{ row.type1 }}: {{ row.count1 }}个</td>
                    <td v-if="row.trend1">
                      ▲
                    </td>
                    <td>{{ row.type2 }}: {{ row.count2 }}个</td>
                    <td v-if="row.trend2">
                      ▲
                    </td>
                    <td>{{ row.type3 }}: {{ row.count3 }}个</td>
                    <td v-if="row.trend3">
                      ▲
                    </td>
                  </tr>
                </tbody>
              </table>
            </n-card>
          </n-space>
        </n-col>
      </n-row>
    </n-space>
  </AppPage>
</template>

<script setup>
import SSEService from '@/utils/sse/sseService'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// --- SSE 服务初始化 ---
const sseUrl = '/api/surface_images'
const sse = new SSEService(sseUrl)

// --- 响应式数据定义 ---

// 实时图像的URL
const currentImage = ref('')
const imageQueue = ref([])
const isPlaying = ref(false)
let playTimer = null

// 实时状态数据
const currentTime = ref('连接中...')
const currentPosition = ref({ longitude: 0, latitude: 0 })
const currentSpeed = ref(0)

// 里程相关数据
const currentMileage = ref(0) // 当前里程（米）
const startMileage = ref(0) // 起始里程（米）
const endMileage = ref(1000) // 结束里程（米），默认1000米

// 病害统计数据
const defectsData = ref({
  rail: { name: '钢轨剥离掉块', count: 0 },
  fastener: { name: '扣件缺失', count: 0 },
  sleeper: { name: '轨枕剥离掉块', count: 0 },
  ballast: { name: '道床翻浆冒泥', count: 0 },
  railCrack: { name: '钢轨裂纹', count: 0 },
  jointAnomaly: { name: '轨缝异常', count: 0 },
  fastenerShift: { name: '扣件移位', count: 0 },
  fastenerLoose: { name: '扣件松脱', count: 0 },
  sleeperCrack: { name: '轨枕裂纹', count: 0 },
  ballastForeign: { name: '道床异物', count: 0 },
})

// 表格列定义
const columns = [
  { title: '钢轨病害', key: 'railCategory', align: 'center' },
  { title: '扣件病害', key: 'fastenerCategory', align: 'center' },
  { title: '轨枕病害', key: 'sleeperCategory', align: 'center' },
  { title: '道床病害', key: 'ballastCategory', align: 'center' },
]

// 表格数据
// 修改defectsTableData计算属性
const defectsTableData = computed(() => [
  {
    type1: '钢轨剥离掉块',
    count1: 2,
    trend1: true,
    type2: '扣件缺失',
    count2: 2,
    trend2: true,
    type3: '轨枕剥离掉块',
    count3: 0,
    trend3: false,
  },
  {
    type1: '钢轨裂纹',
    count1: 0,
    trend1: false,
    type2: '扣件移位',
    count2: 0,
    trend2: false,
    type3: '轨枕裂纹',
    count3: 2,
    trend3: true,
  },
  {
    type1: '轨缝异常',
    count1: 0,
    trend1: false,
    type2: '扣件松脱',
    count2: 0,
    trend2: false,
    type3: '道床翻浆冒泥',
    count3: 0,
    trend3: false,
  },
  {
    type1: '',
    count1: 0,
    trend1: false,
    type2: '',
    count2: 0,
    trend2: false,
    type3: '道床异物',
    count3: 2,
    trend3: true,
  },
])

// 表格行样式
function rowStyle(index) {
  if (index % 2 === 0) {
    return { backgroundColor: 'rgb(19, 21, 27)' }
  }
  else {
    return { backgroundColor: 'rgb(28, 52, 54)' }
  }
}

// --- SSE 连接与数据处理 ---

// SSE消息处理
function handleImageUpdate(data) {
  try {
    if (!data) return

    if (data.url) {
      // 将新图片加入队列（自动限制队列长度）
      if (imageQueue.value.length >= 3) {
        imageQueue.value.shift() // 移除最旧的图片
      }
      imageQueue.value.push(data.url)

      // 如果当前没有播放且队列有数据，开始播放
      if (!isPlaying.value && imageQueue.value.length > 0) {
        startPlayback()
      }
    }

    // 更新位置信息
    if (data.longitude !== undefined && data.latitude !== undefined) {
      currentPosition.value = {
        longitude: Number(data.longitude) || 0,
        latitude: Number(data.latitude) || 0,
      }
    }

    // 更新里程信息（优先使用mileage字段）
    if (data.mileage !== undefined && data.mileage !== null) {
      const mileage = Number(data.mileage) || 0
      currentMileage.value = mileage
      
      // 如果提供了起始和结束里程，更新它们
      if (data.startMileage !== undefined) {
        startMileage.value = Number(data.startMileage) || 0
      }
      if (data.endMileage !== undefined) {
        endMileage.value = Number(data.endMileage) || startMileage.value + 1000
      }
      
      // 自动更新结束里程（如果当前里程超过了结束里程）
      if (currentMileage.value > endMileage.value) {
        endMileage.value = currentMileage.value
      }
    }

    // 更新速度
    if (data.speed !== undefined) {
      currentSpeed.value = Number(data.speed) || 0
    }

    // 更新时间
    currentTime.value = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-')

    // 处理病害数据
    if (data.defects && typeof data.defects === 'object') {
      if (data.defects.rail !== undefined)
        defectsData.value.rail.count = Number(data.defects.rail) || 0
      if (data.defects.railCrack !== undefined)
        defectsData.value.railCrack.count = Number(data.defects.railCrack) || 0
      if (data.defects.jointAnomaly !== undefined)
        defectsData.value.jointAnomaly.count = Number(data.defects.jointAnomaly) || 0

      if (data.defects.fastener !== undefined)
        defectsData.value.fastener.count = Number(data.defects.fastener) || 0
      if (data.defects.fastenerShift !== undefined)
        defectsData.value.fastenerShift.count = Number(data.defects.fastenerShift) || 0
      if (data.defects.fastenerLoose !== undefined)
        defectsData.value.fastenerLoose.count = Number(data.defects.fastenerLoose) || 0

      if (data.defects.sleeper !== undefined)
        defectsData.value.sleeper.count = Number(data.defects.sleeper) || 0
      if (data.defects.sleeperCrack !== undefined)
        defectsData.value.sleeperCrack.count = Number(data.defects.sleeperCrack) || 0

      if (data.defects.ballast !== undefined)
        defectsData.value.ballast.count = Number(data.defects.ballast) || 0
      if (data.defects.ballastForeign !== undefined)
        defectsData.value.ballastForeign.count = Number(data.defects.ballastForeign) || 0
    }
  } catch (error) {
    console.error('处理SSE消息时出错:', error)
  }
}

// 计算游标位置（基于里程）
const pointerPosition = computed(() => {
  const totalMileage = endMileage.value - startMileage.value
  
  // 如果总里程为0或无效，返回默认位置
  if (totalMileage <= 0) {
    return 0
  }
  
  // 计算当前里程在总里程中的比例（0-100%）
  // 注意：刻度尺是从下到上，所以起点在底部（100%），终点在顶部（0%）
  // 但我们需要从下到上显示，所以用 100 - percentage
  const percentage = ((currentMileage.value - startMileage.value) / totalMileage) * 100
  
  // 确保在0-100范围内，并反转（因为刻度尺是从下到上）
  const position = Math.max(0, Math.min(100, percentage))
  
  // 从下到上：起点在底部（100%），终点在顶部（0%）
  // 所以需要反转：100 - position
  return 100 - position
})

// 开始播放
function startPlayback() {
  if (isPlaying.value)
    return

  isPlaying.value = true
  playNextFrame()
}

// 播放下一帧
function playNextFrame() {
  if (!isPlaying.value || imageQueue.value.length === 0) {
    isPlaying.value = false
    if (playTimer) {
      clearTimeout(playTimer)
      playTimer = null
    }
    return
  }

  currentImage.value = imageQueue.value.shift() // 从队列取出图片

  // 按目标帧率继续播放
  playTimer = setTimeout(() => {
    playNextFrame()
  }, 1000 / 5) // 5帧/秒
}

// 停止播放
function stopPlayback() {
  if (playTimer) {
    clearTimeout(playTimer)
    playTimer = null
  }
  isPlaying.value = false
}

function handleImageError(e) {
  // 防止无限循环的错误处理
  if (e.target.src && !e.target.src.includes('data:image')) {
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E'
  }
}

// 格式化里程显示（米转公里+米）
function formatMileage(mileage) {
  if (!mileage && mileage !== 0) return '0m'
  const km = Math.floor(mileage / 1000)
  const m = Math.floor(mileage % 1000)
  if (km > 0) {
    return `K${km}+${m}m`
  }
  return `${m}m`
}

// --- 组件生命周期 ---

onMounted(() => {
  try {
    console.warn(`Connecting to SSE endpoint: ${sseUrl}`)

    // 监听名为 "surface_img" 的事件
    sse.addEventListener('surface_img', handleImageUpdate)

    // (可选) 监听连接成功的事件，方便调试
    sse.addEventListener('connected', (event) => {
      console.warn('SSE connection for images successful:', event)
      currentTime.value = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(/\//g, '-')
    })

    // 监听错误事件
    sse.addEventListener('error', (error) => {
      console.error('SSE connection error:', error)
      currentTime.value = '连接错误'
    })

    sse.start()
  } catch (error) {
    console.error('初始化SSE连接失败:', error)
    currentTime.value = '连接失败'
  }
})

onUnmounted(() => {
  // 在组件销毁时，停止SSE服务并移除监听器，防止内存泄漏
  try {
    stopPlayback()
    console.warn('Disconnecting from SSE endpoint.')
    sse.removeEventListener('surface_img', handleImageUpdate)
    sse.removeEventListener('connected', () => {})
    sse.removeEventListener('error', () => {})
    sse.stop()
  } catch (error) {
    console.error('清理SSE连接时出错:', error)
  }
})
</script>

<style scoped>
/* 图像样式 */
.full-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
}

/* 病害统计列表项样式 */
.defect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 设置图标基础样式 */
.n-icon {
  font-size: 24px;
  margin-right: 12px;
}

.image-placeholder {
  border: 1px dashed #ccc;
  padding: 20px;
  text-align: center;
  color: #999;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.defect-table {
  width: 100%;
  border-collapse: collapse;
}

.defect-table th,
.defect-table td {
  padding: 10px;
  text-align: center;
  border: none;
}

/* 让左侧位置卡片高度与右侧图像卡片一致 */
.position-card {
  display: flex;
  flex-direction: column;
}

.image-card {
  display: flex;
  flex-direction: column;
}

.image-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.detection-image {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
}

.image-path {
  margin-top: 18px;
  font-size: 22px;
  color: #999;
  word-break: break-all;
}

.position-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.ruler-container {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.ruler-image {
  width: auto;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  transform: scale(0.88);
  transform-origin: center;
}

.pointer-image {
  position: absolute;
  left: 50%;
  width: 20px;
  height: 20px;
  transform: translateX(-50%) translateY(-50%) scale(0.9);
  transform-origin: center;
  z-index: 10;
  transition: top 0.3s ease;
}

.mileage-info {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.85);
  transform-origin: center;
  z-index: 5;
  background: rgba(19, 21, 27, 0.95);
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  margin-top: -25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: top 0.3s ease;
}

.mileage-value {
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  white-space: nowrap;
}

.position-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
  margin-top: 4px;
  flex-shrink: 0;
}

.start-label,
.end-label {
  font-size: 11px;
  color: #d0d0d0;
  text-align: center;
}
</style>
