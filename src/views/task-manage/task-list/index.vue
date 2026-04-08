<template>
  <CommonPage>
    <div ref="taskContainer" class="task-container" style="padding: 20px; border-radius: 20px;">
      <!-- 搜索和按钮区域保持不变 -->
      <NSpace justify="space-between" align="center">
        <NInput
          v-model:value="searchQuery" placeholder="搜索任务"
          style="background-color: #24221e56; border: 1px solid #ffffff; border-radius: 16px; color: #ffffff; width: 300px; height: 40px;"
        />
        <NSpace>
          <!-- 重置按钮 - 黑色背景 白色文字 -->
          <NButton class="reset-btn" @click="handleReset">
            重置
          </NButton>

          <!-- 查询按钮 - 深灰色背景 白色文字 -->
          <NButton class="query-btn" @click="handleQuery">
            查询
          </NButton>

          <!-- 新增按钮 - 浅蓝色背景 深红色文字 -->
          <NButton class="add-btn" @click="showCreateDialog">
            新增
          </NButton>
          <!-- 生成报表按钮 - 绿色背景 白色文字 -->
          <NButton class="report-btn" @click="showReportForm">
            生成报表
          </NButton>
          <!-- 下载边缘机数据 -->
          <NButton class="download-btn" @click="downloadEdgeData">
            下载数据
          </NButton>
          <!-- 标定按钮 -->
          <NButton class="calibrate-btn" :loading="calibrating" @click="triggerCalibration">
            标定
          </NButton>
        </NSpace>
      </NSpace>

      <!-- 新增的表格背景容器 -->
      <div class="table-background-container">
        <n-data-table
          remote
          :row-key="row => row.id"
          :checked-row-keys="selectedRowKeys"
          @update:checked-row-keys="handleCheckChange"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
          striped
          size="small"
          table-layout="fixed"
          :columns="columns"
          :data="filteredTaskList"
          :pagination="pagination"
          :max-height="tableHeight"
          :bordered="false"
          class="transparent-table"
          style="position: relative;"
        />
      </div>
    </div>

    <!-- 新增任务对话框 -->
    <n-modal v-model:show="showCreateModal" :mask-closable="false">
      <n-card
        style="width: 600px; max-width: 90vw;"
        title="新增任务"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showCreateModal = false">
            ×
          </n-button>
        </template>

        <n-form
          ref="createFormRef"
          :model="createFormData"
          :rules="createFormRules"
          label-placement="left"
          label-width="100px"
        >
          <n-form-item label="任务名称" path="jobName">
            <n-input
              v-model:value="createFormData.jobName"
              placeholder="请输入任务名称"
              clearable
            />
          </n-form-item>

          <n-form-item label="测试区间" path="testSection">
            <n-input
              v-model:value="createFormData.testSection"
              placeholder="默认无"
              clearable
            />
          </n-form-item>

          <n-form-item label="测试日期" path="testDate">
            <n-date-picker
              v-model:value="createFormData.testDate"
              type="datetime"
              clearable
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="测试人员" path="operator">
            <n-input
              v-model:value="createFormData.operator"
              placeholder="默认 test"
              clearable
            />
          </n-form-item>

          <n-form-item label="采样频率" path="samplingFrequency">
            <n-input
              v-model:value="createFormData.samplingFrequency"
              placeholder="默认 300"
              clearable
            />
          </n-form-item>

          <n-form-item label="测试类型" path="testType">
            <n-select
              v-model:value="createFormData.testType"
              placeholder="请选择测试类型"
              :options="testTypeOptions"
              clearable
            />
          </n-form-item>


          

        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showCreateModal = false">取消</n-button>
            <n-button type="primary" :loading="createLoading" @click="handleCreateSubmit">
              确定
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>

    <!-- 生成报表表单对话框 -->
    <n-modal v-model:show="showFormModal" :mask-closable="false">
      <n-card
        style="width: 700px; max-width: 90vw;"
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

        <!-- 显示选中的任务列表 -->
        <div style="margin-bottom: 20px;">
          <n-text type="info" style="font-size: 14px;">已选择 {{ selectedRowKeys.length }} 个任务：</n-text>
          <n-tag
            v-for="jobId in selectedRowKeys"
            :key="jobId"
            style="margin: 4px 4px 4px 0;"
            type="info"
          >
            {{ getTaskName(jobId) }}
          </n-tag>
        </div>

        <n-form
          ref="reportFormRef"
          :model="reportFormData"
          :rules="formRules"
          label-placement="left"
          label-width="120px"
        >
          <n-form-item label="检验类别" path="inspectionType">
            <n-select
              v-model:value="reportFormData.inspectionType"
              placeholder="请选择检验类别"
              :options="inspectionTypeOptions"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="检验主要设备" path="mainEquipment">
            <n-input
              v-model:value="reportFormData.mainEquipment"
              placeholder="请输入检验主要设备（多个设备用逗号分隔）"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="检验项目" path="inspectionItem">
            <n-select
              v-model:value="reportFormData.inspectionItem"
              placeholder="请选择检验项目"
              :options="inspectionTypeOptions2"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="检测地点" path="inspectionLocation">
            <n-input
              v-model:value="reportFormData.inspectionLocation"
              placeholder="请输入检测地点"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="检测人员" path="inspector">
            <n-input
              v-model:value="reportFormData.inspector"
              placeholder="请输入检测人员（多个人员用逗号分隔）"
              clearable
            />
          </n-form-item>
          
          <n-form-item label="委托单位地址" path="clientAddress">
            <n-input
              v-model:value="reportFormData.clientAddress"
              placeholder="请输入委托单位地址（可选）"
              clearable
            />
          </n-form-item>
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

    <!-- 标定参数输入对话框 -->
    <n-modal v-model:show="showCalibrationModal" :mask-closable="false">
      <n-card
        style="width: 900px; max-width: 95vw;"
        title="标定参数输入（轨道坐标系目标点）"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showCalibrationModal = false">
            ×
          </n-button>
        </template>

        <n-text depth="3">每路激光输入格式：x,y; x,y; x,y（至少2个点）</n-text>

        <n-form label-placement="left" label-width="130px" style="margin-top: 12px;">
          <n-form-item label="激光1目标点">
            <n-input v-model:value="calibrationForm.laser1" placeholder="例如：440,64;475,64;510,64" clearable />
          </n-form-item>
          <n-form-item label="激光2目标点">
            <n-input v-model:value="calibrationForm.laser2" placeholder="例如：440,64;475,64;510,64" clearable />
          </n-form-item>
          <n-form-item label="激光3目标点">
            <n-input v-model:value="calibrationForm.laser3" placeholder="例如：1595,64;1630,64;1665,64" clearable />
          </n-form-item>
          <n-form-item label="激光4目标点">
            <n-input v-model:value="calibrationForm.laser4" placeholder="例如：1595,64;1630,64;1665,64" clearable />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space justify="end">
            <n-button @click="showCalibrationModal = false">取消</n-button>
            <n-button type="primary" :loading="calibrating" @click="confirmCalibration">开始标定</n-button>
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
  NH3, NText, NDivider, NDatePicker, NPagination 
} from 'naive-ui'
import { computed, h, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from './api'

const EDGE_DATA_DOWNLOAD_URL = import.meta.env.VITE_EDGE_DATA_DOWNLOAD_URL
const WIN_DOWNLOAD_SERVICE_BASE_URL = import.meta.env.VITE_WIN_DOWNLOAD_SERVICE_BASE_URL

const router = useRouter()
const searchQuery = ref('')
const taskContainer = ref(null)
const tableHeight = ref(0)

// 新增任务相关状态
const showCreateModal = ref(false)
const createLoading = ref(false)
const createFormRef = ref(null)
const createFormData = ref({
  jobName: '',
  testSection: '无',
  testDate: Date.now(),
  operator: 'test',
  samplingFrequency: '300',
  testType: '线岔道轨道几何参数测量模式',
})

// 新增任务表单验证规则
const createFormRules = {
  jobName: {
    required: true,
    message: '请输入任务名称',
    trigger: ['blur', 'input']
  },
  samplingFrequency: {
    required: true,
    trigger: ['blur', 'input'],
    validator: (_rule, value) => {
      if (value === null || value === undefined || String(value).trim() === '') {
        return new Error('请输入采样频率')
      }
      const n = Number(value)
      if (!Number.isInteger(n) || n <= 0) {
        return new Error('采样频率必须是大于 0 的整数')
      }
      return true
    }
  },
}

// 测试类型选项
const testTypeOptions = [
  { label: '线岔道轨道几何参数测量模式', value: '线岔道轨道几何参数测量模式' },
  { label: '道岔几何参数测量模式', value: '道岔几何参数测量模式' },
  { label: '钢轨波磨测量模式', value: '钢轨波磨测量模式' },
]

// 生成报表相关状态
const showFormModal = ref(false)
const submitLoading = ref(false)
const reportFormRef = ref(null)
const calibrating = ref(false)
const showCalibrationModal = ref(false)
const calibrationForm = ref({
  laser1: '',
  laser2: '',
  laser3: '',
  laser4: '',
})

// 表单数据 - 统一表单，应用到所有选中任务
const reportFormData = ref({
  inspectionType: '',
  mainEquipment: '',
  inspectionItem: '',
  inspectionLocation: '',
  inspector: '',
  clientAddress: ''
})

// 表单验证规则
const formRules = {
  inspectionType: {
    required: true,
    message: '请选择检验类别',
    trigger: ['blur', 'change']
  },
  mainEquipment: {
    required: true,
    message: '请输入检验主要设备',
    trigger: ['blur', 'input']
  },
  inspectionItem: {
    required: true,
    message: '请选择检验项目',
    trigger: ['blur', 'change']
  },
  inspectionLocation: {
    required: true,
    message: '请输入检测地点',
    trigger: ['blur', 'input']
  },
  inspector: {
    required: true,
    message: '请输入检测人员',
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
    // 预留顶部查询区和分页区高度，让表格主体可滚动
    tableHeight.value = Math.max(containerHeight - 220, 300)
  }
}

const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  // 后端分页时需要总条数
  itemCount: 0,
})

