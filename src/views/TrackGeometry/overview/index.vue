<template>
    <AppPage show-footer>
        <n-card>
            <template #header>
                <div class="track-info-container">
                    <n-card size="small" class="track-info-card">
                        <div class="track-info">
                            <div class="info-item">
                                <span class="info-label">线路类型:</span>
                                <n-tag type="success" size="medium">{{ trackType }}</n-tag>
                            </div>
                            <div class="info-item">
                                <span class="info-label">线路名称:</span>
                                <n-tag type="info" size="medium">{{ trackModel }}</n-tag>
                            </div>
                            <div class="info-item">
                                <span class="info-label">行别:</span>
                                <n-tag type="warning" size="medium">{{ trackDirection }}</n-tag>
                            </div>
                        </div>
                    </n-card>
                </div>
            </template>

            <div v-show="currentTab === 'main'">
                <n-layout has-sider>
                    <n-layout-sider content-style="padding: 5px;" width="100px">
                        <div class="sider-content">
                            <n-button v-for="parameter in parameterList" :key="parameter" :bordered="false"
                                style="width: 80px;">
                                {{ parameter }}
                            </n-button>
                        </div>
                    </n-layout-sider>
                    <n-layout>
                        <n-layout-content content-style="padding: 5px;">
                            <TrendChart :data="chartData" :parameters="parameterList" :color-map="colorMap"
                                :x-axis-data="xAxisData" :tag-positions="tagPositions" :not-merge="true" 
                                :sleeper-positions="sleeperPositions" />
                        </n-layout-content>
                    </n-layout>
                </n-layout>
            </div>
        </n-card>
    </AppPage>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TrendChart from './trendChart.vue'

// tab切换状态
const currentTab = ref('main')

// 线路信息
const trackType = ref('正线')
const trackModel = ref('60kg/m')
const trackDirection = ref('上行')

// 参数列表
const parameterList = ref([
    '轨距', '轨距变化率', '左高低', '右高低', '左轨向', '右轨向',
    '水平', '三角坑', '垂直磨耗', '侧面磨耗',
])

// 颜色映射
const colorMap = {
    轨距: '#ff7f0e', 轨距变化率: '#ff7f0e', 左高低: '#1f77b4',
    右高低: '#1f77b4', 左轨向: '#2ca02c', 右轨向: '#2ca02c',
    水平: '#d62728', 三角坑: '#9467bd', 垂直磨耗: '#8c564b',
    侧面磨耗: '#8c564b',
}

// 图表核心数据
const xAxisData = ref([])
const chartData = ref({
    轨距: [], 轨距变化率: [], 左高低: [], 右高低: [], 左轨向: [],
    右轨向: [], 水平: [], 三角坑: [], 垂直磨耗: [], 侧面磨耗: [],
})
const tagPositions = ref([])
const sleeperPositions = ref([])

// 计数器与里程状态

let intervalId

/**
 * 更新所有图表数据，并维持滑动窗口
 * @param {object} newData - 当前时刻的曲线图数据
 * @param {object|null} newTag - 当前时刻可能生成的新标签
 * @param {object|null} newSleeper - 当前时刻可能生成的新轨枕
 */
// function updateChartData(newData, newTag, newSleeper) {
//     const maxDataPoints = 100

//     // 1. 推入新数据
//     xAxisData.value.push(newData.mileage)
//     for (const param of parameterList.value) {
//         chartData.value[param].push(newData[param.toLowerCase()] || null) // 简化key的对应关系
//     }
//     if (newTag) {
//         tagPositions.value.push(newTag)
//     }
//     if (newSleeper) {
//         sleeperPositions.value.push(newSleeper)
//     }

//     // 2. 维持窗口大小，当数据超出最大点数时，从左侧移出旧数据
//     if (xAxisData.value.length > maxDataPoints) {
//         // 移出曲线图的旧数据
//         xAxisData.value.shift()
//         for (const param of parameterList.value) {
//             chartData.value[param].shift()
//         }

//         // 移出标记点的旧数据：检查最左侧的标记点是否已“滑出”可视范围
//         const visibleStartMileage = xAxisData.value[0]
//         if (tagPositions.value.length > 0 && tagPositions.value[0].mileage < visibleStartMileage) {
//             tagPositions.value.shift()
//         }
//         if (sleeperPositions.value.length > 0 && sleeperPositions.value[0].mileage < visibleStartMileage) {
//             sleeperPositions.value.shift()
//         }
//     }
// }


let currentMileageInDecimeters = 0
let tagCounter = 1
let sleeperCounter = 1



/**
 * 生成当前时刻的数据点
 */
// function generateDataPoint() {
//     const currentMileageInMeters = currentMileageInDecimeters / 10.0

//     // 判定当前位置是否需要生成标记点
//     const isTagLocation = (currentMileageInDecimeters > 0 && currentMileageInDecimeters % 100 === 0) // 10米
//     const isSleeperLocation = (currentMileageInDecimeters > 0 && currentMileageInDecimeters % 6 === 0) // 0.6米



//     let newTag = null
//     let newSleeper = null

//     // 如果是标签位
//     if (isTagLocation) {
//         newTag = { mileage: currentMileageInMeters, id: tagCounter++ }
//         sleeperCounter = 1 // 【新需求】重置轨枕计数器
//     }

