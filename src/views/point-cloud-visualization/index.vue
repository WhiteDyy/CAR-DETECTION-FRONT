<template>
  <CommonPage>
    <div class="point-cloud-container">
      <!-- 控制面板 -->
      <n-card class="control-panel" :bordered="false">
        <div class="control-row">
          <n-space vertical :size="8">
            <n-space>
              <n-input
                v-model:value="folderPath"
                placeholder="请输入数据文件夹路径"
                style="width: 500px"
                @keyup.enter="loadFolder"
              />
              <n-button type="primary" @click="loadFolder" :loading="loading">
                加载文件夹
              </n-button>
              <n-button type="default" @click="refreshData" :disabled="!folderPath">
                刷新数据
              </n-button>
            </n-space>
            <n-text depth="3" style="font-size: 12px; margin-left: 0;">
              路径格式：<br/>
              • 本地路径（数据在工业笔记本）：C:\Users\admin\Desktop\laser_points<br/>
              • 网络路径（数据在边缘计算机）：\\192.168.1.100\data 或 \\计算机名\共享名
            </n-text>
          </n-space>
        </div>

        <!-- 帧控制 -->
        <div class="control-row" v-if="frameNumbers.length > 0">
          <n-space align="center">
            <span>帧控制：</span>
            <n-button type="default" @click="previousFrame" :disabled="currentFrameIndex === 0">
              ◀ 上一帧
            </n-button>
            <span class="frame-info">
              帧: {{ currentFrameNumber }}/{{ frameNumbers.length }}
            </span>
            <n-button type="default" @click="nextFrame" :disabled="currentFrameIndex >= frameNumbers.length - 1">
              下一帧 ▶
            </n-button>
            <n-slider
              v-model:value="currentFrameIndex"
              :min="0"
              :max="frameNumbers.length - 1"
              :step="1"
              :tooltip="false"
              style="width: 400px"
              @update:value="onSliderChange"
            />
          </n-space>
        </div>

        <!-- 提示信息 -->
        <div class="control-row" v-if="frameNumbers.length > 0">
          <n-text depth="3" style="font-size: 12px">
            （已启用Y坐标过滤：仅保留-200 ≤ Y ≤ 100）
          </n-text>
        </div>
      </n-card>

      <!-- 图表区域 -->
      <n-card class="chart-card" :bordered="false">
        <div class="chart-container" ref="chartContainerRef">
          <VChart
            v-if="chartOption"
            :option="chartOption"
            :autoresize="true"
            style="width: 100%; height: 100%"
          />
          <div v-else class="empty-state">
            <n-empty description="请先加载数据文件夹" />
          </div>
        </div>
      </n-card>
    </div>
  </CommonPage>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NCard, NButton, NInput, NSpace, NSlider, NText, NEmpty } from 'naive-ui'
import { ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import CommonPage from '@/components/common/CommonPage.vue'
import api from './api'

// 注册 ECharts 组件
use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ScatterChart,
  CanvasRenderer,
  DataZoomComponent,
  ToolboxComponent
])

// 数据状态
const folderPath = ref('')
const frameNumbers = ref([])
const currentFrameIndex = ref(0)
const loading = ref(false)
const frameData = ref(null)

// 图表容器引用
const chartContainerRef = ref(null)

// 传感器颜色映射
const sensorColors = {
  laser_1: '#FF0000',  // 红色
  laser_2: '#0000FF',  // 蓝色
  laser_3: '#00FF00',  // 绿色
  laser_4: '#FF00FF',  // 洋红色
  laser_5: '#00FFFF',  // 青色
  laser_6: '#FF7F0E'   // 橙色
}

// 计算当前帧号
const currentFrameNumber = computed(() => {
  if (frameNumbers.value.length === 0) return 0
  return frameNumbers.value[currentFrameIndex.value] || 0
})

