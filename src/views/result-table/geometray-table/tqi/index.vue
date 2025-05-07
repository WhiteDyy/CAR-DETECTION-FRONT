<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        TQI报告
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



// 定义表头（第一行：字段，第二行：单位）
const columns = [
    {
        title: () => h('div', [
            h('div', '里程'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'km'),
        ]),
        key: 'mileage',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '长度'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'm'),
        ]),
        key: 'length',
        width: 100,
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
            h('div', '轨距变化率'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'gaugeChangeRate',
        width: 120,
    },
    {
        title: () => h('div', [
            h('div', '水平'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'level',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '三角坑'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'triangularPit',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '右高低'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'rightHeight',
        width: 100,
    },
    {
        title: () => h('div', [
            h('div', '右轨向(正矢)'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'rightTrackDirection',
        width: 140,
    },
    {
        title: () => h('div', [
            h('div', '左高低(正矢)'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'leftHeight',
        width: 140,
    },
    {
        title: () => h('div', [
            h('div', 'TQI'),
            h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
        ]),
        key: 'tqi',
        width: 100,
    },
]

// 检查信息（假设取第一条数据）
const inspectionInfo = ref({
    inspectionDate: '',
    inspector: '',
    lineName: '',
    direction: '',
    chordLength: '',
})

// 生成假数据
const tableData = Array.from({ length: 15 }, (_, index) => {
    const data = {
        inspectionDate: `2025-05-${String(index + 1).padStart(2, '0')}`,
        inspector: `检查员${index + 1}`,
        lineName: `线路${index + 1}`,
        direction: index % 2 === 0 ? '上行' : '下行',
        chordLength: `${10 + index}米`,
        mileage: (100 + index * 0.5).toFixed(3),
        length: (50 + index * 5).toFixed(2),
        gauge: (1435 + index * 0.5).toFixed(2),
        gaugeChangeRate: (0.5 + index * 0.1).toFixed(2),
        level: (2 + index * 0.2).toFixed(2),
        triangularPit: (1 + index * 0.1).toFixed(2),
        rightHeight: (3 + index * 0.3).toFixed(2),
        rightTrackDirection: (5 + index * 0.5).toFixed(2),
        leftHeight: (4 + index * 0.4).toFixed(2),
        tqi: (90 + index * 2).toFixed(2),
    }
    // 设置检查信息（取第一条数据）
    if (index === 0) {
        inspectionInfo.value = {
            inspectionDate: data.inspectionDate,
            inspector: data.inspector,
            lineName: data.lineName,
            direction: data.direction,
            chordLength: data.chordLength,
        }
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