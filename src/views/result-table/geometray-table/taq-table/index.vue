<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        道岔框架尺寸报表 ({{ selectedType }})
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
        <!-- 搜索表单 -->
        <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-grid :cols="4" :x-gap="12" :y-gap="8">
                <n-form-item-gi label="编号">
                    <n-input v-model:value="searchForm.number" placeholder="请输入编号" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="位置">
                    <n-input v-model:value="searchForm.direction" placeholder="请输入位置" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="标准值">
                    <n-input v-model:value="searchForm.standardValue" placeholder="请输入标准值" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="实际值">
                    <n-input v-model:value="searchForm.measurementValue" placeholder="请输入实际值" clearable />
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

        <n-data-table :columns="columns" :data="dataTable" :pagination="pagination" :bordered="true"
            :single-line="false" :loading="loading" />
    </CommonPage>
</template>

<script setup>
import { h, ref, onMounted, nextTick } from 'vue';
import { NButton, NTooltip, NDataTable, NForm, NFormItemGi, NInput, NGrid, NSpace } from 'naive-ui';
import api from './api.js';

const dropdownOptions = [
    { label: '60轨12号Ⅱ型单开(专线4249 CZ545)', key: '60轨12号Ⅱ型单开(专线4249 CZ545)' },
];

// State for selected table type
const selectedType = ref('60轨12号Ⅱ型单开(专线4249 CZ545)');

// Handle dropdown selection
const handleDropdownSelect = async (key) => {
    selectedType.value = key;
    searchForm.value.pageNo = 1;
    await fetchData();
};

// 控制搜索表单显示状态
const showSearchForm = ref(false);

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value;
}

// 定义表格列
const columns = [
    {
        title: '编号',
        key: 'number',
        align: 'center',
        width: 50,
    },
    { title: '位置', align: 'center', key: 'direction', width: 400 },
    { title: '标准值', align: 'center', key: 'standardValue', width: 100 },
    { title: '实测值', align: 'center', key: 'measurementValue', width: 100 },
];

// 表格数据和加载状态
const dataTable = ref([]);
const loading = ref(false);

// 分页配置
const pagination = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
    onChange: (pageNo) => {
        searchForm.value.pageNo = pageNo;
        fetchData();
    },
    onUpdatePageSize: (pageSize) => {
        searchForm.value.pageSize = pageSize;
        searchForm.value.pageNo = 1;
        fetchData();
    }
});

// 搜索表单数据
const searchForm = ref({
    number: '',
    direction: '',
    standardValue: '',
    measurementValue: '',
    pageNo: 1,
    pageSize: 10,
});

// 获取数据
async function fetchData() {
    loading.value = true;
    try {
        const params = {
            number: searchForm.value.number || null,
            direction: searchForm.value.direction || null,
            standardValue: searchForm.value.standardValue || null,
            measurementValue: searchForm.value.measurementValue || null,
            dataType: selectedType.value, // Pass the selected table type
            pageNo: searchForm.value.pageNo,
            pageSize: searchForm.value.pageSize,
        };
        const response = await api.getTaqData(params);
        dataTable.value = (response.data.pageData || []).map(item => ({
            number: item.number,
            direction: item.direction,
            standardValue: item.standardValue,
            measurementValue: item.measurementValue,
        }));
        pagination.value.total = response.data.total || 0;
        await nextTick(); // 确保 DOM 更新
        pagination.value = { ...pagination.value }; // 强制触发响应式更新
    } catch (error) {
        console.error('获取数据失败:', error);
        dataTable.value = [];
        pagination.value.total = 0;
    } finally {
        loading.value = false;
    }
}

// 搜索和重置
async function handleSearch() {
    searchForm.value.pageNo = 1;
    await fetchData();
}

async function resetSearch() {
    searchForm.value = {
        number: '',
        direction: '',
        standardValue: '',
        measurementValue: '',
        pageNo: 1,
        pageSize: 10,
    };
    await fetchData();
}

// 页面加载时获取数据
onMounted(() => {
    fetchData();
});
</script>