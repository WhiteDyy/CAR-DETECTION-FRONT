
<template>
  <n-layout>
    <!-- 顶部线路预览 -->
    <n-layout-header bordered style="padding: 20px;">
      <n-card title="线路预览">
        <div class="preview-container" ref="container">
          <div class="preview-content">
            <n-timeline horizontal>
              <n-timeline-item
                v-for="(node, index) in nodes"
                :key="index"
                :type="node.type === 'main' ? 'success' : 'warning'"
                :title="node.content"
                :content="node.type === 'main' ? `里程: ${node.mileage}` : `型号: ${getTurnoutLabelAndName(node.direction)}`"
              />
            </n-timeline>
          </div>
        </div>
      </n-card>
    </n-layout-header>

    <!-- 中部输入区域 -->
    <n-layout-content style="padding: 20px;">
      <n-card title="线路输入">
        <n-form :model="routeForm" inline>
          <n-form-item label="起点节点">
            <n-select
              v-model:value="routeForm.startId"
              :options="nodeOptions"
              placeholder="选择起点节点"
              style="width: 150px;"
            />
          </n-form-item>
          <n-form-item label="终点节点">
            <n-select
              v-model:value="routeForm.endId"
              :options="nodeOptions"
              placeholder="选择终点节点"
              style="width: 150px;"
            />
          </n-form-item>
          <n-form-item label="道岔数量">
            <n-select
              v-model:value="routeForm.branchCount"
              :options="branchCountOptions"
              placeholder="选择道岔数量"
              style="width: 150px;"
            />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" :disabled="!allTurnoutsSelected" @click="generateRoute">生成预览</n-button>
          </n-form-item>
          <n-form-item>
            <n-button @click="resetForm">重置任务</n-button>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="saveToLocal">保存任务</n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </n-layout-content>

    <!-- 底部道岔配置 -->
    <n-layout-footer bordered style="padding: 20px;">
      <n-card title="道岔配置" ref="card">
        <n-form :model="routeForm" class="turnout-form">
          <n-form-item
            v-for="(branch, index) in routeForm.branchConfigs"
            :key="index"
            :label="`道岔 ${index + 1}`"
            class="turnout-item"
          >
            <div class="turnout-name" v-if="branch.type">
              {{ getTurnoutName(branch.type) }}
            </div>
            <n-select
              v-model:value="routeForm.branchConfigs[index].type"
              :options="directionOptions"
              placeholder="选择道岔型号"
              style="width: 180px;"
            />
          </n-form-item>
        </n-form>
      </n-card>
    </n-layout-footer>
  </n-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NCard,
  NForm,
  NFormItem,
  NButton,
  NSelect,
  NTimeline,
  NTimelineItem,
} from 'naive-ui';

const nodes = ref([]);
const container = ref(null);
const card = ref(null);

// 表单数据
const routeForm = ref({
  startId: null,
  endId: null,
  branchCount: 0,
  branchConfigs: [],
});

// 节点选项、道岔数量选项、道岔型号选项
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
];
const directionOptions = [
  { label: '1号道岔', value: 'turnout1', turnoutName: 'SC330 道岔' },
  { label: '2号道岔', value: 'turnout2', turnoutName: 'CZ577 道岔' },
  { label: '3号道岔', value: 'turnout3', turnoutName: '专线4257 道岔' },
  { label: '4号道岔', value: 'turnout4', turnoutName: 'SC340 渡线' },
];

// 验证所有道岔类型是否已选择
const allTurnoutsSelected = computed(() => {
  return routeForm.value.branchConfigs.every(branch => branch.type !== null);
});

// 获取道岔名称
const getTurnoutName = (type) => {
  const option = directionOptions.find(opt => opt.value === type);
  return option ? option.turnoutName : '';
};

// 获取道岔类型和名称
const getTurnoutLabelAndName = (type) => {
  const option = directionOptions.find(opt => opt.value === type);
  return option ? `${option.label} ${option.turnoutName}` : '';
};

// 监听道岔数量变化
watch(
  () => routeForm.value.branchCount,
  (newCount) => {
    const currentLength = routeForm.value.branchConfigs.length;
    if (newCount > currentLength) {
      for (let i = currentLength; i < newCount; i++) {
        routeForm.value.branchConfigs.push({ type: null });
      }
    } else if (newCount < currentLength) {
      routeForm.value.branchConfigs.splice(newCount);
    }
  }
);

// 节点宽度和高度（用于估算时间线尺寸）
const NODE_WIDTH = 150;
const NODE_HEIGHT = 100;
const PREVIEW_HEIGHT = 200;

// 生成线路
const generateRoute = () => {
  if (!allTurnoutsSelected.value) {
    window.$message.error('请为所有道岔选择型号');
    return;
  }

  nodes.value = [];

  const { startId, endId, branchCount, branchConfigs } = routeForm.value;

  if (!startId || !endId) {
    window.$message.error('请选择起点和终点');
    return;
  }

  const isCircular = startId === endId;
  const totalNodes = branchCount + (isCircular ? 1 : 2);

  // 生成节点
  for (let i = 0; i < totalNodes; i++) {
    let node;
    if (i === 0) {
      node = {
        id: i,
        content: `站点${startId}`,
        type: 'main',
        mileage: '0',
      };
    } else if (i === totalNodes - 1 && !isCircular) {
      node = {
        id: i,
        content: `站点${endId}`,
        type: 'main',
        mileage: `${(i * 100).toFixed(1)}`,
      };
    } else {
      const branchIndex = isCircular ? i : i - 1;
      node = {
        id: i,
        content: `道岔${branchIndex + 1}`,
        type: 'branch',
        direction: branchConfigs[branchIndex].type,
      };
    }
    nodes.value.push(node);
  }
};

// 保存到本地
const saveToLocal = () => {
  const data = {
    nodes: nodes.value,
    routeForm: routeForm.value,
  };
  localStorage.setItem('routeData', JSON.stringify(data));
  window.$message.success('线路图已保存到本地');
};

// 读取本地数据
const loadFromLocal = () => {
  const savedData = localStorage.getItem('routeData');
  if (savedData) {
    const data = JSON.parse(savedData);
    nodes.value = data.nodes;
    routeForm.value = { ...routeForm.value, ...data.routeForm };
    nextTick(() => generateRoute());
  }
};

// 重置表单
const resetForm = () => {
  routeForm.value = {
    startId: null,
    endId: null,
    branchCount: 0,
    branchConfigs: [],
  };
  nodes.value = [];
};

// 生命周期钩子
onMounted(() => {
  loadFromLocal();
});
</script>

<style scoped>
.preview-container {
  position: relative;
  width: 100%;
  height: 150px;
  border: 1px solid #ccc;
  overflow-x: auto;
  overflow-y: hidden;
  background: #f9f9f9;
  padding: 20px;
}

.preview-content {
  width: fit-content;
  height: fit-content;
  min-width: 100%;
}

.n-timeline {
  padding: 0 10px;
  white-space: nowrap;
}

.n-timeline-item {
  min-width: 150px;
  display: inline-block;
}

.preview-container::-webkit-scrollbar {
  height: 8px;
}

.preview-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* 道岔表单样式 */
.turnout-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 8px;
}

.turnout-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  transition: all 0.2s;
}

.turnout-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.turnout-item .n-form-item__label {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.turnout-name {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  text-align: left;
}
</style>
