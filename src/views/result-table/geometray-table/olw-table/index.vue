<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        {{ selectedType }}
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
            <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect">
                <n-button style="margin-left: 16px;" type="primary">
                    切换表格
                </n-button>
            </n-dropdown>
        </div>

        <!-- Description List -->

        <!-- 搜索表单 -->
        <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-grid :cols="4" :x-gap="12" :y-gap="8">
                <n-form-item-gi label="线路名">
                    <n-input v-model:value="searchForm.lineName" placeholder="请输入线路名" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="里程">
                    <n-input v-model:value="searchForm.mileage" placeholder="请输入里程" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="轨枕号">
                    <n-input v-model:value="searchForm.sleeperNo" placeholder="请输入轨枕号" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="行别">
                    <n-input v-model:value="searchForm.direction" placeholder="请输入行别" clearable />
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
import { h, ref, computed } from 'vue';
import { NButton, NTooltip, NDataTable, NForm, NFormItemGi, NInput, NGrid, NSpace } from 'naive-ui';


const dropdownOptions = [
    { label: '10米长波报表', key: '10米长波报表' },
    { label: '20米长波报表', key: '20米长波报表' },
    { label: '30米长波报表', key: '30米长波报表' },
    { label: '40米长波报表', key: '40米长波报表' },
    { label: '50米长波报表', key: '50米长波报表' },
    { label: '60米长波报表', key: '60米长波报表' },
    { label: '70米长波报表', key: '70米长波报表' },
]

// State for selected table type
const selectedType = ref('10米长波报表')

// Handle dropdown selection
const handleDropdownSelect = (key) => {
    selectedType.value = key
}


// 控制搜索表单显示状态
const showSearchForm = ref(false);

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value;
}

// Inspection info for description list
const inspectionInfo = ref({});

// 定义表格列
const columns = [
    {
        title: () => h('div', [
            h('div', '里程'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'km'),
        ]),
        key: 'mileage',
        width: 100,
        render: row =>
            h(
                NTooltip,
                { trigger: 'hover' },
                {
                    default: () => row.mileage,
                    trigger: () =>
                        h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.mileage),
                },
            ),
    },
    {
        title: '轨枕号',
        key: 'sleeperNo',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', '高低设计偏差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'heightDesignDeviation',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '轨向设计偏差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'trackDesignDeviation',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '左高低实测'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'leftHeightActual',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '左高低偏差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'leftHeightDeviation',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '右高低实测'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'rightHeightActual',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '右高低偏差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'rightHeightDeviation',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '左轨向实测'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'leftTrackActual',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '左轨向偏差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'leftTrackDeviation',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '右轨向实测'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'rightTrackActual',
        width: 120
    },
    {
        title: () => h('div', [
            h('div', '右轨向偏差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'rightTrackDeviation',
        width: 120
    },
];

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => {
    const data = {
        lineName: `线路${index + 1}`,
        direction: index % 2 === 0 ? '上行' : '下行',
        mileage: (100.12345 + index * 0.1).toFixed(5),
        sleeperNo: `SP${index + 1}`,
        heightDesignDeviation: (0.5 + index * 0.1).toFixed(2),
        trackDesignDeviation: (0.4 + index * 0.1).toFixed(2),
        leftHeightActual: (1.0 + index * 0.2).toFixed(2),
        leftHeightDeviation: (0.2 + index * 0.05).toFixed(2),
        rightHeightActual: (1.1 + index * 0.2).toFixed(2),
        rightHeightDeviation: (0.3 + index * 0.05).toFixed(2),
        leftTrackActual: (0.8 + index * 0.1).toFixed(2),
        leftTrackDeviation: (0.1 + index * 0.05).toFixed(2),
        rightTrackActual: (0.9 + index * 0.1).toFixed(2),
        rightTrackDeviation: (0.15 + index * 0.05).toFixed(2),
        inspectionDate: `2025-05-${String(index + 1).padStart(2, '0')}`,
        inspector: `检查员${index + 1}`,
    };
    // Set inspection info with description list fields (first row)
    if (index === 0) {
        inspectionInfo.value = {
            inspectionDate: data.inspectionDate,
            inspector: data.inspector,
            lineName: data.lineName,
            direction: data.direction,
            designRadius: (500 + index * 10).toFixed(2),
            actualRadius: (505 + index * 10).toFixed(2),
            curveLength: (200 + index * 5).toFixed(2),
            circularCurveLength: (150 + index * 3).toFixed(2),
            transitionCurveLength: (50 + index * 2).toFixed(2),
            designSuperelevation: (100 + index * 2).toFixed(2),
            vmax: (120 + index * 5).toFixed(2),
        };
    }
    return data;
});

// 分页配置
const pagination = {
    pageSize: 10,
};

// 搜索表单数据
const searchForm = ref({
    lineName: '',
    mileage: '',
    sleeperNo: '',
    direction: '',
});

// 过滤后的数据
const filteredData = computed(() => {
    return tableData.filter((item) => {
        const {
            lineName,
            mileage,
            sleeperNo,
            direction,
        } = searchForm.value;

        return (
            (!lineName || item.lineName.toLowerCase().includes(lineName.toLowerCase())) &&
            (!mileage || Number(item.mileage) >= Number(mileage)) &&
            (!sleeperNo || item.sleeperNo.toLowerCase().includes(sleeperNo.toLowerCase())) &&
            (!direction || item.direction.toLowerCase().includes(direction.toLowerCase()))
        );
    });
});

// 搜索和重置
function handleSearch() {
    // 触发 filteredData 的重新计算
}

function resetSearch() {
    searchForm.value = {
        lineName: '',
        mileage: '',
        sleeperNo: '',
        direction: '',
    };
}
</script>

<style scoped>
.track-inspection-table {
    padding: 16px;
}

.description-list dl {
    margin: 0;
}

.description-list dt {
    margin-bottom: 4px;
}

.description-list dd {
    margin: 0;
    color: #555;
}
</style>