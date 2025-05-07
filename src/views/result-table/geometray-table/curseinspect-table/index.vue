<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        曲线检查记录报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
        </div>


        <!-- 检查信息展示（单独区域） -->
        <n-card title="检查信息" v-if="showSearchForm" :bordered="true" style="margin-bottom: 16px;">
            <n-form :model="inspectionInfo" label-placement="left" label-width="auto">
                <n-grid :cols="5" :x-gap="12" :y-gap="8">
                    <n-grid-item>
                        <n-form-item label="检查日期">
                            <n-date-picker v-model:value="inspectionInfo.inspectionDate" type="datetime" clearable />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="检查人员">
                            <n-input v-model:value="inspectionInfo.inspector" placeholder="请输入检查人员" clearable />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="线路名称">
                            <n-input v-model:value="inspectionInfo.lineName" placeholder="请输入线路名称" clearable />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="上下行">
                            <n-input v-model:value="inspectionInfo.direction" placeholder="请输入上下行" clearable />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="X米弦">
                            <n-input v-model:value="inspectionInfo.chordLength" placeholder="请输入X米弦" clearable />
                        </n-form-item>
                    </n-grid-item>
                </n-grid>
                <n-space style="margin-top: 16px;">
                    <n-button type="primary" @click="handleFilter">
                        筛选
                    </n-button>
                    <n-button @click="resetFilter">
                        重置
                    </n-button>
                </n-space>
            </n-form>
        </n-card>

        <div class="description-list"
            style="margin-bottom: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
            <dl style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 5px;">
                <div>
                    <dt style="font-weight: bold; color: #333;">设计半径 (m)</dt>
                    <dd>{{ inspectionInfo.designRadius }}</dd>
                </div>
                <div>
                    <dt style="font-weight: bold; color: #333;">实测半径 (m)</dt>
                    <dd>{{ inspectionInfo.actualRadius }}</dd>
                </div>
                <div>
                    <dt style="font-weight: bold; color: #333;">曲线长度 (m)</dt>
                    <dd>{{ inspectionInfo.curveLength }}</dd>
                </div>
                <div>
                    <dt style="font-weight: bold; color: #333;">圆曲线长 (m)</dt>
                    <dd>{{ inspectionInfo.circularCurveLength }}</dd>
                </div>
                <div>
                    <dt style="font-weight: bold; color: #333;">缓和曲线长 (m)</dt>
                    <dd>{{ inspectionInfo.transitionCurveLength }}</dd>
                </div>
                <div>
                    <dt style="font-weight: bold; color: #333;">设计超高 (mm)</dt>
                    <dd>{{ inspectionInfo.designSuperelevation }}</dd>
                </div>
                <div>
                    <dt style="font-weight: bold; color: #333;">Vmax (km/h)</dt>
                    <dd>{{ inspectionInfo.vmax }}</dd>
                </div>
            </dl>
        </div>

        <!-- 表格 -->
        <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" :bordered="true"
            :single-line="false" />
    </CommonPage>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NButton, NTooltip, NCard, NFormItem, NGrid, NGridItem, NInput } from 'naive-ui'

// 控制搜索表单显示状态
const showSearchForm = ref(false)

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
}
// 检查信息（假设取第一条数据）
const inspectionInfo = ref({
    inspectionDate: '',
    inspector: '',
    lineName: '',
    direction: '',
    chordLength: '',
})


