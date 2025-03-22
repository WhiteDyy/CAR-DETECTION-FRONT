<template>
  <CommonPage>
    <!-- 表格数据 -->
    <!-- <MeCrud ref="$table" v-model:query-items="queryItems" :scroll-x="1200" :columns="columns" :get-data="api.read">
            <MeQueryItem label="用户名" :label-width="50">
                <n-input v-model:value="queryItems.username" type="text" placeholder="请输入用户名" clearable />
            </MeQueryItem>

            <MeQueryItem label="性别" :label-width="50">
                <n-select v-model:value="queryItems.gender" clearable :options="genders" />
            </MeQueryItem>

            <MeQueryItem label="状态" :label-width="50">
                <n-select v-model:value="queryItems.enable" clearable :options="[
                    { label: '启用', value: 1 },
                    { label: '停用', value: 0 },
                ]" />
            </MeQueryItem>
        </MeCrud> -->
    <!-- 搜索框 -->
    <!-- 搜索表单 -->
    <n-form :model="searchForm" label-placement="left" label-width="auto" :style="{ marginBottom: '16px' }">
      <n-grid :cols="4" :x-gap="12" :y-gap="8">
        <n-form-item-gi label="线路代码">
          <n-input v-model:value="searchForm.lineCode" placeholder="请输入线路代码" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="线路类型">
          <n-input v-model:value="searchForm.lineType" placeholder="请输入线路类型" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="起始里程">
          <n-input v-model:value="searchForm.startMeasure" placeholder="请输入起始里程" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="结束里程">
          <n-input v-model:value="searchForm.endMeasure" placeholder="请输入结束里程" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="检测时间范围">
          <n-date-picker
            v-model:value="searchForm.detectDateRange" type="datetimerange" clearable
            style="width: 100%"
          />
        </n-form-item-gi>
        <n-form-item-gi label="车辆编号">
          <n-input v-model:value="searchForm.vehicleNo" placeholder="请输入车辆编号" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="设备代码">
          <n-input v-model:value="searchForm.equipCode" placeholder="请输入设备代码" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="病害位置">
          <n-input v-model:value="searchForm.diseasePosition" placeholder="请输入病害位置" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="病害类型">
          <n-input v-model:value="searchForm.diseaseType" placeholder="请输入病害类型" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="病害详细类型">
          <n-input v-model:value="searchForm.diseaseDetailType" placeholder="请输入病害详细类型" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="病害等级">
          <n-input v-model:value="searchForm.diseaseLevel" placeholder="请输入病害等级" clearable />
        </n-form-item-gi>
        <n-form-item-gi>
          <n-space>
            <NButton type="primary" @click="handleSearch">
              搜索
            </NButton>
            <NButton @click="resetSearch">
              重置
            </NButton>
          </n-space>
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <n-data-table
      :columns="columns" :data="tableData" :pagination="pagination" :bordered="true"
      :single-line="false"
    />
  </CommonPage>
</template>

<script setup>
import { NButton, NImage, NImageGroup, NTooltip } from 'naive-ui'