async function getJobsData() {
  try {
    // 后端分页参数约定：pageNo / pageSize
    const response = await api.getJobsList({
      pageNo: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    if (response.data) {
      const data = response.data.list || response.data.pageData || []
      // 按照 id 倒序排序（id 大的在前面）
      const sortedData = [...data].sort((a, b) => {
        const idA = Number(a.id) || 0
        const idB = Number(b.id) || 0
        return idB - idA
      })
      // 确保 startTime 和 endTime 正确处理（可能是 null、空字符串或其他格式）
      taskList.value = sortedData.map(task => {
        // 清理 startTime：如果为 null、undefined、空字符串或无效值，设置为 null
        let startTime = task.startTime
        if (startTime === null || startTime === undefined || startTime === '') {
          startTime = null
        } else {
          const startTimeStr = String(startTime).trim()
          if (startTimeStr === '' || startTimeStr === 'null' || startTimeStr === 'undefined') {
            startTime = null
          }
        }
        
        // 清理 endTime：如果为 null、undefined、空字符串或无效值，设置为 null
        let endTime = task.endTime
        if (endTime === null || endTime === undefined || endTime === '') {
          endTime = null
        } else {
          const endTimeStr = String(endTime).trim()
          if (endTimeStr === '' || endTimeStr === 'null' || endTimeStr === 'undefined') {
            endTime = null
          }
        }
        
        return {
          ...task,
          startTime,
          endTime,
        }
      })
      // 设置总条数，用于后端分页
      pagination.value.itemCount = response.data.total ?? data.length
      // 移除成功提示，避免频繁刷新时提示过多
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

  // 重置表单数据（统一表单，应用到所有选中任务）
  reportFormData.value = {
    inspectionType: '',
    mainEquipment: '',
    inspectionItem: '',
    inspectionLocation: '',
    inspector: '',
    clientAddress: ''
  }

  showFormModal.value = true
}

function downloadEdgeData() {
  if (!WIN_DOWNLOAD_SERVICE_BASE_URL) {
    // 兼容旧配置：如果还在用浏览器直连边缘机下载，这里保留旧逻辑
    if (!EDGE_DATA_DOWNLOAD_URL) {
      $message.error('未配置 Windows 下载服务地址（VITE_WIN_DOWNLOAD_SERVICE_BASE_URL）或边缘机下载地址（VITE_EDGE_DATA_DOWNLOAD_URL）')
      return
    }
    window.location.href = EDGE_DATA_DOWNLOAD_URL
    return
  }

  if (!selectedRowKeys.value.length) {
    $message.warning('请先选择要下载的任务')
    return
  }
  if (selectedRowKeys.value.length > 1) {
    $message.warning('一次只能下载一个任务，请只选择一个任务')
    return
  }

  const jobId = String(selectedRowKeys.value[0])
  const task = taskList.value.find(t => String(t.id) === jobId)
  const jobName = task?.jobName != null ? String(task.jobName) : ''

  const base = String(WIN_DOWNLOAD_SERVICE_BASE_URL).replace(/\/+$/, '')
  const url = `${base}/jobs/${encodeURIComponent(jobId)}/sync`

  $message.info('正在从边缘机同步并解压数据，请稍候...')
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobName }),
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.detail || '同步失败')
      }
      $message.success(`同步完成，数据已解压到：${data.extractDir || 'data 目录'}`)
    })
    .catch((e) => {
      console.error(e)
      $message.error(`同步失败：${e?.message || '无法连接 Windows 下载服务'}`)
    })
}

