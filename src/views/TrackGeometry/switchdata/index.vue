<template>
  <CommonPage>
    <div class="switch-manual-page">
      <NCard title="道岔人工测量数据录入" :bordered="false" class="form-card">
        <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="110px">
          <NGrid :cols="24" :x-gap="16">
            <NGi :span="8">
              <NFormItem label="批次名称" path="batchName">
                <NInput v-model:value="formData.batchName" placeholder="如：12号-60kg-上行线-20260408" clearable />
              </NFormItem>
            </NGi>
            <NGi :span="8">
              <NFormItem label="道岔名称" path="turnoutName">
                <NInput v-model:value="formData.turnoutName" placeholder="用于算法读取YAML配置的名称" clearable />
              </NFormItem>
            </NGi>
            <NGi :span="8">
              <NFormItem label="录入时间" path="recordedAt">
                <NDatePicker
                  v-model:value="formData.recordedAt"
                  type="datetime"
                  clearable
                  style="width: 100%"
                  :is-date-disabled="() => false"
                />
              </NFormItem>
            </NGi>
            <NGi :span="24">
              <NFormItem label="备注" path="remark">
                <NInput
                  v-model:value="formData.remark"
                  type="textarea"
                  :rows="2"
                  placeholder="可填写线路、施工状态、人工测量说明等"
                />
              </NFormItem>
            </NGi>
          </NGrid>

          <div class="section-title">节点录入（按 V3 测量工步）</div>
          <NDataTable
            :columns="nodeColumns"
            :data="formData.nodes"
            :pagination="false"
            size="small"
            :max-height="420"
            bordered
          />

          <NSpace justify="end" style="margin-top: 16px;">
            <NButton @click="resetForm">重置</NButton>
            <NButton type="primary" :loading="submitting" @click="handleSubmit">保存到数据库</NButton>
          </NSpace>
        </NForm>
      </NCard>

      <NCard title="已录入批次" :bordered="false" class="list-card">
        <NSpace justify="space-between" align="center" style="margin-bottom: 12px;">
          <NInput v-model:value="query.keyword" placeholder="按批次名称/道岔名称搜索" clearable style="width: 320px" />
          <NSpace>
            <NButton @click="fetchBatchList">查询</NButton>
            <NButton @click="resetQuery">重置</NButton>
          </NSpace>
        </NSpace>

        <NDataTable
          :columns="batchColumns"
          :data="batchList"
          :loading="loading"
          :row-key="row => row.id"
          :pagination="pagination"
          remote
          @update:page="onPageChange"
          @update:page-size="onPageSizeChange"
        />
      </NCard>

      <NModal v-model:show="detailVisible" style="width: 1100px; max-width: 95vw;">
        <NCard title="批次节点详情" :bordered="false">
          <NDescriptions bordered :column="2" style="margin-bottom: 12px;">
            <NDescriptionsItem label="批次名称">{{ detailRow?.batchName || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="道岔名称">{{ detailRow?.turnoutName || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="录入时间">{{ formatDateTime(detailRow?.recordedAt) }}</NDescriptionsItem>
            <NDescriptionsItem label="备注">{{ detailRow?.remark || '-' }}</NDescriptionsItem>
          </NDescriptions>
          <NDataTable :columns="nodeColumnsReadonly" :data="detailRow?.nodes || []" :pagination="false" size="small" />
        </NCard>
      </NModal>
    </div>
  </CommonPage>
</template>

<script setup>
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NGrid,
  NGi,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  useMessage,
} from 'naive-ui'
import CommonPage from '@/components/common/CommonPage.vue'
import api from './api'

const message = useMessage()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const detailVisible = ref(false)
const detailRow = ref(null)

const STEP_NAME_MAP = {
  1: '轨距测量值',
  2: '14道尺',
  3: '13道尺',
  4: '查照间隔',
  5: '护背间距',
  6: '心轨降低值',
  7: '护轨轮缘槽宽',
  8: '翼轨轮缘槽宽',
  9: '12道尺',
  10: '11道尺',
  11: '8道尺',
  12: '5道尺',
  13: '尖轨降低值',
  14: '尖轨轨距',
  15: '2道尺',
  16: '1道尺',
  17: '1米线检测车停止-后',
  18: '3道尺',
  19: '4道尺',
  20: '6道尺',
  21: '9道尺',
  22: '10道尺',
  23: '17道尺',
  24: '16道尺',
  25: '岔照间隔',
  26: '道岔轮缘槽宽',
  27: '辙叉轮缘槽宽',
  28: '有害空间轮缘槽宽',
  29: '15道尺',
}

function createDefaultNodes() {
  return Object.keys(STEP_NAME_MAP).map((k) => {
    const stepId = Number(k)
    return {
      stepId,
      stepName: STEP_NAME_MAP[stepId],
      startPulse: null,
      endPulse: null,
      startMileage: null,
      endMileage: null,
      recognition: null,
    }
  })
}

const formData = reactive({
  batchName: '',
  turnoutName: '',
  recordedAt: Date.now(),
  remark: '',
  nodes: createDefaultNodes(),
})

const query = reactive({
  keyword: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  itemCount: 0,
})

const batchList = ref([])

const rules = {
  batchName: { required: true, message: '请输入批次名称', trigger: 'blur' },
  turnoutName: { required: true, message: '请输入道岔名称', trigger: 'blur' },
  recordedAt: { required: true, type: 'number', message: '请选择录入时间', trigger: 'change' },
}

const nodeColumns = [
  { title: '工步', key: 'stepId', width: 70 },
  { title: '节点名称', key: 'stepName', width: 180 },
  {
    title: '起始脉冲',
    key: 'startPulse',
    width: 120,
    render: row => h(NInputNumber, {
      value: row.startPulse,
      min: 0,
      precision: 0,
      onUpdateValue: v => row.startPulse = v,
    }),
  },
  {
    title: '结束脉冲',
    key: 'endPulse',
    width: 120,
    render: row => h(NInputNumber, {
      value: row.endPulse,
      min: 0,
      precision: 0,
      onUpdateValue: v => row.endPulse = v,
    }),
  },
  {
    title: '起始里程(m)',
    key: 'startMileage',
    width: 130,
    render: row => h(NInputNumber, {
      value: row.startMileage,
      min: 0,
      precision: 3,
      onUpdateValue: v => row.startMileage = v,
    }),
  },
  {
    title: '结束里程(m)',
    key: 'endMileage',
    width: 130,
    render: row => h(NInputNumber, {
      value: row.endMileage,
      min: 0,
      precision: 3,
      onUpdateValue: v => row.endMileage = v,
    }),
  },
  {
    title: 'recognition',
    key: 'recognition',
    width: 120,
    render: row => h(NInputNumber, {
      value: row.recognition,
      min: 1,
      precision: 0,
      onUpdateValue: v => row.recognition = v,
    }),
  },
]

const nodeColumnsReadonly = [
  { title: '工步', key: 'stepId', width: 70 },
  { title: '节点名称', key: 'stepName', width: 180 },
  { title: '起始脉冲', key: 'startPulse', width: 120 },
  { title: '结束脉冲', key: 'endPulse', width: 120 },
  { title: '起始里程(m)', key: 'startMileage', width: 130 },
  { title: '结束里程(m)', key: 'endMileage', width: 130 },
  { title: 'recognition', key: 'recognition', width: 120 },
]

const batchColumns = [
  { title: 'ID', key: 'id', width: 70 },
  { title: '批次名称', key: 'batchName', minWidth: 180 },
  { title: '道岔名称', key: 'turnoutName', minWidth: 160 },
  {
    title: '录入时间',
    key: 'recordedAt',
    minWidth: 170,
    render: row => formatDateTime(row.recordedAt),
  },
  { title: '备注', key: 'remark', minWidth: 220, ellipsis: { tooltip: true } },
  {
    title: '节点数',
    key: 'nodeCount',
    width: 90,
    render: row => Array.isArray(row.nodes) ? row.nodes.length : (row.nodeCount ?? '-'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: row => h(
      NButton,
      {
        size: 'small',
        onClick: () => showDetail(row),
      },
      { default: () => '查看节点' },
    ),
  },
]

function formatDateTime(ts) {
  if (!ts)
    return '-'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime()))
    return String(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
}

function resetForm() {
  formData.batchName = ''
  formData.turnoutName = ''
  formData.recordedAt = Date.now()
  formData.remark = ''
  formData.nodes = createDefaultNodes()
}

function buildPayload() {
  const nodes = formData.nodes
    .map(item => ({
      stepId: item.stepId,
      stepName: item.stepName,
      startPulse: item.startPulse,
      endPulse: item.endPulse,
      startMileage: item.startMileage,
      endMileage: item.endMileage,
      recognition: item.recognition,
    }))
    .filter(item => {
      const hasPulse = item.startPulse != null || item.endPulse != null
      const hasMileage = item.startMileage != null || item.endMileage != null
      return hasPulse || hasMileage
    })

  return {
    batchName: formData.batchName,
    turnoutName: formData.turnoutName,
    recordedAt: formData.recordedAt,
    remark: formData.remark,
    nodes,
  }
}

async function handleSubmit() {
  await formRef.value?.validate()

  const payload = buildPayload()
  if (!payload.nodes.length) {
    message.warning('请至少录入一个节点的脉冲或里程范围')
    return
  }

  submitting.value = true
  try {
    await api.createBatch(payload)
    message.success('保存成功')
    resetForm()
    await fetchBatchList()
  }
  catch (e) {
    message.error(e?.message || '保存失败')
  }
  finally {
    submitting.value = false
  }
}

async function fetchBatchList() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: query.keyword || undefined,
    }
    const res = await api.getBatchList(params)
    const data = res?.data || res

    if (Array.isArray(data)) {
      batchList.value = data
      pagination.itemCount = data.length
      pagination.pageCount = 1
    }
    else {
      batchList.value = data?.list || data?.rows || []
      pagination.itemCount = data?.total || batchList.value.length
      pagination.pageCount = Math.max(1, Math.ceil(pagination.itemCount / pagination.pageSize))
    }
  }
  catch (e) {
    message.error(e?.message || '查询失败')
  }
  finally {
    loading.value = false
  }
}

function onPageChange(page) {
  pagination.page = page
  fetchBatchList()
}

function onPageSizeChange(pageSize) {
  pagination.pageSize = pageSize
  pagination.page = 1
  fetchBatchList()
}

function resetQuery() {
  query.keyword = ''
  pagination.page = 1
  fetchBatchList()
}

function showDetail(row) {
  detailRow.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchBatchList()
})
</script>

<style scoped>
.switch-manual-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 8px 0 10px;
  font-weight: 600;
  font-size: 14px;
}

.form-card,
.list-card {
  border-radius: 12px;
}
</style>
