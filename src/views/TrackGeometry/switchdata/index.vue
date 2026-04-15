<template>
  <CommonPage>
    <div>
      <NCard class="image-card">
        <div class="header-content">
          <NButton class="switch-btn" @click="switchData('prev')">
            <template #icon>
              <n-icon>
                <ArrowBackIosRound />
              </n-icon>
            </template>
            上一组
          </NButton>

          <NTag size="large" type="info" class="switch-info">
            第1道岔 - 60kg/m 12号道岔
          </NTag>

          <NButton class="switch-btn" @click="switchData('next')">
            下一组
            <template #icon>
              <n-icon>
                <ArrowForwardIosRound />
              </n-icon>
            </template>
          </NButton>
        </div>

        <!-- Canvas绘图区域 -->
        <div class="canvas-container">
          <canvas ref="canvasRef" class="turnout-canvas" />
        </div>

        <div class="table-container">
          <NDataTable
            :columns="columns" :data="tableData" :row-key="(row) => row.ruler"
            :style="{ marginTop: '20px' }"
          />
        </div>
      </NCard>
    </div>
  </CommonPage>
</template>

<script setup>
import CommonPage from '@/components/common/CommonPage.vue'
import { NButton, NCard, NDataTable, NTag } from 'naive-ui'
import { nextTick, onMounted, ref } from 'vue'

const canvasRef = ref(null)
const imageSrc = new URL('@/assets/images/turnout.jpg', import.meta.url).href

// 定义背景图尺寸
const backgroundImage = {
  width: 1500,
  height: 730,
}

// 定义红色圆点位置（背景图上的固定位置）
const redDotPositions = ref({
  S1: { x: 185, y: 195 },
  S2: { x: 285, y: 350 },
  S3: { x: 360, y: 355 },
  S4: { x: 560, y: 195 },
  S5: { x: 440, y: 365 },
  S6: { x: 645, y: 195 },
  S7: { x: 525, y: 372 },
  S8: { x: 610, y: 390 },
  S9: { x: 703, y: 195 },
  S10: { x: 776, y: 195 },
  S11: { x: 770, y: 420 },
  S12: { x: 860, y: 445 },
  S13: { x: 1040, y: 515 },
  S14: { x: 1300, y: 645 },
  S15: { x: 1340, y: 195 },
  S16: { x: 1135, y: 195 },
  S17: { x: 945, y: 195 },
  S18: { x: 285, y: 195 },
  S19: { x: 995, y: 330 },
})

// 定义卡片位置（相对于背景图）
const cardPositions = ref({
  // 左侧竖直排列的卡片
  S18: { x: 80, y: 10 },
  S1: { x: 80, y: 100 },
  S2: { x: 80, y: 365 },
  S3: { x: 80, y: 455 },
  S5: { x: 80, y: 545 },
  S7: { x: 80, y: 635 },

  // S6、S4在S18和S1右侧水平排列
  S6: { x: 400, y: 10 },
  S4: { x: 400, y: 100 },

  // S9、S10在S6、S4右侧
  S9: { x: 720, y: 10 },
  S10: { x: 720, y: 100 },

  // S17在S10右侧
  S17: { x: 880, y: 10 },

  // S16、S15在S9、S10右侧
  S16: { x: 1170, y: 10 },
  S15: { x: 1170, y: 100 },

  // S19在S15下方
  S19: { x: 1250, y: 235 },

  // S8、S11在S5、S7右侧
  S8: { x: 550, y: 545 },
  S11: { x: 550, y: 635 },

  // S12、S13在S8、S11右侧
  S12: { x: 800, y: 545 },
  S13: { x: 800, y: 635 },

  // S14在S13右侧
  S14: { x: 1100, y: 635 },
})

