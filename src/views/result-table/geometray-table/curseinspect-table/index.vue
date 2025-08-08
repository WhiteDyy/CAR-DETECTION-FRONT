<template>
    <CommonPage>
        <!-- 表格标题与提示 -->
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer; margin-top:-20px"
                        @click="toggleSearchForm">
                        曲线检查记录报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
        </div>

        <!-- 检查信息展示 -->
        <n-card v-if="showSearchForm" :bordered="true" class="card-style">
            <n-form :model="inspectionInfo" label-placement="left" label-width="auto">
                <n-grid :cols="5" :x-gap="12" :y-gap="8">
                    <n-grid-item>
                        <n-form-item label="检查日期">
                            <n-date-picker v-model:value="inspectionInfo.inspectionDate" type="datetime" clearable
                                :value-format="'yyyy-MM-dd HH:mm:ss'" :disabled="isDateInvalid" />
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
                        <n-form-item label="序号">
                            <n-input v-model:value="inspectionInfo.number" placeholder="请输入序号" clearable />
                        </n-form-item>
                    </n-grid-item>
                    <!-- <n-grid-item>
                        <n-form-item label="上下行">
                            <n-input v-model:value="inspectionInfo.direction" placeholder="请输入上下行" clearable />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="X米弦">
                            <n-input v-model:value="inspectionInfo.chordLength" placeholder="请输入X米弦" clearable />
                        </n-form-item>
                    </n-grid-item> -->
                    <n-form-item-gi>
                        <n-space>
                            <n-button type="primary" @click="handleSearch">
                                搜索
                            </n-button>
                            <n-button @click="resetSearch">
                                重置
                            </n-button>
                        </n-space>
                    </n-form-item-gi>
                </n-grid>

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
                <!-- <div>
                    <dt style="font-weight: bold; color: #333;">设计超高 (mm)</dt>
                    <dd>{{ inspectionInfo.designSuperelevation }}</dd>
                </div> -->
                <div>
                    <dt style="font-weight: bold; color: #333;">Vmax (km/h)</dt>
                    <dd>{{ inspectionInfo.vmax }}</dd>
                </div>
            </dl>
        </div>

        <!-- 表格 -->
        <n-data-table :columns="columns" :data="tableData" :bordered="true" :single-line="false" :loading="loading" />
        <n-pagination v-model:page="pagination.pageNo" :page-size="pagination.pageSize" :item-count="pagination.total"
            :on-update:page="pagination.onChange" :on-update:page-size="pagination.onUpdatePageSize"
            style="margin-top: 16px; justify-content: center;" />
    </CommonPage>
</template>

<script setup>
import { h, onMounted, ref, nextTick } from 'vue'
import { NButton, NTooltip, NCard, NForm, NFormItem, NGrid, NGridItem, NInput, NDatePicker } from 'naive-ui'
import api from './api'

// 控制搜索表单显示状态
const showSearchForm = ref(true)

// 检查信息
const inspectionInfo = ref({
    inspectionDate: null,
    inspector: '',
    lineName: '',
    direction: '',
    chordLength: '',
    designRadius: '',
    actualRadius: '',
    curveLength: '',
    circularCurveLength: '',
    transitionCurveLength: '',
    designSuperelevation: '',
    vmax: ''
})

// 是否禁用日期选择器
const isDateInvalid = ref(false)

// 搜索表单数据
const searchForm = ref({
    lineName: '',
    direction: '',
    mileage: '',
    pageNo: 1,
    pageSize: 10
})

// 日期格式转换工具函数
function parseDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
        console.warn(`无效的日期输入: ${dateStr}`)
        return null
    }
    const parsed = new Date(Date.parse(dateStr))
    if (!isNaN(parsed.getTime())) {
        return parsed.getTime()
    }
    console.warn(`无法解析的日期格式: ${dateStr}`)
    return null
}

