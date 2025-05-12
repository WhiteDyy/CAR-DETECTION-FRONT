<template>
    <CommonPage>
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 16px;">
            <n-tooltip trigger="hover">
                <template #trigger>
                    <div style="text-align: center; font-weight: bold; font-size: 25px; cursor: pointer;"
                        @click="toggleSearchForm">
                        轨道图像巡检 临时修补 超限报表
                    </div>
                </template>
                点击可{{ showSearchForm ? '隐藏' : '显示' }}搜索表单
            </n-tooltip>
            <n-dropdown trigger="click" :options="dropdownOptions" @select="handleDropdownSelect">
                <n-button style="margin-left: 16px;" type="primary">
                    切换表格
                </n-button>
            </n-dropdown>
        </div>

        <!-- 第一个表单：基本信息（5列布局，单独绑定） -->
        <n-form v-if="showSearchForm" :model="basicInfoForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-card title="基本信息筛选">
                <n-grid :cols="5" :x-gap="12" :y-gap="8">
                    <n-form-item-gi label="起始里程">
                        <n-input v-model:value="basicInfoForm.startMileage" placeholder="请输入起始里程" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="终止里程">
                        <n-input v-model:value="basicInfoForm.endMileage" placeholder="请输入终止里程" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="线路名称">
                        <n-input v-model:value="basicInfoForm.lineName" placeholder="请输入线路名称" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="上下行">
                        <n-select v-model:value="basicInfoForm.direction" :options="directionOptions" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="检测人员">
                        <n-input v-model:value="basicInfoForm.inspector" placeholder="请输入检测人员" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="检测时间">
                        <n-date-picker v-model:value="basicInfoForm.inspectionTimeRange" type="daterange" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi label="超限处理情况">
                        <n-input v-model:value="basicInfoForm.excessHandling" placeholder="请输入超限处理情况" clearable />
                    </n-form-item-gi>
                    <n-form-item-gi>
                        <n-space>
                            <n-button type="primary" @click="handleSearch">
                                搜索
                            </n-button>
                            <n-button @click="resetBasicInfoForm">
                                重置
                            </n-button>
                        </n-space>
                    </n-form-item-gi>
                </n-grid>
            </n-card>
        </n-form>

        <!-- 第二个表单：超限标准矩阵（固定值，单独绑定，修改布局） -->
        <n-form v-if="showSearchForm" :model="excessStandardsForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-card title="图像巡检超限标准">
                <n-data-table :columns="t1Columns" :data="t1Data" :bordered="true" :single-line="false" :scroll-x="1000"
                    :max-height="500" />

                <n-table :bordered="true" :single-line="false">
                    <tbody>
                        <tr v-for="(item, index) in t2Standards" :key="index">
                            <!-- 左侧标题只在第一行显示，跨 4 行 -->
                            <td v-if="index === 0" rowspan="4" class="title-cell">
                                钢轨折断标准
                            </td>
                            <!-- 右侧内容 -->
                            <td class="content-cell">
                                {{ item }}
                            </td>
                        </tr>
                    </tbody>
                </n-table>

                <n-table :bordered="true" :single-line="false">
                    <thead>
                        <tr>
                            <td colspan="3" class="title-cell">
                                联结零件损伤标准
                            </td>
                        </tr>
                        <tr>
                            <th v-for="(header, index) in t3Headers" :key="index" class="header-cell">
                                {{ header }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="content-cell" rowspan="6">
                                <ul>
                                    <li v-for="(item, index) in contents[0]" :key="index">{{ item }}</li>
                                </ul>
                            </td>
                            <td class="content-cell" rowspan="6">
                                <ul>
                                    <li v-for="(item, index) in contents[1]" :key="index">{{ item }}</li>
                                </ul>
                            </td>
                            <td class="content-cell" rowspan="6">
                                <ul>
                                    <li v-for="(item, index) in contents[2]" :key="index">{{ item }}</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </n-table>


                <n-table :bordered="true" :single-line="false">
                    <tbody>
                        <!-- Section 1: 轨枕失效标准 (Sleeper Failure Standard) -->
                        <tr v-for="(item, index) in sections[0].items" :key="`section1-${index}`">
                            <td v-if="index === 0" :rowspan="sections[0].items.length" class="title-cell">
                                {{ sections[0].title }}
                            </td>
                            <td class="content-cell">{{ item }}</td>
                        </tr>
                        <!-- Section 2: 混凝土严重损伤标准 (Concrete Severe Damage Standard) -->
                        <tr v-for="(item, index) in sections[1].items" :key="`section2-${index}`">
                            <td v-if="index === 0" :rowspan="sections[1].items.length" class="title-cell">
                                {{ sections[1].title }}
                            </td>
                            <td class="content-cell">{{ item }}</td>
                        </tr>
                    </tbody>
                </n-table>
                <n-card title="双块式无砟轨道道床伤损形式及伤损等级判定标准">
                    <n-data-table :columns="t5Columns" :data="t5Data" :bordered="true" :single-line="false"
                        :scroll-x="1000" :max-height="500" />
                </n-card>

                <n-card title="轨枕埋入式无砟道床伤损形式及伤损等级判定标准">
                    <n-data-table :columns="t5Columns" :data="t6Data" :bordered="true" :single-line="false"
                        :scroll-x="1000" :max-height="500" />
                </n-card>

                <n-card title="弹性支承块式无砟道床伤损形式及伤损等级判定标准">
                    <n-data-table :columns="t5Columns" :data="t7Data" :bordered="true" :single-line="false"
                        :scroll-x="1000" :max-height="500" />
                </n-card>


            </n-card>


        </n-form>





        <n-form v-if="showSearchForm" :model="searchForm" label-placement="left" label-width="auto"
            :style="{ marginBottom: '16px' }">
            <n-grid :cols="4" :x-gap="12" :y-gap="8">
                <n-form-item-gi v-for="field in filterFields" :key="field.key" :label="field.label">
                    <n-input v-model:value="searchForm[field.key]" :placeholder="`请输入${field.label}`" clearable />
                </n-form-item-gi>
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

        <n-data-table :columns="columns" :data="filteredData" :pagination="pagination" :bordered="true"
            :single-line="false" :virtual-scroll="true" :scroll-x="3000" :max-height="600" />
    </CommonPage>
</template>

<script setup>
import { h, ref, computed } from 'vue'
import { NButton, NTooltip, NForm, NFormItemGi, NInput, NGrid, NSpace, NDataTable } from 'naive-ui'



const standTablecolumns = [
    {
        title: '',
        key: 'standard',
        rowSpan: (row, i) => (4),
        render: () => '超限标准'
    },
    {
        title: '',
        key: 'type',
        colSpan: (row, i) => (i === 0 ? 0 : 1),
        render(row, i) {
            const types = ['作业验收', '综合保养', '临时补修', '四级超限']
            return types[i]
        }
    },
    { title: '轨距', key: 'gauge' },
    { title: '轨距变化率', key: 'gaugeChangeRate' },
    { title: '水平', key: 'level' },
    { title: '三角坑', key: 'triangularPit' },
    { title: '高低', key: 'height' },
    { title: '轨向', key: 'trackDirection' },
    { title: '正矢', key: 'arrow' },

]

const standTabledata = [

    { key: 0, type: '作业验收', gauge: '-2~+2', gaugeChangeRate: '±2', level: '±2', triangularPit: '±2', height: '±1', trackDirection: '±1', arrow: '±1', },
    { key: 1, type: '综合保养', gauge: '-4~+4', gaugeChangeRate: '±4', level: '±4', triangularPit: '±4', height: '±2', trackDirection: '±2', arrow: '±2', },
    { key: 2, type: '临时补修', gauge: '-6.5~+7.5', gaugeChangeRate: '±6', level: '±7', triangularPit: '±7', height: '±4', trackDirection: '±4', arrow: '±4', },
    { key: 3, type: '四级超限', gauge: '-6~+8', gaugeChangeRate: '±6', level: '±6', triangularPit: '±6', height: '±8', trackDirection: '±8', arrow: '±8', }
]
// 上下行选项
const directionOptions = [
    { label: '上行', value: 'up' },
    { label: '下行', value: 'down' },
]

// Dropdown options for table selection
const dropdownOptions = [
    { label: '作业验收', key: '作业验收' },
    { label: '综合保养', key: '综合保养' },
    { label: '临时补修', key: '临时补修' },
    { label: '四级超限', key: '四级超限' }
]

// State for selected table type
const selectedType = ref('作业验收')

// Handle dropdown selection
const handleDropdownSelect = (key) => {
    selectedType.value = key
}



// 控制搜索表单显示状态
const showSearchForm = ref(false)

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value
}

