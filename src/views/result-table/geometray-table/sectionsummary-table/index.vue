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
            区段小结报表
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
          <NFormItemGi label="线路名称">
            <NInput v-model:value="searchForm.lineInfoLabel" placeholder="请输入线路名称" clearable />
          </NFormItemGi>
          <NFormItemGi label="行别">
            <NInput v-model:value="searchForm.lineInfoValue" placeholder="请输入行别" clearable />
          </NFormItemGi>
          <NFormItemGi label="检测日期">
            <NDatePicker
              v-model:value="searchForm.inspectionDate" type="datetime" clearable
              value-format="yyyy-MM-dd HH:mm:ss" :disabled="isDateInvalid"
            />
          </NFormItemGi>
          <NFormItemGi>
            <n-space>
              <NButton type="primary" @click="handleSearch">
                搜索
              </NButton>
              <NButton @click="resetSearch">
                重置
              </NButton>
            </n-space>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </n-card>

    <!-- 报表顶部信息 -->
    <div class="report-info">
      <div style="font-weight: bold; color: #333;">
        区段起点: {{ reportInfo.startPoint }}
      </div>
      <div style="font-weight: bold; color: #333;">
        区段终点: {{ reportInfo.endPoint }}
      </div>
      <div style="font-weight: bold; color: #333;">
        检察人员: {{ reportInfo.inspector }}
      </div>
      <div style="font-weight: bold; color: #333;">
        检测日期: {{ reportInfo.inspectionDate }}
      </div>
      <div style="font-weight: bold; color: #333;">
        {{ reportInfo.lineInfoLabel }}: {{ reportInfo.lineInfoValue }}
      </div>
    </div>

    <!-- 表格 -->
    <NDataTable :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
    <n-pagination
      v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
      :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
      style="margin-top: 16px; justify-content: center;"
    />
  </CommonPage>
</template>

<script setup>
import { NButton, NDataTable, NDatePicker, NForm, NFormItemGi, NGrid, NInput, NTooltip } from 'naive-ui'
import { nextTick, onMounted, ref } from 'vue'
import api from './api'

// 控制搜索表单显示状态
const showSearchForm = ref(true)

// 是否禁用日期选择器
const isDateInvalid = ref(false)

// 搜索表单数据
const searchForm = ref({
  lineInfoLabel: '',
  lineInfoValue: '',
  inspectionDate: null,
  pageNo: 1,
  pageSize: 10,
})

// 报表顶部信息
const reportInfo = ref({
  startPoint: '',
  endPoint: '',
  inspector: '',
  inspectionDate: '',
  lineInfoLabel: '',
  lineInfoValue: '',
})

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

// 日期格式转换工具函数
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    console.warn(`无效的日期输入: ${dateStr}`)
    return null
  }
  const parsed = new Date(Date.parse(dateStr))
  if (!isNaN(parsed.getTime())) {
    return parsed.getTime()
  }
  console.warn(`无法解析的日期格式: ${dateStr}`)
  return null
}

