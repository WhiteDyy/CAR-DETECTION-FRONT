<template>
    <CommonPage>
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top: -20px;"
                        @click="toggleSearchForm">
                        {{ currentModel }} 道岔道尺报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
            <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect">
                <n-button style="margin-left: 16px; margin-top: -20px;" type="primary">
                    切换表格
                </n-button>
            </n-dropdown>
        </div>

        <!-- 搜索表单 -->
        <n-card v-if="showSearchForm" :bordered="true" class="card-style">
            <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
                :style="{ marginBottom: '16px' }">
                <n-grid :cols="4" :x-gap="12" :y-gap="8">
                    <n-form-item-gi label="道尺号">
                        <n-input v-model:value="searchForm.point" placeholder="请输入道尺号" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="位置">
                        <n-input v-model:value="searchForm.position" placeholder="请输入位置" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="轨向">
                        <n-input v-model:value="searchForm.direction" placeholder="请输入轨向" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="轨枕序号">
                        <n-input v-model:value="searchForm.sleeper" placeholder="请输入轨枕序号" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="参数名称">
                        <n-input v-model:value="searchForm.paramName" placeholder="请输入参数名称" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="参数值">
                        <n-input v-model:value="searchForm.paramValue" placeholder="请输入参数值" clearable />
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

        <n-data-table :columns="columns" :data="data" :bordered="true" :single-line="false" :max-height="600"
            :loading="loading" />
    </CommonPage>
</template>

<script setup>
import { h, ref, computed, onMounted, nextTick } from 'vue';
import { NButton, NTooltip, NDataTable, NForm, NFormItemGi, NInput, NGrid, NSpace } from 'naive-ui';
import api from './api.js';

// 道岔型号列表
const turnoutModels = ['SC330', 'SC400', 'SC500'];

// 当前选中的道岔型号索引
const currentModelIndex = ref(0);

// 计算属性：根据当前索引获取当前道岔型号
const currentModel = computed(() => turnoutModels[currentModelIndex.value]);

// 下拉菜单选项：将道岔型号映射为下拉菜单的选项格式
const dropdownOptions = turnoutModels.map(model => ({
    label: model,
    key: model
}));

// 控制搜索表单显示状态
const showSearchForm = ref(false);

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value;
}

// 切换道岔型号（用于标题点击）：循环切换到下一个型号
const switchTurnoutModel = async () => {
    currentModelIndex.value = (currentModelIndex.value + 1) % turnoutModels.length;
    searchForm.value.pageNo = 1;
    await fetchData();
};

// 处理下拉菜单选择：根据选中的型号更新索引并获取数据
const handleDropdownSelect = async (key) => {
    currentModelIndex.value = turnoutModels.indexOf(key);
    searchForm.value.pageNo = 1;
    await fetchData();
};

// 定义表格列
const columns = [
    // 一级表头：18px
    {
        title: () => h('div', { style: { fontSize: '18px' } }, '道尺号'), // 一级标题样式
        key: 'point',
        align: 'center',
        width: 100,
    },
    {
        title: () => h('div', { style: { fontSize: '18px' } }, '位置'), // 一级标题样式
        key: 'position',
        align: 'center',
        width: 150,
    },
    {
        title: () => h('div', { style: { fontSize: '18px' } }, '轨向'), // 一级标题样式
        key: 'direction',
        align: 'center',
        width: 80,
    },
    {
        title: () => h('div', { style: { fontSize: '18px' } }, '轨枕序号'), // 一级标题样式
        key: 'sleeper',
        align: 'center',
        width: 100,
    },
    {
        title: () => h('div', { style: { fontSize: '18px' } }, '测量参数'), // 一级标题样式
        key: 'measurement',
        align: 'center',
        children: [
            // 二级表头：14px
            {
                title: () => h('div', { style: { fontSize: '14px' } }, '参数名称'), // 二级标题样式
                key: 'paramName',
                align: 'center',
                width: 120,
            },
            {
                title: () => h('div', { style: { fontSize: '14px' } }, '参数值'), // 二级标题样式
                key: 'paramValue',
                align: 'center',
                width: 100,
            },
        ],
    },
];

// 表格数据和加载状态
const data = ref([]);
const loading = ref(false);

// 分页配置
const pagination = ref({
    pageNo: 1,
    pageSize: 43,
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
    point: '',
    position: '',
    direction: '',
    sleeper: '',
    paramName: '',
    paramValue: '',
    pageNo: 1,
    pageSize: 43,
});

// 获取数据
async function fetchData() {
    loading.value = true;
    try {
        const params = {
            lineNo: searchForm.value.lineNo || null,
            lineName: searchForm.value.lineName || null,
            startMileage: searchForm.value.startMileage || null,
            endMileage: searchForm.value.endMileage || null,
            direction: searchForm.value.direction || null,
            curveDirection: searchForm.value.curveDirection || null,
            gaugeType: searchForm.value.gaugeType || null,
            turnoutModel: currentModel.value, // Pass the selected turnout model
            pageNo: searchForm.value.pageNo,
            pageSize: searchForm.value.pageSize,
        };
        const response = await api.getSgData(params);
        data.value = (response.data.pageData || []).map(item => ({
            key: item.key,
            point: item.point,
            position: item.position,
            direction: item.direction,
            sleeper: item.sleeper,
            paramName: item.paramName,
            paramValue: item.paramValue,
        }));
        pagination.value.total = response.data.total || 0;
        await nextTick(); // 确保 DOM 更新
        pagination.value = { ...pagination.value }; // 强制触发响应式更新
    } catch (error) {
        console.error('获取数据失败:', error);
        data.value = [];
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
        point: '',
        position: '',
        direction: '',
        sleeper: '',
        paramName: '',
        paramValue: '',
        pageNo: 1,
        pageSize: 43,
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
