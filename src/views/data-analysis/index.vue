<template>
  <CommonPage>
    <div ref="pageRef" class="page">
      <!-- 上半部分：任务列表 -->
      <div class="panel panel-top">
        <div class="panel-inner">
          <NSpace justify="space-between" align="center" class="toolbar">
            <NInput
              v-model:value="searchQuery"
              placeholder="搜索任务名称"
              clearable
              class="search"
            />
            <NSpace>
              <NButton class="reset-btn" @click="handleReset">重置</NButton>
              <NButton class="query-btn" @click="handleQuery">查询</NButton>
            </NSpace>
          </NSpace>

          <div class="table-wrap">
            <n-data-table
              remote
              striped
              size="small"
              table-layout="fixed"
              :row-key="row => row.id"
              :columns="columns"
              :data="filteredTaskList"
              :pagination="pagination"
              :checked-row-keys="selectedRowKeys"
              :max-height="tableHeight"
              :bordered="false"
              @update:checked-row-keys="handleCheckChange"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </div>
      </div>

      <!-- 下半部分：分析/报表按钮 -->
      <div class="panel panel-bottom">
        <div class="panel-inner">
          <div class="section-title">数据分析与报表</div>
          <NSpace justify="center" wrap size="large" class="btn-group">
            <NButton class="metric-btn" :type="metricBtnType('水平')" @click="toggleMetric('水平')">水平</NButton>
            <NButton class="metric-btn" :type="metricBtnType('轨距')" @click="toggleMetric('轨距')">轨距</NButton>
            <NButton class="metric-btn" :type="metricBtnType('左高低')" @click="toggleMetric('左高低')">左高低</NButton>
            <NButton class="metric-btn" :type="metricBtnType('右高低')" @click="toggleMetric('右高低')">右高低</NButton>
            <NButton class="metric-btn" :type="metricBtnType('左轨向')" @click="toggleMetric('左轨向')">左轨向</NButton>
            <NButton class="metric-btn" :type="metricBtnType('右轨向')" @click="toggleMetric('右轨向')">右轨向</NButton>
            <NButton class="metric-btn" :type="metricBtnType('三角坑')" @click="toggleMetric('三角坑')">三角坑</NButton>
            <NButton class="metric-btn" :type="metricBtnType('陀螺解算轨迹')" @click="toggleMetric('陀螺解算轨迹')">陀螺解算轨迹</NButton>
            <NButton class="metric-btn" type="primary" @click="runSelectedReports">生成报表</NButton>
          </NSpace>
        </div>
      </div>
    </div>
  </CommonPage>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import { NButton, NInput, NSpace } from 'naive-ui'
import taskApi from '@/views/task-manage/task-list/api'

const WIN_DOWNLOAD_SERVICE_BASE_URL = import.meta.env.VITE_WIN_DOWNLOAD_SERVICE_BASE_URL

const pageRef = ref(null)
const tableHeight = ref(360)

const searchQuery = ref('')
const taskList = ref([])
const selectedRowKeys = ref([])
const selectedMetrics = ref(['水平'])

const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
})

