<template>
    <CommonPage title="道岔设计">
        <NCard>
            <NSpace vertical>
                <!-- 画布区域 -->
                <div class="canvas-container">
                    <canvas ref="canvas" width="800" height="500" />
                </div>

                <!-- 控制面板 -->
                <NCard title="道岔设计工具" style="margin-top: 20px;">
                    <NSpace vertical>
                        <NSpace align="center">
                            <NText>道岔类型:</NText>
                            <NSelect v-model:value="turnoutType" :options="turnoutTypes" style="width: 200px;" />
                            <!-- 新增开向选择 -->
                            <NText style="margin-left: 20px;">
                                开向:
                            </NText>
                            <NSelect v-model:value="turnoutDirection" :options="directionTypes" style="width: 120px;" />
                        </NSpace>

                        <NDivider />

                        <NSpace align="center">
                            <NText>添加区域:</NText>
                            <NInput v-model:value="newArea.name" placeholder="区域名称" style="width: 120px;" />
                            <NSelect v-model:value="newArea.type" :options="areaTypes" style="width: 120px;"
                                placeholder="区域类型" />
                            <NInputNumber v-model:value="newArea.mileage" placeholder="里程(mm)" :min="0"
                                style="width: 120px;" />
                            <NInputNumber v-model:value="newArea.gauge" placeholder="轨距(mm)" :min="1000" :max="2000"
                                style="width: 120px;" />
                            <NButton @click="addArea">
                                添加区域
                            </NButton>
                        </NSpace>

                        <NDivider />

                        <NList bordered>
                            <NListItem v-for="(area, index) in areas" :key="index">
                                <NSpace justify="space-between" align="center">
                                    <NSpace vertical>
                                        <NText strong>
                                            {{ area.name }} ({{ area.type }})
                                        </NText>
                                        <NText depth="3">
                                            里程: {{ area.mileage }}mm, 轨距: {{ area.gauge }}mm
                                        </NText>
                                    </NSpace>
                                    <NButton size="small" type="error" @click="removeArea(index)">
                                        删除
                                    </NButton>
                                </NSpace>
                            </NListItem>
                        </NList>

                        <NSpace justify="end" style="margin-top: 20px;">
                            <NButton @click="cancelDesign">
                                取消
                            </NButton>
                            <NButton type="primary" :disabled="areas.length === 0" @click="saveTurnout">
                                保存道岔
                            </NButton>
                        </NSpace>
                    </NSpace>
                </NCard>
            </NSpace>
        </NCard>
    </CommonPage>
</template>

<script setup>
import {
    NButton,
    NCard,
    NDivider,
    NInput,
    NInputNumber,
    NList,
    NListItem,
    NSelect,
    NSpace,
    NText,
} from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 画布引用
const canvas = ref(null)

// 道岔类型
const turnoutType = ref('simple')
// 新增道岔开向
const turnoutDirection = ref('left')
const turnoutTypes = [
    { label: '单开道岔', value: 'simple' },
    { label: '对称道岔', value: 'symmetrical' },
    { label: '复合道岔', value: 'complex' },
]
// 新增开向选项
const directionTypes = [
    { label: '左开道岔', value: 'left' },
    { label: '右开道岔', value: 'right' },
]

// 区域类型
const areaTypes = [
    { label: '主线', value: 'main' },
    { label: '分叉线', value: 'branch' },
    { label: '连接线', value: 'connector' },
]

// 新区域表单
const newArea = ref({
    name: '',
    type: '',
    mileage: 0,
    gauge: 1435,
    description: '',
})

// 区域列表
const areas = ref([])

// 添加区域
function addArea() {
    if (!newArea.value.name || !newArea.value.type) {
        window.$message.warning('请填写区域名称和类型')
        return
    }

    areas.value.push({ ...newArea.value })
    newArea.value = { name: '', type: '', mileage: 0, gauge: 1435, description: '' }
    drawTurnout()
}

// 删除区域
function removeArea(index) {
    areas.value.splice(index, 1)
    drawTurnout()
}

// 绘制道岔
function drawTurnout() {
    const ctx = canvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    // 新的绘制逻辑
    const startX = 100
    const startY = 300
    const mainLineLength = 600

    // 绘制主线（直线轨道）
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(startX + mainLineLength, startY)
    ctx.strokeStyle = '#409EFF'
    ctx.lineWidth = 3
    ctx.stroke()

    // 绘制分叉线（曲轨）
    areas.value.forEach((area, index) => {
        if (area.type === 'branch') {
            ctx.beginPath()
            ctx.moveTo(startX + index * 50, startY)

            // 根据开向设置控制点
            const controlX = turnoutDirection.value === 'left'
                ? startX + index * 50 - 100
                : startX + index * 50 + 100

            ctx.quadraticCurveTo(
                controlX,
                startY - 150,
                startX + index * 50 + (turnoutDirection.value === 'left' ? -50 : 50),
                startY - 200,
            )
            ctx.strokeStyle = '#67C23A'
            ctx.lineWidth = 2
            ctx.stroke()

            // 绘制连接点（圆点）
            ctx.beginPath()
            ctx.arc(startX + index * 50, startY, 3, 0, Math.PI * 2)
            ctx.fillStyle = '#ff0000'
            ctx.fill()
        }
    })
}

// 保存道岔
function saveTurnout() {
    const turnout = {
        id: `turnout_${Date.now()}`,
        name: `${turnoutTypes.find(t => t.value === turnoutType.value).label}`,
        type: 'turnout',
        areas: [...areas.value],
    }

    // 保存到本地存储 (实际应用中应该保存到API)
    const savedTurnouts = JSON.parse(localStorage.getItem('saved-turnouts') || '[]')
    savedTurnouts.push(turnout)
    localStorage.setItem('saved-turnouts', JSON.stringify(savedTurnouts))

    window.$message.success('道岔已保存')
    router.push('/task-edit')
}

// 取消设计
function cancelDesign() {
    router.push('/task-edit')
}

// 初始化画布
onMounted(() => {
    drawTurnout()
})
</script>

<style scoped>
.canvas-container {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
}

canvas {
    background-color: #f9f9f9;
    display: block;
}
</style>
