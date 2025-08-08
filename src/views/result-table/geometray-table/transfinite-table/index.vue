<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top:-20px;"
                        @click="toggleSearchForm">
                        轨道超限报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
        </div>
        <!-- 搜索表单 -->
        <n-card v-if="showSearchForm" :bordered="true" class="card-style">
            <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
                :style="{ marginBottom: '16px'}">
                <n-grid :cols="4" :x-gap="12" :y-gap="8">
                    <n-form-item-gi label="标识位置">
                        <n-input v-model:value="searchForm.mileage" placeholder="请输入标识位置" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="线路特征">
                        <n-input v-model:value="searchForm.operators" placeholder="请输入线路特征" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="检测时间">
                        <n-input v-model:value="searchForm.inspectionTime" placeholder="请输入检测时间" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="负责人员">
                        <n-input v-model:value="searchForm.responsiblePerson" placeholder="请输入负责人员" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="轨距超限峰值">
                        <n-input v-model:value="searchForm.gaugeMeasured" placeholder="请输入轨距超限峰值" clearable />
                    </n-form-item-gi>
                    <!-- <n-form-item-gi label="轨距变化率">
                    <n-input v-model:value="searchForm.gaugeChangeRateMeasured" placeholder="请输入轨距变化率" clearable />
                </n-form-item-gi> -->
                    <n-form-item-gi label="水平超限峰值">
                        <n-input v-model:value="searchForm.levelMeasured" placeholder="请输入水平超限峰值" clearable />
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
        </n-card>

        <n-data-table :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
        <n-pagination v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
            :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
            style="margin-top: 16px; justify-content: center;" />
    </CommonPage>
</template>

<script setup>
import { h, onMounted, ref } from 'vue';
import { NButton, NTooltip, NForm, NFormItemGi, NInput, NGrid, NSpace, NDataTable } from 'naive-ui';
import api from './api'; // 使用默认导入，与 api.js 的默认导出一致

// 控制搜索表单显示状态
const showSearchForm = ref(false);

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value;
}

// 定义表格列
const columns = [
    {
        title: '标识位置',
        align: 'center',
        children: [
            {
                title: '公里',
                key: 'mileage',
                align: 'center',
                width: 100,
                render: (row) => Math.floor(Number(row.mileage))
            },
            {
                title: '米',
                key: 'mileage',
                align: 'center',
                width: 100,
                render: (row) => ((Number(row.mileage) % 1) * 1000).toFixed(0)
            },
        ],
    },
    {
        title: '轨距',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'gaugeMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'gaugeWarning', align: 'center', width: 120 },
        ],
    },
    // {
    //     title: '轨距变化率',
    //     align: 'center',
    //     children: [
    //         { title: '超限峰值mm', key: 'gaugeChangeRateMeasured', align: 'center', width: 120 },
    //         { title: '延长里程m', key: 'gaugeChangeRateWarning', align: 'center', width: 120 },
    //     ],
    // },
    {
        title: '水平',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'levelMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'levelWarning', align: 'center', width: 120 },
        ],
    },
    {
        title: '三角坑',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'twistMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'twistWarning', align: 'center', width: 120 },
        ],
    },
    {
        title: '左高低',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'alignmentLeftMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'alignmentLeftWarning', align: 'center', width: 120 },
        ],
    },
    {
        title: '右高低',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'alignmentRightMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'alignmentRightWarning', align: 'center', width: 120 },
        ],
    },
    {
        title: '左轨向（正矢）',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'directionLeftMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'directionLeftWarning', align: 'center', width: 120 },
        ],
    },
    // {
    //     title: '左正矢',
    //     align: 'center',
    //     children: [
    //         { title: '超限峰值mm', key: 'versineLeftMeasured', align: 'center', width: 120 },
    //         { title: '延长里程m', key: 'versineLeftWarning', align: 'center', width: 120 },
    //     ],
    // },
    {
        title: '右轨向（正矢）',
        align: 'center',
        children: [
            { title: '超限峰值mm', key: 'directionRightMeasured', align: 'center', width: 120 },
            { title: '延长里程m', key: 'directionRightWarning', align: 'center', width: 120 },
        ],
    },
    // {
    //     title: '右正矢',
    //     align: 'center',
    //     children: [
    //         { title: '超限峰值mm', key: 'versineRightMeasured', align: 'center', width: 120 },
    //         { title: '延长里程m', key: 'versineRightWarning', align: 'center', width: 120 },
    //     ],
    // },
    {
        title: '线路特征',
        key: 'operators',
        width: 150,
        align: 'center',
        render: row =>
            h(
                NTooltip,
                { trigger: 'hover' },
                {
                    default: () => row.operators,
                    trigger: () =>
                        h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.operators),
                },
            ),
    },
    {
        title: '完成时间',
        key: 'inspectionTime',
        width: 150,
        align: 'center',
    },
    {
        title: '负责人员',
        key: 'responsiblePerson',
        width: 150,
        align: 'center',
    },
];

