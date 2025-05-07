<template>
    <CommonPage>

        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        SC330 道岔道尺报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
        </div>
        <n-data-table :columns="columns" :data="data" :bordered="true" :single-line="false" :max-height="600" />

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
        title: '量测点数',
        key: 'point',
        align: 'center',
        width: 100,
        // For visual grouping, you might need custom cell rendering or data preprocessing
        // Naive UI does not natively support rowspan based on data values in standard columns
    },
    {
        title: '位置',
        key: 'position',
        align: 'center',
        width: 150,
        // For visual grouping, similar to '量测点数'
    },
    {
        title: '轨向',
        key: 'direction',
        align: 'center',
        width: 80,
        // For visual grouping
    },
    {
        title: '轨枕序号',
        key: 'sleeper',
        align: 'center',
        width: 100,
        // For visual grouping
    },
    {
        title: '测量参数',
        key: 'measurement', // Parent key, not directly used for data
        align: 'center',
        children: [
            {
                title: '参数名称',
                key: 'paramName',
                align: 'center',
                width: 120,
            },
            {
                title: '参数值',
                key: 'paramValue',
                align: 'center',
                width: 100,
            },
        ],
    },
];

const data = ref([
    { key: 1, point: 'S1', position: '尖轨轨顺坡终点', direction: 'A股', sleeper: '第1号枕', paramName: '轨距', paramValue: '**' },
    { key: 2, point: 'S1', position: '尖轨轨顺坡终点', direction: 'A股', sleeper: '第1号枕', paramName: '水平', paramValue: '**' },
    { key: 3, point: 'S2', position: '尖轨尖端', direction: '', sleeper: '第6号枕', paramName: '轨距', paramValue: '**' },
    { key: 4, point: 'S2', position: '尖轨尖端', direction: '', sleeper: '第6号枕', paramName: '水平', paramValue: '**' },
    { key: 5, point: 'S2', position: '尖轨尖端', direction: '', sleeper: '第6号枕', paramName: '密贴', paramValue: '**' },
    { key: 6, point: 'S3', position: '尖轨中前', direction: 'B股', sleeper: '第11-12号枕', paramName: '轨距', paramValue: '**' },
    { key: 7, point: 'S3', position: '尖轨中前', direction: 'B股', sleeper: '第11-12号枕', paramName: '水平', paramValue: '**' },
    { key: 8, point: 'S4', position: '尖轨中', direction: 'B股', sleeper: '第15号枕', paramName: '轨距', paramValue: '**' },
    { key: 9, point: 'S4', position: '尖轨中', direction: 'B股', sleeper: '第15号枕', paramName: '水平', paramValue: '**' },
    { key: 10, point: 'S5', position: '尖轨中后', direction: 'B股', sleeper: '第21号枕', paramName: '轨距', paramValue: '**' },
    { key: 11, point: 'S5', position: '尖轨中后', direction: 'B股', sleeper: '第21号枕', paramName: '水平', paramValue: '**' },
    { key: 12, point: 'S6', position: '尖轨跟端直线股', direction: 'A股', sleeper: '第26号枕', paramName: '轨距', paramValue: '**' },
    { key: 13, point: 'S6', position: '尖轨跟端直线股', direction: 'A股', sleeper: '第26号枕', paramName: '水平', paramValue: '**' },
    { key: 14, point: 'S7', position: '尖轨跟端曲线股', direction: 'B股', sleeper: '第26号枕', paramName: '轨距', paramValue: '**' },
    { key: 15, point: 'S7', position: '尖轨跟端曲线股', direction: 'B股', sleeper: '第26号枕', paramName: '水平', paramValue: '**' },
    { key: 16, point: 'S8', position: '导曲部分直线股前部', direction: 'A股', sleeper: '第32号枕', paramName: '轨距', paramValue: '**' },
    { key: 17, point: 'S8', position: '导曲部分直线股前部', direction: 'A股', sleeper: '第32号枕', paramName: '水平', paramValue: '**' },
    { key: 18, point: 'S9', position: '导曲部分曲线股前部', direction: 'B股', sleeper: '第32号枕', paramName: '轨距', paramValue: '**' },
    { key: 19, point: 'S9', position: '导曲部分曲线股前部', direction: 'B股', sleeper: '第32号枕', paramName: '水平', paramValue: '**' },
    { key: 20, point: 'S10', position: '内配轨接头直线股', direction: 'A股', sleeper: '第38号枕', paramName: '轨距', paramValue: '**' },
    { key: 21, point: 'S10', position: '内配轨接头直线股', direction: 'A股', sleeper: '第38号枕', paramName: '水平', paramValue: '**' },
    { key: 22, point: 'S11', position: '内配轨接头曲线股', direction: 'B股', sleeper: '第38号枕', paramName: '轨距', paramValue: '**' },
    { key: 23, point: 'S11', position: '内配轨接头曲线股', direction: 'B股', sleeper: '第38号枕', paramName: '水平', paramValue: '**' },
    { key: 24, point: 'S12', position: '导曲部分直线股后部', direction: 'A股', sleeper: '第46号枕', paramName: '轨距', paramValue: '**' },
    { key: 25, point: 'S12', position: '导曲部分直线股后部', direction: 'A股', sleeper: '第46号枕', paramName: '水平', paramValue: '**' },
    { key: 26, point: 'S13', position: '导曲部分曲线股后部', direction: 'B股', sleeper: '第46号枕', paramName: '轨距', paramValue: '**' },
    { key: 27, point: 'S13', position: '导曲部分曲线股后部', direction: 'B股', sleeper: '第46号枕', paramName: '水平', paramValue: '**' },
    { key: 28, point: 'S14', position: '直线股辙叉前', direction: 'A股', sleeper: '第54号枕', paramName: '轨距', paramValue: '**' },
    { key: 29, point: 'S14', position: '直线股辙叉前', direction: 'A股', sleeper: '第54号枕', paramName: '水平', paramValue: '**' },
    { key: 30, point: 'S15', position: '直线股辙叉中', direction: 'A股', sleeper: '第57-58号枕', paramName: '轨距', paramValue: '**' },
    { key: 31, point: 'S15', position: '直线股辙叉中', direction: 'A股', sleeper: '第57-58号枕', paramName: '水平', paramValue: '**' },
    { key: 32, point: 'S15', position: '直线股辙叉中', direction: 'A股', sleeper: '第57-58号枕', paramName: '查照距离', paramValue: '**' },
    { key: 33, point: 'S15', position: '直线股辙叉中', direction: 'A股', sleeper: '第57-58号枕', paramName: '护背距离', paramValue: '**' },
    { key: 34, point: 'S16', position: '直线股辙叉后', direction: 'A股', sleeper: '第63号枕', paramName: '轨距', paramValue: '**' },
    { key: 35, point: 'S16', position: '直线股辙叉后', direction: 'A股', sleeper: '第63号枕', paramName: '水平', paramValue: '**' },
    { key: 36, point: 'S17', position: '曲线股辙叉前', direction: 'B股', sleeper: '第63号枕', paramName: '轨距', paramValue: '**' },
    { key: 37, point: 'S17', position: '曲线股辙叉前', direction: 'B股', sleeper: '第63号枕', paramName: '水平', paramValue: '**' },
    { key: 38, point: 'S18', position: '曲线股辙叉中', direction: 'B股', sleeper: '第57-58号枕', paramName: '轨距', paramValue: '**' },
    { key: 39, point: 'S18', position: '曲线股辙叉中', direction: 'B股', sleeper: '第57-58号枕', paramName: '水平', paramValue: '**' },
    { key: 40, point: 'S18', position: '曲线股辙叉中', direction: 'B股', sleeper: '第57-58号枕', paramName: '查照距离', paramValue: '**' },
    { key: 41, point: 'S18', position: '曲线股辙叉中', direction: 'B股', sleeper: '第57-58号枕', paramName: '护背距离', paramValue: '**' },
    { key: 42, point: 'S19', position: '曲线股辙叉后', direction: 'B股', sleeper: '第54号枕', paramName: '轨距', paramValue: '**' },
    { key: 43, point: 'S19', position: '曲线股辙叉后', direction: 'B股', sleeper: '第54号枕', paramName: '水平', paramValue: '**' },
]);



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