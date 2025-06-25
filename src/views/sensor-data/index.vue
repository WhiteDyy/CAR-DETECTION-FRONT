<template>
  <CommonPage>
    <div class="dashboard">
      <n-alert v-if="errorMessage" type="error" :title="errorMessage" />
      <h1>传感器实时仪表盘</h1>
      <n-grid cols="s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" :x-gap="2" :y-gap="2">
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="groa" color="rgb(255, 99, 132)" :x-axis-data="xAxisSequence" title="Gyro 1" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="grob" color="rgb(54, 162, 235)" :x-axis-data="xAxisSequence" title="Gyro 2" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="dipmeter" color="rgb(75, 192, 192)" :x-axis-data="xAxisSequence" title="Dipmeter" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="ga" color="rgb(255, 159, 64)" :x-axis-data="xAxisSequence" title="Accel X" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="gb" color="rgb(153, 102, 255)" :x-axis-data="xAxisSequence" title="Accel Y" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="gc" color="rgb(255, 205, 86)" :x-axis-data="xAxisSequence" title="Accel Z" />
          </n-card>
        </n-gi>
        <n-gi>
          <n-card hoverable class="chart-card">
            <LineChart :data="chartData" parameter="cnt" color="rgb(201, 203, 207)" :x-axis-data="xAxisSequence" title="Encoder" />
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
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in latestData" :key="item.sequence + '-' + index">
              <td>{{ item.sequence }}</td>
              <td>{{ item.groa?.toFixed(2) }}</td>
              <td>{{ item.grob?.toFixed(2) }}</td>
              <td>{{ item.dipmeter?.toFixed(2) }}</td>
              <td>{{ item.ga?.toFixed(2) }}</td>
              <td>{{ item.gb?.toFixed(2) }}</td>
              <td>{{ item.gc?.toFixed(2) }}</td>
              <td>{{ item.cnt }}</td>
              <td>{{ item.startTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </CommonPage>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash';
import LineChart from './LineChart.vue';
import CommonPage from '@/components/common/CommonPage.vue';
import { NGrid, NGi, NCard, NAlert, NButton } from 'naive-ui';
import SSEService from '@/utils/sse/sseService';

const chartData = reactive({
  groa: [], grob: [], dipmeter: [], ga: [], gb: [], gc: [], cnt: [],
});
const sequence = ref([]);
const xAxisSequence = ref([]);
const latestData = ref([]);
const maxPoints = 100;
const errorMessage = ref('');

const updateCharts = debounce(() => {
  xAxisSequence.value = Array.from({ length: chartData.groa.length }, (_, i) => i + 1);
  chartData.groa = [...chartData.groa];
  chartData.grob = [...chartData.grob];
  chartData.dipmeter = [...chartData.dipmeter];
  chartData.ga = [...chartData.ga];
  chartData.gb = [...chartData.gb];
  chartData.gc = [...chartData.gc];
  chartData.cnt = [...chartData.cnt];
  xAxisSequence.value = [...xAxisSequence.value];
  latestData.value = [...latestData.value];
}, 200); // 增加防抖时间


const sseUrl = '/api/sensor';
const sse = new SSEService(sseUrl);


const handleMessage = (data) => {
  errorMessage.value = '';

  // 宽松的数据验证，允许部分字段为字符串并转换
  if (!data || typeof data.sequence !== 'number') {
    return;
  }

  // 类型转换
  const parsedData = {
    sequence: data.sequence,
    ga: Number(data.ga) || 0,
    gb: Number(data.gb) || 0,
    gc: Number(data.gc) || 0,
    cnt: Number(data.cnt) || 0,
    dipmeter: Number(data.dipmeter) || 0,
    groa: Number(data.groa) || 0,
    grob: Number(data.grob) || 0,
    startTime: typeof data.startTime === 'string' ? data.startTime : new Date().toISOString(),
  };

 

  chartData.groa.push(parsedData.groa);
  chartData.grob.push(parsedData.grob);
  chartData.dipmeter.push(parsedData.dipmeter);
  chartData.ga.push(parsedData.ga);
  chartData.gb.push(parsedData.gb);
  chartData.gc.push(parsedData.gc);
  chartData.cnt.push(parsedData.cnt);
  sequence.value.push(parsedData.sequence);

  if (chartData.groa.length > maxPoints) {
    chartData.groa.shift();
    chartData.grob.shift();
    chartData.dipmeter.shift();
    chartData.ga.shift();
    chartData.gb.shift();
    chartData.gc.shift();
    chartData.cnt.shift();
    sequence.value.shift();
  }

  latestData.value.push(parsedData);
  if (latestData.value.length > 5) {
    latestData.value = latestData.value.slice(-5);
  }

  console.warn('表格数据长度:', latestData.value.length, 'chartData length:', chartData.groa.length);
  updateCharts();
};

const resetStateOnReconnect = () => {
  
  latestData.value = [];
  
  // 保留 chartData 和 sequence，不清空折线图数据
};

onMounted(() => {
  console.warn('Mounting, adding SSE listener');
  sse.addEventListener('sensorData', handleMessage);
  sse.addEventListener('reconnect', resetStateOnReconnect);
  sse.start();
});

onUnmounted(() => {
  console.warn('Unmounting, removing SSE listener');
  sse.removeEventListener('sensorData', handleMessage);
  sse.removeEventListener('reconnect', resetStateOnReconnect);
  sse.stop();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
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
th, td {
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