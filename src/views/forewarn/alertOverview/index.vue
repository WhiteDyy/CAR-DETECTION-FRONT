<template>
  <div class="page-container">
    <NCard class="main-card">
      <NGrid x-gap="12" y-gap="12" cols="1 s:1 m:2 l:3 xl:3 2xl:3" responsive="screen">
        <NGi>
          <NCard class="chart-card">
            <b style="font-size: 1rem">总预警消息次数</b>
            <NNumberAnimation
              :from="0"
              :to="totalWarnings"
              :duration="1000"
              style="font-size: 16px; color: red; margin-left: 5px"
            />
            <span>次</span>
            <div class="chart-wrapper">
              <PieChart :chart-data="pieData" />
            </div>
          </NCard>
        </NGi>

        <NGi>
          <NCard class="chart-card">
            <b style="font-size: 1rem">预警类型分布</b>
            <NNumberAnimation
              :from="0"
              :to="barData.cate.length"
              :duration="1000"
              style="font-size: 16px; color: red; margin-left: 5px"
            />
            <div class="chart-wrapper">
              <BarChart :chart-data="barData" />
            </div>
          </NCard>
        </NGi>

        <NGi>
          <NCard class="chart-card">
            <b style="font-size: 1rem">预警时间趋势</b>
            <NNumberAnimation
              :from="0"
              :to="lineData.categoryData.length"
              :duration="1000"
              style="font-size: 16px; color: red; margin-left: 5px"
            />
            <div class="chart-wrapper">
              <LineChart :chart-data="lineData" />
            </div>
          </NCard>
        </NGi>
      </NGrid>

      <div class="table-section">
        <NCard class="table-card">
          <DataTable
            :table-data="tableData"
            :total="totalWarnings"
            :page="queryParams.pageNum"
            :limit="queryParams.pageSize"
            @update-data="updateTableData"
            @pagination="handlePagination"
          />
        </NCard>
      </div>
    </NCard>
  </div>
</template>

<script>
import DataTable from '@/views/forewarn/alertOverview/dataTable.vue'
import {
  NCard,
  NGi,
  NGrid,
  NNumberAnimation,
} from 'naive-ui'
import { defineComponent, onMounted, ref } from 'vue'
import BarChart from '../../../components/Echarts/forewarn/overview/ForewarnBarChart.vue'
import LineChart from '../../../components/Echarts/forewarn/overview/ForewarnlineChart.vue'
import PieChart from '../../../components/Echarts/forewarn/overview/PieChart.vue'