// 定义测量点数据
const measurementPoints = ref([
  { id: 'S1', x: 185, y: 195, measurements: { 轨距: 1435, 水平: 2 } },
  { id: 'S2', x: 285, y: 350, measurements: { 轨距: 1437, 水平: 4 } },
  { id: 'S3', x: 360, y: 355, measurements: { 轨距: 1434, 水平: 2 } },
  { id: 'S4', x: 560, y: 195, measurements: { 轨距: 1435 } },
  { id: 'S5', x: 440, y: 365, measurements: { 轨距: 1435, 水平: 1 } },
  { id: 'S6', x: 645, y: 195, measurements: { 轨距: 1436, 水平: 2 } },
  { id: 'S7', x: 525, y: 372, measurements: { 轨距: 1436, 水平: 2 } },
  { id: 'S8', x: 610, y: 390, measurements: { 轨距: 1434, 水平: 4 } },
  { id: 'S9', x: 703, y: 195, measurements: { 轨距: 1434, 水平: 5 } },
  { id: 'S10', x: 780, y: 195, measurements: { 轨距: 1434, 水平: 5 } },
  { id: 'S11', x: 770, y: 420, measurements: { 轨距: 1435, 水平: 2 } },
  { id: 'S12', x: 860, y: 445, measurements: { 轨距: 1436, 水平: 1 } },
  { id: 'S13', x: 1040, y: 515, measurements: { 轨距: 1436, 水平: 4 } },
  { id: 'S14', x: 1300, y: 645, measurements: { 轨距: 1436, 水平: 1 } },
  { id: 'S15', x: 1340, y: 195, measurements: { 轨距: 1434 } },
  { id: 'S16', x: 1135, y: 195, measurements: { 轨距: 1435, 水平: 2 } },
  { id: 'S17', x: 945, y: 195, measurements: { 轨距: 1435, 水平: 2 } },
  { id: 'S18', x: 285, y: 195, measurements: { 轨距: 1435, 水平: 2 } },
  { id: 'S19', x: 995, y: 330, measurements: { 轨距: 1436, 水平: 0 } },
])

// 表格数据
const tableData = ref([
  { ruler: 'S1', name: '尖轨前顺坡终点', direction: 'A股', sleeperNumber: '第1号枕', mileage: 300, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S2', name: '尖轨尖端', direction: '', sleeperNumber: '第6号枕', mileage: 3300, measurement: '轨距、水平', standardGauge: 1437 },
  { ruler: 'S3', name: '尖轨中前', direction: 'B股', sleeperNumber: '第11-12号枕', mileage: 6808, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S4', name: '尖轨中', direction: 'B股', sleeperNumber: '第15号枕', mileage: 8941, measurement: '轨距', standardGauge: 1435 },
  { ruler: 'S5', name: '尖轨中后', direction: '', sleeperNumber: '第21号枕', mileage: 12407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S6', name: '尖轨跟端直股', direction: 'A股', sleeperNumber: '第26号枕', mileage: 15407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S7', name: '尖轨跟端曲股', direction: 'B股', sleeperNumber: '第26号枕', mileage: 15407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S8', name: '导曲部分直股前部', direction: 'A股', sleeperNumber: '第32号枕', mileage: 19007, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S9', name: '导曲部分曲股前部', direction: 'B股', sleeperNumber: '第32号枕', mileage: 19007, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S10', name: '内配轨接头直股', direction: 'A股', sleeperNumber: '第38号枕', mileage: 22607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S11', name: '内配轨接头曲股', direction: 'B股', sleeperNumber: '第38号枕', mileage: 22607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S12', name: '导曲部分直股后部', direction: 'A股', sleeperNumber: '第46号枕', mileage: 27407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S13', name: '导曲部分曲股后部', direction: 'B股', sleeperNumber: '第46号枕', mileage: 27407, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S14', name: '直股辙叉前', direction: 'A股', sleeperNumber: '第54号枕', mileage: 32207, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S15', name: '直股辙叉中', direction: 'A股', sleeperNumber: '第57-58号枕', mileage: 34607, measurement: '轨距、查照距离、护背间隔', standardGauge: 1435 },
  { ruler: 'S16', name: '直股辙叉后', direction: 'A股', sleeperNumber: '第63号枕', mileage: 37607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S17', name: '曲股辙叉前', direction: 'B股', sleeperNumber: '第63号枕', mileage: 37607, measurement: '轨距、水平', standardGauge: 1435 },
  { ruler: 'S18', name: '曲股辙叉中', direction: 'B股', sleeperNumber: '第57-58号枕', mileage: 34607, measurement: '轨距、查照距离、护背间隔', standardGauge: 1435 },
  { ruler: 'S19', name: '曲股辙叉后', direction: 'B股', sleeperNumber: '第54号枕', mileage: 32207, measurement: '轨距、水平', standardGauge: 1435 },
])

// 定义卡片数据，与测量点对应
const cardData = ref(measurementPoints.value.map((point) => {
  // 从原始表格数据中找到对应的测量值
  const tableItem = tableData.value.find(item => item.ruler === point.id)
  const measurementValues = {}

  if (tableItem) {
    const params = tableItem.measurement.split('、')
    params.forEach((param) => {
      if (param === '轨距') {
        measurementValues[param] = Math.floor(Math.random() * 5) + 1434 // 1434-1438之间的随机值
      }
      else if (param === '水平') {
        measurementValues[param] = Math.floor(Math.random() * 6) // 0-5之间的随机值
      }
      else {
        measurementValues[param] = Math.floor(Math.random() * 10) + 1430 // 其他参数的默认随机值
      }
    })
  }

  return {
    ...point,
    ...tableItem,
    measurementValues,
  }
}))

const columns = [
  { title: '道尺', key: 'ruler', width: 120, align: 'center' },
  { title: '名称', key: 'name', width: 150 },
  { title: '轨向', key: 'direction', width: 120 },
  { title: '轨枕序号', key: 'sleeperNumber', width: 120, align: 'center' },
  {
    title: '里程(m)',
    key: 'mileage',
    width: 120,
    render: row => row.mileage.toFixed(2),
  },
  {
    title: '测量参数(mm)',
    key: 'measurement',
    width: 150,
    render: (row) => {
      const params = row.measurement.split('、')
      return h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
        },
      }, params.map(param => h('span', {}, param)))
    },
  },
  {
    title: '测量值(mm)',
    key: 'measurementValues',
    width: 120,
    render: (row) => {
      const params = row.measurement.split('、')
      return h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
        },
      }, params.map((param) => {
        const value = row.measurementValues ? row.measurementValues[param] : '-'
        // 为轨距值添加颜色标识
        const color = param === '轨距' && value !== row.standardGauge ? 'red' : 'inherit'
        return h('span', { style: { color } }, value)
      }))
    },
  },
  {
    title: '标准轨距(mm)',
    key: 'standardGauge',
    width: 150,
    render: row => h('span', {
      style: {
        color: row.standardGauge === 1435 ? 'green' : 'red',
      },
    }, row.standardGauge),
  },
]

