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

        <n-data-table :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
        <n-pagination v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
            :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
            style="margin-top: 16px; justify-content: center;" />
    </CommonPage>
</template>

<script setup>
import { h, onMounted, ref, nextTick } from 'vue'
import { NButton, NTooltip, NForm, NFormItemGi, NGrid, NInput, NSpace } from 'naive-ui'
import api from './api'

// 控制搜索表单显示状态
const showSearchForm = ref(true)

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
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
    pageNo: 1,
    pageSize: 10
})

// 表格数据和加载状态
const tableData = ref([])
const loading = ref(false)

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
    // { title: '轨距变化率 (mm)', align: 'center', key: 'gaugeChangeRate', width: 120 },
    { title: '实测水平 (mm)', align: 'center', key: 'actualLevel', width: 120 },
    { title: '三角坑 (mm)', align: 'center', key: 'triangularPit', width: 120 },
    { title: '实测右高低 (mm)', align: 'center', key: 'rightHeight', width: 120 },
    { title: '实测右轨向 (正矢) (mm)', align: 'center', key: 'rightTrackDirection', width: 140 },
    { title: '实测左高低 (mm)', align: 'center', key: 'leftHeight', width: 120 },
    { title: '实测左轨向 (正矢) (mm)', align: 'center', key: 'leftTrackDirection', width: 140 },
    // { title: '左轨横向调整量 (mm)', align: 'center', key: 'leftTrackAdjustment', width: 140 },
    // { title: '右轨横向调整量 (mm)', align: 'center', key: 'rightTrackAdjustment', width: 140 },
]

// 分页配置
// 分页配置
const pagination = ref(reactive({
    pageNo: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
    onChange: (pageNo) => {
        console.warn('切换页面到:', pageNo);
        pagination.value.pageNo = pageNo; // 直接更新 pagination.pageNo
        searchForm.value.pageNo = pageNo;
        fetchData();
    },
    onUpdatePageSize: (pageSize) => {
        console.warn('每页条数变更为:', pageSize);
        pagination.value.pageSize = pageSize; // 同步更新
        searchForm.value.pageSize = pageSize;
        pagination.value.pageNo = 1;
        searchForm.value.pageNo = 1;
        fetchData();
    }
}));

// 获取数据
async function fetchData() {
    loading.value = true
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
        }
        const response = await api.getCondense(params)

        tableData.value = (response.data.pageData || []).map(item => ({
            actualMileage: item.actualMileage || '',
            indicatedMileage: item.indicatedMileage || '',
            actualGauge: item.actualGauge || '',
            gaugeChangeRate: item.gaugeChangeRate || '',
            actualLevel: item.actualLevel || '',
            triangularPit: item.triangularPit || '',
            rightHeight: item.rightHeight || '',
            rightTrackDirection: item.rightTrackDirection || '',
            leftHeight: item.leftHeight || '',
            leftTrackDirection: item.leftTrackDirection || '',
            leftTrackAdjustment: item.leftTrackAdjustment || '',
            rightTrackAdjustment: item.rightTrackAdjustment || ''
        }))
         pagination.value.total = response.data.total || 0;
        pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize);
        await nextTick()
        pagination.value = { ...pagination.value }
    } catch (error) {
         tableData.value = [];
        pagination.value.total = 0;
        pagination.value.pageCount = 1;
    } finally {
        loading.value = false
    }
}

// 搜索
async function handleSearch() {
    searchForm.value.page = 1
    await fetchData()
}

// 重置
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
    }
    await fetchData()
}

// 页面加载时获取数据
onMounted(() => {
    fetchData()
})
</script>