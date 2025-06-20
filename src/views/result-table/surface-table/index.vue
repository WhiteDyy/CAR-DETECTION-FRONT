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
        <!-- <n-form v-if="showSearchForm" :model="basicInfoForm" label-placement="left" label-width="auto"
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
        </n-form> -->

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

        <n-data-table :columns="columns" :data="tableData" :pagination="pagination" :bordered="true"
            :single-line="false" :virtual-scroll="true" :scroll-x="3000" :max-height="600" :loading="loading" />
    </CommonPage>
</template>

<script setup>
import { h, ref, computed, onMounted, nextTick } from 'vue';
import { NButton, NTooltip, NForm, NFormItemGi, NInput, NGrid, NSpace, NDataTable, NTable, NCard } from 'naive-ui';
import api from './api.js';

// 上下行选项
const directionOptions = [
    { label: '上行', value: 'up' },
    { label: '下行', value: 'down' },
];

// Dropdown options for table selection
const dropdownOptions = [
    { label: '作业验收', key: '作业验收' },
    { label: '综合保养', key: '综合保养' },
    { label: '临时补修', key: '临时补修' },
    { label: '四级超限', key: '四级超限' },
];

// State for selected table type
const selectedType = ref('作业验收');

// Handle dropdown selection
const handleDropdownSelect = async (key) => {
    selectedType.value = key;
    searchForm.value.pageNo = 1;
    await fetchData();
};

// 控制搜索表单显示状态
const showSearchForm = ref(false);

// 切换搜索表单显示状态
function toggleSearchForm() {
    showSearchForm.value = !showSearchForm.value;
}

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

// 第二个表单：超限标准矩阵（占位符，保持不变）
const excessStandardsForm = ref({});

