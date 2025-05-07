<!-- <template>
    <CommonPage>

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



const showSearchForm = ref(false)


function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
}



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


const pagination = {
    pageSize: 10,
}


const searchForm = ref({
    lineNo: '',
    lineName: '',
    startMileage: '',
    endMileage: '',
    direction: '',
    curveDirection: '',
    gaugeType: '',
})


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


function handleSearch() {

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
</script> -->


<template>
    <CommonPage>
        <div>
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                            @click="toggleSearchForm">
                            区段小结报表
                        </div>
                    </template>
                    点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
                </n-tooltip>
            </div>

            <div class="report-info">
                <div>区段起点: {{ reportInfo.startPoint }}</div>
                <div>区段终点: {{ reportInfo.endPoint }}</div>
                <div>检察人员: {{ reportInfo.inspector }}</div>
                <div>检测日期: {{ reportInfo.inspectionDate }}</div>
                <div>{{ reportInfo.lineInfoLabel }}: {{ reportInfo.lineInfoValue }}</div>
            </div>

            <n-data-table :columns="columns" :data="data" :bordered="true" :single-line="false" />
        </div>
    </CommonPage>

</template>

<script setup>
import { ref } from 'vue';
import { NDataTable } from 'naive-ui';

// 定义表格的列配置 (纯 JavaScript 对象数组)
const columns = [
    {
        title: '项目', // 左侧第一列的标题
        key: 'itemName',
        fixed: 'left', // 固定在左侧，可选
        width: 100 // 可选：设置列宽
    },
    {
        title: '作业验收',
        key: 'jobAcceptance', // 父级列的 key，不直接对应数据
        align: 'center', // 父级列标题居中
        children: [
            {
                title: '点数',
                key: 'jobPoints',
                width: 80, // 可选：设置列宽
                align: 'center' // 内容居中
            },
            {
                title: '延长',
                key: 'jobExtension',
                width: 80,
                align: 'center'
            }
        ]
    },
    {
        title: '综合保养',
        key: 'comprehensiveMaintenance',
        align: 'center',
        children: [
            {
                title: '点数',
                key: 'compPoints',
                width: 80,
                align: 'center'
            },
            {
                title: '延长',
                key: 'compExtension',
                width: 80,
                align: 'center'
            }
        ]
    },
    {
        title: '临时补修',
        key: 'temporaryRepair',
        align: 'center',
        children: [
            {
                title: '点数',
                key: 'tempPoints',
                width: 80,
                align: 'center'
            },
            {
                title: '延长',
                key: 'tempExtension',
                width: 80,
                align: 'center'
            }
        ]
    },
    {
        title: '四级超限',
        key: 'level4Overlimit',
        align: 'center',
        children: [
            {
                title: '点数',
                key: 'level4Points',
                width: 80,
                align: 'center'
            },
            {
                title: '延长',
                key: 'level4Extension',
                width: 80,
                align: 'center'
            }
        ]
    },
    {
        title: '扣分',
        key: 'deduction',
        width: 80,
        align: 'center'
    },
    {
        title: '百分比',
        key: 'percentage',
        width: 100,
        align: 'center'
    }
];

// 定义表格数据，使用 ref 使其具有响应性 (纯 JavaScript 对象数组)
const data = ref([
    {
        key: 1,
        itemName: '轨距',
        jobPoints: 10,
        jobExtension: 5,
        compPoints: 8,
        compExtension: 4,
        tempPoints: 2,
        tempExtension: 1,
        level4Points: 1,
        level4Extension: 0.5,
        deduction: 2,
        percentage: '98%',
    },
    {
        key: 2,
        itemName: '轨距变化率',
        jobPoints: 12,
        jobExtension: 6,
        compPoints: 9,
        compExtension: 4.5,
        tempPoints: 3,
        tempExtension: 1.5,
        level4Points: 0,
        level4Extension: 0,
        deduction: 1,
        percentage: '99%',
    },
    {
        key: 3,
        itemName: '水平',
        jobPoints: 15,
        jobExtension: 7.5,
        compPoints: 10,
        compExtension: 5,
        tempPoints: 1,
        tempExtension: 0.5,
        level4Points: 0,
        level4Extension: 0,
        deduction: 0,
        percentage: '100%',
    },
    {
        key: 4,
        itemName: '三角坑',
        jobPoints: 5,
        jobExtension: 2.5,
        compPoints: 3,
        compExtension: 1.5,
        tempPoints: 0,
        tempExtension: 0,
        level4Points: 2,
        level4Extension: 1,
        deduction: 5,
        percentage: '95%',
    },
    {
        key: 5,
        itemName: '右高低',
        jobPoints: 8,
        jobExtension: 4,
        compPoints: 6,
        compExtension: 3,
        tempPoints: 1,
        tempExtension: 0.5,
        level4Points: 0,
        level4Extension: 0,
        deduction: 1,
        percentage: '99%',
    },
    {
        key: 6,
        itemName: '右轨向',
        jobPoints: 7,
        jobExtension: 3.5,
        compPoints: 5,
        compExtension: 2.5,
        tempPoints: 0,
        tempExtension: 0,
        level4Points: 1,
        level4Extension: 0.5,
        deduction: 2,
        percentage: '98%',
    },
    {
        key: 7,
        itemName: '右正矢',
        jobPoints: 6,
        jobExtension: 3,
        compPoints: 4,
        compExtension: 2,
        tempPoints: 0,
        tempExtension: 0,
        level4Points: 0,
        level4Extension: 0,
        deduction: 0,
        percentage: '100%',
    },
    {
        key: 8,
        itemName: '左高低',
        jobPoints: 9,
        jobExtension: 4.5,
        compPoints: 7,
        compExtension: 3.5,
        tempPoints: 1,
        tempExtension: 0.5,
        level4Points: 0,
        level4Extension: 0,
        deduction: 1,
        percentage: '99%',
    },
    {
        key: 9,
        itemName: '左轨向',
        jobPoints: 8,
        jobExtension: 4,
        compPoints: 6,
        compExtension: 3,
        tempPoints: 0,
        tempExtension: 0,
        level4Points: 1,
        level4Extension: 0.5,
        deduction: 2,
        percentage: '98%',
    },
    {
        key: 10,
        itemName: '左正矢',
        jobPoints: 7,
        jobExtension: 3.5,
        compPoints: 5,
        compExtension: 2.5,
        tempPoints: 0,
        tempExtension: 0,
        level4Points: 0,
        level4Extension: 0,
        deduction: 0,
        percentage: '100%',
    },
]);

// 报表顶部信息，使用 ref 使其具有响应性 (纯 JavaScript 对象)
const reportInfo = ref({
    startPoint: 'XXX',
    endPoint: 'YYY',
    inspector: '张三',
    inspectionDate: '2023-10-27',
    lineInfoLabel: 'XXX线',
    lineInfoValue: '上行',
});

</script>

<style scoped>
/* 为报表顶部信息添加一些样式 */
.report-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    /* 响应式布局 */
    gap: 10px;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 5px;
    background-color: #f9f9f9;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
}
</style>