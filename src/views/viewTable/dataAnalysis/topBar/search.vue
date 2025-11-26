<template>
  <div>
    <n-grid :x-gap="10" style="display: flex;justify-content:space-between">
      <n-gi :span="7">
        <b style="margin-right:10px;">线路选择</b>
        <n-select v-model:value="value" :options="options" clearable placeholder="请选择" />

      </n-gi>
      <n-gi :span="7">
        <b style="margin-right:10px;">病害选择</b>
        <n-select v-model:value="value" :options="options2" clearable placeholder="请选择" />

      </n-gi>
      <n-button type="primary" icon="SearchIcon">搜索</n-button>
    </n-grid>
  </div>
</template>

<script>
export default {
  name: "Search",
  data() {
      return {
        options: [{
          value: '选项1',
          label: '线路1'
        }, {
          value: '选项2',
          label: '线路2'
        }, {
          value: '选项3',
          label: '线路3'
        }, {
          value: '选项4',
          label: '线路4'
        }, {
          value: '选项5',
          label: '线路5'
        }],
        options2: [{
          value: '选项1',
          label: '病害1'
        }, {
          value: '选项2',
          label: '病害2'
        }, {
          value: '选项3',
          label: '病害3'
        }, {
          value: '选项4',
          label: '病害4'
        }, {
          value: '选项5',
          label: '病害5'
        }],
        value: ''
      }
    }
};
</script>

<style>
</style>