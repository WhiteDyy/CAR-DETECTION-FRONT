<template>
    <CommonPage>
        <div>
            <header>
                <div class="header-content">
                    <n-button class="switch-btn left-btn" @click="switchData('prev')">
                        <template #icon>
                            <n-icon><ArrowBackIosRound /></n-icon>
                        </template>
                        上一组
                    </n-button>
                    
                    <n-tag size="large" type="info" class="switch-info">第1道岔 - 60kg/m 12号道岔</n-tag>
                    
                    <n-button class="switch-btn right-btn" @click="switchData('next')">
                        下一组
                        <template #icon>
                            <n-icon><ArrowForwardIosRound /></n-icon>
                        </template>
                    </n-button>
                </div>
                <!-- <img src="@/assets/images/switch.png" alt=""> -->
                <!-- <n-image :src="imageSrc" alt="overview" preview class="full-image" /> -->
                <div class="image-container">
          <n-image :src="imageSrc" alt="overview" preview class="full-image" />
        </div>
            </header>
            <n-card>
                <n-data-table
                    :bordered="true"
                    :striped="true"
                    :columns="columns"
                    :data="tableData"
                />
            </n-card>
        </div>
    </CommonPage>
</template>

<script setup>
import { ref ,h} from 'vue'

import CommonPage from '@/components/common/CommonPage.vue';
import { NDataTable, NCard } from 'naive-ui';
const imageSrc = new URL('@/assets/images/switch.png', import.meta.url).href

const tableData = ref([
  { ruler: 'S1', name: '尖轨前顺坡终点', direction: 'A股', sleeperNumber: '第1号枕', mileage: 300, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S2', name: '尖轨尖端', direction: '', sleeperNumber: '第6号枕', mileage: 3300, measurement: '轨距、水平', standardGauge: 1437 },
  { ruler: 'S3', name: '尖轨中前', direction: 'B股', sleeperNumber: '第11-12号枕', mileage: 6808, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S4', name: '尖轨中', direction: 'B股', sleeperNumber: '第15号枕', mileage: 8941, measurement: '轨距', standardGauge: 1435 },
  { ruler: 'S5', name: '尖轨中后', direction: '', sleeperNumber: '第21号枕', mileage: 12407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S6', name: '尖轨跟端直股', direction: 'A股', sleeperNumber: '第26号枕', mileage: 15407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S7', name: '尖轨跟端曲股', direction: 'B股', sleeperNumber: '第26号枕', mileage: 15407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S8', name: '导曲部分直股前部', direction: 'A股', sleeperNumber: '第32号枕', mileage: 19007, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S9', name: '导曲部分曲股前部', direction: 'B股', sleeperNumber: '第32号枕', mileage: 19007, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S10', name: '内配轨接头直股', direction: 'A股', sleeperNumber: '第38号枕', mileage: 22607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S11', name: '内配轨接头曲股', direction: 'B股', sleeperNumber: '第38号枕', mileage: 22607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S12', name: '导曲部分直股后部', direction: 'A股', sleeperNumber: '第46号枕', mileage: 27407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S13', name: '导曲部分曲股后部', direction: 'B股', sleeperNumber: '第46号枕', mileage: 27407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S14', name: '直股辙叉前', direction: 'A股', sleeperNumber: '第54号枕', mileage: 32207, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S15', name: '直股辙叉中', direction: 'A股', sleeperNumber: '第57-58号枕', mileage: 34607, measurement: '轨距、查照距离、护背间隔', standardGauge: 1435 },
  { ruler: 'S16', name: '直股辙叉后', direction: 'A股', sleeperNumber: '第63号枕', mileage: 37607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S17', name: '曲股辙叉前', direction: 'B股', sleeperNumber: '第63号枕', mileage: 37607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S18', name: '曲股辙叉中', direction: 'B股', sleeperNumber: '第57-58号枕', mileage: 34607, measurement: '轨距、查照距离、护背间隔', standardGauge: 1435 },
  { ruler: 'S19', name: '曲股辙叉后', direction: 'B股', sleeperNumber: '第54号枕', mileage: 32207, measurement: '轨距、水平', standardGauge: 1435 }
])
tableData.value.forEach(item => {
  if (!item.measurementValues) {
    const params = item.measurement.split('、');
    const values = {};
    params.forEach(param => {
      // 生成一些合理的假数据
      if (param === '轨距') {
        values[param] = Math.floor(Math.random() * 5) + 1434; // 1434-1438之间的随机值
      } else if (param === '水平') {
        values[param] = Math.floor(Math.random() * 6); // 0-5之间的随机值
      } else if (param === '查照距离') {
        values[param] = Math.floor(Math.random() * 10) + 1390; // 1390-1399之间的随机值
      } else if (param === '护背间隔') {
        values[param] = Math.floor(Math.random() * 10) + 40; // 40-49之间的随机值
      } else {
        values[param] = Math.floor(Math.random() * 10) + 1430; // 其他参数的默认随机值
      }
    });
    item.measurementValues = values;
  }
});
const columns = [
    { title: '道尺', key: 'ruler', width: 120, align: 'center' },
    { title: '名称', key: 'name', width: 150 },
    { title: '轨向',  key: 'direction', width: 120,},
    { title: '轨枕序号', key: 'sleeperNumber', width: 120, align: 'center' },
    {
        title: '里程(m)',
        key: 'mileage',
        width: 120,
        render: (row) => row.mileage.toFixed(2)
    },
    {
        title: '测量参数(mm)', 
        key: 'measurement', 
        width: 150,
        render: (row) => {
            // 将测量参数按、分割成数组
            const params = row.measurement.split('、');
            // 创建多行显示的元素
            return h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, params.map(param => h('span', {}, param)))
        }
    },
    {
        title: '测量值(mm)',
        key: 'measurementValues',
        width: 120,
        render: (row) => {
            const params = row.measurement.split('、');
            return h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, params.map(param => {
                const value = row.measurementValues[param];
                // 为轨距值添加颜色标识
                const color = param === '轨距' && value !== row.standardGauge ? 'red' : 'inherit';
                return h('span', { style: { color } }, value);
            }))
        }
    },
    {
        title: '标准轨距(mm)',
        key: 'standardGauge',
        width: 150,
        render: (row) => h('span', {
            style: { 
                color: row.standardGauge === 1435 ? 'green' : 'red' 
            }
        }, row.standardGauge)
    }
]

</script>

<style scoped>
header {
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    margin-bottom: 10px;
    position: absolute;
    top: 10px;
    z-index: 10;
}

.switch-info {
    font-size: 16px;
    font-weight: bold;
}

.image-container {
  flex: 3;
  /* 图像占更大比例 */
  display: flex;
  justify-content: center;
  /* 图像居中 */
  align-items: center;
  min-width: 500px;
}

.full-image {
  max-width: 100%;
  /* 图像自适应容器宽度 */
  height: auto;
  
}

.switch-btn {
    min-width: 90px;
}

</style>