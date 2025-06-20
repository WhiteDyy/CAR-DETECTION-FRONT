<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        磨耗报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
        </div>
        <!-- 搜索表单 -->
        <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-grid :cols="4" :x-gap="12" :y-gap="8">
                <n-form-item-gi label="里程">
                    <n-input v-model:value="searchForm.mileage" placeholder="请输入里程" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="左轨垂磨">
                    <n-input v-model:value="searchForm.leftVerticalWear" placeholder="请输入左轨垂磨" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="左轨侧磨">
                    <n-input v-model:value="searchForm.leftSideWear" placeholder="请输入左轨侧磨" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="左轨总磨">
                    <n-input v-model:value="searchForm.leftTotalWear" placeholder="请输入左轨总磨" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="右轨垂磨">
                    <n-input v-model:value="searchForm.rightVerticalWear" placeholder="请输入右轨垂磨" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="右轨侧磨">
                    <n-input v-model:value="searchForm.rightSideWear" placeholder="请输入右轨侧磨" clearable />
                </n-form-item-gi>
                <n-form-item-gi label="右轨总磨">
                    <n-input v-model:value="searchForm.rightTotalWear" placeholder="请输入右轨总磨" clearable />
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
import { h, onMounted, ref, nextTick} from 'vue'
import { NButton, NTooltip } from 'naive-ui'
import api from './api.js'

// 控制搜索表单显示状态
const showSearchForm = ref(false)

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
}

// 定义表格列
const columns = [
    { title: '里程(km)', key: 'mileage', width: 150 },
    { title: '左轨垂磨(mm)', key: 'leftVerticalWear', width: 150 },
    { title: '左轨侧磨(mm)', key: 'leftSideWear', width: 150 },
    { title: '左轨总磨(mm)', key: 'leftTotalWear', width: 150 },
    { title: '右轨垂磨(mm)', key: 'rightVerticalWear', width: 150 },
    { title: '右轨侧磨(mm)', key: 'rightSideWear', width: 150 },
    { title: '右轨总磨(mm)', key: 'rightTotalWear', width: 150 },
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
    mileage:'',
    leftVerticalWear: '',
    leftSideWear: '',
    leftTotalWear: '',
    rightVerticalWear: '',
    rightSideWear: '',
    rightTotalWear: '',
    pageNo: 1,
    pageSize: 10
});

// 获取数据
async function fetchData() {
    console.log("挂载时搜索数据！！！！", searchForm.value.mileage);
    loading.value = true;
    try {
        const params = {
            mileage: searchForm.value.mileage || null,
            leftVerticalWear: searchForm.value.leftVerticalWear || null,
            leftSideWear: searchForm.value.leftSideWear || null,
            leftTotalWear: searchForm.value.leftTotalWear || null,
            rightVerticalWear: searchForm.value.rightVerticalWear || null,
            rightSideWear: searchForm.value.rightSideWear || null,
            rightTotalWear: searchForm.value.rightTotalWear || null,
            pageNo: searchForm.value.pageNo,
            pageSize: searchForm.value.pageSize // 改为 pageSize
        };
        console.log("传送的参数：", params);
        const response = await api.getWearTable(params);
        console.log("后端返回数据：", response.data);
        tableData.value = (response.data.pageData || []).map(item => ({
            id: item.id,
            mileage: item.mileage,
            leftVerticalWear: item.leftVerticalWear,
            leftSideWear: item.leftSideWear,
            leftTotalWear: item.leftTotalWear,
            rightVerticalWear: item.rightVerticalWear,
            rightSideWear: item.rightSideWear,
            rightTotalWear: item.rightTotalWear,
        }));
        pagination.value.total = response.data.total || 0;
        await nextTick(); // 确保 DOM 更新
        pagination.value = { ...pagination.value }; // 强制触发响应式更新
    } catch (error) {
        console.error('获取数据失败:', error);
        tableData.value = [];
        pagination.value.total = 0;
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
            leftVerticalWear: '',
            sitemleftSideWear: '',
            leftTotalWear: '',
            rightVerticalWear: '',
            rightSideWear: '',
            rightTotalWear: '',
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
