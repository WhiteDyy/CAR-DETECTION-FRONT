<template>
  <n-layout has-sider>
    <n-layout-sider content-style="padding: 5px;" width="100px">
      <div class="sider-content">
        <n-button
          v-for="parameter in parameterList" :key="parameter" :bordered="false"
          style="width: 80px; height: 40px;" @click="openDialog(parameter)"
        >
          {{ parameter }}
        </n-button>
      </div>
    </n-layout-sider>
    <n-layout>
      <n-layout-content content-style="padding: 5px;">
        <TrendChart
          :data="chartData" :parameters="parameterList" :color-map="colorMap"
          :x-axis-data="xAxisData"
        />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import TrendChart from './TrendChart.vue' // 调整为你的TrendChart组件实际路径

// 定义props接收外部传入的数据
defineProps({
  parameterList: {
    type: Array,
    default: () => [],
  },
  chartData: {
    type: Array,
    default: () => [],
  },
  colorMap: {
    type: Object,
    default: () => ({}),
  },
  xAxisData: {
    type: Array,
    default: () => [],
  },
})

// 定义emit事件
const emit = defineEmits(['open-dialog'])

// 点击按钮触发事件
function openDialog(parameter) {
  emit('open-dialog', parameter)
}
</script>