// 表格数据和加载状态
const tableData = ref([]);
const loading = ref(false);

// 分页配置
const pagination = ref(reactive({
    pageNo: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
    onChange: (pageNo) => {
        pagination.value.pageNo = pageNo; // 直接更新 pagination.pageNo
        searchForm.value.pageNo = pageNo;
        fetchData();
    },
    onUpdatePageSize: (pageSize) => {
        pagination.value.pageSize = pageSize; // 同步更新
        searchForm.value.pageSize = pageSize;
        pagination.value.pageNo = 1;
        searchForm.value.pageNo = 1;
        fetchData();
    }
}));

// 搜索表单数据
const searchForm = ref({
    mileage: '',
    gaugeMeasured: '',
    gaugeChangeRateMeasured: '',
    levelMeasured: '',
    twistMeasured: '',
    alignmentRightMeasured: '',
    alignmentLeftMeasured: '',
    directionRightMeasured: '',
    directionLeftMeasured: '',
    // versineRightMeasured: '',
    // versineLeftMeasured: '',
    gaugeWarning: '',
    gaugeChangeRateWarning: '',
    levelWarning: '',
    twistWarning: '',
    alignmentRightWarning: '',
    alignmentLeftWarning: '',
    directionRightWarning: '',
    directionLeftWarning: '',
    versineRightWarning: '',
    versineLeftWarning: '',
    operators: '',
    inspectionTime: '',
    responsiblePerson: '',
    pageNo: 1,
    pageSize: 10
});

// 获取数据
async function fetchData() {
    loading.value = true;
    try {
        const params = {
            mileage: searchForm.value.mileage,
            gaugeMeasured: searchForm.value.gaugeMeasured,
            gaugeChangeRateMeasured: searchForm.value.gaugeChangeRateMeasured,
            levelMeasured: searchForm.value.levelMeasured,
            twistMeasured: searchForm.value.twistMeasured,
            alignmentRightMeasured: searchForm.value.alignmentRightMeasured,
            alignmentLeftMeasured: searchForm.value.alignmentLeftMeasured,
            directionRightMeasured: searchForm.value.directionRightMeasured,
            directionLeftMeasured: searchForm.value.directionLeftMeasured,
            // versineRightMeasured: searchForm.value.versineRightMeasured,
            // versineLeftMeasured: searchForm.value.versineLeftMeasured,
            gaugeWarning: searchForm.value.gaugeWarning,
            gaugeChangeRateWarning: searchForm.value.gaugeChangeRateWarning,
            levelWarning: searchForm.value.levelWarning,
            twistWarning: searchForm.value.twistWarning,
            alignmentRightWarning: searchForm.value.alignmentRightWarning,
            alignmentLeftWarning: searchForm.value.alignmentLeftWarning,
            directionRightWarning: searchForm.value.directionRightWarning,
            directionLeftWarning: searchForm.value.directionLeftWarning,
            versineRightWarning: searchForm.value.versineRightWarning,
            versineLeftWarning: searchForm.value.versineLeftWarning,
            operators: searchForm.value.operators,
            inspectionTime: searchForm.value.inspectionTime,
            responsiblePerson: searchForm.value.responsiblePerson,
            pageNo: pagination.value.pageNo, // 使用 pagination.pageNo
            pageSize: pagination.value.pageSize // 使用 pagination.pageSize
        };
        const response = await api.getTransfinite(params); // 使用 api.getTransfinite
        console.warn('API 响应:', response); // 调试 API 响应
        tableData.value = (response.data.pageData || []).map(item => ({
            id: item.id,
            mileage: item.mileage,
            gaugeMeasured: item.gaugeMeasured,
            gaugeWarning: item.gaugeWarning,
            gaugeChangeRateMeasured: item.gaugeChangeRateMeasured,
            gaugeChangeRateWarning: item.gaugeChangeRateWarning,
            levelMeasured: item.levelMeasured,
            levelWarning: item.levelWarning,
            twistMeasured: item.twistMeasured,
            twistWarning: item.twistWarning,
            alignmentRightMeasured: item.alignmentRightMeasured,
            alignmentRightWarning: item.alignmentRightWarning,
            directionRightMeasured: item.directionRightMeasured,
            directionRightWarning: item.directionRightWarning,
            // versineRightMeasured: item.versineRightMeasured,
            versineRightWarning: item.versineRightWarning,
            alignmentLeftMeasured: item.alignmentLeftMeasured,
            alignmentLeftWarning: item.alignmentLeftWarning,
            directionLeftMeasured: item.directionLeftMeasured,
            directionLeftWarning: item.directionLeftWarning,
            versineLeftMeasured: item.versineLeftMeasured,
            versineLeftWarning: item.versineLeftWarning,
            operators: item.operators,
            inspectionTime: item.inspectionTime,
            responsiblePerson: item.responsiblePerson,
        }));
        pagination.value.total = response.data.total || 0;
        pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize);
        await nextTick();
    } catch (error) {
        console.error('获取数据失败:', error);
        tableData.value = [];
        pagination.value.total = 0;
        pagination.value.pageCount = 1;
    } finally {
        loading.value = false;
    }
}