// 绘制Canvas
function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制背景图
  const img = new Image()
  img.src = imageSrc
  img.onload = () => {
    // 绘制背景图（覆盖整个Canvas区域）
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // 设置虚线样式
    ctx.setLineDash([5, 3])
    ctx.strokeStyle = 'rgba(218, 227, 243, 0.8)' // 灰色线条
    ctx.fillStyle = 'rgba(218, 227, 243, 0.8)' // 灰色背景

    // 绘制所有卡片
    drawCards(ctx)

    // 绘制所有箭头
    drawArrows(ctx)
  }
}

// 绘制卡片
function drawCards(ctx) {
  const cardWidth = 140
  const cardHeight = 70
  const cardRadius = 8

  cardData.value.forEach((item) => {
    const pos = cardPositions.value[item.id]
    if (!pos)
      return

    const cardX = pos.x
    const cardY = pos.y

    // 判断卡片背景色 - 统一为灰色
    const bgColor = 'rgba(218, 227, 243, 0.8)'

    // 绘制卡片背景
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, cardRadius)
    ctx.fillStyle = bgColor
    ctx.fill()

    // // 卡片边框 - 灰色
    // ctx.strokeStyle = '#aaaaaa';
    // ctx.lineWidth = 1;
    // roundRect(ctx, cardX, cardY, cardWidth, cardHeight, cardRadius);
    // ctx.stroke();

    // 卡片标题
    ctx.fillStyle = '#333'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(item.ruler, cardX + cardWidth / 2, cardY + 20)

    // 测量值 - 黑色字体
    ctx.fillStyle = '#000000' // 黑色字体
    ctx.font = '14px Arial'

    // 轨距值
    const gaugeValue = item.measurementValues['轨距']
    // const gaugeColor = gaugeValue === item.standardGauge ? '#52c41a' : '#ff4d4f';
    const gaugeColor = gaugeValue === item.standardGauge ? '#000000' : '#000000'

    ctx.fillStyle = gaugeColor
    ctx.fillText(`轨距:  ${gaugeValue} mm`, cardX + 60, cardY + 40)

    // 水平值
    if (item.measurementValues['水平'] != undefined) {
      const levelValue = item.measurementValues['水平']
      ctx.fillStyle = '#000000' // 黑色字体
      ctx.fillText(`水平:  ${levelValue} mm`, cardX + 65, cardY + 60)
    }
  })
}

