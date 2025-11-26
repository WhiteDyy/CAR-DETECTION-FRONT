<template>
  <div>
    <RouteMonitor :route-data="routeData" :current-mileage="currentMileage" />
    <!-- 控制里程的示例 -->
    <n-button @click="increaseMileage">
      增加里程
    </n-button>
    <n-slider v-model:value="currentMileage" :min="0" :max="maxMileage" :step="1" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import RouteMonitor from './RouteMonitor.vue'

const routeData = ref({
  nodes: [],
  connections: [],
})
const currentMileage = ref(0)
const maxMileage = ref(0)

// 从本地加载数据
function loadFromLocal() {
  const savedData = localStorage.getItem('routeData')
  if (savedData) {
    const data = JSON.parse(savedData)
    routeData.value = {
      nodes: data.nodes,
      connections: data.connections,
    }
    // 计算最大里程
    maxMileage.value = Math.max(...data.nodes.map(node => Number(node.mileage)))
  }
}

function increaseMileage() {
  if (currentMileage.value < maxMileage.value) {
    currentMileage.value += 0.1
  }
  else {
    currentMileage.value = 0 // 重置
  }
}

onMounted(() => {
  loadFromLocal()
})
</script>