function formatDateTime(val) {
  if (!val)
    return '-'
  const d = new Date(val)
  if (Number.isNaN(d.getTime()))
    return String(val)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function getJobsData() {
  try {
    const response = await taskApi.getJobsList({
      pageNo: pagination.value.page,
      pageSize: pagination.value.pageSize,
    })
    const data = response?.data?.list || response?.data?.pageData || []
    const sortedData = [...data].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
    taskList.value = sortedData
    pagination.value.itemCount = response?.data?.total ?? data.length
  } catch (error) {
    console.error('获取任务列表失败:', error)
    $message.error('获取任务列表失败')
  }
}

const filteredTaskList = computed(() => {
  const q = searchQuery.value?.trim()?.toLowerCase()
  if (!q)
    return taskList.value
  return taskList.value.filter((t) => {
    const name = (t.jobName ?? '').toString().toLowerCase()
    return name.includes(q)
  })
})

function handleReset() {
  searchQuery.value = ''
  selectedRowKeys.value = []
  pagination.value.page = 1
  getJobsData()
  $message.success('已重置')
}

function handleQuery() {
  pagination.value.page = 1
  getJobsData()
  $message.success('查询完成')
}

function handleCheckChange(keys) {
  selectedRowKeys.value = keys
}

function handlePageChange(page) {
  pagination.value.page = page
  getJobsData()
}

function handlePageSizeChange(pageSize) {
  pagination.value.pageSize = pageSize
  pagination.value.page = 1
  getJobsData()
}

async function downloadJobData(row) {
  if (!WIN_DOWNLOAD_SERVICE_BASE_URL) {
    $message.error('未配置 Windows 下载服务地址（VITE_WIN_DOWNLOAD_SERVICE_BASE_URL）')
    return
  }

  const base = String(WIN_DOWNLOAD_SERVICE_BASE_URL).replace(/\/+$/, '')
  const jobId = row?.id != null ? String(row.id) : ''
  const jobName = row?.jobName != null ? String(row.jobName) : ''
  if (!jobId) {
    $message.error('任务ID为空，无法下载')
    return
  }

  try {
    // 直接触发浏览器下载（zip 流），由 car_detect_win 负责从边缘机匹配 jobName 对应的 zip 并转发
    const url = `${base}/jobs/${encodeURIComponent(jobId)}/download?jobName=${encodeURIComponent(jobName)}`
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    $message.success('已开始下载（如浏览器拦截弹窗/下载，请允许）')
  } catch (e) {
    console.error(e)
    $message.error('下载失败：无法连接 Windows 下载服务')
  }
}

const columns = [
  { type: 'selection', width: 60 },
  {
    title: '序号',
    key: 'index',
    width: 80,
    render: (_, index) => index + 1 + (pagination.value.page - 1) * pagination.value.pageSize,
  },
  { title: '任务名称', key: 'jobName', minWidth: 160, ellipsis: { tooltip: true } },
  { title: '线路类型', key: 'lineType', width: 90, ellipsis: { tooltip: true } },
  { title: '方向', key: 'direction', width: 70, ellipsis: { tooltip: true } },
  { title: '操作人员', key: 'operator', width: 90, ellipsis: { tooltip: true } },
  { title: '设备编号', key: 'deviceId', width: 140, ellipsis: { tooltip: true } },
  {
    title: '速度',
    key: 'speed',
    width: 90,
    render: row => row.speed ? `${row.speed} km/h` : '-',
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 170,
    render: row => formatDateTime(row.createdAt),
  },
  {
    title: '执行时间',
    key: 'timeRange',
    width: 260,
    render(row) {
      return `${formatDateTime(row.startTime)} ~ ${formatDateTime(row.endTime)}`
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 130,
    render(row) {
      return h(NButton, {
        size: 'small',
        class: 'row-download-btn',
        onClick: () => downloadJobData(row),
      }, { default: () => '下载数据' })
    },
  },
]

function updateHeight() {
  const h = window.innerHeight
  // 给下半部分按钮区预留空间，让表格更好滚动
  tableHeight.value = Math.max(Math.floor(h * 0.40), 220)
}

function metricBtnType(name) {
  return selectedMetrics.value.includes(name) ? 'primary' : 'default'
}

function toggleMetric(name) {
  const idx = selectedMetrics.value.indexOf(name)
  if (idx >= 0)
    selectedMetrics.value.splice(idx, 1)
  else
    selectedMetrics.value.push(name)
}

async function runLevelReport() {
  if (!WIN_DOWNLOAD_SERVICE_BASE_URL) {
    $message.error('未配置 Windows 下载服务地址（VITE_WIN_DOWNLOAD_SERVICE_BASE_URL）')
    return
  }

  const base = String(WIN_DOWNLOAD_SERVICE_BASE_URL).replace(/\/+$/, '')
  const jobs = taskList.value
    .filter(row => selectedRowKeys.value.includes(row.id))
    .map(row => ({ id: row.id, jobName: row.jobName }))

  if (!jobs.length) {
    $message.error('未找到选中任务的数据')
    return
  }

  try {
    $message.info('正在生成水平报表，请稍候...')
    const res = await fetch(`${base}/reports/level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      $message.error(data?.detail || '生成报表失败')
      return
    }
    $message.success('水平报表已生成，请在 car_detect_win 的 data 目录中查看图片文件')
  } catch (e) {
    console.error(e)
    $message.error('生成报表失败：无法连接 Windows 下载服务')
  }
}

async function runGyroTrajectoryReport() {
  if (!WIN_DOWNLOAD_SERVICE_BASE_URL) {
    $message.error('未配置 Windows 下载服务地址（VITE_WIN_DOWNLOAD_SERVICE_BASE_URL）')
    return
  }
  const base = String(WIN_DOWNLOAD_SERVICE_BASE_URL).replace(/\/+$/, '')
  const jobs = taskList.value
    .filter(row => selectedRowKeys.value.includes(row.id))
    .map(row => ({ id: row.id, jobName: row.jobName }))

  if (!jobs.length) {
    $message.error('未找到选中任务的数据')
    return
  }

  try {
    $message.info('正在生成陀螺解算轨迹报表，请稍候...')
    const res = await fetch(`${base}/reports/gyro_trajectory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      $message.error(data?.detail || '生成报表失败')
      return
    }
    $message.success('陀螺解算轨迹报表已生成，请在 car_detect_win 的 data 目录中查看 docx 文件')
  } catch (e) {
    console.error(e)
    $message.error('生成报表失败：无法连接 Windows 下载服务')
  }
}

async function runSelectedReports() {
  if (!selectedRowKeys.value.length) {
    $message.warning('请先在上方选择任务')
    return
  }
  if (!selectedMetrics.value.length) {
    $message.warning('请先选择要生成的报表类型（可多选）')
    return
  }

  if (!WIN_DOWNLOAD_SERVICE_BASE_URL) {
    $message.error('未配置 Windows 下载服务地址（VITE_WIN_DOWNLOAD_SERVICE_BASE_URL）')
    return
  }

  const base = String(WIN_DOWNLOAD_SERVICE_BASE_URL).replace(/\/+$/, '')
  const jobs = taskList.value
    .filter(row => selectedRowKeys.value.includes(row.id))
    .map(row => ({ id: row.id, jobName: row.jobName }))
  if (!jobs.length) {
    $message.error('未找到选中任务的数据')
    return
  }

  try {
    $message.info('正在生成报表，请稍候...')
    const res = await fetch(`${base}/reports/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs, metrics: selectedMetrics.value }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      $message.error(data?.detail || '生成报表失败')
      return
    }
    $message.success('报表已生成，请在 car_detect_win 的 data 目录中查看 docx 文件')
  } catch (e) {
    console.error(e)
    $message.error('生成报表失败：无法连接 Windows 下载服务')
  }
}

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
  getJobsData()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeight)
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.panel {
  padding: 2px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background-image: url('/Frame.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.panel-inner {
  padding: 14px 16px;
}

.panel-top {
  flex: 1;
}

.panel-bottom {
  flex: 0 0 auto;
}

.toolbar {
  margin-bottom: 8px;
}

.search {
  width: 320px;
}

.table-wrap {
  border-radius: 14px;
  overflow: hidden;
}

/* 表格透明化 + 线条/条纹风格：对齐 task-list 页面 */
.panel-top :deep(.n-data-table),
.panel-top :deep(.n-data-table-wrapper),
.panel-top :deep(.n-data-table-table),
.panel-top :deep(.n-data-table-thead),
.panel-top :deep(.n-data-table-tbody),
.panel-top :deep(.n-data-table-tr),
.panel-top :deep(.n-data-table-th),
.panel-top :deep(.n-data-table-td) {
  background: transparent !important;
}

.panel-top :deep(.n-data-table-thead .n-data-table-th) {
  background-color: transparent !important;
  border-bottom: 2px solid #06f5e1 !important;
  color: #ffffff !important;
}

.panel-top :deep(.n-data-table-td) {
  border-bottom: 1px solid rgba(0, 170, 255, 0.3) !important;
  color: #ffffff !important;
}

.panel-top :deep(.n-data-table-tr.n-data-table-tr--striped) {
  background-color: rgba(31, 58, 61, 0.7) !important;
}

.panel-top :deep(.n-data-table-tr) {
  position: relative;
}

.panel-top :deep(.n-data-table-tr:not(:last-child)::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10px;
  right: 10px;
  height: 1px;
  background: linear-gradient(to right, rgba(10, 138, 109, 0), rgba(48, 126, 151, 0.8), rgba(10, 138, 109, 0));
}

.panel-top :deep(.n-pagination) {
  background: transparent !important;
  color: white !important;
}

.panel-top :deep(.n-pagination-item) {
  background: transparent !important;
  border: 1px solid #00aaff;
  color: white !important;
}

.section-title {
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 14px;
  text-align: center;
  letter-spacing: 1px;
  font-size: 18px;
}

.btn-group {
  padding: 10px 0 6px;
}

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

.row-download-btn:deep(.n-button) {
  border-radius: 10px !important;
  min-width: 96px !important;
  padding: 8px 14px !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  letter-spacing: 0.5px !important;
  background-color: rgba(91, 108, 255, 0.95) !important;
  border: 1px solid rgba(6, 245, 225, 0.25) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s ease !important;
}

.row-download-btn:deep(.n-button):hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 6px 12px rgba(15, 245, 226, 0.45) !important;
  border-color: rgba(6, 245, 225, 0.5) !important;
}

.row-download-btn:deep(.n-button):active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 5px rgba(173, 12, 12, 0.4) !important;
}

.metric-btn:deep(.n-button) {
  position: relative !important;
  overflow: hidden !important;
  min-width: 150px !important;
  border-radius: 16px !important;
  padding: 14px 28px !important;
  height: 46px !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  letter-spacing: 1px !important;
  background: linear-gradient(135deg, rgba(91, 108, 255, 0.95), rgba(76, 175, 80, 0.95)) !important;
  border: 1px solid rgba(6, 245, 225, 0.25) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s ease !important;
}

.metric-btn:deep(.n-button)::before {
  content: '';
  position: absolute;
  top: -60%;
  left: -30%;
  width: 60%;
  height: 220%;
  transform: rotate(25deg);
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.28) 50%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease, left 0.5s ease;
}

.metric-btn:deep(.n-button):hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 6px 12px rgba(15, 245, 226, 0.5) !important;
  border-color: rgba(6, 245, 225, 0.5) !important;
}

.metric-btn:deep(.n-button):hover::before {
  opacity: 1;
  left: 90%;
}

.metric-btn:deep(.n-button):active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 5px rgba(173, 12, 12, 0.4) !important;
}
</style>