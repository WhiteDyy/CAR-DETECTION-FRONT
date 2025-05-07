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
import { NSpace, NButton, NPopconfirm } from 'naive-ui'; // 导入组件

// 路由实例
const router = useRouter();

// 搜索框的值
const searchQuery = ref('');

// 静态任务列表数据
const taskList = ref([
  {
    task_id: 1,
    task_name: '任务1 - 正线检测',
    start_km: 'K0+000',
    end_km: 'K10+000',
    created_at: '2025-03-01 10:00:00',
  },
  {
    task_id: 2,
    task_name: '任务2 - 道岔检测',
    start_km: 'K5+000',
    end_km: 'K15+000',
    created_at: '2025-03-02 14:30:00',
  },
  {
    task_id: 3,
    task_name: '任务3 - 综合检测',
    start_km: 'K20+000',
    end_km: 'K30+000',
    created_at: '2025-03-03 09:15:00',
  },
]);

// 根据搜索框过滤任务列表
const filteredTaskList = computed(() => {
  if (!searchQuery.value) return taskList.value;
  return taskList.value.filter((task) =>
    task.task_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 表格列定义，使用h函数替代JSX
const columns = [
  { title: '任务名称', key: 'task_name' },
  { title: '起始公里标', key: 'start_km' },
  { title: '终点公里标', key: 'end_km' },
  { title: '创建时间', key: 'created_at' },
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

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: taskList.value.length,
});

// 路由跳转方法
const goToCreate = () => router.push('/taskmanage/task-create');
const editTask = (row) => router.push(`/tasks/edit/${row.task_id}`);
const startTask = (row) => router.push('/track-geometry/overview/');

// 删除任务方法（静态数据模拟）
const deleteTask = (row) => {
  const index = taskList.value.findIndex((task) => task.task_id === row.task_id);
  if (index !== -1) {
    taskList.value.splice(index, 1);
    pagination.value.itemCount = taskList.value.length; // 更新分页总数
  }
};
</script>