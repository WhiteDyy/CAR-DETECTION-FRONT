<template>
  <n-layout>
    <n-modal v-model:show="showInitialDialog" preset="card" title="新建线路" :style="{
      width: '600px'
    }" :header-style="{
      backgroundColor: 'rgba(82, 207, 197, 0.2)',
      border: '2px solid rgba(82, 207, 197, 1)',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px'
    }" :content-style="{
      backgroundColor: 'rgba(82, 207, 197, 0.2)',
      border: '2px solid rgba(82, 207, 197, 1)',
      borderBottomLeftRadius: '16px',
      borderBottomRightRadius: '16px'
    }">

      <n-form label-placement="left" label-width="100px">
        <!-- 线路名称 -->
        <n-form-item label="线路名称" style="margin-top: 30px;">
          <n-input v-model:value="routeForm.routeName" placeholder="请输入线路名称" :clearable="true" />
        </n-form-item>

        <!-- 起始节点 -->
        <n-form-item label="起始节点">
          <n-select v-model:value="routeForm.startId" :options="nodeOptions" placeholder="选择起始节点" :clearable="true"
            style="width: 200px;" />
        </n-form-item>

        <!-- 终点节点 -->
        <n-form-item label="终点节点">
          <n-select v-model:value="routeForm.endId" :options="nodeOptions" placeholder="选择终点节点" :clearable="true"
            style="width: 200px;" />
        </n-form-item>

        <!-- 道岔数量 -->
        <n-form-item label="道岔数量">
          <n-select v-model:value="routeForm.branchCount" :options="branchCountOptions" placeholder="选择道岔数量"
            :clearable="true" style="width: 200px;" />
        </n-form-item>

        <n-space justify="end" :style="{ 'margin-top': '24px' }">
          <n-button @click="resetForm" class="custom-button">重置任务</n-button>
          <n-button type="primary" @click="initRoute" class="custom-primary-button">确定</n-button>
        </n-space>
      </n-form>
    </n-modal>

    <!-- 线路预览区域 -->
    <n-layout-header bordered style="padding: 20px;">
      <n-card :title="routeForm.routeName || '线路预览'">
        <div class="preview-container" ref="container">
          <!-- 节点和连接线容器 -->
          <div class="node-container">
            <div v-for="(node, index) in nodes" :key="index" :class="['node', node.type]"
              :style="nodePositionStyle(node)">
              <div class="node-content">
                <div class="node-label">{{ node.content }}</div>
                <div class="node-info" v-if="node.type === 'main'">
                  里程: {{ node.mileage }}
                </div>

                <!-- 修改道岔配置区域，同时显示label和turnoutName -->
                <div class="turnout-config" v-if="node.type === 'branch'">
                  <n-select v-model:value="node.direction" :options="directionOptions" placeholder="选择型号" size="small"
                    style="margin-bottom: 5px; width: 100%;" />
                  <n-select v-model:value="node.trackDirection" :options="trackDirectionOptions" placeholder="选择轨向"
                    size="small" style="width: 100%;" />
                  <!-- 新增显示turnoutName -->
                  <div class="turnout-name" v-if="node.direction">
                    {{ getTurnoutName(node.direction) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 连接线 -->
            <svg class="connections" width="100%" height="100%">
              <path v-for="(path, index) in connectionPaths" :key="`path-${index}`" :d="path.d" fill="none"
                stroke="white" stroke-width="2" /> <!-- 修改为白色线条，移除箭头 -->

              <!-- 移除箭头标记，因为不再需要 -->
            </svg>
          </div>
        </div>
      </n-card>
    </n-layout-header>

    <n-layout-footer bordered style="padding: 20px;">
      <n-space justify="end">
        <n-button @click="resetForm">重置任务</n-button>
        <n-button type="primary" @click="saveToLocal">保存任务</n-button>
      </n-space>
    </n-layout-footer>
  </n-layout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import {
  NLayout,
  NLayoutHeader,
  NLayoutFooter,
  NCard,
  NForm,
  NFormItem,
  NButton,
  NSelect,
  NSpace,
  NModal
} from 'naive-ui';

// 控制初始弹框显示
const showInitialDialog = ref(true);

// 线路表单数据
const routeForm = ref({
  routeName: '',
  startId: null,
  endId: null,
  branchCount: 0,
});

const nodes = ref([]);
const container = ref(null);
const connectionPaths = ref([]);

// 选项数据
const nodeOptions = [
  { label: '站点A', value: 'A' },
  { label: '站点B', value: 'B' },
  { label: '站点C', value: 'C' },
  { label: '站点D', value: 'D' },
];
const branchCountOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '21', value: 21 },
];
const directionOptions = [
  { label: '1号道岔', value: 'turnout1', turnoutName: 'SC330 道岔' },
  { label: '2号道岔', value: 'turnout2', turnoutName: 'CZ577 道岔' },
  { label: '3号道岔', value: 'turnout3', turnoutName: '专线4257 道岔' },
  { label: '4号道岔', value: 'turnout4', turnoutName: 'SC340 渡线' },
];
const trackDirectionOptions = [
  { label: 'A股', value: 'A' },
  { label: 'B股', value: 'B' },
];

