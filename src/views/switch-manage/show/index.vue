<template>
  <div class="viewer-container">
    <TrackSwitchViewer :switch-id="switchId" :real-time-data="realTimeData" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import TrackSwitchViewer from './TrackSwitchViewer.vue'

const switchId = '5' // 固定 switchId，也可以改为 ref 以支持动态变化
const realTimeData = ref({
  S1: '轨距:1000mm/水平:0.5%',
})

let timerId = null

onMounted(() => {
  console.warn('Initial realTimeData:', realTimeData.value)

  // 可选：启用定时器以测试动态更新
  // timerId = setInterval(() => {
  //     realTimeData.value = {
  //         S1: Math.random() > 0.5 ? '左转' : '右转',
  //         S2: '停止',
  //         S3: String(Math.floor(Math.random() * 100)), // 随机数示例
  //     };
  //     console.warn('Updated realTimeData:', realTimeData.value);
  // }, 5000);
})

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId)
    console.warn('Timer cleared on component unmount')
    timerId = null
  }
})
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100vh;
  /* 占满视口高度 */
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  overflow: auto;
  /* 内容超出时显示滚动条 */
}
</style>