function triggerCalibration() {
  if (calibrating.value) return

  // 打开输入弹框，由用户手动输入轨道坐标系目标点
  showCalibrationModal.value = true
}

function parseFeaturePointsText(text) {
  const raw = String(text || '').trim()
  if (!raw) return []
  return raw
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const [x, y] = pair.split(',').map(v => Number(String(v).trim()))
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`点格式错误: ${pair}，应为 x,y`) 
      }
      return [x, y]
    })
}

async function confirmCalibration() {
  try {
    calibrating.value = true

    const fp1 = parseFeaturePointsText(calibrationForm.value.laser1)
    const fp2 = parseFeaturePointsText(calibrationForm.value.laser2)
    const fp3 = parseFeaturePointsText(calibrationForm.value.laser3)
    const fp4 = parseFeaturePointsText(calibrationForm.value.laser4)

    const all = [fp1, fp2, fp3, fp4]
    for (let i = 0; i < all.length; i += 1) {
      if (all[i].length < 2) {
        throw new Error(`激光${i + 1} 目标点至少输入2个`) 
      }
    }

    const selectedTask = selectedRowKeys.value.length
      ? taskList.value.find(t => String(t.id) === String(selectedRowKeys.value[0]))
      : null
    const taskName = selectedTask?.jobName ? String(selectedTask.jobName) : 'calibration'

    const resp = await api.calibrate({
      taskName,
      featurePoints: {
        laser1: fp1,
        laser2: fp2,
        laser3: fp3,
        laser4: fp4,
      },
    })

    if (resp?.code !== 0) {
      throw new Error(resp?.message || '发送标定命令失败')
    }

    showCalibrationModal.value = false
    $message.success('标定命令已发送：将先采集，再自动提取齿尖交点并计算 R/T')
  }
  catch (error) {
    console.error('触发标定失败:', error)
    $message.error(error?.message || '触发标定失败')
    throw error
  }
  finally {
    calibrating.value = false
  }
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
    // 将统一表单数据应用到所有选中任务
    // 注意：后端现在只需要一个表单数据（统一表单），但为了兼容性，我们仍然传递一个数组
    const forms = [{
      jobId: String(selectedRowKeys.value[0]), // 使用第一个任务ID作为占位符
      inspectionType: reportFormData.value.inspectionType,
      mainEquipment: reportFormData.value.mainEquipment,
      inspectionItem: reportFormData.value.inspectionItem,
      inspectionLocation: reportFormData.value.inspectionLocation,
      inspector: reportFormData.value.inspector,
      clientAddress: reportFormData.value.clientAddress
    }]
    
    const response = await api.generateReport({ 
      ids: selectedRowKeys.value,
      forms: forms // 统一表单数据
    })
    
    // 直接使用 ArrayBuffer 创建 Blob（docx文件）
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 生成文件名（使用当前日期）
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '')
    a.download = `report_${dateStr}.docx`
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
  { type: 'selection', width: 60 },
  { title: '任务名称', key: 'jobName', width: 150, ellipsis: { tooltip: true } },
  { title: '测试类型', key: 'testType', width: 220, ellipsis: { tooltip: true } },
  { title: '测试区间', key: 'testSection', width: 120, ellipsis: { tooltip: true } },
  {
    title: '测试日期',
    key: 'testDate',
    width: 160,
    render: row => formatDateTime(row.testDate || row.createdAt),
  },
  {
    title: '执行时间',
    key: 'timeRange',
    width: 260,
    render(row) {
      return `${formatDateTime(row.startTime)} ~ ${formatDateTime(row.endTime)}`
    },
  },
  { title: '操作人员', key: 'operator', width: 80, ellipsis: { tooltip: true } },
  {
    title: '采样频率',
    key: 'samplingFrequency',
    width: 100,
    render(row) {
      return row.samplingFrequency ? `${row.samplingFrequency}` : '-'
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: row => formatDateTime(row.createdAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    render(row) {
      const taskStore = useTaskStore()
      const currentTask = taskStore.getCurrentTask()
      const isCurrentTask = currentTask && currentTask.id === row.id
      
      // 判断任务状态：严格检查 startTime 和 endTime
      // 如果 startTime 为 null、undefined、空字符串或无效值，认为未开始
      const hasStartTime = row.startTime != null 
        && row.startTime !== '' 
        && row.startTime !== undefined
        && String(row.startTime).trim() !== ''
        && String(row.startTime).trim() !== 'null'
        && String(row.startTime).trim() !== 'undefined'
      
      // 如果 endTime 为 null、undefined、空字符串或无效值，认为未结束
      const hasEndTime = row.endTime != null 
        && row.endTime !== '' 
        && row.endTime !== undefined
        && String(row.endTime).trim() !== ''
        && String(row.endTime).trim() !== 'null'
        && String(row.endTime).trim() !== 'undefined'
      
      const isStarted = hasStartTime && !hasEndTime // 已开始但未结束
      const isEnded = hasEndTime // 已结束
      
      // 调试信息（开发时可以查看）
      // console.log('任务状态判断:', {
      //   id: row.id,
      //   jobName: row.jobName,
      //   startTime: row.startTime,
      //   endTime: row.endTime,
      //   hasStartTime,
      //   hasEndTime,
      //   isStarted,
      //   isEnded
      // })
      
      const buttons = []
      
      // 编辑按钮（已结束的任务不能编辑）
      if (!isEnded) {
        buttons.push(
          h(NButton, {
            size: 'small',
            class: 'action-btn',
            onClick: () => editTask(row),
          }, { default: () => '编辑' }),
        )
      }
      
      // 删除按钮
      buttons.push(
        h(NButton, {
          size: 'small',
          type: 'error',
          class: 'action-btn',
          onClick: () => handleDelete(row.id),
        }, { default: () => '删除' }),
      )
      
      // 开始检测按钮（只有未开始的任务才显示）
      if (!isStarted && !isEnded) {
        buttons.push(
          h(NButton, {
            size: 'small',
            type: 'primary',
            class: 'action-btn',
            onClick: () => startDetection(row),
          }, { default: () => '开始检测' }),
        )
      }
      
      // 结束检测按钮（只有已开始且未结束的任务才显示）
      if (isStarted && !isEnded) {
        buttons.push(
          h(NButton, {
            size: 'small',
            type: 'warning',
            class: 'action-btn',
            onClick: () => endDetection(row),
          }, { default: () => '结束检测' }),
        )
      }
      
      // 状态提示（已结束的任务显示状态）
      if (isEnded) {
        buttons.push(
          h('span', { style: { color: '#999', fontSize: '12px' } }, '已结束')
        )
      }
      
      return h(
        NSpace,
        {
          wrap: false,
          size: 8,
          align: 'center',
          justify: 'start',
        },
        buttons,
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
        // 调用后端API删除任务
        const response = await api.deleteJob(id)
        
        if (response.code !== 0) {
          throw new Error(response.message || '删除失败')
        }
        
        // 删除成功后，重新从后端拉取当前页数据
        // 如果当前页只剩一条且被删掉，并且不是第一页，则回到上一页再请求
        if (taskList.value.length === 1 && pagination.value.page > 1) {
          pagination.value.page -= 1
        }
        await getJobsData()
        $message.success('删除成功')
      }
      catch (error) {
        console.error('删除任务失败:', error)
        $message.error(error.message || '删除失败!')
        // 抛出错误以阻止对话框关闭
        throw error
      }
    },
    ...confirmOptions,
  })
}