// 展平 columns 以获取所有筛选字段
const filterFields = computed(() => {
    const fields = [];
    columns.forEach((col) => {
        if (col.children) {
            col.children.forEach((child) => {
                if (child.key && child.key !== 'mileage') {
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
    fields.unshift({
        key: 'mileage',
        label: '标识位置（公里）',
    });
    return fields;
});

// 定义主表格列
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

// 表格数据和加载状态
const tableData = ref([]);
const loading = ref(false);

// 分页配置
const pagination = ref({
    pageNo: 1,
    pageSize: 10,
    total: 0,
    onChange: (pageNo) => {
        searchForm.value.pageNo = pageNo;
        fetchData();
    },
    onUpdatePageSize: (pageSize) => {
        searchForm.value.pageSize = pageSize;
        searchForm.value.pageNo = 1;
        fetchData();
    }
});

// 搜索表单数据
const searchForm = ref({
    mileage: '',
    railSpallingWidth: '',
    railSpallingDepth: '',
    railSpallingQuantity: '',
    railAbrasionWidth: '',
    railAbrasionDepth: '',
    railAbrasionQuantity: '',
    railCorrugationWidth: '',
    railCorrugationDepth: '',
    railCorrugationQuantity: '',
    railScalePatternWidth: '',
    railScalePatternQuantity: '',
    railCrackWidth: '',
    railCrackQuantity: '',
    fishplateCrackWidth: '',
    fishplateCrackQuantity: '',
    fishplateBoltDamageQuantity: '',
    fishplateWasherDamageWidth: '',
    fishplateWasherDamageDepth: '',
    fishplateWasherDamageQuantity: '',
    fastenerDamageQuantity: '',
    fastenerDisplacementQuantity: '',
    fastenerWasherDamageQuantity: '',
    fastenerScrewSpikeDamageQuantity: '',
    fastenerBaseplateDamageQuantity: '',
    sleeperCrackWidth: '',
    sleeperCrackQuantity: '',
    sleeperSpallingWidth: '',
    sleeperSpallingQuantity: '',
    ballastBedCrackWidth: '',
    ballastBedCrackQuantity: '',
    lineFeature: '',
    inspectionTime: '',
    responsiblePerson: '',
    operators: '',
    lineName: '',
    direction: '',
    inspector: '',
    excessHandling: '',
    pageNo: 1,
    pageSize: 10,
});

// 获取数据
async function fetchData() {
    loading.value = true;
    try {
        const params = {
            mileage: searchForm.value.mileage || null,
            railSpallingWidth: searchForm.value.railSpallingWidth || null,
            railSpallingDepth: searchForm.value.railSpallingDepth || null,
            railSpallingQuantity: searchForm.value.railSpallingQuantity || null,
            railAbrasionWidth: searchForm.value.railAbrasionWidth || null,
            railAbrasionDepth: searchForm.value.railAbrasionDepth || null,
            railAbrasionQuantity: searchForm.value.railAbrasionQuantity || null,
            railCorrugationWidth: searchForm.value.railCorrugationWidth || null,
            railCorrugationDepth: searchForm.value.railCorrugationDepth || null,
            railCorrugationQuantity: searchForm.value.railCorrugationQuantity || null,
            railScalePatternWidth: searchForm.value.railScalePatternWidth || null,
            railScalePatternQuantity: searchForm.value.railScalePatternQuantity || null,
            railCrackWidth: searchForm.value.railCrackWidth || null,
            railCrackQuantity: searchForm.value.railCrackQuantity || null,
            fishplateCrackWidth: searchForm.value.fishplateCrackWidth || null,
            fishplateCrackQuantity: searchForm.value.fishplateCrackQuantity || null,
            fishplateBoltDamageQuantity: searchForm.value.fishplateBoltDamageQuantity || null,
            fishplateWasherDamageWidth: searchForm.value.fishplateWasherDamageWidth || null,
            fishplateWasherDamageDepth: searchForm.value.fishplateWasherDamageDepth || null,
            fishplateWasherDamageQuantity: searchForm.value.fishplateWasherDamageQuantity || null,
            fastenerDamageQuantity: searchForm.value.fastenerDamageQuantity || null,
            fastenerDisplacementQuantity: searchForm.value.fastenerDisplacementQuantity || null,
            fastenerWasherDamageQuantity: searchForm.value.fastenerWasherDamageQuantity || null,
            fastenerScrewSpikeDamageQuantity: searchForm.value.fastenerScrewSpikeDamageQuantity || null,
            fastenerBaseplateDamageQuantity: searchForm.value.fastenerBaseplateDamageQuantity || null,
            sleeperCrackWidth: searchForm.value.sleeperCrackWidth || null,
            sleeperCrackQuantity: searchForm.value.sleeperCrackQuantity || null,
            sleeperSpallingWidth: searchForm.value.sleeperSpallingWidth || null,
            sleeperSpallingQuantity: searchForm.value.sleeperSpallingQuantity || null,
            ballastBedCrackWidth: searchForm.value.ballastBedCrackWidth || null,
            ballastBedCrackQuantity: searchForm.value.ballastBedCrackQuantity || null,
            lineFeature: searchForm.value.lineFeature || null,
            inspectionTime: searchForm.value.inspectionTime || null,
            responsiblePerson: searchForm.value.responsiblePerson || null,
            operators: searchForm.value.operators || null,
            lineName: searchForm.value.lineName || null,
            direction: searchForm.value.direction || null,
            inspector: searchForm.value.inspector || null,
            excessHandling: searchForm.value.excessHandling || null,
            dataType: selectedType.value, // Pass the selected table type
            pageNo: searchForm.value.pageNo,
            pageSize: searchForm.value.pageSize,
        };
        const response = await api.getSurface(params);
        tableData.value = (response.data.pageData || []).map(item => ({
            mileage: item.mileage,
            railSpallingWidth: item.railSpallingWidth,
            railSpallingDepth: item.railSpallingDepth,
            railSpallingQuantity: item.railSpallingQuantity,
            railAbrasionWidth: item.railAbrasionWidth,
            railAbrasionDepth: item.railAbrasionDepth,
            railAbrasionQuantity: item.railAbrasionQuantity,
            railCorrugationWidth: item.railCorrugationWidth,
            railCorrugationDepth: item.railCorrugationDepth,
            railCorrugationQuantity: item.railCorrugationQuantity,
            railScalePatternWidth: item.railScalePatternWidth,
            railScalePatternQuantity: item.railScalePatternQuantity,
            railCrackWidth: item.railCrackWidth,
            railCrackQuantity: item.railCrackQuantity,
            fishplateCrackWidth: item.fishplateCrackWidth,
            fishplateCrackQuantity: item.fishplateCrackQuantity,
            fishplateBoltDamageQuantity: item.fishplateBoltDamageQuantity,
            fishplateWasherDamageWidth: item.fishplateWasherDamageWidth,
            fishplateWasherDamageDepth: item.fishplateWasherDamageDepth,
            fishplateWasherDamageQuantity: item.fishplateWasherDamageQuantity,
            fastenerDamageQuantity: item.fastenerDamageQuantity,
            fastenerDisplacementQuantity: item.fastenerDisplacementQuantity,
            fastenerWasherDamageQuantity: item.fastenerWasherDamageQuantity,
            fastenerScrewSpikeDamageQuantity: item.fishplateScrewSpikeDamageQuantity,
            fastenerBaseplateDamageQuantity: item.fastenerBaseplateDamageQuantity,
            sleeperCrackWidth: item.sleeperCrackWidth,
            sleeperCrackQuantity: item.sleeperCrackQuantity,
            sleeperSpallingWidth: item.sleeperSpallingWidth,
            sleeperSpallingQuantity: item.sleeperSpallingQuantity,
            ballastBedCrackWidth: item.ballastBedCrackWidth,
            ballastBedCrackQuantity: item.ballastBedCrackQuantity,
            lineFeature: item.lineFeature,
            inspectionTime: item.inspectionTime,
            responsiblePerson: item.responsiblePerson,
            operators: item.operators,
            lineName: item.lineName,
            direction: item.direction,
            inspector: item.inspector,
            excessHandling: item.excessHandling,
        }));
        pagination.value.total = response.data.total || 0;
        await nextTick(); // 确保 DOM 更新
        pagination.value = { ...pagination.value }; // 强制触发响应式更新
    } catch (error) {
        console.error('获取数据失败:', error);
        tableData.value = [];
        pagination.value.total = 0;
    } finally {
        loading.value = false;
    }
}

// 搜索和重置
async function handleSearch() {
    searchForm.value.pageNo = 1;
    await fetchData();
}

function resetBasicInfoForm() {
    basicInfoForm.value = {
        startMileage: '',
        endMileage: '',
        lineName: '',
        direction: null,
        inspector: '',
        inspectionTimeRange: null,
        excessHandling: '',
    };
}

async function resetSearch() {
    searchForm.value = {
        mileage: '',
        railSpallingWidth: '',
        railSpallingDepth: '',
        railSpallingQuantity: '',
        railAbrasionWidth: '',
        railAbrasionDepth: '',
        railAbrasionQuantity: '',
        railCorrugationWidth: '',
        railCorrugationDepth: '',
        railCorrugationQuantity: '',
        railScalePatternWidth: '',
        railScalePatternQuantity: '',
        railCrackWidth: '',
        railCrackQuantity: '',
        fishplateCrackWidth: '',
        fishplateCrackQuantity: '',
        fishplateBoltDamageQuantity: '',
        fishplateWasherDamageWidth: '',
        fishplateWasherDamageDepth: '',
        fishplateWasherDamageQuantity: '',
        fastenerDamageQuantity: '',
        fastenerDisplacementQuantity: '',
        fastenerWasherDamageQuantity: '',
        fastenerScrewSpikeDamageQuantity: '',
        fastenerBaseplateDamageQuantity: '',
        sleeperCrackWidth: '',
        sleeperCrackQuantity: '',
        sleeperSpallingWidth: '',
        sleeperSpallingQuantity: '',
        ballastBedCrackWidth: '',
        ballastBedCrackQuantity: '',
        lineFeature: '',
        inspectionTime: '',
        responsiblePerson: '',
        operators: '',
        lineName: '',
        direction: '',
        inspector: '',
        excessHandling: '',
        pageNo: 1,
        pageSize: 10,
    };
    await fetchData();
}

// 页面加载时获取数据
onMounted(() => {
    fetchData();
});

// 以下部分保持不变（超限标准相关表格和数据）
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
            const types = ['作业验收', '综合保养', '临时补修', '四级超限'];
            return types[i];
        }
    },
    { title: '轨距', key: 'gauge' },
    { title: '轨距变化率', key: 'gaugeChangeRate' },
    { title: '水平', key: 'level' },
    { title: '三角坑', key: 'triangularPit' },
    { title: '高低', key: 'height' },
    { title: '轨向', key: 'trackDirection' },
    { title: '正矢', key: 'arrow' },
];

const standTabledata = [
    { key: 0, type: '作业验收', gauge: '-2~+2', gaugeChangeRate: '±2', level: '±2', triangularPit: '±2', height: '±1', trackDirection: '±1', arrow: '±1' },
    { key: 1, type: '综合保养', gauge: '-4~+4', gaugeChangeRate: '±4', level: '±4', triangularPit: '±4', height: '±2', trackDirection: '±2', arrow: '±2' },
    { key: 2, type: '临时补修', gauge: '-6.5~+7.5', gaugeChangeRate: '±6', level: '±7', triangularPit: '±7', height: '±4', trackDirection: '±4', arrow: '±4' },
    { key: 3, type: '四级超限', gauge: '-6~+8', gaugeChangeRate: '±6', level: '±6', triangularPit: '±6', height: '±8', trackDirection: '±8', arrow: '±8' },
];

const renderDiagonalCell = () => {
    return h('div', {
        style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '25px',
            position: 'relative',
        },
    }, [
        h('svg', {
            width: '100%',
            height: '100%',
            viewBox: '0 0 100 100',
            preserveAspectRatio: 'none',
            style: {
                position: 'absolute',
                top: 0,
                left: 0,
            },
        }, [
            h('line', {
                x1: '0',
                y1: '0',
                x2: '100',
                y2: '100',
                stroke: '#000',
                strokeWidth: '3',
                strokeLinecap: 'round',
            }),
        ]),
    ]);
};

const createt1Columns = () => {
    return [
        {
            title: '钢轨轻伤和重伤标准',
            key: 'item',
            align: 'center',
            children: [
                {
                    title: '伤损项目',
                    key: 'item',
                    width: 150,
                    fixed: 'center',
                    align: 'center',
                },
                {
                    title: '伤损程度',
                    key: 'degree',
                    align: 'center',
                    children: [
                        {
                            title: '轻伤',
                            key: 'minorInjuryGroup',
                            align: 'center',
                            children: [
                                {
                                    title: 'Vmax>160km/h',
                                    key: 'minor_vmax_gt_160',
                                    minWidth: 150,
                                    align: 'center',
                                    colSpan: (rowData, rowIndex) => {
                                        if (rowIndex === 0 || rowIndex === 4) {
                                            return 3;
                                        }
                                        return undefined;
                                    },
                                    render: (rowData, rowIndex) => {
                                        if (rowIndex === 4) {
                                            return renderDiagonalCell();
                                        }
                                        return h('div', { style: { padding: '8px' } }, rowData.minor_vmax_gt_160);
                                    }
                                },
                                {
                                    title: '160km/h≥Vmax>120km/h',
                                    key: 'minor_vmax_120_160',
                                    minWidth: 150,
                                    align: 'center',
                                    render: (rowData, rowIndex) => {
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
                            title: '重伤',
                            key: 'seriousInjuryGroup',
                            align: 'center',
                            children: [
                                {
                                    title: 'Vmax>160km/h',
                                    key: 'serious_vmax_gt_160',
                                    minWidth: 150,
                                    align: 'center',
                                    colSpan: (rowData, rowIndex) => {
                                        if (rowIndex === 0) {
                                            return 3;
                                        }
                                        return undefined;
                                    },
                                    render: (rowData, rowIndex) => {
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
                                            return { rowSpan: 0, colSpan: 0 };
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
                                            return { rowSpan: 0, colSpan: 0 };
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

const t1Columns = createt1Columns();

const t1Data = [
    {
        item: '钢轨头部磨耗',
        minor_vmax_gt_160: '磨耗量超过表3.6.3-2所列限度之一者',
        minor_vmax_120_160: '',
        minor_vmax_le_120: '',
        serious_vmax_gt_160: '磨耗量超过表3.6.3-3所列限度之一者',
        serious_vmax_120_160: '',
        serious_vmax_le_120: ''
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
        minor_vmax_gt_160: '谷深超过0.3mm',
        minor_vmax_120_160: '谷深超过0.3mm',
        minor_vmax_le_120: '谷深超过0.5mm',
        serious_vmax_gt_160: '',
        serious_vmax_120_160: '',
        serious_vmax_le_120: ''
    },
    {
        item: '钢轨表面裂纹',
        minor_vmax_gt_160: '',
        minor_vmax_120_160: '',
        minor_vmax_le_120: '',
        serious_vmax_gt_160: '有',
        serious_vmax_120_160: '有',
        serious_vmax_le_120: '有'
    }
];

const t2Standards = ref([
    '钢轨全截面断裂',
    '裂纹贯通整个轨头截面',
    '裂纹贯通整个轨底截面',
    '允许速度不大于160km/h区段钢轨顶面上有长度大于50mm且深度大于10mm的掉块，允许速度大于160km/h区段钢轨顶面上有长度大于30mm且深度大于5mm的掉块'
]);

const t3Headers = ref([
    '接头夹板伤损',
    '接头螺栓及垫圈伤损',
    '混凝土扣件伤损'
]);

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
]);

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
]);

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
];

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
    border: 1px solid #efeff5;
    margin: 20px;
    border-radius: 3px;
    overflow: hidden;
    width: fit-content;
    min-width: 1000px;
}

.table-title {
    text-align: center;
    font-weight: bold;
    padding: 10px 0;
    border-bottom: 1px solid #efeff5;
    background-color: #fafafa;
    line-height: 1.5;
}

.n-table {
    margin: 20px auto;
}

.title-cell {
    width: 150px;
    padding: 12px;
    font-weight: bold;
    background-color: #f5f5f5;
    text-align: center;
    vertical-align: middle;
}

.content-cell {
    padding: 12px;
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
    vertical-align: middle;
}
</style>