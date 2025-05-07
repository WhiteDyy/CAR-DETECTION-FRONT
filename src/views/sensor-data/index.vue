<template>
    <CommonPage>
        <div class="dashboard">
            <h1>传感器实时仪表盘</h1>
            <n-grid cols="s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" :x-gap="2" :y-gap="2">
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="groa" color="rgb(255, 99, 132)" :x-axis-data="sequence"
                            title="Gyro 1" />
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="groa2" color="rgb(54, 162, 235)" :x-axis-data="sequence"
                            title="Gyro 2" />
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="dipmeter" color="rgb(75, 192, 192)"
                            :x-axis-data="sequence" title="Dipmeter" />
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="accelX" color="rgb(255, 159, 64)"
                            :x-axis-data="sequence" title="Accel X" />
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="accelY" color="rgb(153, 102, 255)"
                            :x-axis-data="sequence" title="Accel Y" />
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="accelZ" color="rgb(255, 205, 86)"
                            :x-axis-data="sequence" title="Accel Z" />
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card hoverable class="chart-card">
                        <LineChart :data="chartData" parameter="codee40" color="rgb(201, 203, 207)"
                            :x-axis-data="sequence" title="Encoder" />
                    </n-card>
                </n-gi>
            </n-grid>
            <div class="table-container">
                <h2>最新数据 (最近 5 包)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sequence</th>
                            <th>Gyro 1</th>
                            <th>Gyro 2</th>
                            <th>Dipmeter</th>
                            <th>Accel X</th>
                            <th>Accel Y</th>
                            <th>Accel Z</th>
                            <th>Encoder</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in latestData" :key="item.sequence">
                            <td>{{ item.sequence }}</td>
                            <td>{{ item.groa.x.toFixed(2) }}</td>
                            <td>{{ item.groa2.x.toFixed(2) }}</td>
                            <td>{{ item.dipmeter.x.toFixed(2) }}</td>
                            <td>{{ item.accel.acc1.toFixed(2) }}</td>
                            <td>{{ item.accel.acc2.toFixed(2) }}</td>
                            <td>{{ item.accel.acc3.toFixed(2) }}</td>
                            <td>{{ item.codee40.cnt }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </CommonPage>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash';
import LineChart from './LineChart.vue';
import CommonPage from '@/components/common/CommonPage.vue';
import { NGrid, NGi, NCard } from 'naive-ui';
import SSEService from '@/utils/sse/sseService.js';


// // 响应式数据
// const chartData = ref({
//     groa: [],
//     groa2: [],
//     dipmeter: [],
//     accelX: [],
//     accelY: [],
//     accelZ: [],
//     codee40: [],
// });
// const sequence = ref([]);
// const latestData = ref([]);
// const maxPoints = 1000; // 保留最近1000点数据

// // 更新图表数据的节流函数
// const updateCharts = debounce(() => {
//     chartData.value = { ...chartData.value };
//     sequence.value = sequence.value.slice();
// }, 100);

// // 创建SSE服务实例
// const sseService = new SSEService('http://localhost:8000/sse');

// const handleSSEData = (data) => {
//     // data 是后端推送的一个数组（包含五条数据）
//     try {
//         // 确保 data 是一个数组
//         if (!Array.isArray(data)) {
//             console.error('预期接收到数组，但收到:', data);
//             return;
//         }

//         // 遍历数组中的每条数据
//         data.forEach((message) => {
//             // 验证 message 是否包含必要字段
//             if (!message.groa || !message.groa2 || !message.dipmeter || !message.accel || !message.codee40 || !message.sequence) {
//                 console.warn('数据格式不完整:', message);
//                 return;
//             }

//             // 更新 chartData 和 sequence
//             chartData.value.groa.push(message.groa.x);
//             chartData.value.groa2.push(message.groa2.x);
//             chartData.value.dipmeter.push(message.dipmeter.x);
//             chartData.value.accelX.push(message.accel.acc1);
//             chartData.value.accelY.push(message.accel.acc2);
//             chartData.value.accelZ.push(message.accel.acc3);
//             chartData.value.codee40.push(message.codee40.cnt);
//             sequence.value.push(message.sequence);
//             latestData.value.push(message);

//             // 限制数据点数量
//             if (sequence.value.length > maxPoints) {
//                 chartData.value.groa.shift();
//                 chartData.value.groa2.shift();
//                 chartData.value.dipmeter.shift();
//                 chartData.value.accelX.shift();
//                 chartData.value.accelY.shift();
//                 chartData.value.accelZ.shift();
//                 chartData.value.codee40.shift();
//                 sequence.value.shift();
//             }
//         });

//         // 保留最新5条数据
//         latestData.value = latestData.value.slice(-5);

//         updateCharts(); // 更新图表
//     } catch (error) {
//         console.error('处理SSE数据出错:', error);
//     }
// };

// // 添加SSE事件监听器
// sseService.addEventListener(handleSSEData);

// // 组件生命周期管理
// onMounted(() => {
//     sseService.start(); // 启动SSE连接
// });

// onUnmounted(() => {
//     sseService.stop(); // 关闭SSE连接
// });


// 响应式数据
const chartData = ref({
    groa: [],
    groa2: [],
    dipmeter: [],
    accelX: [],
    accelY: [],
    accelZ: [],
    codee40: [],
});
const sequence = ref([]);
const latestData = ref([]);
const maxPoints = 1000; // 保留最近 1000 点

// 更新图表数据的节流函数
const updateCharts = debounce(() => {
    chartData.value = { ...chartData.value };
    sequence.value = sequence.value.slice();
}, 100);

// 生成模拟数据
const generateMockData = () => {
    const mockBatch = [];
    const baseSequence = sequence.value.length > 0 ? sequence.value[sequence.value.length - 1] : 0;

    for (let i = 0; i < 50; i++) {
        const sequenceNum = baseSequence + i + 1;
        const mockData = {
            groa: { x: Math.sin(sequenceNum * 0.1) * 100 + Math.random() * 10 },
            groa2: { x: Math.cos(sequenceNum * 0.1) * 100 + Math.random() * 10 },
            dipmeter: { x: Math.sin(sequenceNum * 0.05) * 45 + 45 },
            accel: {
                acc1: Math.random() * 2 - 1,
                acc2: Math.random() * 2 - 1,
                acc3: Math.random() * 2 - 1,
            },
            codee40: { cnt: sequenceNum * 10 + Math.floor(Math.random() * 5) },
            sequence: sequenceNum,
        };
        mockBatch.push(mockData);
    }
    return mockBatch;
};

// 模拟数据更新
const simulateData = () => {
    const batch = generateMockData();
    batch.forEach((message) => {
        chartData.value.groa.push(message.groa.x);
        chartData.value.groa2.push(message.groa2.x);
        chartData.value.dipmeter.push(message.dipmeter.x);
        chartData.value.accelX.push(message.accel.acc1);
        chartData.value.accelY.push(message.accel.acc2);
        chartData.value.accelZ.push(message.accel.acc3);
        chartData.value.codee40.push(message.codee40.cnt);
        sequence.value.push(message.sequence);
        latestData.value.push(message);

        if (sequence.value.length > maxPoints) {
            chartData.value.groa.shift();
            chartData.value.groa2.shift();
            chartData.value.dipmeter.shift();
            chartData.value.accelX.shift();
            chartData.value.accelY.shift();
            chartData.value.accelZ.shift();
            chartData.value.codee40.shift();
            sequence.value.shift();
        }
        latestData.value = latestData.value.slice(-5);
    });
    updateCharts();
};

onMounted(() => {
    for (let i = 0; i < 10; i++) {
        simulateData();
    }
    const interval = setInterval(simulateData, 1000);
    onUnmounted(() => clearInterval(interval));
});
</script>

<style scoped>
.dashboard {
    padding: 20px;
    /* max-width: 1400px; */
    margin: auto;
}

.chart-card {
    height: 300px;
}

.table-container {
    margin-top: 30px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 10px;
    text-align: center;
    border: 1px solid #ddd;
}

th {
    background: #4caf50;
    color: white;
}

tr:nth-child(even) {
    background: #f2f2f2;
}
</style>