function startDetection(row) {
  // 先检查任务状态
  const hasEndTime = row.endTime != null && row.endTime !== '' && String(row.endTime).trim() !== ''
  const hasStartTime = row.startTime != null && row.startTime !== '' && String(row.startTime).trim() !== ''
  const isStarted = hasStartTime && !hasEndTime
  const isEnded = hasEndTime
  
  if (isStarted) {
    $message.warning('该任务已开始，不能重复开始')
    return
  }
  
  if (isEnded) {
    $message.warning('该任务已结束，不能再次开始')
    return
  }
  
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
        $message.error(`操作失败: ${error.message}`)
      }
    },
  })
}

async function createTaskRecord(task) {
  const taskStore = useTaskStore()
  console.log('开始检测任务:', task)
  
  // 检查任务是否已开始（有开始时间且没有结束时间）
  const hasEndTime = task.endTime != null && task.endTime !== '' && String(task.endTime).trim() !== ''
  const hasStartTime = task.startTime != null && task.startTime !== '' && String(task.startTime).trim() !== ''
  if (hasStartTime && !hasEndTime) {
    throw new Error('该任务已开始，不能重复开始')
  }
  
  // 检查任务是否已结束
  if (hasEndTime) {
    throw new Error('该任务已结束，不能再次开始')
  }
  
  // 格式化当前时间为ISO格式，作为开始时间
  const formatDateTimeForApi = (timestamp) => {
    if (!timestamp) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    }
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  }
  
  // 调用开始检测API，传入任务ID和当前时间作为开始时间
  const response = await api.startCurrentJob({
    id: task.id, // 使用id字段，后端会根据id更新现有任务
    jobId: task.id,
    jobName: task.jobName,
    startTime: formatDateTimeForApi(Date.now()), // 设置为当前时间
    operator: task.operator,
    lineType: task.lineType,
    direction: task.direction,
    speed: task.speed,
    testSection: task.testSection,
    testDate: task.testDate,
    testType: task.testType,
    samplingFrequency: Number(task.samplingFrequency || task.speed || 300),
  })
  
  if (response.code !== 0) {
    throw new Error(response.message || '开始检测失败')
  }
  else {
    $message.success('检测已开始')
    // 更新任务状态到store
    taskStore.setCurrentTask(response.data)
    // 刷新任务列表以显示更新后的开始时间
    await getJobsData()
  }
}