export default defineComponent({
  name: 'ForewarnOverview',
  components: {
    NCard,
    NGrid,
    NGi,
    NNumberAnimation,
    PieChart,
    BarChart,
    LineChart,
    DataTable,
  },
  setup() {
    // 你的setup代码保持不变
    const pieData = ref([])
    const barData = ref({ cate: [], barData: [] })
    const lineData = ref({ categoryData: [], data: [] })
    const totalWarnings = ref(0)
    const tableData = ref([])

    const queryParams = ref({
      pageNum: 1,
      pageSize: 20,
    })

    // 生成模拟数据
    const generateMockData = () => {
      const mockData = []
      const warningTypes = ['重', '轻', '已处理']
      const dangerousSources = ['2', '1', '']
      const targets = ['钢轨', '扣件', '道床', '轨枕']
      const rules = ['波磨预警', '裂纹预警', '翻浆冒泥预警', '锈蚀预警']

      for (let i = 0; i < 50; i++) {
        const randomDate = new Date(2024, 5, 1)
        randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 120))

        mockData.push({
          dangerousId: `WARN${String(i + 1).padStart(4, '0')}`,
          diseaseLevel: warningTypes[Math.floor(Math.random() * warningTypes.length)],
          uploadDate: randomDate.toLocaleString(),
          detectDate: randomDate.toISOString().split('T')[0],
          target: targets[Math.floor(Math.random() * targets.length)],
          dangerousSource: dangerousSources[Math.floor(Math.random() * dangerousSources.length)],
          rules: rules[Math.floor(Math.random() * rules.length)],
          diseaseDescript: `发现${targets[Math.floor(Math.random() * targets.length)]}存在${rules[Math.floor(Math.random() * rules.length)]}问题`,
          advice: `建议进行${rules[Math.floor(Math.random() * rules.length)].includes('波磨') ? '打磨' : '更换'}处理`,
        })
      }
      return mockData
    }

    const formatDateOnly = (date) => {
      const year = date.getFullYear()
      const month = (`0${date.getMonth() + 1}`).slice(-2)
      const day = (`0${date.getDate()}`).slice(-2)
      return `${year}-${month}-${day}`
    }

    const getList = () => {
      tableData.value = generateMockData()
      totalWarnings.value = tableData.value.length

      // Pie chart data
      pieData.value = [
        {
          value: tableData.value.filter(item => item.diseaseLevel === '重').length,
          name: '急需处理消息',
        },
        {
          value: tableData.value.filter(item => item.diseaseLevel === '轻').length,
          name: '待观察消息',
        },
        {
          value: tableData.value.filter(item => item.diseaseLevel === '已处理').length,
          name: '已处理消息',
        },
      ]

      // Bar chart data
      const types = ['病害预警', '设备预警', '系统异常']
      const types1 = ['2', '1', '']
      barData.value = {
        cate: types,
        barData: types1.map(
          type =>
            tableData.value.filter(item => item.dangerousSource === type).length,
        ),
      }

      // Line chart data
      let startDate, endDate
      if (tableData.value && tableData.value.length > 0) {
        const dates = tableData.value
          .map(item => new Date(item.detectDate))
          .filter(date => !isNaN(date.getTime()))

        if (dates.length > 0) {
          startDate = new Date(Math.min(...dates))
          endDate = new Date(Math.max(...dates))
        }
        else {
          startDate = new Date('2024-06-01')
          endDate = new Date('2024-09-15')
        }
      }
      else {
        startDate = new Date('2024-06-01')
        endDate = new Date('2024-09-15')
      }

      const weekPoints = []
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
        weekPoints.push(formatDateOnly(d))
      }

      const lineSeries = types.map((type, index) => ({
        name: type,
        type: 'line',
        stack: 'Total',
        data: weekPoints.map((weekStart) => {
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 7)
          return tableData.value.filter((item) => {
            const itemDate = new Date(item.detectDate)
            return (
              itemDate >= new Date(weekStart)
              && itemDate < weekEnd
              && item.dangerousSource === types1[index]
            )
          }).length
        }),
      }))

      lineData.value = {
        categoryData: weekPoints,
        data: lineSeries,
        options: {
          xAxis: {
            type: 'category',
            axisLabel: {
              rotate: 45,
              interval: 0,
              formatter: value => value.slice(5),
            },
            boundaryGap: false,
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
          },
          tooltip: {
            trigger: 'axis',
            formatter: (params) => {
              let result = `${params[0].name}<br/>`
              params.forEach((item) => {
                result += `${item.seriesName}: ${item.value}<br/>`
              })
              return result
            },
          },
          dataZoom: [
            {
              type: 'slider',
              start: 0,
              end: 100,
            },
          ],
        },
      }
    }

    const handlePagination = (query) => {
      queryParams.value.pageNum = query.page
      queryParams.value.pageSize = query.limit
      getList()
    }

    const updateTableData = (newData) => {
      tableData.value = newData
    }

    onMounted(() => {
      getList()
    })

    return {
      pieData,
      barData,
      lineData,
      totalWarnings,
      tableData,
      queryParams,
      handlePagination,
      updateTableData,
    }
  },
})
</script>

<style scoped>
.page-container {
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.main-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-card ::v-deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-card ::v-deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 8px;
}

.chart-wrapper {
  flex: 1;
  min-height: 200px;
  position: relative;
}

.table-section {
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.table-card ::v-deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

/* 确保图表容器有足够空间 */
:deep(.chart) {
  width: 100% !important;
  height: 100% !important;
  min-height: 200px;
}
</style>
