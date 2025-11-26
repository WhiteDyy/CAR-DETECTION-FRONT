<template>
  <CommonPage>
    <!-- 表格标题与提示 -->
    <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
      <NTooltip trigger="hover">
        <template #trigger>
          <div
            style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top: -20px"
            @click="toggleSearchForm"
          >
            压缩报表
          </div>
        </template>
        点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
      </NTooltip>
    </div>
    <!-- 搜索表单 -->
    <n-card v-if="showSearchForm" :bordered="true" class="card-style">
      <NForm
        v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
        :style="{ marginBottom: '16px' }"
      >
        <NGrid :cols="4" :x-gap="12" :y-gap="8">
          <NFormItemGi label="线编号">
            <NInput v-model:value="searchForm.lineNo" placeholder="请输入线编号" clearable />
          </NFormItemGi>
          <NFormItemGi label="线路名">
            <NInput v-model:value="searchForm.lineName" placeholder="请输入线路名" clearable />
          </NFormItemGi>
          <NFormItemGi label="起点里程">
            <NInput v-model:value="searchForm.startMileage" placeholder="请输入起点里程" clearable />
          </NFormItemGi>
          <NFormItemGi label="终点里程">
            <NInput v-model:value="searchForm.endMileage" placeholder="请输入终点里程" clearable />
          </NFormItemGi>
          <NFormItemGi label="行别">
            <NInput v-model:value="searchForm.direction" placeholder="请输入行别" clearable />
          </NFormItemGi>
          <NFormItemGi label="曲线方向">
            <NInput v-model:value="searchForm.curveDirection" placeholder="请输入曲线方向" clearable />
          </NFormItemGi>
          <NFormItemGi label="轨距类型">
            <NInput v-model:value="searchForm.gaugeType" placeholder="请输入轨距类型" clearable />
          </NFormItemGi>
          <NFormItemGi>
            <NSpace>
              <NButton type="primary" @click="handleSearch">
                搜索
              </NButton>
              <NButton @click="resetSearch">
                重置
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>
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
import { NButton, NForm, NFormItemGi, NGrid, NInput, NSpace, NTooltip } from 'naive-ui'
import { h, nextTick, onMounted, ref } from 'vue'
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
  pageSize: 10,
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
    console.warn('切换页面到:', pageNo)
    pagination.value.pageNo = pageNo // 直接更新 pagination.pageNo
    searchForm.value.pageNo = pageNo
    fetchData()
  },
  onUpdatePageSize: (pageSize) => {
    console.warn('每页条数变更为:', pageSize)
    pagination.value.pageSize = pageSize // 同步更新
    searchForm.value.pageSize = pageSize
    pagination.value.pageNo = 1
    searchForm.value.pageNo = 1
    fetchData()
  },
}))

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
      pageSize: pagination.value.pageSize, // 使用 pagination.pageSize
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
      rightTrackAdjustment: item.rightTrackAdjustment || '',
    }))
    pagination.value.total = response.data.total || 0
    pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize)
    await nextTick()
    pagination.value = { ...pagination.value }
  }
  catch (error) {
    tableData.value = []
    pagination.value.total = 0
    pagination.value.pageCount = 1
  }
  finally {
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

:deep(.n-input__input-el) {
  color: black;
}

:deep(.n-input__placeholder) {
  color: #8d8d8d !important;
  /* 淡灰色 */
}

/* 修改输入框为圆角样式 */
:deep(.custom-input .n-input__input) {
  border-radius: 12px !important;
  /* 圆角大小 */
}
</style>