// 结束检测
async function endDetection(row) {
  const taskStore = useTaskStore()
  const currentTask = taskStore.getCurrentTask()
  
  // 检查是否是当前正在进行的任务
  if (!currentTask || currentTask.id !== row.id) {
    // 如果不是当前任务，需要先设置当前任务
    taskStore.setCurrentTask(row)
  }
  
  window.$dialog?.warning({
    content: '确定要结束本次检测吗？',
    title: '结束检测确认',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        // 调用结束作业API
        const response = await api.stopCurrentJob({
          id: row.id,
          ...row
        })
        
        if (response.code !== 0) {
          throw new Error(response.message || '结束检测失败')
        }
        
        // 清除当前任务状态
        taskStore.clearCurrentTask()
        $message.success('检测已成功结束')
        
        // 刷新任务列表
        await getJobsData()
      }
      catch (error) {
        console.error('结束检测失败:', error)
        $message.error(error.message || '结束检测失败')
        // 抛出错误以阻止对话框关闭
        throw error
      }
    },
  })
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

// 切换页码（后端分页）
function handlePageChange(page) {
  pagination.value.page = page
  getJobsData()
}

// 切换每页数量（后端分页）
function handlePageSizeChange(pageSize) {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  getJobsData()
}

// 显示新增任务对话框
function showCreateDialog() {
  // 重置表单数据（不包含开始时间和结束时间，这些由开始/结束检测按钮自动设置）
  createFormData.value = {
    jobName: '',
    testSection: '无',
    testDate: Date.now(),
    operator: 'test',
    samplingFrequency: '300',
    testType: '线岔道轨道几何参数测量模式',
  }
  showCreateModal.value = true
}

