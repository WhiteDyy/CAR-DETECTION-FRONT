<template>
  <CommonPage>
    <!-- 表格标题与提示 -->
    <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
      <NTooltip trigger="hover">
        <template #trigger>
          <div
            style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top:-20px"
            @click="toggleSearchForm"
          >
            磨耗报表
          </div>
        </template>
        点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
      </NTooltip>
    </div>
    <!-- 搜索表单 -->
    <n-card v-if="showSearchForm" :bordered="true" class="card-style">
      <n-form
        v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
        :style="{ marginBottom: '16px' }"
      >
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
              <NButton type="primary" @click="handleSearch">
                搜索
              </NButton>
              <NButton @click="resetSearch">
                重置
              </NButton>
            </n-space>
          </n-form-item-gi>
        </n-grid>
      </n-form>
    </n-card>

    <n-data-table :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
    <n-pagination
      v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
      :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
      style="margin-top: 16px; justify-content: center;"
    />
  </CommonPage>
</template>

<script setup>
import { NButton, NTooltip } from 'naive-ui'
import { nextTick, onMounted, ref } from 'vue'
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
    pagination.value.pageNo = pageNo // 直接更新 pagination.pageNo
    searchForm.value.pageNo = pageNo
    fetchData()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.value.pageSize = pageSize // 同步更新
    searchForm.value.pageSize = pageSize
    pagination.value.pageNo = 1
    searchForm.value.pageNo = 1
    fetchData()
  },
}))

const searchForm = ref({
  mileage: '',
  leftVerticalWear: '',
  leftSideWear: '',
  leftTotalWear: '',
  rightVerticalWear: '',
  rightSideWear: '',
  rightTotalWear: '',
  pageNo: 1,
  pageSize: 10,
})

// 获取数据
async function fetchData() {
  console.warn('挂载时搜索数据！！！！', searchForm.value.mileage)
  loading.value = true
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
      pageSize: searchForm.value.pageSize, // 改为 pageSize
    }
    console.warn('传送的参数：', params)
    const response = await api.getWearTable(params)
    console.warn('后端返回数据：', response.data)
    tableData.value = (response.data.pageData || []).map(item => ({
      id: item.id,
      mileage: item.mileage,
      leftVerticalWear: item.leftVerticalWear,
      leftSideWear: item.leftSideWear,
      leftTotalWear: item.leftTotalWear,
      rightVerticalWear: item.rightVerticalWear,
      rightSideWear: item.rightSideWear,
      rightTotalWear: item.rightTotalWear,
    }))
    pagination.value.total = response.data.total || 0
    await nextTick() // 确保 DOM 更新
    pagination.value = { ...pagination.value } // 强制触发响应式更新
  }
  catch (error) {
    console.error('获取数据失败:', error)
    tableData.value = []
    pagination.value.total = 0
  }
  finally {
    loading.value = false
  }
}

async function handleSearch() {
  searchForm.value.pageNo = 1
  await fetchData()
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
    pageSize: 10,
  }
  await fetchData()
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
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
