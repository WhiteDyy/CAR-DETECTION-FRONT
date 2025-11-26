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
        </NSpace>
      </NSpace>

      <!-- 新增的表格背景容器 -->
      <div class="table-background-container">
        <n-data-table
          striped :columns="columns" :data="filteredTaskList" :pagination="pagination" :bordered="false"
          class="transparent-table" style="position: relative;"
        />
      </div>
    </div>
  </CommonPage>
</template>

<script setup>
import { useTaskStore } from '@/store'
import { NButton, NInput, NRadio, NRadioGroup, NSpace } from 'naive-ui'
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from './api'

const router = useRouter()
const searchQuery = ref('')
const taskContainer = ref(null)
const tableHeight = ref(0)

function updateHeight() {
  if (taskContainer.value) {
    const windowHeight = window.innerHeight
    const containerHeight = windowHeight * 0.8 // 例如70%的窗口高度
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
// const filteredTaskList = computed(() => {
//   if (!searchQuery.value) return taskList.value;
//   return taskList.value.filter((task) =>
//     task.jobName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//     task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
//   );
// });
const filteredTaskList = computed(() => {
  if (!searchQuery.value)
    return taskList.value
  return taskList.value.filter((task) => {
    const jobName = task.jobName ? task.jobName.toLowerCase() : ''
    const description = task.description ? task.description.toLowerCase() : ''
    return jobName.includes(searchQuery.value.toLowerCase()) || description.includes(searchQuery.value.toLowerCase())
  })
})

const columns = [
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
.reset-btn:deep(.n-button) {
  background-color: #000000 !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

/* 查询按钮样式 - 深灰色背景 白色文字 */
.query-btn:deep(.n-button) {
  background-color: #333333 !important;
  border-color: #333333 !important;
  color: #ffffff !important;
}

/* 新增按钮样式 - 浅蓝色背景 深红色文字 */
.add-btn:deep(.n-button) {
  background-color: #66ccff !important;
  border-color: #66ccff !important;
  color: #8b0000 !important;
}

/* 公共按钮样式 */
:deep(.n-button) {
  border-radius: 16px !important;
  min-width: 120px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s ease !important;
}

/* 悬停效果 */
:deep(.n-button):hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 6px 12px rgba(15, 245, 226, 0.5) !important;
}

/* 按下效果 */
:deep(.n-button):active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 5px rgba(173, 12, 12, 0.4) !important;
}

/* 表格背景容器 */
.table-background-container {
  padding: 2px;
  margin-top: 30px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  height: 100%;
  /* 自适应高度 */
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

/* 透明表格样式 */

/* 深度穿透选择器覆盖Naive UI默认样式 */

/* 表头样式 */
:deep(.n-data-table-thead .n-data-table-th) {
  background-color: transparent !important;
  border-bottom: 2px solid #06f5e1 !important;
  color: #ffffff !important;
}

/* 单元格样式 */
:deep(.n-data-table-td) {
  border-bottom: 1px solid rgba(0, 170, 255, 0.3) !important;
  color: #ffffff !important;
}

/* 奇数行背景 */
:deep(.n-data-table-tr.n-data-table-tr--striped) {
  background-color: rgba(31, 58, 61, 0.7) !important;
}

/* 行分隔伪元素 */
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

/* 分页器样式 */
:deep(.n-pagination) {
  background: transparent !important;
  color: white !important;
}

:deep(.n-pagination-item) {
  background: transparent !important;
  border: 1px solid #00aaff;
  color: white !important;
}
</style>