// 绘制箭头
function drawArrows(ctx) {
  cardData.value.forEach((item) => {
    const startPos = redDotPositions.value[item.id]
    if (!startPos)
      return

    const endPos = cardPositions.value[item.id]
    if (!endPos)
      return

    // 计算从圆点到卡片的路径
    const pathPoints = calculatePath(startPos, endPos, item.id, ctx)

    // 绘制路径
    ctx.beginPath()
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y)

    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y)
    }

    ctx.stroke()

    // 绘制箭头头部 - 根据最后一段线段的方向
    if (pathPoints.length > 1) {
      // 获取最后一段线段的起点和终点
      const lastSegmentStart = pathPoints[pathPoints.length - 2]
      const lastSegmentEnd = pathPoints[pathPoints.length - 1]

      // 计算最后一段线段的角度
      const angle = Math.atan2(lastSegmentEnd.y - lastSegmentStart.y, lastSegmentEnd.x - lastSegmentStart.x)

      // 箭头位置 - 放在最后一段线段的末端
      const arrowX = lastSegmentEnd.x
      const arrowY = lastSegmentEnd.y

      // 绘制箭头
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle - Math.PI / 6),
        arrowY - 10 * Math.sin(angle - Math.PI / 6),
      )
      ctx.lineTo(
        arrowX - 10 * Math.cos(angle + Math.PI / 6),
        arrowY - 10 * Math.sin(angle + Math.PI / 6),
      )
      ctx.closePath()

      // 设置箭头颜色
      const isStandard = item.measurementValues['轨距'] === item.standardGauge
      ctx.fillStyle = isStandard ? 'rgba(218, 227, 243, 0.8)' : 'rgba(218, 227, 243, 0.8)'
      ctx.fill()
    }
  })
}

// 计算从圆点到卡片的路径
function calculatePath(startPos, endPos, id, ctx) {
  // 虚线样式
  ctx.setLineDash([5, 2])

  const pathPoints = []
  pathPoints.push({ x: startPos.x, y: startPos.y })

  // 根据ID确定连接方式
  switch (id) {
    case 'S1':
      // S1直接垂直连接到卡片的下沿
      pathPoints.push({ x: endPos.x + 105, y: endPos.y + 70 }) // 卡片右下角
      break

    case 'S18':
      // S18用直角折线连接卡片的居中右沿
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 }) // 水平到卡片右边缘
      break

    case 'S2':
    case 'S3':
    case 'S5':
    case 'S7':
      // 这些点用直角折线连接卡片的居中右侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 }) // 水平到卡片右边缘
      break

    case 'S4':
    case 'S6':
      // S4和S6用直角折线连接卡片的居中右侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 }) // 水平到卡片右边缘
      break

    case 'S10':
      // S10直接垂直连接到卡片的下沿
      pathPoints.push({ x: endPos.x + 56, y: endPos.y + 70 }) // 卡片右下角
      break

    case 'S9':
      // S9用直角折线连接卡片的居中左侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x, y: endPos.y + 35 }) // 水平到卡片左边缘
      break

    case 'S17':
      // S17直接垂直连接到卡片的下沿
      pathPoints.push({ x: endPos.x + 65, y: endPos.y + 70 }) // 卡片右下角
      break

    case 'S16':
      // S16用直角折线连接卡片的居中左侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x, y: endPos.y + 35 }) // 水平到卡片左边缘
      break

    case 'S15':
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 })
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 })
      break

    case 'S19':
      // S19用直角折线连接卡片的居中下侧
      pathPoints.push({ x: endPos.x + 70, y: startPos.y }) // 水平到卡片中心点
      pathPoints.push({ x: endPos.x + 70, y: endPos.y + 70 }) // 垂直到卡片下边缘
      break

    case 'S8':
      // S8用垂直线连接卡片的居中上侧
      // pathPoints.push({ x: endPos.x, y: endPos.y - 35 }); // 水平到卡片中心点
      pathPoints.push({ x: endPos.x + 60, y: endPos.y }) // 垂直到卡片上边缘
      break

    case 'S11':
      // S11用直角折线连接卡片的居中右侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 }) // 水平到卡片右边缘
      break

    case 'S12':
      // S12用垂直线连接卡片的居中上侧
      // pathPoints.push({ x: endPos.x, y: endPos.y - 35 }); // 水平到卡片中心点
      pathPoints.push({ x: endPos.x + 60, y: endPos.y }) // 垂直到卡片上边缘
      break

    case 'S13':
      // S13用直角折线连接卡片的居中右侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 }) // 水平到卡片右边缘
      break

    case 'S14':
      // S14用直角折线连接卡片的居中右侧
      pathPoints.push({ x: startPos.x, y: endPos.y + 35 }) // 垂直到卡片中心点
      pathPoints.push({ x: endPos.x + 140, y: endPos.y + 35 }) // 水平到卡片右边缘
      break

    default:
      // 默认直线连接
      pathPoints.push({ x: endPos.x, y: endPos.y })
      break
  }

  return pathPoints
}