async function handleSearch() {
    searchForm.value.pageNo = 1;
    await fetchData();
}

async function resetSearch() {
    searchForm.value = {
        mileage: '',
        gaugeMeasured: '',
        gaugeChangeRateMeasured: '',
        levelMeasured: '',
        twistMeasured: '',
        alignmentRightMeasured: '',
        alignmentLeftMeasured: '',
        directionRightMeasured: '',
        directionLeftMeasured: '',
        // versineRightMeasured: '',
        versineLeftMeasured: '',
        gaugeWarning: '',
        gaugeChangeRateWarning: '',
        levelWarning: '',
        twistWarning: '',
        alignmentRightWarning: '',
        alignmentLeftWarning: '',
        directionRightWarning: '',
        directionLeftWarning: '',
        versineRightWarning: '',
        versineLeftWarning: '',
        operators: '',
        inspectionTime: '',
        responsiblePerson: '',
        pageNo: 1,
        pageSize: 10
    };
    await fetchData();
}

// 页面加载时获取数据
onMounted(() => {
    fetchData();
});
</script>

<style scoped>
:deep(.n-data-table) {
    border: 1px solid rgb(189, 187, 187);
    border-collapse: collapse;
    /* 关键属性：合并单元格边框 */
}

/* 表头背景颜色 */
:deep(.n-data-table thead th) {
    border: 1px solid rgb(189, 187, 187) !important;
    background-color: rgb(32, 44, 51) !important;
}

/* 表体行背景色（覆盖整行） */
:deep(.n-data-table tbody tr) {
    background-color: rgb(39, 88, 86) !important;
    /* 主颜色 */
}

/* 可选：奇偶行区分（增强视觉） */
:deep(.n-data-table tbody tr:nth-child(odd)) {
    background-color: rgb(39, 88, 86) !important;
    /* 奇数行 */
}

:deep(.n-data-table tbody tr:nth-child(even)) {
    background-color: rgba(39, 88, 86, 0.8) !important;
    /* 偶数行（更浅） */
}

/* 关键：覆盖单元格默认背景色（如果 UI 库有默认样式） */
:deep(.n-data-table tbody td) {
    border: 1px solid rgb(189, 187, 187);
    background-color: transparent !important;
    /* 清除 td 自带的背景色 */
}

.card-style {
    background-color: rgb(32, 44, 51);
    margin-top: -10px;
    margin-bottom: 12px;

}

:deep(.custom-input) {
    background-color: rgb(233, 233, 233) !important;
    /* 可选：修改边框颜色 */
}

:deep(.n-input) {
    background-color: rgb(233, 233, 233) !important;
    /* 可选：修改边框颜色 */
}

:deep(.n-input__placeholder) {
    color: #8d8d8d !important;
    /* 淡灰色 */

}
:deep(.n-input__input-el) {
    color: black;
}
/* 修改输入框为圆角样式 */
:deep(.custom-input .n-input__input) {
    border-radius: 12px !important;
    /* 圆角大小 */
}
</style>