// 处理新增任务提交
async function handleCreateSubmit() {
  try {
    createLoading.value = true
    
    // 等待DOM更新后再验证
    await nextTick()
    
    // 验证表单
    await createFormRef.value?.validate()
    
    // 构建请求数据（新增任务时，不设置startTime和endTime，这些由开始/结束检测按钮自动设置）
    const requestData = {
      jobName: createFormData.value.jobName,
      lineType: '道岔',
      direction: '-',
      testSection: createFormData.value.testSection || '无',
      testDate: createFormData.value.testDate,
      operator: createFormData.value.operator || 'test',
      samplingFrequency: Number(createFormData.value.samplingFrequency || 300),
      testType: createFormData.value.testType,
      speed: String(createFormData.value.samplingFrequency || '300')
      // 注意：不包含 startTime 和 endTime，这些字段由开始/结束检测按钮自动设置
    }
    
    // 调用API创建任务
    const response = await api.createJob(requestData)
    
    if (response.code !== 0) {
      throw new Error(response.message || '创建任务失败')
    }
    
    $message.success('任务创建成功')
    showCreateModal.value = false
    
    // 新增后默认回到第一页，并重新从后端拉取数据
    pagination.value.page = 1
    await getJobsData()
  } catch (error) {
    console.error('创建任务失败:', error)
    if (error.errors) {
      $message.error('请填写完整的表单信息')
    } else {
      $message.error(error.message || '创建任务失败')
    }
  } finally {
    createLoading.value = false
  }
}

