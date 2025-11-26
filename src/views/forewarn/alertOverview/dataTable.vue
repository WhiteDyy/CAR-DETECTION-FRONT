<template>
  <div class="table-container">
    <n-spin :show="loading" style="height: 100%">
      <n-data-table
        :columns="columns"
        :data="paginatedData"
        :row-class-name="tableRowClassName"
        :bordered="true"
        :max-height="600"
        :scroll-x="1200"
        class="custom-table"
        style="height: 100%"
      />
    </n-spin>

    <!-- 编辑对话框 -->
    <n-modal v-model:show="dialogVisible" :title="dialogTitle" preset="dialog" style="width: 500px">
      <template #header>
        <div>{{ dialogTitle }}</div>
      </template>

      <n-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-placement="left"
        label-width="100"
      >
        <n-form-item label="预警类型" path="diseaseLevel">
          <n-select
            v-model:value="editForm.diseaseLevel"
            placeholder="请选择预警类型"
            :options="diseaseLevelOptions"
          />
        </n-form-item>
        <n-form-item label="预警时间" path="uploadDate">
          <n-date-picker
            v-model:value="editForm.uploadDate"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
            disabled
          />
        </n-form-item>
        <n-form-item label="预警对象" path="target">
          <n-input v-model:value="editForm.target" disabled />
        </n-form-item>
        <n-form-item label="预警规则" path="rules">
          <n-input v-model:value="editForm.rules" disabled />
        </n-form-item>
        <n-form-item label="描述" path="diseaseDescript">
          <n-input
            v-model:value="editForm.diseaseDescript"
            type="textarea"
            disabled
          />
        </n-form-item>
        <n-form-item label="预处理建议" path="advice">
          <n-input v-model:value="editForm.advice" disabled />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="dialogVisible = false">
            取消
          </n-button>
          <n-button type="primary" @click="submitForm">
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 分页 -->
    <n-pagination
      v-if="total > 0"
      v-model:page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :item-count="total"
      :page-slot="6"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
  </div>
</template>