// 定义表格列
const columns = [
    {
        title: () => h('div', [
            h('div', '序号'),
        ]),
        key: 'index',
        width: 80,
    },
    {
        title: () => h('div', [
            h('div', '测点里程'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'km'),
        ]),
        key: 'mileage',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '计划正矢'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'plannedVector',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '实测正矢'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'actualVector',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '正矢差'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'vectorDifference',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '拨量'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'adjustmentAmount',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '拨后正矢'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'postAdjustmentVector',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '实测超高'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'actualSuperelevation',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '超高差值'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'superelevationDifference',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '超高顺坡率'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, '‰'),
        ]),
        key: 'superelevationGradient',
        width: 120,
    },
    {
        title: () => h('div', [
            h('div', '轨距'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'gauge',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '轨距千分率'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, '‰'),
        ]),
        key: 'gaugePermillage',
        width: 120,
    },
]

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => {
    const data = {
        index: index + 1,
        inspectionDate: `2025-05-${String(index + 1).padStart(2, '0')}`,
        inspector: `检查员${index + 1}`,
        lineName: `线路${index + 1}`,
        direction: index % 2 === 0 ? '上行' : '下行',
        chordLength: `${10 + index}米`,
        mileage: (100 + index * 0.5).toFixed(3),
        plannedVector: (10 + index * 0.5).toFixed(2),
        actualVector: (10.2 + index * 0.5).toFixed(2),
        vectorDifference: (0.2 + index * 0.1).toFixed(2),
        adjustmentAmount: (1 + index * 0.2).toFixed(2),
        postAdjustmentVector: (10 + index * 0.5).toFixed(2),
        actualSuperelevation: (100 + index * 2).toFixed(2),
        superelevationDifference: (2 + index * 0.3).toFixed(2),
        superelevationGradient: (0.5 + index * 0.1).toFixed(2),
        gauge: (1435 + index * 0.5).toFixed(2),
        gaugePermillage: (0.3 + index * 0.05).toFixed(2),
    }
    // 设置检查信息（取第一条数据）
    if (index === 0) {
        inspectionInfo.value = {
            inspectionDate: data.inspectionDate,
            inspector: data.inspector,
            lineName: data.lineName,
            direction: data.direction,
            chordLength: data.chordLength,
            designRadius: (500 + index * 10).toFixed(2),
            actualRadius: (505 + index * 10).toFixed(2),
            curveLength: (200 + index * 5).toFixed(2),
            circularCurveLength: (150 + index * 3).toFixed(2),
            transitionCurveLength: (50 + index * 2).toFixed(2),
            designSuperelevation: (100 + index * 2).toFixed(2),
            vmax: (120 + index * 5).toFixed(2),
        };
    }
    return data
})

// 分页配置
const pagination = {
    pageSize: 10,
}

// 搜索表单数据
const searchForm = ref({
    lineName: '',
    direction: '',
    mileage: '',
})

// 过滤后的数据
const filteredData = computed(() => {
    return tableData.filter((item) => {
        const { lineName, direction, mileage } = searchForm.value
        return (
            (!lineName || item.lineName.toLowerCase().includes(lineName.toLowerCase())) &&
            (!direction || item.direction.toLowerCase().includes(direction.toLowerCase())) &&
            (!mileage || Number(item.mileage) >= Number(mileage))
        )
    })
})

// 搜索和重置
function handleSearch() {
    // 触发 filteredData 的重新计算
    // 更新检查信息（假设取过滤后的第一条数据）
    if (filteredData.value.length > 0) {
        const firstItem = filteredData.value[0]
        inspectionInfo.value = {
            inspectionDate: firstItem.inspectionDate,
            inspector: firstItem.inspector,
            lineName: firstItem.lineName,
            direction: firstItem.direction,
            chordLength: firstItem.chordLength,
        }
    }
}

function resetSearch() {
    searchForm.value = {
        lineName: '',
        direction: '',
        mileage: '',
    }
    // 重置检查信息为第一条数据
    if (tableData.length > 0) {
        const firstItem = tableData[0]
        inspectionInfo.value = {
            inspectionDate: firstItem.inspectionDate,
            inspector: firstItem.inspector,
            lineName: firstItem.lineName,
            direction: firstItem.direction,
            chordLength: firstItem.chordLength,
        }
    }
}
</script>

<style scoped>
.track-inspection-table {
    padding: 16px;
}

.description-list dl {
    margin: 0;
}

.description-list dt {
    margin-bottom: 4px;
}

.description-list dd {
    margin: 0;
    color: #555;
}
</style>