// 重置功能：清空搜索条件并重新加载数据
async function handleReset() {
  searchQuery.value = ''
  pagination.value.page = 1
  await getJobsData()
  $message.success('已重置搜索条件')
}

// 查询功能：重新加载数据（搜索过滤由computed自动处理）
async function handleQuery() {
  pagination.value.page = 1
  await getJobsData()
  if (searchQuery.value) {
    $message.success('查询完成')
  }
}

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

watch(searchQuery, () => {
  pagination.value.page = 1
})
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

.download-btn:deep(.n-button) {
  background-color: #5b6cff !important;
  border-color: #5b6cff !important;
  color: #ffffff !important;
}

.calibrate-btn:deep(.n-button) {
  background-color: #ff9800 !important;
  border-color: #ff9800 !important;
  color: #ffffff !important;
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

:deep(.action-btn.n-button) {
  min-width: 90px !important;
  padding: 6px 12px !important;
  border-radius: 10px !important;
}

.task-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-background-container {
  padding: 2px;
  margin-top: 30px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
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

/* 新增任务对话框样式 */
:deep(.n-modal) {
  background: rgba(0, 0, 0, 0.8) !important;
}

:deep(.n-card) {
  background: linear-gradient(135deg, rgba(36, 34, 30, 0.95) 0%, rgba(28, 52, 54, 0.95) 100%) !important;
  border: 1px solid rgba(6, 245, 225, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}

:deep(.n-card-header) {
  border-bottom: 1px solid rgba(6, 245, 225, 0.3) !important;
  color: #ffffff !important;
}

:deep(.n-card__title) {
  color: #06f5e1 !important;
  font-weight: 600 !important;
}

:deep(.n-form-item-label) {
  color: #ffffff !important;
}

:deep(.n-input),
:deep(.n-select),
:deep(.n-date-picker) {
  background-color: rgba(36, 34, 30, 0.6) !important;
  border: 1px solid rgba(6, 245, 225, 0.3) !important;
  border-radius: 8px !important;
  color: #ffffff !important;
}

:deep(.n-input:focus),
:deep(.n-select:focus),
:deep(.n-date-picker:focus) {
  border-color: #06f5e1 !important;
  box-shadow: 0 0 0 2px rgba(6, 245, 225, 0.2) !important;
}

:deep(.n-input__input-el),
:deep(.n-select__input) {
  color: #ffffff !important;
}

:deep(.n-input__placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.n-button) {
  border-radius: 8px !important;
}

:deep(.n-button--primary-type) {
  background-color: #06f5e1 !important;
  border-color: #06f5e1 !important;
  color: #1f3a3d !important;
}

:deep(.n-button--primary-type:hover) {
  background-color: #05d4c4 !important;
  border-color: #05d4c4 !important;
}
</style>