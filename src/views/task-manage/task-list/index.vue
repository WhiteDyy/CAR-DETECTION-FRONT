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
import { NSpace, NButton, NPopconfirm } from 'naive-ui';
import api from './api'


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

// 修改表格列定义以匹配新的数据结构
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
          h(NButton, { size: 'small', onClick: () => editTask(row) }, { default: () => '编辑' }),
          h(
            NPopconfirm,
            { onPositiveClick: () => deleteTask(row) },
            {
              trigger: () =>
                h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
              default: () => '确认删除？',
            }
          ),
          h(NButton, { size: 'small', type: 'primary', onClick: () => startTask(row) }, { default: () => '开始检测' }),
        ]
      );
    },
  },
];

// 格式化日期时间的工具函数
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

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: taskList.value.length,
});

// 路由跳转方法
const goToCreate = () => router.push('/taskmanage/task-create');
const editTask = (row) => router.push(`/tasks/edit/${row.id}`); // 修改为使用新的id字段
const startTask = (row) => router.push('/track-geometry/overview/');

// 删除任务方法
const deleteTask = (row) => {
  const index = taskList.value.findIndex((task) => task.id === row.id); // 修改为使用新的id字段
  if (index !== -1) {
    taskList.value.splice(index, 1);
    pagination.value.itemCount = taskList.value.length;
  }
};


onMounted(() => {
  getJobsData();
})


</script>