// 获取道岔名称
const getTurnoutName = (type) => {
  if (!type) return '';
  const option = directionOptions.find(opt => opt.value === type);
  return option ? option.turnoutName : '';
};

// 初始化线路
const initRoute = () => {
  if (!routeForm.value.routeName) {
    window.$message?.error('请输入线路名称');
    return;
  }

  if (!routeForm.value.startId) {
    window.$message?.error('请选择起始节点');
    return;
  }

  if (!routeForm.value.endId) {
    window.$message?.error('请选择终点节点');
    return;
  }

  showInitialDialog.value = false;
  generateRoute();
};

// 计算节点位置样式
const nodePositionStyle = (node) => {
  return {
    left: `${node.position.x}px`,
    top: `${node.position.y}px`,
  };
};

// 生成线路图
const generateRoute = () => {
  nodes.value = [];
  connectionPaths.value = [];

  const { startId, endId, branchCount } = routeForm.value;

  if (!startId || !endId) return;

  const totalNodes = branchCount + 2;
  const nodesPerRow = 4;
  const rowCount = Math.ceil(totalNodes / nodesPerRow);

  // 节点布局参数
  const containerWidth = container.value ? container.value.offsetWidth : 800;
  const nodeWidth = 150; // 增加宽度以容纳配置选项
  const nodeHeight = branchCount > 0 ? 120 : 80; // 道岔节点更高
  const horizontalSpacing = (containerWidth - nodeWidth * Math.min(totalNodes, nodesPerRow)) / (Math.min(totalNodes, nodesPerRow) + 1);
  const verticalSpacing = 120;

  // 生成节点并计算位置
  for (let i = 0; i < totalNodes; i++) {
    const row = Math.floor(i / nodesPerRow);
    const col = i % nodesPerRow;

    // 处理换行时的列号（蛇形排列）
    let effectiveCol;
    if (row % 2 === 0) {
      // 偶数行从左到右
      effectiveCol = col;
    } else {
      // 奇数行从右到左
      effectiveCol = nodesPerRow - col - 1;
    }

    // 节点位置计算
    let x = horizontalSpacing + effectiveCol * (nodeWidth + horizontalSpacing);
    let y = 30 + row * (nodeHeight + verticalSpacing);

    // 创建节点
    let node;
    if (i === 0) {
      // 起点节点
      node = {
        id: i,
        content: `站点${startId}`,
        type: 'main',
        mileage: '0',
        position: { x, y }
      };
    } else if (i === totalNodes - 1) {
      // 终点节点
      node = {
        id: i,
        content: `站点${endId}`,
        type: 'main',
        mileage: `${(i * 100).toFixed(1)}`,
        position: { x, y }
      };
    } else {
      // 道岔节点
      node = {
        id: i,
        content: `道岔${i}`,
        type: 'branch',
        direction: null,
        trackDirection: 'A', // 默认A股
        position: { x, y }
      };
    }
    nodes.value.push(node);
  }

  // 生成连接线路径
  generateConnectionPaths(rowCount, nodesPerRow, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing);
};

// 生成连接线路径 - 修改为白色线条且不带箭头
const generateConnectionPaths = (rowCount, nodesPerRow, nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing) => {
  const paths = [];

  for (let i = 0; i < nodes.value.length - 1; i++) {
    const currentNode = nodes.value[i];
    const nextNode = nodes.value[i + 1];

    const startX = currentNode.position.x + nodeWidth/2;
    const startY = currentNode.position.y + nodeHeight;
    const endX = nextNode.position.x + nodeWidth/2;
    const endY = nextNode.position.y+nodeHeight;
    // console.log(i,'：(',startX,',',startY,')-->(',endX,',',endY,')');
    

    // 简单直线连接，不带箭头
    paths.push({
      d: `M ${startX} ${startY} L ${endX} ${endY}`
    });
  }

  connectionPaths.value = paths;
};
// 保存到本地
const saveToLocal = () => {
  const data = {
    nodes: nodes.value,
    routeForm: routeForm.value,
  };
  localStorage.setItem('routeData', JSON.stringify(data));
  window.$message?.success('线路图已保存到本地');
};