//     // 如果是轨枕位
//     if (isSleeperLocation) {
//         newSleeper = { mileage: currentMileageInMeters, id: sleeperCounter++ }
//     }

//     // 准备要更新的曲线图数据
//     const chartPointData = {
//         mileage: currentMileageInMeters,
//         轨距: 1435 + Math.round(Math.random() * 4 - 2),
//         轨距变化率: Math.random() * 0.2 - 0.1,
//         左高低: 2 + Math.random() * 2,
//         右高低: 2 + Math.random() * 2,
//         左轨向: 1 + Math.random() * 1,
//         右轨向: 1 + Math.random() * 1,
//         水平: Math.random() * 2 - 1,
//         三角坑: Math.random() * 0.5,
//         垂直磨耗: 0.5 + Math.random() * 0.5,
//         侧面磨耗: 0.3 + Math.random() * 0.3,
//     }

//     // 将所有新生成的数据统一交由 updateChartData 函数处理
//     updateChartData(chartPointData, newTag, newSleeper)

//     currentMileageInDecimeters += 1
// }


/**
 * 更新所有图表数据，并维持滑动窗口
 * @param {object} newData - 当前时刻的曲线图数据
 * @param {object|null} newTag - 当前时刻可能生成的新标签
 * @param {object|null} newSleeper - 当前时刻可能生成的新轨枕
 */
function updateChartData(newData, newTag, newSleeper) {
    const maxDataPoints = 100

    // 1. 推入新数据
    xAxisData.value.push(newData.mileage)
    for (const param of parameterList.value) {
        // 在父组件中，应使用原始的 parameterList 值作为 key
        chartData.value[param].push(newData[param] || null)
    }
    if (newTag) {
        tagPositions.value.push(newTag)
    }
    if (newSleeper) {
        sleeperPositions.value.push(newSleeper)
    }

    // 2. 维持窗口大小，当数据超出最大点数时，从左侧移出旧数据
    if (xAxisData.value.length > maxDataPoints) {
        xAxisData.value.shift()
        for (const param of parameterList.value) {
            chartData.value[param].shift()
        }

        const visibleStartMileage = xAxisData.value[0]

        // --- START: FIX #1 ---
        // **【修复1】** 使用 while 循环替代 if，确保清理所有滑出范围的标记点
        while (tagPositions.value.length > 0 && tagPositions.value[0].mileage < visibleStartMileage) {
            tagPositions.value.shift()
        }
        while (sleeperPositions.value.length > 0 && sleeperPositions.value[0].mileage < visibleStartMileage) {
            sleeperPositions.value.shift()
        }
        // --- END: FIX #1 ---
    }
}



/**
 * 生成当前时刻的数据点
 */
function generateDataPoint() {
    const currentMileageInMeters = currentMileageInDecimeters / 10.0
    const isTagLocation = (currentMileageInDecimeters > 0 && currentMileageInDecimeters % 100 === 0)
    const isSleeperLocation = (currentMileageInDecimeters > 0 && currentMileageInDecimeters % 6 === 0)

    let newTag = null
    let newSleeper = null

    if (isTagLocation) {
        newTag = { mileage: currentMileageInMeters, id: tagCounter++ }
        // --- START: FIX #2 ---
        // **【修复2】** 移除此行，确保轨枕ID全局唯一，不会被重置
        // sleeperCounter = 1
        // --- END: FIX #2 ---
    }

    if (isSleeperLocation) {
        newSleeper = { mileage: currentMileageInMeters, id: sleeperCounter++ }
    }

    // 准备要更新的曲线图数据 (注意key的大小写要与parameterList一致)
    const chartPointData = {
        mileage: currentMileageInMeters,
        轨距: 1435 + Math.round(Math.random() * 4 - 2),
        轨距变化率: Math.random() * 0.2 - 0.1,
        左高低: 2 + Math.random() * 2,
        右高低: 2 + Math.random() * 2,
        左轨向: 1 + Math.random() * 1,
        右轨向: 1 + Math.random() * 1,
        水平: Math.random() * 2 - 1,
        三角坑: Math.random() * 0.5,
        垂直磨耗: 0.5 + Math.random() * 0.5,
        侧面磨耗: 0.3 + Math.random() * 0.3,
    }

    updateChartData(chartPointData, newTag, newSleeper)
    currentMileageInDecimeters += 1
}
onMounted(() => {
    // 注意定时器速度调整为100ms，以匹配0.1米的步进单位
    intervalId = setInterval(generateDataPoint, 1000)
})

onUnmounted(() => {
    clearInterval(intervalId)
})
</script>

<style scoped>
.sider-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 820px;
    padding-top: 42px;
    padding-bottom: 14px;
}

/* Styles below were not used by active elements and are kept for reference if needed */
.custom-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    padding: 0px 0px;
}

.track-info-container {
    margin-bottom: 16px;
}

.track-info-card {
    background-color: #f9f9f9;
    border-radius: 8px;
}

.track-info {
    display: flex;
    justify-content: center;
    gap: 32px;
    padding: 4px 0;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-label {
    font-weight: 500;
    color: #666;
}
</style>