const imageSrc = new URL('@/assets/images/test.jpg', import.meta.url).href
// 定义表格列
const columns = [
  {
    title: '病害ID',
    key: 'diseaseId',
    width: 200,
    render: row =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          default: () => row.diseaseId,
          trigger: () =>
            h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.diseaseId),
        },
      ),
  },
  { title: '线路代码', key: 'lineCode', width: 100 },
  { title: '线路类型', key: 'lineType', width: 100 },
  {
    title: '起始经度',
    key: 'startLongitude',
    width: 100,
    render: row =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          default: () => row.startLongitude,
          trigger: () =>
            h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.startLongitude),
        },
      ),
  },
  { title: '起始里程', key: 'startMeasure', width: 100 },
  { title: '结束里程', key: 'endMeasure', width: 100 },
  {
    title: '起始纬度',
    key: 'startLatitude',
    width: 100,
    render: row =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          default: () => row.startLatitude,
          trigger: () =>
            h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.startLatitude),
        },
      ),
  },
  {
    title: '结束经度',
    key: 'endLongitude',
    width: 100,
    render: row =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          default: () => row.endLongitude,
          trigger: () =>
            h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.endLongitude),
        },
      ),
  },
  {
    title: '结束纬度',
    key: 'endLatitude',
    width: 100,
    render: row =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          default: () => row.endLongitude,
          trigger: () =>
            h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.endLongitude),
        },
      ),
  },
  { title: '检测时间', key: 'detectDate', width: 160, render: row => row.detectDate.toLocaleString() },
  { title: '上传时间', key: 'uploadDate', width: 160, render: row => row.uploadDate.toLocaleString() },
  { title: '车辆编号', key: 'vehicleNo', width: 120 },
  { title: '设备代码', key: 'equipCode', width: 100 },
  { title: '主题代码', key: 'topicCode', width: 100 },
  { title: '病害位置', key: 'diseasePosition', width: 120 },
  { title: '病害类型', key: 'diseaseType', width: 100 },
  { title: '病害详细类型', key: 'diseaseDetailType', width: 150 },
  {
    title: '病害图像',
    key: 'diseaseImage',
    width: 100,
    render: row =>
      h(
        NImageGroup,
        null,
        {
          default: () =>
            h(NImage, {
              width: 80, // 小图宽度
              src: row.diseaseImage,
              previewSrc: row.diseaseImage, // 点击后显示大图
              alt: `病害图像 ${row.diseaseId}`,
              style: { cursor: 'pointer' },
            }),
        },
      ),
  },
  { title: '病害等级', key: 'diseaseLevel', width: 100 },
  {
    title: '病害描述',
    key: 'diseaseDescript',
    width: 200,
    render: row =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          default: () => row.diseaseDescript,
          trigger: () =>
            h('span', { style: { display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, row.diseaseDescript),
        },
      ),
  },
  { title: '病害值', key: 'diseaseVal', width: 100 },
  { title: '单位', key: 'diseaseUnit', width: 100 },
  { title: '盒子位置', key: 'boxPosition', width: 120 },
  { title: '创建时间', key: 'createDate', width: 160, render: row => row.createDate.toLocaleString() },
  { title: '创建用户ID', key: 'createUserId', width: 120 },
  { title: '创建站点ID', key: 'createStationId', width: 120 },
  { title: '创建部门ID', key: 'createDeptId', width: 120 },
  { title: '更新时间', key: 'updateDate', width: 160, render: row => row.updateDate?.toLocaleString() || '-' },
  { title: '更新用户ID', key: 'updateUserId', width: 120 },
  { title: '更新站点ID', key: 'updateStationId', width: 120 },
  { title: '更新部门ID', key: 'updateDeptId', width: 120 },
  { title: '版本锁', key: 'lockVersion', width: 100 },
  { title: '文件ID', key: 'fileId', width: 120 },

]

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => ({
  diseaseId: `550e8400-e29b-41d4-a716-44665544000${index}`,
  lineCode: `LC00${index + 1}`,
  lineType: `LT0${index + 1}`,
  startLongitude: (120.12345678901234 + index * 0.1).toFixed(14),
  startMeasure: (100.12345 + index * 10).toFixed(5),
  endMeasure: (110.12345 + index * 10).toFixed(5),
  startLatitude: (30.12345678901234 + index * 0.1).toFixed(14),
  endLongitude: (120.22345678901234 + index * 0.1).toFixed(14),
  endLatitude: (30.22345678901234 + index * 0.1).toFixed(14),
  detectDate: new Date(2025, 2, 15 + index, 10, 0, 0),
  uploadDate: new Date(2025, 2, 16 + index, 14, 0, 0),
  vehicleNo: `VH-00${index + 1}`,
  equipCode: `EQ${index + 1}`,
  topicCode: `TC${index + 1}`,
  diseasePosition: `POS${index + 1}`,
  diseaseType: `TYPE${index + 1}`,
  diseaseDetailType: `DETAIL_TYPE_${index + 1}`,
  diseaseImage: imageSrc,
  diseaseLevel: `LEVEL_${index % 3 + 1}`,
  diseaseDescript: `这是第 ${index + 1} 条病害的描述信息`,
  diseaseVal: (10.5 + index * 2).toFixed(2),
  diseaseUnit: 'mm',
  boxPosition: `BOX_POS${index + 1}`,
  createDate: new Date(2025, 2, 14 + index, 9, 0, 0),
  createUserId: `USER${index + 1}`,
  createStationId: `ST${index + 1}`,
  createDeptId: `DEPT${index + 1}`,
  updateDate: index % 2 === 0 ? new Date(2025, 2, 17 + index, 15, 0, 0) : null,
  updateUserId: `USER${index + 2}`,
  updateStationId: `ST${index + 2}`,
  updateDeptId: `DEPT${index + 2}`,
  lockVersion: index,
  fileId: `FILE${index + 1}`,

}))

// 分页配置
const pagination = {
  pageSize: 10,
}

// 搜索表单数据
const searchForm = ref({
  lineCode: '',
  lineType: '',
  startMeasure: '',
  endMeasure: '',
  detectDateRange: null, // [startTimestamp, endTimestamp]
  vehicleNo: '',
  equipCode: '',
  diseasePosition: '',
  diseaseType: '',
  diseaseDetailType: '',
  diseaseLevel: '',
})

// 过滤后的数据
const filteredData = computed(() => {
  return tableData.filter((item) => {
    const {
      lineCode,
      lineType,
      startMeasure,
      endMeasure,
      detectDateRange,
      vehicleNo,
      equipCode,
      diseasePosition,
      diseaseType,
      diseaseDetailType,
      diseaseLevel,
    } = searchForm.value

    return (
      (!lineCode || item.lineCode.toLowerCase().includes(lineCode.toLowerCase()))
      && (!lineType || item.lineType.toLowerCase().includes(lineType.toLowerCase()))
      && (!startMeasure || Number(item.startMeasure) >= Number(startMeasure))
      && (!endMeasure || Number(item.endMeasure) <= Number(endMeasure))
      && (!detectDateRange || (
        (!detectDateRange[0] || item.detectDate.getTime() >= detectDateRange[0])
        && (!detectDateRange[1] || item.detectDate.getTime() <= detectDateRange[1])
      ))
      && (!vehicleNo || item.vehicleNo.toLowerCase().includes(vehicleNo.toLowerCase()))
      && (!equipCode || item.equipCode.toLowerCase().includes(equipCode.toLowerCase()))
      && (!diseasePosition || item.diseasePosition.toLowerCase().includes(diseasePosition.toLowerCase()))
      && (!diseaseType || item.diseaseType.toLowerCase().includes(diseaseType.toLowerCase()))
            && (!diseaseDetailType || item.diseaseDetailType.toLowerCase().includes(diseaseDetailType.toLowerCase()))
            && (!diseaseLevel || item.diseaseLevel.toLowerCase().includes(diseaseLevel.toLowerCase()))
    )
  })
})

// 搜索和重置
function handleSearch() {
  // 触发 filteredData 的重新计算
}

function resetSearch() {
  searchForm.value = {
    lineCode: '',
    lineType: '',
    startMeasure: '',
    endMeasure: '',
    detectDateRange: null,
    vehicleNo: '',
    equipCode: '',
    diseasePosition: '',
    diseaseType: '',
    diseaseDetailType: '',
    diseaseLevel: '',
  }
}
</script>
