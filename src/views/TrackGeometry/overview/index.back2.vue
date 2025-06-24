<template>
    <CommonPage>
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
        <n-layout has-sider>
            <n-layout-sider content-style="padding: 0;" :width="paramListWidth">
                
            </n-layout-sider>
            <n-layout>
                <n-layout-content>
                    <TrendChart :data="chartData" :parameters="parameterList" :colorMap="colorMap"
                        :xAxisData="xAxisData" :tagPositions="tagPositions" :sleeperPositions="sleeperPositions"
                        :kmPositions="kmPositions" />
                </n-layout-content>

            </n-layout>
        </n-layout>

        <div>
        </div>
    </CommonPage>
</template>

<script setup>
import { ref } from 'vue'
import TrendChart from './trendChart.vue'
import CommonPage from '@/components/common/CommonPage.vue';



// 线路信息
const trackType = ref('正线'); // 可选值: '正线', '道岔'
const trackModel = ref('60kg/m'); // 线路型号
const trackDirection = ref('上行'); // 行别: '上行', '下行'

// tab切换状态
const currentTab = ref('main')


const trackImage = new URL('@/assets/images/switch.jpg', import.meta.url).href




// 参数列表
const parameterList = ref([
    '轨距',
    '轨距变化率',
    '左高低',
    '右高低',
    '左轨向',
    '右轨向',
    '水平',
    '三角坑',
    '垂直磨耗',
    '侧面磨耗',
])

// 动态计算侧边栏宽度
const maxParamLength = Math.max(...parameterList.value.map(p => p.length));
const paramListWidth = Math.max(80, maxParamLength * 20);

// 颜色映射
const colorMap = {
    轨距: '#ff7f0e',
    轨距变化率: '#ff7f0e',
    左高低: '#1f77b4',
    右高低: '#1f77b4',
    左轨向: '#2ca02c',
    右轨向: '#2ca02c',
    水平: '#d62728',
    三角坑: '#9467bd',
    垂直磨耗: '#8c564b',
    侧面磨耗: '#8c564b',
}

// X 轴数据（里程）
const xAxisData = ref([])

// 图表数据（Y 值）
const chartData = ref({
    轨距: [],
    轨距变化率: [],
    左高低: [],
    右高低: [],
    左轨向: [],
    右轨向: [],
    水平: [],
    三角坑: [],
    垂直磨耗: [],
    侧面磨耗: [],
})

const tagPositions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 110, 120, 130, 140, 150, 160, 170, 180, 190];
const sleeperPositions = [15, 25, 35, 45, 55, 65, 75, 85, 95, 115, 125, 135, 145, 155, 165, 175, 185, 195];
const kmPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9];


function updateChartData(newData) {
    xAxisData.value.push(newData.mileage);
    // 假设 newData 包含与 chartData 对应的字段
    chartData.value['轨距'].push(newData.track || null);
    chartData.value['轨距变化率'].push(newData.trackChangeRate || null);
    chartData.value['左高低'].push(newData.lHl || null);
    chartData.value['右高低'].push(newData.hHl || null);
    chartData.value['左轨向'].push(newData.lTd || null);
    chartData.value['右轨向'].push(newData.hTd || null);
    chartData.value['水平'].push(newData.level || null);
    chartData.value['三角坑'].push(newData.trianglePit || null);
    chartData.value['垂直磨耗'].push(newData.verticalAbrasion || null);
    chartData.value['侧面磨耗'].push(newData.sideAbrasion || null);
}



let currentMileage = 0;
let intervalId;


// Function to generate and update a single data point
function generateDataPoint() {
    const data = {
        mileage: currentMileage,
        track: 1435 + Math.round(Math.random() * 4 - 2), // 轨距：1433~1437mm
        trackChangeRate: Math.random() * 0.2 - 0.1, // 轨距变化率：-0.1~0.1
        lHl: 2 + Math.random() * 2,
        hHl: 2 + Math.random() * 2,
        lTd: 1 + Math.random() * 1,
        hTd: 1 + Math.random() * 1,
        abrasion: 0.5 + Math.random() * 0.5,
        twist: 1 + Math.random() * 1,
        curve: 120 + Math.random() * 10,
        level: Math.random() * 2 - 1, // 水平：-1~1
        trianglePit: Math.random() * 0.5, // 三角坑：0~0.5
        verticalAbrasion: 0.5 + Math.random() * 0.5, // 垂直磨耗：0.5~1
        sideAbrasion: 0.3 + Math.random() * 0.3, // 侧面磨耗：0.3~0.6
    };
    updateChartData(data);
    currentMileage += 1;
}

// Set up periodic updates on mount
onMounted(() => {
    intervalId = setInterval(() => {
        generateDataPoint();
    }, 1000); // Update every 1 second
});

// Clean up the interval on unmount
onUnmounted(() => {
    clearInterval(intervalId);
});
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

.custom-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    padding: 0px 0px;
}

n-card {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    /* 示例高度，可根据需要调整 */
    width: 100%;
}

.main-card {
    margin: 6px;
    /* 卡片外边距 */
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
    padding: 6px;
    /* 内部间距 */
}

.flex-container {
    display: flex;
    justify-content: space-between;
    /* 左右靠边，中间拉伸 */
    align-items: flex-start;
    /* 顶部对齐 */
    gap: 16px;
    /* 元素间距 */
    width: 100%;
}

.left-table,
.right-table {
    width: auto;
    /* 自适应内容宽度 */
    min-width: 200px;
    /* 最小宽度，防止过窄 */
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    text-align: center;
}

.svg-container {
    flex: 1;
    /* 图片容器占据剩余空间 */
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 800px;
    /* 图片最大宽度 */
}

.background {
    width: 100%;
    /* 图片宽度自适应容器 */
    max-width: 800px;
    /* 保持最大宽度限制 */
    height: auto;
}

td {
    padding: 6px 8px;
    white-space: nowrap;
    /* 防止值换行 */
}

.modal-content {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    /* height: 200px; */
    /* 自定义弹窗内容高度，可调整 */
}

/* 可选：调整 route-monitor 内容缩放 */
.modal-content route-monitor {
    transform: scale(0.9);
    /* 按需调整内容大小 */
}


.title-container {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    width: 600px;
    height: 50px;
    /* 固定宽度 */
    margin: 0 auto;
    /* 居中 */
    padding: 2px;
    background: #ffffff;
    /* 卡片背景 */
    border-radius: 8px;
    /* 圆角 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    /* 阴影 */
    border: 1px solid #e8e8e8;
    /* 边框 */
}

.custom-title {
    font-size: 16px;
    /* 字体小以适应单行 */
    font-weight: 500;
    color: #333;
}

.info-row {
    display: flex;
    justify-content: space-between;
    /* 元素均匀分布 */
    align-items: center;
    gap: 8px;
    /* 元素间距 */
}

.info-row span {
    flex: 1;
    /* 均分空间 */
    text-align: center;
    /* 文本居中 */
    white-space: nowrap;
    /* 防止换行 */
    overflow: hidden;
    /* text-overflow: ellipsis; */
    /* 超长文本显示省略号 */
}

/* 添加线路信息样式 */
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