// 读取本地数据
const loadFromLocal = () => {
  const savedData = localStorage.getItem('routeData');
  if (savedData) {
    const data = JSON.parse(savedData);
    routeForm.value = data.routeForm;
    nodes.value = data.nodes;

    if (data.nodes.length > 0) {
      showInitialDialog.value = false;
    }
  }
};

// 重置表单
const resetForm = () => {
  routeForm.value = {
    routeName: '',
    startId: null,
    endId: null,
    branchCount: 0,
  };

  nodes.value = [];
  connectionPaths.value = [];
  showInitialDialog.value = true;
};

// 生命周期钩子
onMounted(() => {
  loadFromLocal();
  nextTick(() => {
    if (nodes.value.length > 0) {
      generateRoute();
    }
  });
});
</script>

<style scoped>
.turnout-config .turnout-name {
  font-size: 12px;
  color: #ccc;
  margin-top: 5px;
  text-align: center;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 88%;
  border: 2px solid #09e2d0f1;
  border-radius: 19px;
  background-image: url('/Frame.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  overflow: auto;
}

.node-container {
  position: relative;
  width: 100%;
  min-height: 750px;
}

.node {
  position: absolute;
  width: 180px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  z-index: 10;
  transition: all 0.3s ease;
  padding: 8px;
  box-sizing: border-box;
}

.node.main {
  height: 80px;
  background-color: #4caf50;
  color: white;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.node.branch {
  height: 120px;
  background-color: #ff6600;
  color: white;
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
}

.node-content {
  text-align: center;
  width: 100%;
  font-size: large;
}

.node-label {
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 5px;
}

.node-info {
  font-size: 12px;
  margin-bottom: 8px;
}

/* 修改道岔配置区域样式，同时显示label和turnoutName */
.turnout-config {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
}

.turnout-config :deep(.n-select) {
  margin-bottom: 5px;
}

.turnout-config :deep(.n-select .n-select-option) {
  display: flex;
  justify-content: space-between;
}

.turnout-config :deep(.n-select .n-select-option span:last-child) {
  color: #ccc;
  font-size: 12px;
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
}

/* 修改连接线样式为白色且不带箭头 */
:deep(.connections path) {
  stroke: white;
  /* 白色线条 */
  marker-end: none;
  /* 移除箭头 */
}

:deep(.n-form) {
  --n-color: rgba(82, 207, 197, 1);
  --n-text-color: #333;
  --n-border-radius: 12px;
}

:deep(.n-form-item) {
  margin-bottom: 20px;
}

:deep(.n-input) {
  --n-input-text-color: #f12020;
  --n-input-border-color: rgba(82, 207, 197, 0.5);
  --n-input-bg-color: rgba(255, 255, 255, 0.7);
  --n-input-hover-border-color: rgba(82, 207, 197, 0.8);
  --n-input-focus-border-color: rgba(82, 207, 197, 1);
}

:deep(.n-select) {
  --n-select-text-color: #333;
  --n-select-border-color: rgba(82, 207, 197, 0.5);
  --n-select-bg-color: rgba(255, 255, 255, 0.7);
}

:deep(.n-select .n-select-option:hover) {
  --n-select-option-hover-bg-color: rgba(82, 207, 197, 0.2);
}

:deep(.n-select .n-select-option--selected) {
  --n-select-option-selected-bg-color: rgba(82, 207, 197, 0.3);
}

:deep(.n-select .n-select-focused) {
  --n-select-focused-border-color: rgba(82, 207, 197, 1);
}

:deep(.custom-button) {
  background-color: transparent;
  border: 1px solid rgba(82, 207, 197, 1);
  color: rgba(82, 207, 197, 1);
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.custom-button:hover) {
  background-color: rgba(82, 207, 197, 0.2);
}

:deep(.custom-primary-button) {
  background-color: rgba(82, 207, 197, 1);
  border: none;
  color: white;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.custom-primary-button:hover) {
  background-color: rgba(82, 207, 197, 0.8);
}
</style>