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
          <img :src="currentImage" alt="Current Image" style="max-width: 100%;" @error="handleImageError">

          <p>当前图片: {{ currentImage }}</p>
          <!-- <p>图片数量: {{ imageList.length }}</p> -->
        </div>
      </n-card>

      <n-row :gutter="16">
        <!-- 左侧位置展示卡片 -->
        <n-col :span="6" style="width: 200px;">
          <n-card title="当前检测位置" segmented style="height: 100%;">
            <div class="position-container" style="transform: rotate(-90deg); transform-origin: center; height: 200px;">
              <div class="ruler-container" style="position: relative; height: 100%;">
                <img
                  src="@/assets/images/group.png" alt="Ruler" class="ruler-image"
                  style="height: 100%; object-fit: contain;"
                >
                <img
                  src="@/assets/images/polygon.png" alt="Pointer" class="pointer-image" :style="{
                    top: `${pointerPosition}%`,
                    transform: 'translateY(-50%) rotate(90deg)',
                  }" style="position: absolute; left: 0; width: 24px; height: 24px;"
                >
              </div>
              <div class="position-labels" style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span style="writing-mode: vertical-rl; transform: rotate(180deg);">终点</span>
                <span style="writing-mode: vertical-rl;">起点</span>
              </div>
            </div>
          </n-card>
        </n-col>

        <!-- 图像卡片 -->
        <n-col :span="18">
          <n-space vertical :size="16" style="height: 100%;">
            <n-card title="实时检测图像" segmented>
              <div>
                <template v-if="currentImage">
                  <img :src="currentImage" alt="Current Image" style="max-width: 100%;" @error="handleImageError">
                  <p>当前图片: {{ currentImage }}</p>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'

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

    // 更新位置信息
    if (data.longitude && data.latitude) {
      currentPosition.value = {
        longitude: data.longitude,
        latitude: data.latitude,
      }
    }

    // 更新速度
    if (data.speed !== undefined) {
      currentSpeed.value = data.speed
    }

    // 更新时间和位置
    currentTime.value = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-')
  }

  // 处理病害数据
  if (data.defects) {
    if (data.defects.rail !== undefined)
      defectsData.value.rail.count = data.defects.rail
    if (data.defects.railCrack !== undefined)
      defectsData.value.railCrack.count = data.defects.railCrack
    if (data.defects.jointAnomaly !== undefined)
      defectsData.value.jointAnomaly.count = data.defects.jointAnomaly

    if (data.defects.fastener !== undefined)
      defectsData.value.fastener.count = data.defects.fastener
    if (data.defects.fastenerShift !== undefined)
      defectsData.value.fastenerShift.count = data.defects.fastenerShift
    if (data.defects.fastenerLoose !== undefined)
      defectsData.value.fastenerLoose.count = data.defects.fastenerLoose

    if (data.defects.sleeper !== undefined)
      defectsData.value.sleeper.count = data.defects.sleeper
    if (data.defects.sleeperCrack !== undefined)
      defectsData.value.sleeperCrack.count = data.defects.sleeperCrack

    if (data.defects.ballast !== undefined)
      defectsData.value.ballast.count = data.defects.ballast
    if (data.defects.ballastForeign !== undefined)
      defectsData.value.ballastForeign.count = data.defects.ballastForeign
  }
}

// 计算游标位置
const pointerPosition = computed(() => {
  if (currentPosition.value.longitude && currentPosition.value.latitude) {
    // 假设经度范围是-180到180，将其映射到0-100%的范围
    const position = ((currentPosition.value.longitude + 180) / 360) * 100
    return Math.max(0, Math.min(100, position))
  }
  return 50 // 默认位置
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
  if (imageQueue.value.length === 0) {
    isPlaying.value = false
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
  clearTimeout(playTimer)
  isPlaying.value = false
}

function handleImageError(e) {
  e.target.src = '/error-placeholder.jpg' // 设置默认错误图片
}

// --- 组件生命周期 ---

onMounted(() => {
  console.warn(`Connecting to SSE endpoint: /api/surface_images`)

  // 监听名为 "surface_img" 的事件
  sse.addEventListener('surface_img', handleImageUpdate)

  // (可选) 监听连接成功的事件，方便调试
  sse.addEventListener('connected', (event) => {
    console.warn('SSE connection for images successful:', event)
  })

  sse.start()
})

onUnmounted(() => {
  // 5. 【卸载】在组件销毁时，停止SSE服务并移除监听器，防止内存泄漏
  stopPlayback()
  console.warn('Disconnecting from SSE endpoint.')
  sse.removeEventListener('surface_img', handleImageUpdate)
  sse.stop()
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

.position-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.ruler-container {
  position: relative;
  height: calc(100% - 60px);
  margin: 20px 0;
}

.ruler-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pointer-image {
  position: absolute;
  top: 0;
  width: 24px;
  height: 24px;
  transform: translateX(-50%) translateY(-50%);
  z-index: 2;
}

.position-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 10px 0;
  margin-top: 8px;
}

.start-label,
.end-label {
  font-size: 14px;
  color: #666;
  text-align: center;
}
</style>
