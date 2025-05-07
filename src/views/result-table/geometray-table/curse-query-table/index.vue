<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        曲线查询表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
        </div>
        <!-- 搜索表单 -->
        <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-grid :cols="4" :x-gap="12" :y-gap="8">
                <n-form-item-gi label="线编号">
                    <n-input v-model:value="searchForm.lineNo" placeholder="请输入线编号" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="线路名">
                    <n-input v-model:value="searchForm.lineName" placeholder="请输入线路名" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="起点里程">
                    <n-input v-model:value="searchForm.startMileage" placeholder="请输入起点里程" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="终点里程">
                    <n-input v-model:value="searchForm.endMileage" placeholder="请输入终点里程" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="行别">
                    <n-input v-model:value="searchForm.direction" placeholder="请输入行别" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="曲线方向">
                    <n-input v-model:value="searchForm.curveDirection" placeholder="请输入曲线方向" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="轨距类型">
                    <n-input v-model:value="searchForm.gaugeType" placeholder="请输入轨距类型" clearable />
                </n-form-item-gi>
                <n-form-item-gi>
                    <n-space>
                        <n-button type="primary" @click="handleSearch">
                            搜索
                        </n-button>
                        <n-button @click="resetSearch">
                            重置
                        </n-button>
                    </n-space>
                </n-form-item-gi>
            </n-grid>
        </n-form>

        <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" :bordered="true"
            :single-line="false" />
    </CommonPage>
</template>

<script setup>
import { h, ref, computed } from 'vue'
import { NButton, NTooltip } from 'naive-ui'


// 控制搜索表单显示状态
const showSearchForm = ref(false)

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
}


// 定义表格列
const columns = [
    {
        title: '线编号',
        key: 'lineNo',
        width: 120,
        render: row =>
            h(
                NTooltip,
                { trigger: 'hover' },
                {
                    default: () => row.lineNo,
                    trigger: () =>
                        h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.lineNo),
                },
            ),
    },
    { title: '行别', key: 'direction', width: 100 },
    { title: '线路名', key: 'lineName', width: 150 },
    { title: '起点里程', key: 'startMileage', width: 120 },
    { title: '终点里程', key: 'endMileage', width: 120 },
    { title: '曲线方向', key: 'curveDirection', width: 120 },
    { title: '曲线半径', key: 'curveRadius', width: 120 },
    { title: '转向角', key: 'turningAngle', width: 100 },
    { title: '轨距类型', key: 'gaugeType', width: 120 },
    { title: '轨距加宽', key: 'gaugeWidening', width: 120 },
    { title: '超高', key: 'superelevation', width: 100 },
    { title: '顺坡率', key: 'gradientRate', width: 100 },
    { title: '起点切线长', key: 'startTangentLength', width: 140 },
    { title: '起缓和线长', key: 'startTransitionLength', width: 140 },
    { title: '终缓和线长', key: 'endTransitionLength', width: 140 },
    { title: '终点切线长', key: 'endTangentLength', width: 140 },
    { title: '曲线全长', key: 'totalCurveLength', width: 120 },
    { title: '平均速度', key: 'averageSpeed', width: 120 },
]

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => ({
    lineNo: `LN00${index + 1}`,
    direction: index % 2 === 0 ? '上行' : '下行',
    lineName: `线路${index + 1}`,
    startMileage: (100.12345 + index * 10).toFixed(5),
    endMileage: (110.12345 + index * 10).toFixed(5),
    curveDirection: index % 2 === 0 ? '左曲' : '右曲',
    curveRadius: (500 + index * 50).toFixed(2),
    turningAngle: (15 + index * 2).toFixed(2),
    gaugeType: `GT${index % 3 + 1}`,
    gaugeWidening: (5 + index * 0.5).toFixed(2),
    superelevation: (100 + index * 10).toFixed(2),
    gradientRate: (0.5 + index * 0.1).toFixed(2),
    startTangentLength: (50 + index * 5).toFixed(2),
    startTransitionLength: (30 + index * 3).toFixed(2),
    endTransitionLength: (30 + index * 3).toFixed(2),
    endTangentLength: (50 + index * 5).toFixed(2),
    totalCurveLength: (200 + index * 20).toFixed(2),
    averageSpeed: (80 + index * 5).toFixed(2),
}))

// 分页配置
const pagination = {
    pageSize: 10,
}

// 搜索表单数据
const searchForm = ref({
    lineNo: '',
    lineName: '',
    startMileage: '',
    endMileage: '',
    direction: '',
    curveDirection: '',
    gaugeType: '',
})

// 过滤后的数据
const filteredData = computed(() => {
    return tableData.filter((item) => {
        const {
            lineNo,
            lineName,
            startMileage,
            endMileage,
            direction,
            curveDirection,
            gaugeType,
        } = searchForm.value

        return (
            (!lineNo || item.lineNo.toLowerCase().includes(lineNo.toLowerCase())) &&
            (!lineName || item.lineName.toLowerCase().includes(lineName.toLowerCase())) &&
            (!startMileage || Number(item.startMileage) >= Number(startMileage)) &&
            (!endMileage || Number(item.endMileage) <= Number(endMileage)) &&
            (!direction || item.direction.toLowerCase().includes(direction.toLowerCase())) &&
            (!curveDirection || item.curveDirection.toLowerCase().includes(curveDirection.toLowerCase())) &&
            (!gaugeType || item.gaugeType.toLowerCase().includes(gaugeType.toLowerCase()))
        )
    })
})

// 搜索和重置
function handleSearch() {
    // 触发 filteredData 的重新计算
}

function resetSearch() {
    searchForm.value = {
        lineNo: '',
        lineName: '',
        startMileage: '',
        endMileage: '',
        idom: '',
        curveDirection: '',
        gaugeType: '',
    }
}
</script>