// 定义表格列
const columns = [
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '序号'),
        ]),
        key: 'index',
        width: 80
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '测点里程'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'km'),
        ]),
        key: 'mileage',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '轨距'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'gauge',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '设计正矢'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'plannedVector',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '实测正矢'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'actualVector',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '正矢差'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'vectorDifference',
        width: 100
    },
    // {
    //     title: () => h('div', [
    //         h('div', '拨量'),
    //         h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
    //     ]),
    //     key: 'adjustmentAmount',
    //     width: 100
    // },
    // {
    //     title: () => h('div', [
    //         h('div', '拨后正矢'),
    //         h('div', { style: { fontSize: '12px', color: '#666' } }, 'mm'),
    //     ]),
    //     key: 'postAdjustmentVector',
    //     width: 100
    // },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '设计水平'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'designLevation',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '实测水平'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'actualSuperelevation',
        width: 100
    },
    {
        title: () => h('div', [
            h('div', { style: { fontSize: '18px' } }, '水平差'),
            h('div', { style: { fontSize: '14px', color: '#666' } }, 'mm'),
        ]),
        key: 'superelevationDifference',
        width: 100
    },
    // {
    //     title: () => h('div', [
    //         h('div', '超高顺坡率'),
    //         h('div', { style: { fontSize: '12px', color: '#666' } }, '‰'),
    //     ]),
    //     key: 'superelevationGradient',
    //     width: 120
    // },

    // {
    //     title: () => h('div', [
    //         h('div', '轨距千分率'),
    //         h('div', { style: { fontSize: '12px', color: '#666' } }, '‰'),
    //     ]),
    //     key: 'gaugePermillage',
    //     width: 120
    // }
]

// 表格数据和加载状态
const tableData = ref([])
const loading = ref(false)

// 分页配置
const pagination = ref(reactive({
    pageNo: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
    onChange: (pageNo) => {
        console.warn('切换页面到:', pageNo);
        pagination.value.pageNo = pageNo; // 直接更新 pagination.pageNo
        searchForm.value.pageNo = pageNo;
        fetchData();
    },
    onUpdatePageSize: (pageSize) => {
        console.warn('每页条数变更为:', pageSize);
        pagination.value.pageSize = pageSize; // 同步更新
        searchForm.value.pageSize = pageSize;
        pagination.value.pageNo = 1;
        searchForm.value.pageNo = 1;
        fetchData();
    }
}));

// 获取数据
async function fetchData() {
    loading.value = true
    try {
        const params = {
            line_name: searchForm.value.lineName,
            direction: searchForm.value.direction,
            mileage: searchForm.value.mileage,
            pageNo: pagination.value.pageNo, // 使用 pagination.pageNo
            pageSize: pagination.value.pageSize // 使用 pagination.pageSize
        }
        const response = await api.getCurseInspect(params)
        console.warn('后端返回数据:', response.data)

        tableData.value = (response.data.pageData || []).map(item => {
            const parsedDate = parseDate(item.inspectionDate)
            if (!parsedDate && item.inspectionDate) {
                isDateInvalid.value = true
            }
            return {
                id: item.id || '',
                index: item.indexs || '',
                mileage: item.mileage || '',
                plannedVector: item.plannedVector || '',
                actualVector: item.actualVector || '',
                vectorDifference: item.vectorDifference || '',
                adjustmentAmount: item.adjustmentAmount || '',
                postAdjustmentVector: item.postAdjustmentVector || '',
                actualSuperelevation: item.actualSuperelevation || '',
                superelevationDifference: item.superelevationDifference || '',
                superelevationGradient: item.superelevationGradient || '',
                gauge: item.gauge || '',
                gaugePermillage: item.gaugePermillage || '',
                inspectionDate: parsedDate,
                inspector: item.inspector || '',
                lineName: item.lineName || '',
                direction: item.direction || '',
                chordLength: item.chordLength || ''
            }
        })
        pagination.value.total = response.data.total || 0;
        pagination.value.pageCount = Math.ceil(pagination.value.total / pagination.value.pageSize);
        await nextTick();
        // 更新检查信息
        if (tableData.value.length > 0) {
            const firstItem = tableData.value[0]
            inspectionInfo.value = {
                inspectionDate: firstItem.inspectionDate,
                inspector: firstItem.inspector,
                lineName: firstItem.lineName,
                direction: firstItem.direction,
                chordLength: firstItem.chordLength,
                designRadius: firstItem.designRadius || '',
                actualRadius: firstItem.actualRadius || '',
                curveLength: firstItem.curveLength || '',
                circularCurveLength: firstItem.circularCurveLength || '',
                transitionCurveLength: firstItem.transitionCurveLength || '',
                designSuperelevation: firstItem.designSuperelevation || '',
                vmax: firstItem.vmax || ''
            }
        } else {
            inspectionInfo.value = {
                inspectionDate: null,
                inspector: '',
                lineName: '',
                direction: '',
                chordLength: '',
                designRadius: '',
                actualRadius: '',
                curveLength: '',
                circularCurveLength: '',
                transitionCurveLength: '',
                designSuperelevation: '',
                vmax: ''
            }
        }

        await nextTick()
        pagination.value = { ...pagination.value }
    } catch (error) {
        console.error('获取数据失败:', error)
        tableData.value = [];
        pagination.value.total = 0;
        pagination.value.pageCount = 1;
        inspectionInfo.value = {
            inspectionDate: null,
            inspector: '',
            lineName: '',
            direction: '',
            chordLength: '',
            designRadius: '',
            actualRadius: '',
            curveLength: '',
            circularCurveLength: '',
            transitionCurveLength: '',
            designSuperelevation: '',
            vmax: ''
        }
        isDateInvalid.value = false
    } finally {
        loading.value = false
    }
}