// 定义表格列
// const columns = [
//     {
//         title: '标识位置',
//         align: 'center',
//         children: [
//             { title: '公里', key: 'mileage', align: 'center', width: 100, render: (row) => Math.floor(Number(row.mileage)) },
//             { title: '米', key: 'mileage', align: 'center', width: 100, render: (row) => ((Number(row.mileage) % 1) * 1000).toFixed(0) },
//         ],
//     },
//     {
//         title: '钢轨剥离掉块',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '深度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '钢轨擦伤',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '深度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '钢轨波磨',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '深度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '钢轨鱼鳞纹',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '钢轨裂纹',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '夹板裂纹',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '夹板螺栓损坏',
//         align: 'center',
//         children: [
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '夹板垫圈损坏',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '深度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '扣件损坏',
//         align: 'center',
//         children: [
//             { title: '数量', key: '', align: 'center', width: 80 },
//         ],
//     },
//     {
//         title: '扣件移位',
//         align: 'center',
//         children: [
//             { title: '数量', key: '', align: 'center', width: 80 },
//         ],
//     },
//     {
//         title: '扣件垫圈损坏',
//         align: 'center',
//         children: [
//             { title: '数量', key: '', align: 'center', width: 80 },
//         ],
//     },
//     {
//         title: '扣件螺旋道钉损坏',
//         align: 'center',
//         children: [
//             { title: '数量', key: '', align: 'center', width: 80 },
//         ],
//     },
//     {
//         title: '扣件挡板座损坏',
//         align: 'center',
//         children: [
//             { title: '数量', key: '', align: 'center', width: 80 },
//         ],
//     },
//     {
//         title: '轨枕裂纹',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '轨枕掉块',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '道床裂纹',
//         align: 'center',
//         children: [
//             { title: '宽度mm', key: '', align: 'center', width: 60 },
//             { title: '数量', key: '', align: 'center', width: 60 },
//         ],
//     },
//     {
//         title: '线路特征',
//         key: '',
//         width: 150,
//         align: 'center',
//     },
//     {
//         title: '完成时间',
//         key: 'inspectionTime',
//         width: 150,
//         align: 'center',
//     },
//     {
//         title: '负责人员',
//         key: 'responsiblePerson',
//         width: 150,
//         align: 'center',
//     },
// ];