// 定义表格的列配置
const columns = [
  {
    title: '项目',
    key: 'itemName',
    fixed: 'left',
    width: 100,
  },
  {
    title: '作业验收',
    key: 'jobAcceptance',
    align: 'center',
    children: [
      {
        title: '点数',
        key: 'jobPoints',
        width: 80,
        align: 'center',
      },
      {
        title: '延长',
        key: 'jobExtension',
        width: 80,
        align: 'center',
      },
    ],
  },
  {
    title: '综合保养',
    key: 'comprehensiveMaintenance',
    align: 'center',
    children: [
      {
        title: '点数',
        key: 'compPoints',
        width: 80,
        align: 'center',
      },
      {
        title: '延长',
        key: 'compExtension',
        width: 80,
        align: 'center',
      },
    ],
  },
  {
    title: '临时补修',
    key: 'temporaryRepair',
    align: 'center',
    children: [
      {
        title: '点数',
        key: 'tempPoints',
        width: 80,
        align: 'center',
      },
      {
        title: '延长',
        key: 'tempExtension',
        width: 80,
        align: 'center',
      },
    ],
  },
  {
    title: '四级超限',
    key: 'level4Overlimit',
    align: 'center',
    children: [
      {
        title: '点数',
        key: 'level4Points',
        width: 80,
        align: 'center',
      },
      {
        title: '延长',
        key: 'level4Extension',
        width: 80,
        align: 'center',
      },
    ],
  },
  {
    title: '扣分',
    key: 'deduction',
    width: 80,
    align: 'center',
  },
  {
    title: '百分比',
    key: 'percentage',
    width: 100,
    align: 'center',
  },
]

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const params = {
      line_name: searchForm.value.lineInfoLabel,
      direction: searchForm.value.lineInfoValue,
      inspection_date: searchForm.value.inspectionDate,
      pageNo: pagination.value.pageNo, // 使用 pagination.pageNo
      pageSize: pagination.value.pageSize, // 使用 pagination.pageSize
    }
    const response = await api.getSectionSummary(params)
    tableData.value = (response.data.pageData || []).map(item => ({
      key: item.id || item.key || Date.now() + Math.random(), // 确保每行有唯一 key
      itemName: item.itemName || '',
      jobPoints: item.jobPoints || 0,
      jobExtension: item.jobExtension || 0,
      compPoints: item.compPoints || 0,
      compExtension: item.compExtension || 0,
      tempPoints: item.tempPoints || 0,
      tempExtension: item.tempExtension || 0,
      level4Points: item.level4Points || 0,
      level4Extension: item.level4Extension || 0,
      deduction: item.deduction || 0,
      percentage: item.percentage || '',
    }))

    // 更新报表顶部信息
    if (tableData.value.length > 0) {
      const firstItem = response.data.pageData[0] || {}
      reportInfo.value = {
        startPoint: firstItem.startPoint || '',
        endPoint: firstItem.endPoint || '',
        inspector: firstItem.inspector || '',
        inspectionDate: parseDate(firstItem.inspectionDate) || '',
        lineInfoLabel: firstItem.lineInfoLabel || '',
        lineInfoValue: firstItem.lineInfoValue || '',
      }
    }
    else {
      reportInfo.value = {
        startPoint: '',
        endPoint: '',
        inspector: '',
        inspectionDate: '',
        lineInfoLabel: '',
        lineInfoValue: '',
      }
    }
    pagination.value.total = response.data.total || 0
    pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize)
    await nextTick()
  }
  catch (error) {
    tableData.value = []
    pagination.value.total = 0
    pagination.value.pageCount = 1
    reportInfo.value = {
      startPoint: '',
      endPoint: '',
      inspector: '',
      inspectionDate: '',
      lineInfoLabel: '',
      lineInfoValue: '',
    }
    isDateInvalid.value = false
  }
  finally {
    loading.value = false
  }
}

// 搜索
async function handleSearch() {
  searchForm.value.pageNo = 1
  isDateInvalid.value = false
  await fetchData()
}

// 重置
async function resetSearch() {
  searchForm.value = {
    lineInfoLabel: '',
    lineInfoValue: '',
    inspectionDate: null,
    pageNo: 1,
    pageSize: 10,
  }
  reportInfo.value = {
    startPoint: '',
    endPoint: '',
    inspector: '',
    inspectionDate: '',
    lineInfoLabel: '',
    lineInfoValue: '',
  }
  isDateInvalid.value = false
  await fetchData()
}

// 切换搜索表单显示状态
function toggleSearchForm() {
  showSearchForm.value = !showSearchForm.value
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.report-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
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
:deep(.n-input__input-el) {
  color: black;
}

:deep(.n-input__placeholder) {
  color: #929090 !important;
  /* 淡灰色 */
}

/* 修改输入框为圆角样式 */
:deep(.custom-input .n-input__input) {
  border-radius: 12px !important;
  /* 圆角大小 */
}
</style>