// 搜索
async function handleSearch() {
    searchForm.value.pageNo = 1
    isDateInvalid.value = false
    await fetchData()
}

// 重置
async function resetSearch() {
    searchForm.value = {
        lineName: '',
        direction: '',
        mileage: '',
        pageNo: 1,
        pageSize: 10
    }
    inspectionInfo.value = {
        inspectionDate: null,
        inspector: '',
        lineName: '',
        direction: '',
        chordLength: '',
        designRadius: '',
        actualRadius: '',
        curveLength: '',
        circularCurveLength: '',
        transitionCurveLength: '',
        designSuperelevation: '',
        vmax: ''
    }
    isDateInvalid.value = false
    await fetchData()
}

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
}

// 页面加载时获取数据
onMounted(() => {
    fetchData()
})
</script>

<style scoped>
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

:deep(.n-data-table) {
    border: 1px solid rgb(189, 187, 187);
    border-collapse: collapse;
    /* 关键属性：合并单元格边框 */
}

/* 表头背景颜色 */
:deep(.n-data-table thead th) {
    border: 1px solid rgb(189, 187, 187) !important;
    background-color: rgb(32, 44, 51) !important;
}

/* 表体行背景色（覆盖整行） */
:deep(.n-data-table tbody tr) {
    background-color: rgb(39, 88, 86) !important;
    /* 主颜色 */
}

/* 可选：奇偶行区分（增强视觉） */
:deep(.n-data-table tbody tr:nth-child(odd)) {
    background-color: rgb(39, 88, 86) !important;
    /* 奇数行 */
}

:deep(.n-data-table tbody tr:nth-child(even)) {
    background-color: rgba(39, 88, 86, 0.8) !important;
    /* 偶数行（更浅） */
}

/* 关键：覆盖单元格默认背景色（如果 UI 库有默认样式） */
:deep(.n-data-table tbody td) {
    border: 1px solid rgb(189, 187, 187);
    background-color: transparent !important;
    /* 清除 td 自带的背景色 */
}

.card-style {
    background-color: rgb(32, 44, 51);
    margin-top: -10px;
    margin-bottom: 12px;

}

:deep(.custom-input) {
    background-color: rgb(233, 233, 233) !important;
    /* 可选：修改边框颜色 */
}

:deep(.n-input) {
    background-color: rgb(233, 233, 233) !important;
    /* 可选：修改边框颜色 */
}

:deep(.n-input__placeholder) {
    color: #8d8d8d !important;
    /* 淡灰色 */

}
:deep(.n-input__input-el) {
    color: black;
}

/* 修改输入框为圆角样式 */
:deep(.custom-input .n-input__input) {
    border-radius: 12px !important;
    /* 圆角大小 */
}
</style>