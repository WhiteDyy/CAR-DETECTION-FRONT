<template>
  <CommonPage>
    <!-- 表格标题与提示 -->
    <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
      <NTooltip trigger="hover">
        <template #trigger>
          <div
            style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top:-20px;"
            @click="toggleSearchForm"
          >
            TQI报表
          </div>
        </template>
        点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
      </NTooltip>
    </div>

    <!-- 检查信息展示 -->
    <NCard v-if="showSearchForm" title="筛选" :bordered="true" class="card-style">
      <NForm v-if="showSearchForm" :model="inspectionInfo" label-placement="left" label-width="auto">
        <NGrid :cols="5" :x-gap="12" :y-gap="8">
          <NGridItem>
            <NFormItem label="检查日期">
              <NDatePicker
                v-model:value="inspectionInfo.inspectionDate" type="datetime" clearable
                value-format="yyyy-MM-dd HH:mm:ss" :disabled="isDateInvalid" class="custom-input"
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="检查人员">
              <NInput
                v-model:value="inspectionInfo.inspector" placeholder="请输入检查人员" clearable
                class="custom-input"
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="线路名称">
              <NInput
                v-model:value="inspectionInfo.lineName" placeholder="请输入线路名称" clearable
                class="custom-input"
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="上下行">
              <NInput
                v-model:value="inspectionInfo.direction" placeholder="请输入上下行" clearable
                class="custom-input"
              />
            </NFormItem>
          </NGridItem>
          <NGridItem>
            <NFormItem label="X米弦">
              <NInput
                v-model:value="inspectionInfo.chordLength" placeholder="请输入X米弦" clearable
                class="custom-input"
              />
            </NFormItem>
          </NGridItem>
        </NGrid>
        <n-space style="margin-top: 16px;">
          <NButton type="primary" @click="handleSearch">
            筛选
          </NButton>
          <NButton @click="resetSearch">
            重置
          </NButton>
        </n-space>
      </NForm>
    </NCard>

    <!-- 表格 -->
    <n-data-table :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
    <n-pagination
      v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
      :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
      style="margin-top: 16px; justify-content: center;"
    />
  </CommonPage>
</template>

<script setup>
import { NButton, NCard, NDatePicker, NForm, NFormItem, NGrid, NGridItem, NInput, NTooltip } from 'naive-ui'
import { h, nextTick, onMounted, ref } from 'vue'
import api from './api'

// 控制搜索表单显示状态
const showSearchForm = ref(true)

// 切换搜索表单显示状态
function toggleSearchForm() {
  showSearchForm.value = !showSearchForm.value
}
// 检查信息
const inspectionInfo = ref({
  inspectionDate: null, // 初始化为 null
  inspector: '',
  lineName: '',
  direction: '',
  chordLength: '',
})

// 是否禁用日期选择器（用于调试无效日期）
const isDateInvalid = ref(false)

// 搜索表单数据
const searchForm = ref({
  lineName: '',
  direction: '',
  mileage: '',
  pageNo: 1,
  pageSize: 10,
})

// 日期格式转换工具函数
// function parseDate(dateStr) {
//     if (!dateStr || typeof dateStr !== 'string') {
//         console.warn(`无效的日期输入: ${dateStr}`)
//         return null
//     }
//     // 尝试解析常见日期格式
//     const formats = [
//         'YYYY-MM-DD HH:mm:ss',
//         'YYYY-MM-DD',
//         'YYYY/MM/DD HH:mm:ss',
//         'YYYY/MM/DD'
//     ]
//     for (const format of formats) {
//         const parsed = new Date(Date.parse(dateStr))
//         if (!isNaN(parsed.getTime())) {
//             return parsed.getTime() // 返回时间戳（毫秒）
//         }
//     }
//     console.warn(`无法解析的日期格式: ${dateStr}`)
//     return null
// }

function parseDate(dateStr) {
  if (!dateStr)
    return null

  try {
    // 尝试直接解析
    const date = new Date(dateStr)
    if (isNaN(date.getTime()))
      throw new Error('Invalid date')
    return date.getTime()
  }
  catch (e) {
    console.warn(`无法解析日期: ${dateStr}, 错误: ${e.message}`)
    return null
  }
}

