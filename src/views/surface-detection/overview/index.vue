<!-- <template>
  <AppPage show-footer>
    <n-space vertical :size="16" class="mt-12">
      <n-card title="实时病害图像" segmented>
        <n-image :src="imageSrc" alt="实时病害图像" preview class="full-image" />
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
import { ref } from 'vue'

// 图片路径（请确保路径正确）
// const imageSrc = new URL('@/assets/images/test.jpg', import.meta.url).href
// http://localhost:8089/images/
const imageSrc = "/api/images/20250627_092449488_65ac5cdc.jpg"
// --- 响应式数据定义 ---

// 实时状态数据
const currentTime = ref('2025-06-27 10:30:00')
const currentPosition = ref('116.3975°E, 39.9087°N') // 经纬度格式
const currentSpeed = ref(80)

// 病害统计数据 (针对当前显示的图像)
const defectsData = ref([
  { id: 1, category: '钢轨病害', count: 2, icon: 'i-mdi:railroad-light', color: '#D9534F' },
  { id: 2, category: '扣件病害', count: 5, icon: 'i-mdi:screw-lag', color: '#F0AD4E' },
  { id: 3, category: '轨枕病害', count: 1, icon: 'i-mdi:view-grid-outline', color: '#5BC0DE' },
  { id: 4, category: '道床病害', count: 0, icon: 'i-mdi:dots-grid', color: '#5CB85C' },
])

// --- 模拟数据更新 ---
// 在实际应用中，您会通过 WebSocket 或 API 来更新这些数据
setInterval(() => {
  // 更新时间
  currentTime.value = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

  // 模拟速度和位置变化
  currentSpeed.value = Math.floor(Math.random() * 10) + 75 // 75-84 km/h

  // 模拟检测到新的病害数据 (通常伴随图片更新)
  defectsData.value[0].count = Math.floor(Math.random() * 4) // 钢轨: 0-3
  defectsData.value[1].count = Math.floor(Math.random() * 8) // 扣件: 0-7
  defectsData.value[2].count = Math.floor(Math.random() * 3) // 轨枕: 0-2
  defectsData.value[3].count = Math.floor(Math.random() * 2) // 道床: 0-1
}, 5000) // 每5秒更新一次示例数据

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
</style>

<n-image :src="imageSrc" alt="实时病害图像" :preview-disabled="!imageSrc" class="full-image" />
-->

<template>
  <AppPage show-footer>
    <n-space vertical :size="16" class="mt-12">
      <n-card title="实时病害图像" segmented>

        <div>
          <img :src="imageSrc" alt="Current Image" style="max-width: 100%;" @error="handleImageError" />
          <div>
            <button @click="prevImage">上一张</button>
            <button @click="nextImage">下一张</button>
            <button @click="stopPlayback">暂停</button>
            <button @click="startPlayback">播放</button>
          </div>
          <p>当前图片: {{ imageSrc }}</p>
          <p>图片数量: {{ imageList.length }}</p>
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


// 响应式变量
const imageSrc = ref(''); // 当前显示的图片 URL
const imageList = ref([]); // 图片 URL 列表
const currentIndex = ref(-1); // 当前播放索引
const isLooping = ref(false); // 是否循环播放
let playbackInterval = null; // 定时器引用

// 配置
const PLAYBACK_INTERVAL = 100; // 播放间隔（100ms）
const MAX_IMAGE_LIST_SIZE = 100; // 最大图片数量（调整为更合理的值）

// 处理 SSE 图像更新
const handleImageUpdate = (data) => {
  console.log('Received SSE image update:', data);

  // 验证数据是否包含 URL 列表
  if (!data.urls || !Array.isArray(data.urls) || data.urls.length === 0) {
    console.warn('Invalid or empty URL list in SSE data:', data);
    return;
  }

  // 添加 URL 列表到 imageList 并预加载
  data.urls.forEach(url => {
    preloadImage(url);
    imageList.value.push(url);
  });

  // 限制列表大小
  if (imageList.value.length > MAX_IMAGE_LIST_SIZE) {
    imageList.value.splice(0, imageList.value.length - MAX_IMAGE_LIST_SIZE);
    if (currentIndex.value > imageList.value.length - 1) {
      currentIndex.value = imageList.value.length - 1;
    }
  }

  // 如果是首次接收，立即显示第一张并启动播放
  if (imageList.value.length > 0 && currentIndex.value === -1) {
    currentIndex.value = 0;
    imageSrc.value = imageList.value[0];
    startPlayback();
  }
};

// 启动播放
const startPlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval);
  }

  playbackInterval = setInterval(() => {
    if (imageList.value.length === 0) {
      clearInterval(playbackInterval);
      playbackInterval = null;
      imageSrc.value = '';
      console.log('No images to play');
      return;
    }

    // 移动到下一张图片
    currentIndex.value++;

    // 检查是否播放完成
    if (currentIndex.value >= imageList.value.length) {
      if (isLooping.value) {
        // 循环播放
        currentIndex.value = 0;
      } else {
        // 停止播放
        clearInterval(playbackInterval);
        playbackInterval = null;
        currentIndex.value = imageList.value.length - 1; // 保持最后一张
        console.log('Playback completed');
        return;
      }
    }

    imageSrc.value = imageList.value[currentIndex.value];
    console.log('Playing image:', imageSrc.value);
  }, PLAYBACK_INTERVAL);
};

// 停止播放
const stopPlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
    console.log('Playback stopped');
  }
};

// 切换循环模式
const toggleLooping = () => {
  isLooping.value = !isLooping.value;
  console.log('Looping:', isLooping.value);
};

// 手动切换到下一张图片
const nextImage = () => {
  if (imageList.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % imageList.value.length;
  imageSrc.value = imageList.value[currentIndex.value];
};

// 手动切换到上一张图片
const prevImage = () => {
  if (imageList.value.length === 0) return;
  currentIndex.value = (currentIndex.value - 1 + imageList.value.length) % imageList.value.length;
  imageSrc.value = imageList.value[currentIndex.value];
};

// 预加载图片
const preloadImage = (url) => {
  const img = new Image();
  img.src = url;
};


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
</style>