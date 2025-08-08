<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top:-20px"
                        @click="toggleSearchForm">
                        道岔框架尺寸报表 ({{ selectedType }})
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
            <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect">
                <n-button style="margin-left: 16px; margin-top:-20px" type="primary">
                    切换表格
                </n-button>
            </n-dropdown>
        </div>
        <!-- 搜索表单 -->
        <n-card v-if="showSearchForm" :bordered="true" class="card-style">
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
        </n-card>
        <n-data-table :columns="columns" :data="dataTable" :bordered="true"
            :single-line="false" :loading="loading" />
        <n-pagination v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
            :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
            style="margin-top: 16px; justify-content: center;" />
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
    margin-bottom: 28px;

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