// 图表配置
const chartOption = computed(() => {
  if (!frameData.value || !frameData.value.sensors || frameData.value.sensors.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#999', fontSize: 16 }
      }
    }
  }

  // 构建散点图系列
  const series = frameData.value.sensors.map(sensor => ({
    name: sensor.sensorName,
    type: 'scatter',
    data: sensor.points.map(point => [point[0], point[1]]),
    symbolSize: 8,
    itemStyle: {
      color: sensor.color
    },
    emphasis: {
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      }
    }
  }))

  return {
    title: {
      text: `点云数据可视化 - 帧 ${currentFrameNumber.value}`,
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.seriesName}<br/>坐标: (${params.value[0].toFixed(2)}, ${params.value[1].toFixed(2)})`
      }
    },
    legend: {
      data: frameData.value.sensors.map(s => s.sensorName),
      top: 30,
      right: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'X坐标',
      nameLocation: 'middle',
      nameGap: 30,
      scale: true
    },
    yAxis: {
      type: 'value',
      name: 'Y坐标',
      nameLocation: 'middle',
      nameGap: 50,
      scale: true
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 20,
        bottom: 10
      },
      {
        type: 'slider',
        show: true,
        yAxisIndex: [0],
        start: 0,
        end: 100,
        width: 20,
        right: 10
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100
      },
      {
        type: 'inside',
        yAxisIndex: [0],
        start: 0,
        end: 100
      }
    ],
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false
        },
        restore: {},
        saveAsImage: {}
      },
      right: 20,
      top: 30
    },
    series: series
  }
})

// 加载文件夹
const loadFolder = async () => {
  if (!folderPath.value.trim()) {
    $message.warning('请输入数据文件夹路径')
    return
  }

  loading.value = true
  try {
    const res = await api.loadDataFolder(folderPath.value)
    if (res.code === 0 || res.code === 200) {
      frameNumbers.value = res.data.frameNumbers || []
      currentFrameIndex.value = 0
      
      if (frameNumbers.value.length > 0) {
        $message.success(`成功加载文件夹，共 ${frameNumbers.value.length} 个帧`)
        await loadFrameData()
      } else {
        $message.warning('文件夹中没有找到有效数据，请确认文件夹中包含 laser_1.txt 到 laser_6.txt 文件')
      }
    } else {
      // 显示详细的错误信息
      const errorMsg = res.message || '加载文件夹失败'
      $message.error(errorMsg)
      console.error('加载文件夹失败:', res)
    }
  } catch (error) {
    console.error('加载文件夹失败:', error)
    let errorMsg = '加载文件夹失败'
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error.message) {
      errorMsg = error.message
    }
    $message.error(errorMsg)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  if (frameNumbers.value.length > 0) {
    loadFrameData()
  }
}

// 加载帧数据
const loadFrameData = async () => {
  if (frameNumbers.value.length === 0) return

  const frameNum = currentFrameNumber.value
  try {
    const res = await api.getFrameData(folderPath.value, frameNum)
    if (res.code === 0 || res.code === 200) {
      frameData.value = res.data
    } else {
      $message.error(res.message || '获取帧数据失败')
      frameData.value = null
    }
  } catch (error) {
    console.error('获取帧数据失败:', error)
    $message.error('获取帧数据失败: ' + (error.message || '未知错误'))
    frameData.value = null
  }
}

// 上一帧
const previousFrame = () => {
  if (currentFrameIndex.value > 0) {
    currentFrameIndex.value--
    loadFrameData()
  }
}

// 下一帧
const nextFrame = () => {
  if (currentFrameIndex.value < frameNumbers.value.length - 1) {
    currentFrameIndex.value++
    loadFrameData()
  }
}

// 滑块变化
const onSliderChange = (value) => {
  currentFrameIndex.value = value
  loadFrameData()
}

onMounted(() => {
  // 组件挂载后的初始化操作
})

onUnmounted(() => {
  // 清理工作
})
</script>

<style scoped>
.point-cloud-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.control-panel {
  flex-shrink: 0;
}

.control-row {
  margin-bottom: 12px;
}

.control-row:last-child {
  margin-bottom: 0;
}

.frame-info {
  min-width: 100px;
  text-align: center;
  font-weight: 500;
}

.chart-card {
  flex: 1;
  min-height: 0;
}

.chart-container {
  width: 100%;
  height: 600px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>