const columns = [
    {
        title: '标识位置',
        align: 'center',
        children: [
            { title: '公里', key: 'mileage', align: 'center', width: 100, render: (row) => Math.floor(Number(row.mileage)) },
            { title: '米', key: 'mileage', align: 'center', width: 100, render: (row) => ((Number(row.mileage) % 1) * 1000).toFixed(0) },
        ],
    },
    {
        title: '钢轨剥离掉块',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'railSpallingWidth', align: 'center', width: 60 },
            { title: '深度mm', key: 'railSpallingDepth', align: 'center', width: 60 },
            { title: '数量', key: 'railSpallingQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '钢轨擦伤',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'railAbrasionWidth', align: 'center', width: 60 },
            { title: '深度mm', key: 'railAbrasionDepth', align: 'center', width: 60 },
            { title: '数量', key: 'railAbrasionQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '钢轨波磨',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'railCorrugationWidth', align: 'center', width: 60 },
            { title: '深度mm', key: 'railCorrugationDepth', align: 'center', width: 60 },
            { title: '数量', key: 'railCorrugationQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '钢轨鱼鳞纹',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'railScalePatternWidth', align: 'center', width: 60 },
            { title: '数量', key: 'railScalePatternQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '钢轨裂纹',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'railCrackWidth', align: 'center', width: 60 },
            { title: '数量', key: 'railCrackQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '夹板裂纹',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'fishplateCrackWidth', align: 'center', width: 60 },
            { title: '数量', key: 'fishplateCrackQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '夹板螺栓损坏',
        align: 'center',
        children: [
            { title: '数量', key: 'fishplateBoltDamageQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '夹板垫圈损坏',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'fishplateWasherDamageWidth', align: 'center', width: 60 },
            { title: '深度mm', key: 'fishplateWasherDamageDepth', align: 'center', width: 60 },
            { title: '数量', key: 'fishplateWasherDamageQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '扣件损坏',
        align: 'center',
        children: [
            { title: '数量', key: 'fastenerDamageQuantity', align: 'center', width: 80 },
        ],
    },
    {
        title: '扣件移位',
        align: 'center',
        children: [
            { title: '数量', key: 'fastenerDisplacementQuantity', align: 'center', width: 80 },
        ],
    },
    {
        title: '扣件垫圈损坏',
        align: 'center',
        children: [
            { title: '数量', key: 'fastenerWasherDamageQuantity', align: 'center', width: 80 },
        ],
    },
    {
        title: '扣件螺旋道钉损坏',
        align: 'center',
        children: [
            { title: '数量', key: 'fastenerScrewSpikeDamageQuantity', align: 'center', width: 80 },
        ],
    },
    {
        title: '扣件挡板座损坏',
        align: 'center',
        children: [
            { title: '数量', key: 'fastenerBaseplateDamageQuantity', align: 'center', width: 80 },
        ],
    },
    {
        title: '轨枕裂纹',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'sleeperCrackWidth', align: 'center', width: 60 },
            { title: '数量', key: 'sleeperCrackQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '轨枕掉块',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'sleeperSpallingWidth', align: 'center', width: 60 },
            { title: '数量', key: 'sleeperSpallingQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '道床裂纹',
        align: 'center',
        children: [
            { title: '宽度mm', key: 'ballastBedCrackWidth', align: 'center', width: 60 },
            { title: '数量', key: 'ballastBedCrackQuantity', align: 'center', width: 60 },
        ],
    },
    {
        title: '线路特征',
        key: 'lineFeature',
        width: 150,
        align: 'center',
    },
    {
        title: '完成时间',
        key: 'inspectionTime',
        width: 150,
        align: 'center',
    },
    {
        title: '负责人员',
        key: 'responsiblePerson',
        width: 150,
        align: 'center',
    },
];

// 展平 columns 以获取所有筛选字段
const filterFields = computed(() => {
    const fields = [];
    columns.forEach((col) => {
        if (col.children) {
            col.children.forEach((child) => {
                if (child.key && child.key !== 'mileage') { // 避免 mileage 重复
                    fields.push({
                        key: child.key,
                        label: `${col.title} - ${child.title}`,
                    });
                }
            });
        } else if (col.key) {
            fields.push({
                key: col.key,
                label: col.title,
            });
        }
    });
    // 添加 mileage 作为单独字段
    fields.unshift({
        key: 'mileage',
        label: '标识位置（公里）',
    });
    return fields;
});


// 生成假数据（包含新字段）
// const tableData = Array.from({ length: 15 }, (_, index) => ({
//     mileage: (index * 0.5).toFixed(3),
//     gaugeMeasured: (1435 + Math.random() * 2).toFixed(2),
//     gaugeWarning: '±2',
//     gaugeChangeRateMeasured: (Math.random() * 2).toFixed(2),
//     gaugeChangeRateWarning: '±1',
//     levelMeasured: (Math.random() * 3).toFixed(2),
//     levelWarning: '±2',
//     twistMeasured: (Math.random() * 4).toFixed(2),
//     twistWarning: '±3',
//     alignmentLeftMeasured: (Math.random() * 3).toFixed(2),
//     alignmentLeftWarning: '±2',
//     alignmentRightMeasured: (Math.random() * 3).toFixed(2),
//     alignmentRightWarning: '±2',
//     directionLeftMeasured: (Math.random() * 2).toFixed(2),
//     directionLeftWarning: '±1',
//     directionRightMeasured: (Math.random() * 2).toFixed(2),
//     directionRightWarning: '±1',
//     versineLeftMeasured: (Math.random() * 2).toFixed(2),
//     versineLeftWarning: '±1',
//     versineRightMeasured: (Math.random() * 2).toFixed(2),
//     versineRightWarning: '±1',
//     superelevationMeasured: (Math.random() * 150).toFixed(2),
//     superelevationWarning: '±10',
//     startTangentLengthMeasured: (50 + index * 2).toFixed(2),
//     startTangentLengthWarning: '±5',
//     startTransitionLengthMeasured: (30 + index * 1.5).toFixed(2),
//     startTransitionLengthWarning: '±3',
//     endTransitionLengthMeasured: (30 + index * 1.5).toFixed(2),
//     endTransitionLengthWarning: '±3',
//     endTangentLengthMeasured: (50 + index * 2).toFixed(2),
//     endTangentLengthWarning: '±5',
//     curveRadiusMeasured: (500 + index * 10).toFixed(2),
//     curveRadiusWarning: '±20',
//     turningAngleMeasured: (10 + index * 0.5).toFixed(2),
//     turningAngleWarning: '±1',
//     totalCurveLengthMeasured: (200 + index * 5).toFixed(2),
//     totalCurveLengthWarning: '±10',
//     operators: `操作员 ${index + 1}`,
//     responsiblePerson: `人员 ${index + 1}`,
//     inspectionTime: new Date().toLocaleDateString(),
//     lineName: `线路 ${index % 3 + 1}`,
//     direction: index % 2 === 0 ? 'up' : 'down',
//     inspector: `检测员 ${index + 1}`,
//     excessHandling: `处理情况 ${index + 1}`,
// }));

const tableData = Array.from({ length: 15 }, (_, index) => ({
    mileage: (index * 0.5).toFixed(3), // 标识位置 - 公里和米


    // 新增的钢轨剥离掉块数据
    railSpallingWidth: (Math.random() * 10 + 1).toFixed(1), // 宽度mm
    railSpallingDepth: (Math.random() * 5 + 0.5).toFixed(1), // 深度mm
    railSpallingQuantity: Math.floor(Math.random() * 5), // 数量 (0-4)

    // 新增的钢轨擦伤数据
    railAbrasionWidth: (Math.random() * 8 + 0.5).toFixed(1),
    railAbrasionDepth: (Math.random() * 3 + 0.1).toFixed(1),
    railAbrasionQuantity: Math.floor(Math.random() * 4),

    // 新增的钢轨波磨数据
    railCorrugationWidth: (Math.random() * 15 + 2).toFixed(1),
    railCorrugationDepth: (Math.random() * 2 + 0.1).toFixed(1),
    railCorrugationQuantity: Math.floor(Math.random() * 3),

    // 新增的钢轨鱼鳞纹数据
    railScalePatternWidth: (Math.random() * 5 + 0.5).toFixed(1),
    railScalePatternQuantity: Math.floor(Math.random() * 6),

    // 新增的钢轨裂纹数据
    railCrackWidth: (Math.random() * 3 + 0.1).toFixed(1),
    railCrackQuantity: Math.floor(Math.random() * 2),

    // 新增的夹板裂纹数据
    fishplateCrackWidth: (Math.random() * 2 + 0.1).toFixed(1),
    fishplateCrackQuantity: Math.floor(Math.random() * 2),

    // 新增的夹板螺栓损坏数据
    fishplateBoltDamageQuantity: Math.floor(Math.random() * 3),

    // 新增的夹板垫圈损坏数据
    fishplateWasherDamageWidth: (Math.random() * 1.5 + 0.1).toFixed(1),
    fishplateWasherDamageDepth: (Math.random() * 0.5 + 0.1).toFixed(1),
    fishplateWasherDamageQuantity: Math.floor(Math.random() * 4),

    // 新增的扣件损坏数据
    fastenerDamageQuantity: Math.floor(Math.random() * 7),

    // 新增的扣件移位数据
    fastenerDisplacementQuantity: Math.floor(Math.random() * 5),

    // 新增的扣件垫圈损坏数据
    fastenerWasherDamageQuantity: Math.floor(Math.random() * 6),

    // 新增的扣件螺旋道钉损坏数据
    fastenerScrewSpikeDamageQuantity: Math.floor(Math.random() * 4),

    // 新增的扣件挡板座损坏数据
    fastenerBaseplateDamageQuantity: Math.floor(Math.random() * 3),

    // 新增的轨枕裂纹数据
    sleeperCrackWidth: (Math.random() * 5 + 0.5).toFixed(1),
    sleeperCrackQuantity: Math.floor(Math.random() * 4),

    // 新增的轨枕掉块数据
    sleeperSpallingWidth: (Math.random() * 8 + 1).toFixed(1),
    sleeperSpallingQuantity: Math.floor(Math.random() * 3),

    // 新增的道床裂纹数据
    ballastBedCrackWidth: (Math.random() * 10 + 2).toFixed(1),
    ballastBedCrackQuantity: Math.floor(Math.random() * 2),

    // 线路特征
    lineFeature: ['弯道', '直线', '隧道', '桥梁', '岔区'][Math.floor(Math.random() * 5)],

    operators: `操作员 ${index + 1}`,
    responsiblePerson: `人员 ${index + 1}`,
    inspectionTime: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    lineName: `线路 ${index % 3 + 1}`,
    direction: index % 2 === 0 ? '上行' : '下行', // Changed to Chinese for consistency
    inspector: `检测员 ${index + 1}`,
    excessHandling: `处理情况 ${index + 1}`,
}));

// 第一个表单：基本信息数据
const basicInfoForm = ref({
    startMileage: '',
    endMileage: '',
    lineName: '',
    direction: null,
    inspector: '',
    inspectionTimeRange: null,
    excessHandling: '',
});




const renderDiagonalCell = () => {
    return h('div', {
        style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '25px',
            position: 'relative', // 确保 SVG 定位正确
        },
    }, [
        h('svg', {
            width: '100%',
            height: '100%',
            viewBox: '0 0 100 100',
            preserveAspectRatio: 'none',
            style: {
                position: 'absolute', // 填充整个单元格
                top: 0,
                left: 0,
            },
        }, [
            h('line', {
                x1: '0',   // 左上角
                y1: '0',
                x2: '100', // 右下角
                y2: '100',
                stroke: '#000',      // 深灰色斜线，增强可见性
                strokeWidth: '3',    // 稍粗的线条，突出分隔效果
                strokeLinecap: 'round', // 圆形线帽，美化斜线两端
            }),
        ]),
    ]);
};

/**
 * 创建表格列定义
 * @returns {Array} 列配置数组
 */
const createt1Columns = () => {
    return [
        {
            title: '钢轨轻伤和重伤标准', // 第一列标题
            key: 'item', // 对应数据中的 key
            align: 'center', // 标题和单元格内容居中对齐
            children: [
                {
                    title: '伤损项目', // 第一列标题
                    key: 'item', // 对应数据中的 key
                    width: 150, // 列宽
                    fixed: 'center', // 固定在左侧，方便滚动查看
                    align: 'center', // 标题和单元格内容居中对齐
                },
                {
                    title: '伤损程度', // 第二列是一个父级标题，包含子列
                    key: 'degree', // 虚拟 key，用于组织子列
                    align: 'center',
                    children: [
                        {
                            title: '轻伤', // “轻伤”子标题，包含三列
                            key: 'minorInjuryGroup', // 虚拟 key
                            align: 'center',
                            children: [
                                {
                                    title: 'Vmax>160km/h',
                                    key: 'minor_vmax_gt_160',
                                    minWidth: 150,
                                    align: 'center',
                                    // span 函数用于控制单元格合并
                                    // colSpan: (rowData, rowIndex) => (rowIndex === 0 ? 3 : 1),
                                    colSpan: (rowData, rowIndex) => {
                                        // 对于“钢轨头部磨耗”、“波浪形磨耗”和“钢轨表面裂纹”行，
                                        // 第一个子列需要横跨3列（colSpan: 3）
                                        if (rowIndex === 0 || rowIndex === 4) {
                                            return 3
                                        }
                                        return undefined; // 其他单元格不合并
                                    },


                                    // render 函数用于自定义单元格内容
                                    render: (rowData, rowIndex) => {
                                        // “钢轨表面裂纹”行在“轻伤”部分需要显示斜线
                                        if (rowIndex === 4) {
                                            return renderDiagonalCell();
                                        }
                                        // 其他情况渲染数据内容，并添加内边距
                                        return h('div', { style: { padding: '8px' } }, rowData.minor_vmax_gt_160);
                                    }
                                },
                                {
                                    title: '160km/h≥Vmax>120km/h',
                                    key: 'minor_vmax_120_160',
                                    minWidth: 150,
                                    align: 'center',

                                    render: (rowData, rowIndex) => {
                                        // 尽管会被 span 隐藏，但 render 函数仍可能被调用，
                                        // 所以仍要确保正确处理斜线显示
                                        if (rowIndex === 4) {
                                            return renderDiagonalCell();
                                        }
                                        return h('div', { style: { padding: '8px' } }, rowData.minor_vmax_120_160);
                                    }
                                },
                                {
                                    title: 'Vmax≤120km/h',
                                    key: 'minor_vmax_le_120',
                                    minWidth: 150,
                                    align: 'center',

                                    render: (rowData, rowIndex) => {
                                        if (rowIndex === 4) {
                                            return renderDiagonalCell();
                                        }
                                        return h('div', { style: { padding: '8px' } }, rowData.minor_vmax_le_120);
                                    }
                                }
                            ]
                        },
                        {
                            title: '重伤', // “重伤”子标题，包含三列
                            key: 'seriousInjuryGroup', // 虚拟 key
                            align: 'center',
                            children: [
                                {
                                    title: 'Vmax>160km/h',
                                    key: 'serious_vmax_gt_160',
                                    minWidth: 150,
                                    align: 'center',
                                    colSpan: (rowData, rowIndex) => {
                                        // 对于“钢轨头部磨耗”、“波浪形磨耗”和“钢轨表面裂纹”行，
                                        // 第一个子列需要横跨3列（colSpan: 3）
                                        if (rowIndex === 0) {
                                            return 3
                                        }
                                        return undefined; // 其他单元格不合并
                                    },
                                    render: (rowData, rowIndex) => {
                                        // “波浪形磨耗”行在“重伤”部分需要显示斜线
                                        if (rowIndex === 3) {
                                            return renderDiagonalCell();
                                        }
                                        return h('div', { style: { padding: '8px' } }, rowData.serious_vmax_gt_160);
                                    }
                                },
                                {
                                    title: '160km/h≥Vmax>120km/h',
                                    key: 'serious_vmax_120_160',
                                    minWidth: 150,
                                    align: 'center',
                                    span: (rowData, rowIndex) => {
                                        if (rowIndex === 0 || rowIndex === 3 || rowIndex === 4) {
                                            return { rowSpan: 0, colSpan: 0 }; // 隐藏
                                        }
                                        return undefined;
                                    },
                                    render: (rowData, rowIndex) => {
                                        if (rowIndex === 3) {
                                            return renderDiagonalCell();
                                        }
                                        return h('div', { style: { padding: '8px' } }, rowData.serious_vmax_120_160);
                                    }
                                },
                                {
                                    title: 'Vmax≤120km/h',
                                    key: 'serious_vmax_le_120',
                                    minWidth: 150,
                                    align: 'center',
                                    span: (rowData, rowIndex) => {
                                        if (rowIndex === 0 || rowIndex === 3 || rowIndex === 4) {
                                            return { rowSpan: 0, colSpan: 0 }; // 隐藏
                                        }
                                        return undefined;
                                    },
                                    render: (rowData, rowIndex) => {
                                        if (rowIndex === 3) {
                                            return renderDiagonalCell();
                                        }
                                        return h('div', { style: { padding: '8px' } }, rowData.serious_vmax_le_120);
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
};


const t1Columns = createt1Columns(); // 获取列定义

// 表格数据
const t1Data = [
    {
        item: '钢轨头部磨耗',
        minor_vmax_gt_160: '磨耗量超过表3.6.3-2所列限度之一者', // 此内容会通过 span 属性合并占据3列
        minor_vmax_120_160: '', // 留空，会被合并
        minor_vmax_le_120: '',   // 留空，会被合并
        serious_vmax_gt_160: '磨耗量超过表3.6.3-3所列限度之一者', // 此内容会通过 span 属性合并占据3列
        serious_vmax_120_160: '',// 留空，会被合并
        serious_vmax_le_120: ''  // 留空，会被合并
    },
    {
        item: '轨顶或轨面剥落掉块',
        minor_vmax_gt_160: '长度超过15mm且深度超过3mm',
        minor_vmax_120_160: '长度超过15mm且深度超过3mm',
        minor_vmax_le_120: '长度超过15mm且深度超过4mm',
        serious_vmax_gt_160: '长度超过25mm且深度超过3mm',
        serious_vmax_120_160: '长度超过25mm且深度超过3mm',
        serious_vmax_le_120: '长度超过30mm且深度超过8mm'
    },
    {
        item: '钢轨顶面擦伤',
        minor_vmax_gt_160: '深度超过0.5mm',
        minor_vmax_120_160: '深度超过0.5mm',
        minor_vmax_le_120: '深度超过1mm',
        serious_vmax_gt_160: '深度超过1mm',
        serious_vmax_120_160: '深度超过1mm',
        serious_vmax_le_120: '深度超过2mm'
    },
    {
        item: '波浪形磨耗',
        minor_vmax_gt_160: '谷深超过0.3mm', // 此内容会通过 span 属性合并占据3列
        minor_vmax_120_160: '谷深超过0.3mm',
        minor_vmax_le_120: '谷深超过0.5mm',
        serious_vmax_gt_160: '', // 留空，该单元格需要显示斜线
        serious_vmax_120_160: '',
        serious_vmax_le_120: ''
    },
    {
        item: '钢轨表面裂纹',
        minor_vmax_gt_160: '', // 留空，该单元格需要显示斜线
        minor_vmax_120_160: '',
        minor_vmax_le_120: '',
        serious_vmax_gt_160: '有', // 此内容会通过 span 属性合并占据3列
        serious_vmax_120_160: '有',
        serious_vmax_le_120: '有'
    }
];


const t2Standards = ref([
    '钢轨全截面断裂',
    '裂纹贯通整个轨头截面',
    '裂纹贯通整个轨底截面',
    '允许速度不大于160km/h区段钢轨顶面上有长度大于50mm且深度大于10mm的掉块，允许速度大于160km/h区段钢轨顶面上有长度大于30mm且深度大于5mm的掉块'
])

const t3Headers = ref([
    '接头夹板伤损',
    '接头螺栓及垫圈伤损',
    '混凝土扣件伤损'
])


const contents = ref([
    [
        '1.折断',
        '2.中间两螺栓孔范围内裂纹：正线、到发线有裂纹；其他战线平直及异形夹板超过5mm，双头及鱼尾型夹板超过15mm',
        '3.其他部位裂纹发展到螺栓孔'
    ],
    [
        '1.螺栓折断、变形，严重锈蚀、丝扣损坏或杆径磨耗超过3mm不能保持规定的扭矩',
        '2.垫圈折断或失去弹性'
    ],
    [
        '1.螺旋道钉折断、浮起，螺帽或螺杆丝扣损坏，严重锈蚀',
        '2.垫圈损坏或作用不良',
        '3.弹条、扣板（弹片）损坏或不能保持应有的扣压力',
        '4.扣板、轨距挡板严重磨损、锈蚀，扣板、轨距挡板前后离缝超过2mm',
        '5.挡板座、铁座损坏或作用不良',
        '6.预埋套管损坏'
    ]
])



const sections = ref([
    {
        title: '轨枕失效标准 混凝土枕（含混凝土宽枕、混凝土岔枕及短轨枕）',
        items: [
            '1. 明显折断',
            '2. 纵向通裂（1）挡肩顶角处缝宽大于1.5mm（2）纵向水平裂缝基本贯通（缝宽大于0.5mm）',
            '3. 横裂（或斜裂）接近环状裂纹（残余裂缝宽度大于0.5mm或长度超过2/3枕高）',
            '4. 挡肩破损，接近失去承载能力（破损长度超过挡肩长度的1/2）',
            '5. 严重掉块，影响钢轨或扣件正常安装及使用，或影响轨枕其他正常使用功能'
        ]
    },
    {
        title: '混凝土严重损伤标准',
        items: [
            '1. 横裂裂缝长度为枕高的1/2~2/3',
            '2. 纵裂（1）两螺栓孔间纵裂（挡肩顶角处缝宽不大于1.5mm）（2）纵向水平裂缝基本贯通（缝宽不大于0.5mm）',
            '3. 挡肩破损长度为挡肩长度的1/3~1/2',
            '4. 严重网状龟裂和掉块',
            '5. 承轨槽压溃，深度超过2mm',
            '6. 钢筋（或钢丝）外露（钢筋未锈蚀，长度超过100mm）',
            '7. 斜裂长度为枕高的1/2~2/3'
        ]
    }
])



const t5Columns = [
    {
        title: '伤损部位',
        key: 'damagePart',
        align: 'center',
        width: 120,

    },
    { title: '伤损形式', align: 'center', key: 'damageKine', width: 100 },
    { title: '判断项目', align: 'center', key: 'JudgmentPoint', width: 150 },
    {
        title: '评定等级', align: 'center', key: 'level', width: 120,
        children: [
            { title: 'I', align: 'center', key: 'level1', width: 60 },
            { title: 'II', align: 'center', key: 'level2', width: 60 },
            { title: 'III', align: 'center', key: 'level3', width: 60 },
        ]
    },
    {
        title: '备注', align: 'center', key: 'mark', width: 120,

    },

]


const t5Data = ref([
    {
        key: 1,
        damagePart: '双块式轨枕',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.1',
        level2: '0.2',
        level3: '0.3',
        mark: '掉块、缺损应适时修补',
    },
    {
        key: 2,
        damagePart: '道床板',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
    {
        key: 3,
        damagePart: '道床板',
        damageKine: '轨枕界面裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
    {
        key: 4,
        damagePart: '支承层',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.3',
        level2: '0.5',
        level3: '1',
        mark: '',
    },
    {
        key: 5,
        damagePart: '底座',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
]);

const t6Data = ref([
    {
        key: 1,
        damagePart: '长枕',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.1',
        level2: '0.2',
        level3: '0.3',
        mark: '掉块、缺损应适时修补',
    },
    {
        key: 2,
        damagePart: '道床板',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
    {
        key: 3,
        damagePart: '道床板', // 根据上下文推断，认为此项也属于道床板的判断项目
        damageKine: '轨枕界面裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
    {
        key: 4,
        damagePart: '底座',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
]);

const t7Data = ref([
    {
        key: 1,
        damagePart: '支承块',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.1',
        level2: '0.2',
        level3: '0.3',
        mark: '掉块、缺损应适时修补',
    },
    {
        key: 2,
        damagePart: '道床板',
        damageKine: '裂缝',
        JudgmentPoint: '宽度（mm）',
        level1: '0.2',
        level2: '0.3',
        level3: '0.5',
        mark: '',
    },
]);

// 分页配置
const pagination = {
    pageSize: 10,
}

// 搜索表单数据
const searchForm = ref({
    mileage: '',
    gaugeMeasured: '',
    gaugeWarning: '',
    gaugeChangeRateMeasured: '',
    gaugeChangeRateWarning: '',
    levelMeasured: '',
    levelWarning: '',
    twistMeasured: '',
    twistWarning: '',
    alignmentLeftMeasured: '',
    alignmentLeftWarning: '',
    alignmentRightMeasured: '',
    alignmentRightWarning: '',
    directionLeftMeasured: '',
    directionLeftWarning: '',
    directionRightMeasured: '',
    directionRightWarning: '',
    versineLeftMeasured: '',
    versineLeftWarning: '',
    versineRightMeasured: '',
    versineRightWarning: '',
    operators: '',
    inspectionTime: '',
    responsiblePerson: '',
});

// 过滤后的数据
const filteredData = computed(() => {
    return tableData.filter((item) => {
        return Object.keys(searchForm.value).every((key) => {
            const filterValue = searchForm.value[key];
            if (!filterValue) return true; // 空过滤条件通过

            const itemValue = item[key];
            if (!itemValue) return false; // 数据无值则不通过

            // 数值字段（如 mileage, gaugeMeasured 等）使用范围过滤
            if (['mileage', 'gaugeMeasured', 'gaugeChangeRateMeasured', 'levelMeasured', 'twistMeasured',
                'alignmentLeftMeasured', 'alignmentRightMeasured', 'directionLeftMeasured',
                'directionRightMeasured', 'versineLeftMeasured', 'versineRightMeasured'].includes(key)) {
                const numFilter = Number(filterValue);
                const numItem = Number(itemValue);
                return !isNaN(numFilter) && !isNaN(numItem) && numItem >= numFilter;
            }

            // 字符串字段（如 operators, inspectionTime, responsiblePerson）使用模糊匹配
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        });
    });
});


</script>

<style scoped>
/* 优化表单样式 */
.n-form-item {
    margin-bottom: 8px;
}

.n-input {
    width: 100%;
}

.table-wrapper {
    /* 为整个表格容器添加边框和圆角，使其看起来像一个整体 */
    border: 1px solid #efeff5;
    /* 匹配 Naive UI 默认的表格边框颜色 */
    border-bottom: none;
    /* 底部边框由 NDataTable 自身提供 */
    margin: 20px;
    border-radius: 3px;
    overflow: hidden;
    /* 确保圆角和内部元素裁剪正确 */
    width: fit-content;
    /* 根据内容调整宽度，或者设置为特定宽度 */
    min-width: 1000px;
    /* 确保表格不会过窄，根据实际内容调整 */
}

.table-title {
    text-align: center;
    font-weight: bold;
    padding: 10px 0;
    border-bottom: 1px solid #efeff5;
    /* 标题与表头之间的分割线 */
    background-color: #fafafa;
    /* 匹配 Naive UI 默认的表头背景色 */
    line-height: 1.5;
}

.n-table {
    margin: 20px auto;
}

/* 左侧标题单元格 */
.title-cell {
    width: 150px;
    padding: 12px;
    font-weight: bold;
    background-color: #f5f5f5;
    text-align: center;
    vertical-align: middle;
}

/* 右侧内容单元格 */
.content-cell {
    padding: 12px;
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
    vertical-align: middle;
}
</style>