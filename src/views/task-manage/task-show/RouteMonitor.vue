<!-- RouteMonitor.vue -->
<template>
    <div class="route-monitor">
        <div class="preview-container" ref="container">
            <div class="timeline-wrapper">
                <!-- 渲染节点 -->
                <div v-for="(node, index) in nodes" :key="index" class="timeline-node"
                    :class="{ 'main-node': node.type === 'main', 'branch-node': node.type === 'branch' }"
                    :style="getNodeStyle(node)">
                    <div class="timeline-dot"></div>
                    <div class="timeline-info">
                        <div>名称: {{ node.content }}</div>
                        <div>里程: {{ node.mileage }}</div>
                        <div>类型: {{ node.type === 'main' ? '主线' : '道岔' }}</div>
                    </div>
                </div>
                <!-- 渲染连接线 -->
                <div v-for="(connection, index) in connections" :key="'conn-' + index" class="connection-line"
                    :ref="el => connectionLines[index] = el">
                    <div class="progress-line" :style="getProgressStyle(connection)"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
    routeData: {
        type: Object,
        required: true,
        default: () => ({ nodes: [], connections: [] })
    },
    currentMileage: {
        type: Number,
        required: true,
        default: 0
    }
});

const nodes = ref([]);
const connections = ref([]);
const connectionLines = ref([]);
const container = ref(null);

// 初始化数据
const initData = () => {
    nodes.value = props.routeData.nodes;
    connections.value = props.routeData.connections.map(conn => ({
        ...conn,
        progress: 0,
        startMileage: nodes.value[conn.start].mileage,
        endMileage: nodes.value[conn.end].mileage
    }));
    nextTick(() => drawConnectionLines());
};

// 获取节点样式
const getNodeStyle = (node) => {
    return {
        left: `${node.x}px`,
        top: `${node.y}px`,
    };
};

// 获取连接线进度样式
const getProgressStyle = (connection) => {
    return {
        width: `${(connection.progress || 0) * 100}%`,
        background: '#00B42A' // 保持绿色
    };
};

// 绘制连接线
const drawConnectionLines = () => {
    connections.value.forEach((conn, index) => {
        const line = connectionLines.value[index];
        if (!line) return;

        const startNode = container.value.querySelectorAll('.timeline-node')[conn.start];
        const endNode = container.value.querySelectorAll('.timeline-node')[conn.end];
        if (!startNode || !endNode) return;

        const startDot = startNode.querySelector('.timeline-dot');
        const endDot = endNode.querySelector('.timeline-dot');
        const containerRect = container.value.getBoundingClientRect();

        const startRect = startDot.getBoundingClientRect();
        const endRect = endDot.getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2 - containerRect.left;
        const startY = startRect.top + startRect.height / 2 - containerRect.top;
        const endX = endRect.left + endRect.width / 2 - containerRect.left;
        const endY = endRect.top + endRect.height / 2 - containerRect.top;

        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

        line.style.width = `${length}px`;
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
    });
};

// 根据里程更新进度
const updateProgressByMileage = () => {
    const mileage = props.currentMileage;

    connections.value.forEach(conn => {
        const startMileage = Number(conn.startMileage);
        const endMileage = Number(conn.endMileage);

        if (mileage < startMileage) {
            conn.progress = 0;
        } else if (mileage >= endMileage) {
            conn.progress = 1;
        } else {
            // 计算当前连接线的进度
            const totalDistance = endMileage - startMileage;
            const currentDistance = mileage - startMileage;
            conn.progress = currentDistance / totalDistance;
        }
    });
};

// 监听里程变化
watch(() => props.currentMileage, () => {
    updateProgressByMileage();
});

// 监听路由数据变化
watch(() => props.routeData, () => {
    initData();
}, { deep: true });

onMounted(() => {
    initData();
});

onUnmounted(() => {
    // 清理工作如果需要
});
</script>

<style scoped>
.route-monitor {
    position: relative;
    width: 50%;
}

.preview-container {
    position: relative;
    width: 100%;
    height: 350px;
    border: 1px solid #ccc;
    overflow-x: auto;
    overflow-y: hidden;
    background: #f9f9f900;
    padding: 20px;
    display: flex;
    /* 使用 flex 布局 */
    justify-content: center;
    /* 水平居中 */
    min-width: 0;
    /* 防止溢出 */
}

.timeline-node {
    position: absolute;
    width: 120px;
    text-align: center;
}

.timeline-dot {
    width: 17px;
    height: 17px;
    border: 2px solid #999;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
}

.main-node .timeline-dot {
    border-color: #18a058;
}

.branch-node .timeline-dot {
    border-color: #fa2f14;
}

.timeline-info {
    position: absolute;
    top: 20px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
    color: #333;
}

.connection-line {
    position: absolute;
    background: #999;
    height: 2px;
    z-index: 1;
}

.progress-line {
    height: 100%;
    transition: width 0.1s linear;
}
</style>