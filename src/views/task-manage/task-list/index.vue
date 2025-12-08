<template>
  <CommonPage>
    <div ref="taskContainer" style="padding: 20px; border-radius: 20px;">
      <!-- 搜索和按钮区域保持不变 -->
      <NSpace justify="space-between" align="center">
        <NInput
          v-model:value="searchQuery" placeholder="搜索任务"
          style="background-color: #24221e56; border: 1px solid #ffffff; border-radius: 16px; color: #ffffff; width: 300px; height: 40px;"
        />
        <NSpace>
          <!-- 重置按钮 - 黑色背景 白色文字 -->
          <NButton class="reset-btn" @click="goToCreate">
            重置
          </NButton>

          <!-- 查询按钮 - 深灰色背景 白色文字 -->
          <NButton class="query-btn" @click="goToCreate">
            查询
          </NButton>

          <!-- 新增按钮 - 浅蓝色背景 深红色文字 -->
          <NButton class="add-btn" @click="goToCreate">
            新增
          </NButton>
          <!-- 生成报表按钮 - 绿色背景 白色文字 -->
          <NButton class="report-btn" @click="showReportForm">
            生成报表
          </NButton>
        </NSpace>
      </NSpace>

      <!-- 新增的表格背景容器 -->
      <div class="table-background-container">
        <n-data-table
          :row-key="row => row.id"
          :checked-row-keys="selectedRowKeys"
          @update:checked-row-keys="handleCheckChange"
          striped :columns="columns" :data="filteredTaskList" :pagination="pagination" :bordered="false"
          class="transparent-table" style="position: relative;"
        />
      </div>
    </div>

    <!-- 生成报表表单对话框 -->
    <n-modal v-model:show="showFormModal" :mask-closable="false">
      <n-card
        style="width: 600px; max-width: 90vw;"
        title="生成报表"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showFormModal = false">
            ×
          </n-button>
        </template>

        <n-form
          ref="reportFormRef"
          :model="reportFormData"
          :rules="formRules"
          label-placement="left"
          label-width="120px"
        >
          <div v-for="(form, index) in reportFormData.forms" :key="index" class="form-section">
            <n-h3 prefix="bar" style="margin-top: 0;">
              <n-text type="primary">任务 {{ index + 1 }}: {{ getTaskName(form.jobId) }}</n-text>
            </n-h3>
            
            <n-form-item label="检验类别" :path="`forms[${index}].inspectionType`">
              <n-select
                v-model:value="form.inspectionType"
                placeholder="请选择检验类别"
                :options="inspectionTypeOptions"
                clearable
              />
            </n-form-item>
            
            <n-form-item label="检验主要设备" :path="`forms[${index}].mainEquipment`">
              <n-input
                v-model:value="form.mainEquipment"
                placeholder="请输入检验主要设备"
                clearable
              />
            </n-form-item>
            
            <n-form-item label="检验项目" :path="`forms[${index}].inspectionItem`">
              <n-select
                v-model:value="form.inspectionItem"
                type="textarea"
                placeholder="请输入检验项目"
                :options="inspectionTypeOptions2"
                clearable
              />
            </n-form-item>
            
            <n-divider v-if="index < reportFormData.forms.length - 1" />
          </div>
        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showFormModal = false">取消</n-button>
            <n-button type="primary" :loading="submitLoading" @click="handleFormSubmit">
              提交并生成报表
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { useTaskStore } from '@/store'
import { 
  NButton, NInput, NRadio, NRadioGroup, NSpace, 
  NForm, NFormItem, NSelect, NModal, NCard, 
  NH3, NText, NDivider 
} from 'naive-ui'
import { computed, h, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from './api'

const router = useRouter()
const searchQuery = ref('')
const taskContainer = ref(null)
const tableHeight = ref(0)

// 生成报表相关状态
const showFormModal = ref(false)
const submitLoading = ref(false)
const reportFormRef = ref(null)

// 表单数据
const reportFormData = ref({
  forms: []
})

// 表单验证规则
const formRules = {
  forms: {
    validator: (rule, value) => {
      for (const form of value) {
        if (!form.inspectionType) {
          return new Error('请填写所有检验类别')
        }
        if (!form.mainEquipment) {
          return new Error('请填写所有检验主要设备')
        }
        if (!form.inspectionItem) {
          return new Error('请填写所有检验项目')
        }
      }
      return true
    },
    trigger: ['blur', 'input']
  }
}

// 检验类别选项
const inspectionTypeOptions = [
  { label: '开发试验', value: '开发试验' },
  { label: '线路检测', value: '线路检测' }
]

// 检验类别选项
const inspectionTypeOptions2 = [
  { label: '第一类参数', value: '第一类参数' },
  { label: '第二类参数', value: '第二类参数' },
  { label: '第三类参数', value: '第三类参数' },
  { label: '第四类参数', value: '第四类参数' }
]

function updateHeight() {
  if (taskContainer.value) {
    const windowHeight = window.innerHeight
    const containerHeight = windowHeight * 0.8
    taskContainer.value.style.height = `${containerHeight}px`
  }
}

async function getJobsData() {
  try {
    const response = await api.getJobsList()
    if (response.data) {
      taskList.value = response.data.pageData
      pagination.value.itemCount = response.data.length
      $message.success('获取作业数据成功')
      return response.data
    }
  }
  catch (error) {
    console.error('获取作业数据失败:', error)
    $message.error('获取作业数据失败')
  }
}

const taskList = ref([])
const filteredTaskList = computed(() => {
  if (!searchQuery.value)
    return taskList.value
  return taskList.value.filter((task) => {
    const jobName = task.jobName ? task.jobName.toLowerCase() : ''
    const description = task.description ? task.description.toLowerCase() : ''
    return jobName.includes(searchQuery.value.toLowerCase()) || description.includes(searchQuery.value.toLowerCase())
  })
})

// 获取任务名称
const getTaskName = (jobId) => {
  const task = taskList.value.find(t => t.id === jobId)
  return task ? task.jobName : `任务 ${jobId}`
}

// 显示生成报表表单
function showReportForm() {
  if (selectedRowKeys.value.length === 0) {
    $message.warning('请先选择要生成报表的任务')
    return
  }

  // 初始化表单数据
  reportFormData.value.forms = selectedRowKeys.value.map(jobId => ({
    jobId,
    inspectionType: '',
    mainEquipment: '',
    inspectionItem: ''
  }))

  showFormModal.value = true
}

// 处理表单提交
async function handleFormSubmit() {
  try {
    submitLoading.value = true
    
    // 验证表单
    await reportFormRef.value?.validate()
    
    // 提交表单数据并生成报表
    await generateReport()
    
    showFormModal.value = false
    $message.success('报表生成成功')
  } catch (error) {
    console.error('表单验证或报表生成失败:', error)
    if (error.errors) {
      $message.error('请填写完整的表单信息')
    } else {
      $message.error('报表生成失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 修改后的生成报表方法
async function generateReport() {
  try {
    const response = await api.generateReport({ 
      ids: selectedRowKeys.value,
      forms: reportFormData.value.forms // 添加表单数据
    })
    
    // 直接使用 ArrayBuffer 创建 Blob
    const blob = new Blob([response], { type: 'application/zip' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reports_${new Date().toISOString().slice(0,10)}.zip`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('生成报表失败:', error)
    throw error // 抛出错误以便上层处理
  }
}

const columns = [
  { type: 'selection' },
  { title: '任务名称', key: 'jobName' },
  { title: '线路类型', key: 'lineType' },
  { title: '方向', key: 'direction' },
  {
    title: '执行时间',
    key: 'timeRange',
    render(row) {
      return `${formatDateTime(row.startTime)} ~ ${formatDateTime(row.endTime)}`
    },
  },
  { title: '操作人员', key: 'operator' },
  { title: '设备编号', key: 'deviceId' },
  { title: '创建时间', key: 'createdAt', render: row => formatDateTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        {},
        [
          h(NButton, { size: 'small', onClick: () => editTask(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row.id) }, { default: () => '删除' }),
          h(NButton, { size: 'small', type: 'primary', onClick: () => startDetection(row) }, { default: () => '开始检测' }),
        ],
      )
    },
  },
]

const selectedDetectionType = ref('image')

async function handleDelete(id, confirmOptions) {
  if (id === undefined || id === null)
    return
  window.$dialog?.warning({
    content: '确定删除此任务吗？',
    title: '删除确认',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        const d = this
        d.loading = true
        const index = taskList.value.findIndex(task => task.id === id)
        if (index !== -1) {
          taskList.value.splice(index, 1)
          pagination.value.itemCount = taskList.value.length
        }
        $message.success('删除成功')
        d.loading = false
      }
      catch (error) {
        console.error(error)
        $message.error('删除失败!')
        this.loading = false
      }
    },
    ...confirmOptions,
  })
}

function startDetection(row) {
  window.$dialog?.success({
    title: '选择检测类型',
    content: () => h(NRadioGroup, {
      'value': selectedDetectionType.value,
      'onUpdate:value': val => selectedDetectionType.value = val,
    }, () => [
      h(NSpace, { vertical: true }, [
        h(NRadio, { value: 'image' }, '图像实时检测'),
        h(NRadio, { value: 'geometry' }, '几何实时检测'),
      ]),
    ]),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await createTaskRecord(row)
        if (selectedDetectionType.value === 'image') {
          router.push('/surface-detection/overview')
        }
        else {
          router.push('/track-geometry/overview')
        }
      }
      catch (error) {
        $message.error(`操作失败${error.message}`)
      }
    },
  })
}

async function createTaskRecord(task) {
  const taskStore = useTaskStore()
  console.log('创建任务记录:', task)
  const response = await api.startCurrentJob({
    jobId: task.id,
    startTime: task.startTime,
    startStation: task.startStation,
    operator: task.operator,
    jobStatus: 'started',
    createdAt: new Date().toISOString(),
  })
  if (response.code !== 0) {
    throw new Error('创建任务记录失败')
  }
  else {
    $message.success('任务记录创建成功')
    taskStore.setCurrentTask(response.data)
  }
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString)
    return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const selectedRowKeys = ref([])
function handleCheckChange(keys) {
  selectedRowKeys.value = keys
}
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: taskList.value.length,
})

const goToCreate = () => router.push('/taskmanage/task-create')
const editTask = row => router.push(`/tasks/edit/${row.id}`)

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
  getJobsData()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeight)
})

watch(() => filteredTaskList.value.length, updateHeight)
</script>

<style scoped>
/* 原有的样式保持不变 */
.reset-btn:deep(.n-button) {
  background-color: #000000 !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

.query-btn:deep(.n-button) {
  background-color: #333333 !important;
  border-color: #333333 !important;
  color: #ffffff !important;
}

.report-btn:deep(.n-button) {
  background-color: #4CAF50 !important;
  border-color: #4CAF50 !important;
  color: white !important;
}

.add-btn:deep(.n-button) {
  background-color: #66ccff !important;
  border-color: #66ccff !important;
  color: #8b0000 !important;
}

:deep(.n-button) {
  border-radius: 16px !important;
  min-width: 120px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s ease !important;
}

:deep(.n-button):hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 6px 12px rgba(15, 245, 226, 0.5) !important;
}

:deep(.n-button):active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 5px rgba(173, 12, 12, 0.4) !important;
}

.table-background-container {
  padding: 2px;
  margin-top: 30px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  height: 100%;
  background-image: url('/Frame.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.table-background-container :deep(.n-data-table),
.table-background-container :deep(.n-data-table-wrapper),
.table-background-container :deep(.n-data-table-table),
.table-background-container :deep(.n-data-table-thead),
.table-background-container :deep(.n-data-table-tbody),
.table-background-container :deep(.n-data-table-tr),
.table-background-container :deep(.n-data-table-th),
.table-background-container :deep(.n-data-table-td) {
  background: transparent !important;
}

:deep(.n-data-table-thead .n-data-table-th) {
  background-color: transparent !important;
  border-bottom: 2px solid #06f5e1 !important;
  color: #ffffff !important;
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid rgba(0, 170, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.n-data-table-tr.n-data-table-tr--striped) {
  background-color: rgba(31, 58, 61, 0.7) !important;
}

:deep(.n-data-table-tr) {
  position: relative;
}

:deep(.n-data-table-tr:not(:last-child)::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10px;
  right: 10px;
  height: 1px;
  background: linear-gradient(to right, rgba(10, 138, 109, 0), rgba(48, 126, 151, 0.8), rgba(10, 138, 109, 0));
}

:deep(.n-pagination) {
  background: transparent !important;
  color: white !important;
}

:deep(.n-pagination-item) {
  background: transparent !important;
  border: 1px solid #00aaff;
  color: white !important;
}

/* 新增的表单样式 */
.form-section {
  margin-bottom: 20px;
}

.form-section:last-child {
  margin-bottom: 0;
}
</style>