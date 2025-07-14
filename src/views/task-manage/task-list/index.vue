<template>
  <CommonPage>
    <div>
      <n-space justify="space-between">
        <n-input v-model:value="searchQuery" placeholder="搜索任务" />
        <n-button type="primary" @click="goToCreate">创建新任务</n-button>
      </n-space>
      <n-data-table :columns="columns" :data="filteredTaskList" :pagination="pagination" />
    </div>
  </CommonPage>
</template>

<script setup>
import { ref, computed, h } from 'vue';
import { useRouter } from 'vue-router';

import { NButton, NSpace, NPopconfirm, NRadioGroup, NRadio } from 'naive-ui';
import api from './api'
import { useTaskStore } from '@/store'

const router = useRouter();
const searchQuery = ref('');



async function getJobsData() {
  try {
    // 调用后端接口获取作业列表数据
    const response = await api.getJobsList()

    // 如果成功获取数据
    if (response.data) {
      // 更新本地数据
      taskList.value = response.data.pageData

      // 更新分页信息
      pagination.value.itemCount = response.data.length

      // 显示成功提示
      $message.success('获取作业数据成功')

      return response.data
    }
  } catch (error) {
    // 错误处理
    console.error('获取作业数据失败:', error)
    $message.error('获取作业数据失败')
  }
}


// 修改数据结构以匹配后端返回
const taskList = ref([]);

// 修改过滤逻辑以使用新的字段名
const filteredTaskList = computed(() => {
  if (!searchQuery.value) return taskList.value;
  return taskList.value.filter((task) =>
    task.jobName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});



const columns = [
  { title: '任务名称', key: 'jobName' },
  { title: '线路类型', key: 'lineType' },
  { title: '方向', key: 'direction' },
  {
    title: '执行时间',
    key: 'timeRange',
    render(row) {
      return `${formatDateTime(row.startTime)} ~ ${formatDateTime(row.endTime)}`;
    }
  },
  { title: '操作人员', key: 'operator' },
  { title: '设备编号', key: 'deviceId' },
  { title: '创建时间', key: 'createdAt', render: (row) => formatDateTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        NSpace,
        {},
        [
          h(NButton, {
            size: 'small',
            onClick: () => editTask(row)
          }, { default: () => '编辑' }),

          h(NButton, {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete(row.id)
          }, { default: () => '删除' }),

          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: () => startDetection(row)
          }, { default: () => '开始检测' }),
        ]
      );
    },
  },
];


const selectedDetectionType = ref('image') // 默认选择图像检测


const handleDelete = async (id, confirmOptions) => {
  if (id === undefined || id === null) return;

  window.$dialog?.warning({
    content: '确定删除此任务吗？',
    title: '删除确认',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        const d = this;
        d.loading = true;

        // 调用删除API
        // await api.deleteTask(id);

        // 前端模拟删除
        const index = taskList.value.findIndex(task => task.id === id);
        if (index !== -1) {
          taskList.value.splice(index, 1);
          pagination.value.itemCount = taskList.value.length;
        }


        $message.success('删除成功')
        d.loading = false;
      } catch (error) {
        console.error(error);
        $message.error('删除失败!')
        this.loading = false;
      }
    },
    ...confirmOptions,
  });
};

const startDetection = (row) => {

  window.$dialog?.success({
    title: '选择检测类型',
    content: () => h(NRadioGroup, {
      value: selectedDetectionType.value,
      'onUpdate:value': (val) => selectedDetectionType.value = val
    }, () => [
      h(NSpace, { vertical: true }, [
        h(NRadio, { value: 'image' }, '图像实时检测'),
        h(NRadio, { value: 'geometry' }, '几何实时检测')
      ])
    ]),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await createTaskRecord(row)


        if (selectedDetectionType.value === 'image') {
          router.push('/surface-detection/overview')
        } else {
          router.push('/track-geometry/overview')
        }
      } catch (error) {

        $message.error('操作失败' + error.message)
      }
    }
  })
}

const createTaskRecord = async (task) => {

  const taskStore = useTaskStore()

  console.log('创建任务记录:', task)
  const response = await api.startCurrentJob({
    jobId: task.id,
    startTime: task.startTime,
    startStation: task.startStation,
    operator: task.operator,
    jobStatus: "started",
    createdAt: new Date().toISOString(),

  });
  if (response.code !== 0) {
    throw new Error('创建任务记录失败');
  } else {
    $message.success('任务记录创建成功');
    // 2. 存储任务数据到Pinia
    taskStore.setCurrentTask(response.data)
  }



}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: taskList.value.length,
});

const goToCreate = () => router.push('/taskmanage/task-create');
const editTask = (row) => router.push(`/tasks/edit/${row.id}`);

onMounted(() => {
  getJobsData();
})


onMounted(() => {
  getJobsData();
})


</script>