<script>
import {
  createDiscreteApi,
  NButton,
} from 'naive-ui'
import { computed, defineComponent, h, markRaw, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'DiseaseTable',
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    page: {
      type: Number,
      default: 1,
    },
    limit: {
      type: Number,
      default: 20,
    },
  },
  setup(props, { emit }) {
    const message = createDiscreteApi(['message'])
    const loading = ref(false)
    const editFormRef = ref(null)

    const queryParams = ref({
      pageNum: 1,
      pageSize: 20,
    })

    // 模拟数据
    const mockTableData = ref([])

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('')
    const editingRowIndex = ref(-1)

    const editForm = ref({
      dangerousId: '',
      diseaseLevel: '',
      uploadDate: '',
      target: '',
      rules: '',
      diseaseDescript: '',
      advice: '',
    })

    const diseaseLevelOptions = [
      { label: '重', value: '重' },
      { label: '轻', value: '轻' },
      { label: '已处理', value: '已处理' },
    ]

    const editRules = {
      diseaseLevel: {
        required: true,
        message: '请选择预警类型',
        trigger: ['blur', 'change'],
      },
    }

    // 表格列配置
    const createColumns = () => {
      const baseColumns = [
        {
          title: '预警类型',
          key: 'diseaseLevel',
          width: 180,
          sorter: true,
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: '预警时间',
          key: 'uploadDate',
          width: 220,
          sorter: true,
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: '预警对象',
          key: 'target',
          width: 150,
          sorter: true,
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: '预警规则',
          key: 'rules',
          width: 150,
          sorter: true,
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: '描述',
          key: 'diseaseDescript',
          width: 250,
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: '预处理建议',
          key: 'advice',
          width: 180,
          ellipsis: {
            tooltip: true,
          },
        },
      ]

      // 操作列
      const actionColumn = {
        title: '操作',
        key: 'actions',
        width: 150,
        fixed: 'right',
        render: (row) => {
          return h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => handleEdit(row),
            },
            { default: () => '编辑' },
          )
        },
      }

      return [...baseColumns, actionColumn]
    }

    const columns = createColumns()

    // 计算分页数据
    const paginatedData = computed(() => {
      const data = props.tableData.length > 0 ? props.tableData : mockTableData.value
      const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
      const end = start + queryParams.value.pageSize
      return data.slice(start, end)
    })

    // 初始化模拟数据
    const initMockData = () => {
      const mockData = []
      const levels = ['重', '轻', '已处理', '人工核验']
      const targets = ['设备A', '设备B', '设备C', '系统D', '网络E']
      const rules = ['规则1: CPU使用率>90%', '规则2: 内存使用率>85%', '规则3: 磁盘空间<10%']
      const descriptions = [
        '系统资源使用率过高，建议立即检查',
        '网络连接异常，可能存在安全风险',
        '服务响应时间过长，影响用户体验',
      ]
      const advices = [
        '重启相关服务，释放资源',
        '检查网络配置，优化连接',
        '清理缓存文件，增加存储空间',
      ]

      for (let i = 1; i <= 50; i++) {
        const level = levels[Math.floor(Math.random() * levels.length)]
        const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)

        mockData.push({
          dangerousId: `danger_${i}`,
          diseaseLevel: level,
          uploadDate: date.toLocaleString(),
          target: targets[Math.floor(Math.random() * targets.length)],
          rules: rules[Math.floor(Math.random() * rules.length)],
          diseaseDescript: descriptions[Math.floor(Math.random() * descriptions.length)],
          advice: advices[Math.floor(Math.random() * advices.length)],
        })
      }

      mockTableData.value = markRaw(mockData) // 使用 markRaw 避免响应式
    }

    // 方法
    const tableRowClassName = (row) => {
      if (row.diseaseLevel === '人工核验') {
        return 'warning-row'
      }
      else if (row.diseaseLevel === '已处理') {
        return 'success-row'
      }
      return ''
    }

    const handlePageChange = (page) => {
      queryParams.value.pageNum = page
      emit('pagination', { page, limit: queryParams.value.pageSize })
    }

    const handlePageSizeChange = (pageSize) => {
      queryParams.value.pageSize = pageSize
      queryParams.value.pageNum = 1
      emit('pagination', { page: 1, limit: pageSize })
    }

    const handleEdit = (row) => {
      dialogTitle.value = '编辑预警信息'
      const data = props.tableData.length > 0 ? props.tableData : mockTableData.value
      editingRowIndex.value = data.findIndex(item => item.dangerousId === row.dangerousId)

      // 填充表单数据
      editForm.value = { ...row }
      // 转换日期格式
      if (row.uploadDate) {
        editForm.value.uploadDate = new Date(row.uploadDate).getTime()
      }
      dialogVisible.value = true
    }

    const submitForm = () => {
      editFormRef.value?.validate((errors) => {
        if (!errors) {
          loading.value = true

          // 模拟更新操作
          setTimeout(() => {
            const newData = [...(props.tableData.length > 0 ? props.tableData : mockTableData.value)]
            newData[editingRowIndex.value] = {
              ...editForm.value,
              uploadDate: new Date(editForm.value.uploadDate).toLocaleString(),
            }

            if (props.tableData.length > 0) {
              emit('updateData', newData)
            }
            else {
              mockTableData.value = markRaw(newData)
            }

            dialogVisible.value = false
            message.success('编辑成功')
            loading.value = false
          }, 500)
        }
      })
    }

    const handleDialogClose = () => {
      editFormRef.value?.restoreValidation()
      editingRowIndex.value = -1
    }

    // 监听props变化
    onMounted(() => {
      queryParams.value.pageNum = props.page
      queryParams.value.pageSize = props.limit
      initMockData()
    })

    return {
      loading,
      queryParams,
      columns,
      paginatedData,
      dialogVisible,
      dialogTitle,
      editForm,
      editFormRef,
      editRules,
      diseaseLevelOptions,
      tableRowClassName,
      handlePageChange,
      handlePageSizeChange,
      handleEdit,
      submitForm,
      handleDialogClose,
    }
  },
})
</script>

<style scoped>
.table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.pagination-container {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.n-data-table) {
  flex: 1;
}
</style>
