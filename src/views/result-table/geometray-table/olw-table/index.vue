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
            {{ selectedType }}
          </div>
        </template>
        点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
      </NTooltip>
      <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect">
        <NButton style="margin-left: 16px; margin-top:-20px" type="primary">
          切换表格
        </NButton>
      </n-dropdown>
    </div>

    <!-- 搜索表单 -->
    <n-card v-if="showSearchForm" :bordered="true" class="card-style">
      <NForm
        v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
        :style="{ marginBottom: '16px' }"
      >
        <NGrid :cols="4" :x-gap="12" :y-gap="8">
          <NFormItemGi label="线路名">
            <NInput v-model:value="searchForm.lineName" placeholder="请输入线路名" clearable />
          </NFormItemGi>
          <NFormItemGi label="里程">
            <NInput v-model:value="searchForm.mileage" placeholder="请输入里程" clearable />
          </NFormItemGi>
          <NFormItemGi label="轨枕号">
            <NInput v-model:value="searchForm.sleeperNo" placeholder="请输入轨枕号" clearable />
          </NFormItemGi>
          <NFormItemGi label="行别">
            <NInput v-model:value="searchForm.direction" placeholder="请输入行别" clearable />
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

    <NDataTable :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
    <n-pagination
      v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
      :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
      style="margin-top: 16px; justify-content: center;"
    />
  </CommonPage>
</template>

<script setup>
import { NButton, NDataTable, NForm, NFormItemGi, NGrid, NInput, NSpace, NTooltip } from 'naive-ui'
import { h, nextTick, onMounted, ref } from 'vue'
import api from './api.js'

const dropdownOptions = [
  { label: '10米短波报表', key: '10米短波报表' },
  { label: '20米短波报表', key: '20米短波报表' },
  { label: '40米中波报表', key: '40米中波报表' },
]

// State for selected table type
const selectedType = ref('10米短波报表')

// Handle dropdown selection
async function handleDropdownSelect(key) {
  selectedType.value = key
  searchForm.value.pageNo = 1
  await fetchData()
}

// 控制搜索表单显示状态
const showSearchForm = ref(false)

// 切换搜索表单显示状态
function toggleSearchForm() {
  showSearchForm.value = !showSearchForm.value
}

// Inspection info for description list
const inspectionInfo = ref({})

// 定义表格列
const columns = [
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '里程'),
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
    title: () => h('div', { style: { fontSize: '18px' } }, '轨枕号'),
    key: 'sleeperNo',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '高低设计值'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'heightDesignDeviation',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '轨向设计值'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'trackDesignDeviation',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '左高低实测'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'leftHeightActual',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '左高低偏差'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'leftHeightDeviation',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '右高低实测'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightHeightActual',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '右高低偏差'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightHeightDeviation',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '左轨向实测'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'leftTrackActual',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '左轨向偏差'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'leftTrackDeviation',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '右轨向实测'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightTrackActual',
    width: 120,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '右轨向偏差'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightTrackDeviation',
    width: 120,
  },
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

// 搜索表单数据
const searchForm = ref({
  lineName: '',
  mileage: '',
  sleeperNo: '',
  direction: '',
  pageNo: 1,
  pageSize: 10,
})

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const params = {
      lineName: searchForm.value.lineName || null,
      mileage: searchForm.value.mileage || null,
      sleeperNo: searchForm.value.sleeperNo || null,
      direction: searchForm.value.direction || null,
      dataType: selectedType.value, // Pass the selected table type
      pageNo: pagination.value.pageNo, // 使用 pagination.pageNo
      pageSize: pagination.value.pageSize, // 使用 pagination.pageSize
    }
    const response = await api.getOlw(params)
    tableData.value = (response.data.pageData || []).map(item => ({
      lineName: item.lineName,
      direction: item.direction,
      mileage: item.mileage,
      sleeperNo: item.sleeperNo,
      heightDesignDeviation: item.heightDesignDeviation,
      trackDesignDeviation: item.trackDesignDeviation,
      leftHeightActual: item.leftHeightActual,
      leftHeightDeviation: item.leftHeightDeviation,
      rightHeightActual: item.rightHeightActual,
      rightHeightDeviation: item.rightHeightDeviation,
      leftTrackActual: item.leftTrackActual,
      leftTrackDeviation: item.leftTrackDeviation,
      rightTrackActual: item.rightTrackActual,
      rightTrackDeviation: item.rightTrackDeviation,
      inspectionDate: item.inspectionDate,
      inspector: item.inspector,
    }))

    // Set inspection info from the first row
    if (tableData.value.length > 0) {
      const firstRow = tableData.value[0]
      inspectionInfo.value = {
        inspectionDate: firstRow.inspectionDate,
        inspector: firstRow.inspector,
        lineName: firstRow.lineName,
        direction: firstRow.direction,
        designRadius: firstRow.designRadius || null,
        actualRadius: firstRow.actualRadius || null,
        curveLength: firstRow.curveLength || null,
        circularCurveLength: firstRow.circularCurveLength || null,
        transitionCurveLength: firstRow.transitionCurveLength || null,
        designSuperelevation: firstRow.designSuperelevation || null,
        vmax: firstRow.vmax || null,
      }
    }
    else {
      inspectionInfo.value = {}
    }
    pagination.value.total = response.data.total || 0
    pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize)
    await nextTick()
  }
  catch (error) {
    tableData.value = []
    pagination.value.total = 0
    pagination.value.pageCount = 1
    inspectionInfo.value = {}
  }
  finally {
    loading.value = false
  }
}

// 搜索和重置
async function handleSearch() {
  searchForm.value.pageNo = 1
  await fetchData()
}

async function resetSearch() {
  searchForm.value = {
    lineName: '',
    mileage: '',
    sleeperNo: '',
    direction: '',
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
