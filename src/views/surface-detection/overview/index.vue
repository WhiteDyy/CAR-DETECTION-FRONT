<template>
  <AppPage show-footer>
    <n-space vertical :size="16" class="mt-12">
      <n-card title="实时病害图像" segmented>
        <div>
          <template v-if="currentImage">
            <img :src="currentImage" alt="Current Image" style="max-width: 100%;" @error="handleImageError" />
            <p>当前图片: {{ currentImage }}</p>
          </template>
          <template v-else>
            <div class="image-placeholder">
              <p>当前暂无图像</p>
            </div>
          </template>
        </div>
      </n-card>

      <n-grid x-gap="16" y-gap="16" cols="1 s:1 m:2 l:2" responsive="screen">
        <n-grid-item>
          <n-card title="实时状态" segmented>
            <n-space vertical :size="24">
              <n-statistic label="当前时间" :value="currentTime">
                <template #prefix>
                  <n-icon class="i-mdi:clock-outline text-blue-500" />
                </template>
              </n-statistic>
              <n-statistic label="当前位置 (经纬度)" :value="currentPosition">
                <template #prefix>
                  <n-icon class="i-mdi:map-marker-outline text-blue-500" />
                </template>
              </n-statistic>
              <n-statistic label="当前速度">
                <template #prefix>
                  <n-icon class="i-mdi:speedometer text-blue-500" />
                </template>
                <template #default>
                  {{ currentSpeed }}
                </template>
                <template #suffix>
                  公里/小时
                </template>
              </n-statistic>
            </n-space>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card title="病害统计 (当前图像)" segmented>
            <n-list hoverable clickable>
              <n-list-item v-for="defect in defectsData" :key="defect.id">
                <template #prefix>
                  <n-icon :class="defect.icon" :style="{ color: defect.color }" />
                </template>
                <div class="defect-item">
                  <span>{{ defect.category }}</span>
                  <n-tag :type="defect.count > 0 ? 'error' : 'success'" round>
                    {{ defect.count }} 个
                  </n-tag>
                </div>
              </n-list-item>
            </n-list>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>
  </AppPage>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SSEService from '@/utils/sse/sseService' // 1. 【引入】SSE服务工具

// --- 响应式数据定义 ---

// 实时图像的URL
// const imageSrc = ref('') 
// const imageSrc = "/api/images/20250630_121811390_be9103d9.jpg"

// 实时状态数据
const currentTime = ref('连接中...')
const currentPosition = ref('N/A')
const currentSpeed = ref(0)

// 病害统计数据 (针对当前显示的图像)
const defectsData = ref([
  { id: 1, category: '钢轨病害', count: 0, icon: 'i-mdi:railroad-light', color: '#D9534F' },
  { id: 2, category: '扣件病害', count: 0, icon: 'i-mdi:screw-lag', color: '#F0AD4E' },
  { id: 3, category: '轨枕病害', count: 0, icon: 'i-mdi:view-grid-outline', color: '#5BC0DE' },
  { id: 4, category: '道床病害', count: 0, icon: 'i-mdi:dots-grid', color: '#5CB85C' },
])


// --- SSE 连接与数据处理 ---

// 2. 【实例化】创建SSE服务实例，指向病害图像接口
const sseUrl = '/api/surface_images'
const sse = new SSEService(sseUrl)

/**
 * 3. 【定义】处理从SSE接收到的每一条图像更新消息
 * @param {object} data - 后端推送的包含图像和状态信息的对象
 */
// const handleImageUpdate = (data) => {
// 假设后端推送的数据是一个JSON对象，SSEService会自动解析
// 示例数据结构:
// {
//   "imageName": "20250627_092449488_65ac5cdc.jpg",
//   "timestamp": "2025-06-27T10:30:00Z",
//   "longitude": 116.3975,
//   "latitude": 39.9087,
//   "speed": 80,
//   "defects": { "rail": 2, "fastener": 5, "sleeper": 1, "ballast": 0 }
// }
// console.log('Received SSE image update:', data)

// let data = JSON.parse(odata) // 确保数据是JSON格式

// 更新图片路径 (假设后端直接提供图片名称)
// 注意：这里的URL路径需要与您的代理或服务器配置匹配
// imageSrc.value = data.url

// 更新实时状态
// currentTime.value = new Date(data.timestamp).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
// currentPosition.value = `${data.longitude.toFixed(4)}°E, ${data.latitude.toFixed(4)}°N`
// currentSpeed.value = data.speed

// // 更新病害统计
// if (data.defects) {
//   defectsData.value[0].count = data.defects.rail || 0
//   defectsData.value[1].count = data.defects.fastener || 0
//   defectsData.value[2].count = data.defects.sleeper || 0
//   defectsData.value[3].count = data.defects.ballast || 0
// }
// }

// --- 组件生命周期 ---
// 只需要维护当前图片URL
// const imageSrc = ref('')
// const lastUpdated = ref('')
// const isPlaying = ref(false)

// // 处理SSE消息 - 简化为直接更新当前图片
// const handleImageUpdate = (data) => {
//   if (data.url) {
//     imageSrc.value = data.url
//     lastUpdated.value = new Date().toLocaleTimeString()
//     console.log('Updated image:', data.url)
//   }
// }


// 配置
const TARGET_FPS = 5 // 目标帧率（5帧/秒）
const BUFFER_SIZE = 3 // 缓冲队列长度

// 状态
const imageQueue = ref([]) // 图片缓冲队列
const currentImage = ref('')
const isPlaying = ref(false)
let frameInterval = 1000 / TARGET_FPS
let playTimer = null

// SSE消息处理
const handleImageUpdate = (data) => {
  if (data.url) {
    // 将新图片加入队列（自动限制队列长度）
    if (imageQueue.value.length >= BUFFER_SIZE) {
      imageQueue.value.shift() // 移除最旧的图片
    }
    imageQueue.value.push(data.url)

    // 如果当前没有播放且队列有数据，开始播放
    if (!isPlaying.value && imageQueue.value.length > 0) {
      startPlayback()
    }
  }
}

// 开始播放
const startPlayback = () => {
  if (isPlaying.value) return

  isPlaying.value = true
  playNextFrame()
}

// 播放下一帧
const playNextFrame = () => {
  if (imageQueue.value.length === 0) {
    isPlaying.value = false
    return
  }

  currentImage.value = imageQueue.value.shift() // 从队列取出图片

  // 按目标帧率继续播放
  playTimer = setTimeout(() => {
    playNextFrame()
  }, frameInterval)
}

// 停止播放
const stopPlayback = () => {
  clearTimeout(playTimer)
  isPlaying.value = false
}




onMounted(() => {
  // 4. 【挂载】在组件挂载后，开始监听SSE事件并启动连接
  console.warn(`Connecting to SSE endpoint: ${sseUrl}`)

  // // 监听名为 "image-url" 的事件 (与后端 SseEmitter.event().name("image-url") 一致)
  sse.addEventListener('surface_img', handleImageUpdate)

  // // (可选) 监听连接成功的事件，方便调试
  sse.addEventListener('connected', (event) => {
    console.warn('SSE connection for images successful:', event)
  })

  sse.start()
})

onUnmounted(() => {
  // 5. 【卸载】在组件销毁时，停止SSE服务并移除监听器，防止内存泄漏
  stopPlayback()
  console.warn('Disconnecting from SSE endpoint.')
  sse.removeEventListener('image-url', handleImageUpdate)
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
</style>