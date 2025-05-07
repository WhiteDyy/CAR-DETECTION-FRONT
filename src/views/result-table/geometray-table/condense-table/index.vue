<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        压缩报表
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
// 定义表格列
const columns = [
    {
        title: '实测里程 (km)',
        key: 'actualMileage',
        width: 120,
        align: 'center',
        render: row =>
            h(
                NTooltip,
                { trigger: 'hover' },
                {
                    default: () => row.actualMileage,
                    trigger: () =>
                        h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.actualMileage),
                },
            ),
    },
    { title: '标示里程 (km)', align: 'center', key: 'indicatedMileage', width: 120 },
    { title: '实测轨距 (mm)', align: 'center', key: 'actualGauge', width: 120 },
    { title: '轨距变化率 (mm)', align: 'center', key: 'gaugeChangeRate', width: 120 },
    { title: '实测水平 (mm)', align: 'center', key: 'actualLevel', width: 120 },
    { title: '三角坑 (mm)', align: 'center', key: 'triangularPit', width: 120 },
    { title: '实测右高低 (mm)', align: 'center', key: 'rightHeight', width: 120 },
    { title: '实测右轨向 (正矢) (mm)', align: 'center', key: 'rightTrackDirection', width: 140 },
    { title: '实测左高低 (mm)', align: 'center', key: 'leftHeight', width: 120 },
    { title: '实测左轨向 (正矢) (mm)', align: 'center', key: 'leftTrackDirection', width: 140 },
    { title: '左轨横向调整量 (mm)', align: 'center', key: 'leftTrackAdjustment', width: 140 },
    { title: '右轨横向调整量 (mm)', align: 'center', key: 'rightTrackAdjustment', width: 140 },
]

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => ({
    actualMileage: (100.12345 + index * 0.1).toFixed(5),
    indicatedMileage: (100.22345 + index * 0.1).toFixed(5),
    actualGauge: (1435 + index * 0.5).toFixed(2),
    gaugeChangeRate: (0.1 + index * 0.05).toFixed(2),
    actualLevel: (0 + index * 0.2).toFixed(2),
    triangularPit: (0 + index * 0.3).toFixed(2),
    rightHeight: (0 + index * 0.4).toFixed(2),
    rightTrackDirection: (0 + index * 0.5).toFixed(2),
    leftHeight: (0 + index * 0.4).toFixed(2),
    leftTrackDirection: (0 + index * 0.5).toFixed(2),
    leftTrackAdjustment: (0 + index * 0.2).toFixed(2),
    rightTrackAdjustment: (0 + index * 0.2).toFixed(2),
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