// 定义表格列（保持不变）
const columns = [
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '里程'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'km'),
    ]),
    key: 'mileage',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '长度'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'm'),
    ]),
    key: 'length',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '轨距'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'gauge',
    width: 100,
  },
  // {
  //     title: () => h('div', [
  //         h('div', '轨距变化率'),
  //         h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm')
  //     ]),
  //     key: 'gaugeChangeRate',
  //     width: 120
  // },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '水平'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'level',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '三角坑'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'triangularPit',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '左高低'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightHeight',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '右高低'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightHeight',
    width: 100,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '左轨向(正矢)'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'leftHeight',
    width: 140,
  },
  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, '右轨向(正矢)'),
      h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
    ]),
    key: 'rightTrackDirection',
    width: 140,
  },

  {
    title: () => h('div', [
      h('div', { style: { fontSize: '18px' } }, 'TQI'),
      // h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm')
    ]),
    key: 'tqi',
    width: 100,
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

// 获取数据
async function fetchData() {
  loading.value = true
  try {
    const params = {
      line_name: searchForm.value.lineName,
      direction: searchForm.value.direction,
      mileage: searchForm.value.mileage,
      pageNo: pagination.value.pageNo, // 使用 pagination.pageNo
      pageSize: pagination.value.pageSize, // 使用 pagination.pageSize
    }
    const response = await api.getTqi(params)
    console.warn('后端返回数据:', response.data) // 调试：打印后端数据

    tableData.value = (response.data.pageData || []).map((item) => {
      const parsedDate = parseDate(item.inspectionDate)
      if (!parsedDate && item.inspectionDate) {
        isDateInvalid.value = true // 标记日期无效
      }
      return {
        inspectionDate: parsedDate,
        inspector: item.inspector || '',
        lineName: item.lineName || '',
        direction: item.direction || '',
        chordLength: item.chordLength || '',
        mileage: item.mileage || '',
        length: item.length || '',
        gauge: item.gauge || '',
        gaugeChangeRate: item.gaugeChangeRate || '',
        level: item.level || '',
        triangularPit: item.triangularPit || '',
        rightHeight: item.rightHeight || '',
        rightTrackDirection: item.rightTrackDirection || '',
        leftHeight: item.leftHeight || '',
        tqi: item.tqi || '',
      }
    })
    // 更新检查信息
    if (tableData.value.length > 0) {
      const firstItem = tableData.value[0]
      inspectionInfo.value = {
        inspectionDate: firstItem.inspectionDate,
        inspector: firstItem.inspector,
        lineName: firstItem.lineName,
        direction: firstItem.direction,
        chordLength: firstItem.chordLength,
      }
    }
    else {
      inspectionInfo.value = {
        inspectionDate: null,
        inspector: '',
        lineName: '',
        direction: '',
        chordLength: '',
      }
    }
    pagination.value.total = response.data.total || 0
    pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize)
    await nextTick()
  }
  catch (error) {
    console.error('获取数据失败:', error)
    tableData.value = []
    pagination.value.total = 0
    inspectionInfo.value = {
      inspectionDate: null,
      inspector: '',
      lineName: '',
      direction: '',
      chordLength: '',
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
  isDateInvalid.value = false // 重置日期无效标记
  await fetchData()
}

// 重置
async function resetSearch() {
  searchForm.value = {
    lineName: '',
    direction: '',
    mileage: '',
    pageNo: 1,
    pageSize: 10,
  }
  inspectionInfo.value = {
    inspectionDate: null,
    inspector: '',
    lineName: '',
    direction: '',
    chordLength: '',
  }
  isDateInvalid.value = false // 重置日期无效标记
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
  border-collapse: collapse; /* 关键属性：合并单元格边框 */
}
/* 表头背景颜色 */
:deep(.n-data-table thead th) {
  border: 1px solid rgb(189, 187, 187) !important;
  background-color: rgb(32, 44, 51) !important;
}

/* 表体行背景色（覆盖整行） */
:deep(.n-data-table tbody tr) {
  background-color: rgb(39, 88, 86) !important; /* 主颜色 */
}

/* 可选：奇偶行区分（增强视觉） */
:deep(.n-data-table tbody tr:nth-child(odd)) {
  background-color: rgb(39, 88, 86) !important; /* 奇数行 */
}
:deep(.n-data-table tbody tr:nth-child(even)) {
  background-color: rgba(39, 88, 86, 0.8) !important; /* 偶数行（更浅） */
}

/* 关键：覆盖单元格默认背景色（如果 UI 库有默认样式） */
:deep(.n-data-table tbody td) {
  border: 1px solid rgb(189, 187, 187);
  background-color: transparent !important; /* 清除 td 自带的背景色 */
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

:deep(.n-input__placeholder) {
  color: #8d8d8d !important; /* 淡灰色 */
}
:deep(.n-input__input-el) {
  color: black;
}

/* 修改输入框为圆角样式 */
:deep(.custom-input .n-input__input) {
  border-radius: 12px !important; /* 圆角大小 */
}
</style>