// 辅助函数：绘制圆角矩形
function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius)
    radius = width / 2
  if (height < 2 * radius)
    radius = height / 2
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

// 监听窗口大小变化，重新绘制Canvas
function handleResize() {
  const canvas = canvasRef.value
  if (!canvas)
    return

  // 设置Canvas尺寸与背景图一致
  canvas.width = backgroundImage.width
  canvas.height = backgroundImage.height

  // 居中显示Canvas
  const container = canvas.parentElement
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  canvas.style.marginLeft = `${(containerWidth - canvas.width) / 2}px`
  canvas.style.marginTop = `${(containerHeight - canvas.height) / 2}px`

  // 重新绘制
  nextTick(() => {
    drawCanvas()
  })
}

onMounted(() => {
  // 初始化Canvas尺寸
  nextTick(() => {
    const canvas = canvasRef.value
    if (!canvas)
      return

    // 设置Canvas尺寸与背景图一致
    canvas.width = backgroundImage.width
    canvas.height = backgroundImage.height

    // 居中显示Canvas
    const container = canvas.parentElement
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    canvas.style.marginLeft = `${(containerWidth - canvas.width) / 2}px`
    canvas.style.marginTop = `${(containerHeight - canvas.height) / 2}px`

    // 绘制Canvas
    drawCanvas()
  })

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 你原有的switchData函数
function switchData(direction) {
  // 你的切换数据逻辑
  console.log('切换数据:', direction)

  // 模拟切换数据后更新测量值
  if (direction === 'next') {
    // 模拟下一组数据变化
    cardData.value.forEach((item) => {
      const params = ['轨距', '水平']
      params.forEach((param) => {
        if (param === '轨距') {
          item.measurementValues[param] = Math.floor(Math.random() * 5) + 1434
        }
        else if (param === '水平') {
          item.measurementValues[param] = Math.floor(Math.random() * 6)
        }
      })
    })
  }
  else {
    // 模拟上一组数据变化
    cardData.value.forEach((item) => {
      const params = ['轨距', '水平']
      params.forEach((param) => {
        if (param === '轨距') {
          item.measurementValues[param] = Math.floor(Math.random() * 5) + 1434
        }
        else if (param === '水平') {
          item.measurementValues[param] = Math.floor(Math.random() * 6)
        }
      })
    })
  }

  // 重新绘制Canvas
  nextTick(() => {
    drawCanvas()
  })
}

const highlightRow = ref(null)
const highlightCol = ref(null)

// 表格初始化完成后添加事件监听
onMounted(() => {
  const tableBody = document.querySelector('.n-data-table tbody')
  if (!tableBody)
    return
})
</script>

<style scoped>
.image-card {
  margin-bottom: 10px;
  padding: 10px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  margin-bottom: 5px;
}

.switch-info {
  font-size: 20px;
  font-weight: bold;
  margin-top: -18px;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 730px;
  margin-top: 10px;
  overflow: hidden;
}

.turnout-canvas {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  /* 允许点击穿透 */
}

.table-container {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.switch-btn {
  min-width: 120px;
  min-height: 40px;
  margin-top: -20px;
  background-color: rgba(0, 255, 255, 0.7);
  border-radius: 12px;
  font-size: larger;
  font-weight: bolder;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-container ::v-deep .n-data-table {
  font-size: 16px;
  border: 3px solid #666;
  border-collapse: collapse;
}

/* 表头样式 */
.table-container ::v-deep .n-data-table thead th {
  background-color: #f0f0f0;
  font-weight: bold;
  border: 2px solid #666;
  padding: 8px;
  position: sticky;
  /* 关键属性 */
  top: 0;
  /* 固定在顶部 */
  z-index: 1;
  /* 确保表头在内容上方 */
}

/* 数据行样式 */
.table-container ::v-deep .n-data-table tbody td {
  border: 2px solid #666;
  padding: 8px;
  transition: background-color 0.3s;
  /* 平滑过渡 */
}

/* 第一列和第二列特殊背景 */
.table-container ::v-deep .n-data-table tbody td:nth-child(1),
.table-container ::v-deep .n-data-table tbody td:nth-child(2) {
  background-color: rgba(64, 66, 71, 0.6);
}

/* 表头行特殊背景 */
.table-container ::v-deep .n-data-table thead tr:first-child th {
  background-color: rgba(64, 66, 71, 0.8);
}

/* 表格容器样式 */
.table-container {
  overflow: auto;
  max-height: 400px;
}
</style>
