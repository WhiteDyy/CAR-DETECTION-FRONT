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

        <!-- <n-data-table :columns="columns" :data="tableData" :pagination="pagination" :bordered="true"
            :single-line="false" :loading="loading" /> -->
        <n-data-table :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
        <n-pagination v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
            :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
            style="margin-top: 16px; justify-content: center;" />
    </CommonPage>
</template>

<script setup>
import { h, onMounted, ref, nextTick } from 'vue'
import { NButton, NTooltip } from 'naive-ui'
import api from './api'

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
    { title: '超高顺坡率', key: 'gradientRate', width: 100 },
    { title: '起点切线长', key: 'startTangentLength', width: 140 },
    { title: '起缓和线长', key: 'startTransitionLength', width: 140 },
    { title: '终缓和线长', key: 'endTransitionLength', width: 140 },
    { title: '终点切线长', key: 'endTangentLength', width: 140 },
    { title: '曲线全长', key: 'totalCurveLength', width: 120 },
    { title: '平均速度', key: 'averageSpeed', width: 120 },
]

// 表格数据和加载状态
const tableData = ref([])
const loading = ref(false)

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



const searchForm = ref({
    lineNo: '',
    lineName: '',
    startMileage: '',
    endMileage: '',
    direction: '',
    curveDirection: '',
    gaugeType: '',
    pageNo: 1,
    pageSize: 10
});

// 获取数据
async function fetchData() {
    loading.value = true;
    try {
        const params = {
            line_no: searchForm.value.lineNo,
            line_name: searchForm.value.lineName,
            start_mileage: searchForm.value.startMileage,
            end_mileage: searchForm.value.endMileage,
            direction: searchForm.value.direction,
            curve_direction: searchForm.value.curveDirection,
            gauge_type: searchForm.value.gaugeType,
            pageNo: pagination.value.pageNo, // 使用 pagination.pageNo
            pageSize: pagination.value.pageSize // 使用 pagination.pageSize
        };
        const response = await api.getCurveList(params);
        tableData.value = (response.data.pageData || []).map(item => ({
            id: item.id,
            lineNo: item.lineNo,
            direction: item.direction,
            lineName: item.lineName,
            startMileage: item.startMileage,
            endMileage: item.endMileage,
            curveDirection: item.curveDirection,
            curveRadius: item.curveRadius,
            turningAngle: item.turningAngle,
            gaugeType: item.gaugeType,
            gaugeWidening: item.gaugeWidening,
            superelevation: item.superelevation,
            gradientRate: item.gradientRate,
            startTangentLength: item.startTangentLength,
            startTransitionLength: item.startTransitionLength,
            endTransitionLength: item.endTransitionLength,
            endTangentLength: item.endTangentLength,
            totalCurveLength: item.totalCurveLength,
            averageSpeed: item.averageSpeed,
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
        lineNo: '',
        lineName: '',
        startMileage: '',
        endMileage: '',
        direction: '',
        curveDirection: '',
        gaugeType: '',
        pageNo: 1,
        pageSize: 10
    };
    await fetchData();
}

// 页面加载时获取数据
onMounted(() => {
    fetchData()
})
</script>
