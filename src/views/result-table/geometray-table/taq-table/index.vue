<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        轨道调整量报表
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
        align: 'center',
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
    { title: '行别', align: 'center', key: 'direction', width: 100 },
    { title: '线路名', align: 'center', key: 'lineName', width: 150 },
    { title: '实测里程', align: 'center', key: 'startMileage', width: 120 },
    {
        title: '横向调整量', align: 'center', key: 'endMileage', width: 120,
        children: [
            { title: '左轨', align: 'center', key: 'leftAdjustment', width: 120 },
            { title: '右轨', align: 'center', key: 'rightAdjustment', width: 120 },
        ]
    },
    {
        title: '纵向调整量', align: 'center', key: 'longitudinalAdjustment', width: 120,
        children: [
            { title: '左轨', align: 'center', key: 'leftLongitudinalAdjustment', width: 120 },
            { title: '右轨', align: 'center', key: 'rightLongitudinalAdjustment', width: 120 },
        ]
    },
]

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => ({
    key: index, // Naive UI 推荐为每行数据提供一个唯一的 key
    lineNo: `LN${String(index + 1).padStart(3, '0')}`, // 格式化线编号
    direction: index % 2 === 0 ? '上行' : '下行',
    lineName: `线路${index + 1}`,
    startMileage: (100.12345 + index * 0.1).toFixed(5), // 示例实测里程
    leftAdjustment: (Math.random() * 5 - 2.5).toFixed(2), // 示例左轨横向调整量
    rightAdjustment: (Math.random() * 5 - 2.5).toFixed(2), // 示例右轨横向调整量
    leftLongitudinalAdjustment: (Math.random() * 8 - 4).toFixed(2), // 示例左轨纵向调整量
    rightLongitudinalAdjustment: (Math.random() * 8 - 4).toFixed(2), // 示例右轨纵向调整量

}));
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