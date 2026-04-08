<template>
  <AppPage show-footer>
    <n-card>
      <div class="track-switch-container">
        <div class="track-switch-editor">
          <div v-if="backgroundImage" class="toolbar">
            <button @click="addArrow">
              添加箭头
            </button>
            <button @click="addLine">
              添加直线
            </button>
            <button @click="addMarker">
              添加标记
            </button>
            <div class="text-tools">
              <input v-model="textInput" placeholder="输入文字">
              <select v-model="textAlign">
                <option value="left">
                  左对齐
                </option>
                <option value="center">
                  居中
                </option>
                <option value="right">
                  右对齐
                </option>
              </select>
              <input v-model="textBackgroundColor" type="color" title="背景颜色">
              <button @click="addText">
                添加文字
              </button>
            </div>
            <button @click="startDrawingPolyline">
              添加折线
            </button>
            <button @click="groupSelected">
              组合选中元素
            </button>
            <button @click="deleteSelected">
              删除选中元素
            </button>
            <button @click="copySelected">
              复制
            </button>
            <button @click="pasteCopied">
              粘贴
            </button>
            <div class="id-tools">
              <input v-model="selectedElementId" placeholder="输入元素ID">
              <button @click="bindElementId">
                绑定元素ID
              </button>
            </div>
            <div class="save-tools">
              <input v-model="switchId" placeholder="输入道岔整体ID">
              <button @click="saveCanvas">
                保存画布
              </button>
            </div>
          </div>
          <!-- 图像上传 -->
          <input v-if="!backgroundImage" type="file" accept="image/*" @change="uploadImage">
          <!-- 画布 -->
          <canvas ref="canvas" />
          <!-- 工具栏 -->
        </div>
      </div>
    </n-card>
  </AppPage>
</template>

<script setup>
import { fabric } from 'fabric'
import { onMounted, ref, watch } from 'vue'

defineOptions({
  name: 'CreateSwitch',
})

const props = defineProps({
  realTimeData: Object, // 后端传入的实时数据，例如 { point1: '左转', point2: '右转' }
})

const emit = defineEmits(['update']) // 用于通知父组件数据更新

const canvas = ref(null)
let fabricCanvas = null
const backgroundImage = ref(null)
const elements = ref([]) // 存储画布上的元素（箭头、标记、文字）
const isDrawingPolyline = ref(false)
const polylinePoints = ref([]) // 存储折线绘制时的点
// 存储复制的对象
const copiedObjects = ref(null)

// 新增：用于绑定元素ID和整体ID
const selectedElementId = ref('') // 输入框中绑定的元素ID
const switchId = ref('') // 道岔整体ID

// 初始化画布
onMounted(async () => {
  await nextTick()

  fabricCanvas = new fabric.Canvas(canvas.value, {
    selection: true,
    interactive: true, // 确保画布支持交互
  })

  // 监听元素移动，更新位置
  fabricCanvas.on('object:moving', (e) => {
    const target = e.target
    elements.value.forEach((el) => {
      if (el.id === target.id) {
        el.left = target.left
        el.top = target.top
      }
    })
    emit('update', elements.value) // 通知父组件更新
  })

  // 监听鼠标点击以绘制折线
  fabricCanvas.on('mouse:down', (e) => {
    if (isDrawingPolyline.value && e.target === null) {
      const pointer = fabricCanvas.getPointer(e.e)
      polylinePoints.value.push({ x: pointer.x, y: pointer.y })
      drawTempPolyline()
    }
  })

  // 监听选中事件以显示当前元素的ID
  fabricCanvas.on('selection:created', (e) => {
    const activeObject = e.selected[0]
    if (activeObject) {
      selectedElementId.value = activeObject.id || ''
    }
  })
  fabricCanvas.on('selection:updated', (e) => {
    const activeObject = e.selected[0]
    if (activeObject) {
      selectedElementId.value = activeObject.id || ''
    }
  })
})

// 生成唯一 ID 的工具函数
const generateId = (prefix = 'element') => `${prefix}_${Date.now()}`

// 复制选中的对象
function copySelected() {
  const activeObjects = fabricCanvas.getActiveObjects()
  if (activeObjects.length === 0) {
    console.warn('请先选中要复制的元素')
    return
  }

  if (activeObjects.length === 1) {
    activeObjects[0].clone((cloned) => {
      copiedObjects.value = [cloned]
      console.warn('已复制单个对象:', cloned.id)
    })
  }
  else {
    const group = new fabric.Group(activeObjects)
    group.clone((cloned) => {
      copiedObjects.value = [cloned]
      console.warn('已复制多个对象为组:', cloned.id)
    })
  }
}

// 粘贴复制的对象
function pasteCopied() {
  if (!copiedObjects.value || copiedObjects.value.length === 0) {
    console.warn('没有可粘贴的对象')
    return
  }

  const clonedObjects = []
  copiedObjects.value.forEach((obj) => {
    obj.clone((cloned) => {
      // 默认粘贴到画布中心，偏移 20 像素
      cloned.set({
        left: (fabricCanvas.width / 2) + 20,
        top: (fabricCanvas.height / 2) + 20,
        id: `${obj.id}_${Date.now()}`,
        selectable: true,
        hasBorders: true,
        borderColor: obj.type === 'group' ? 'blue' : 'gray',
        borderDashArray: obj.type === 'group' ? [5, 5] : null,
      })

      if (cloned.type === 'group') {
        cloned.forEachObject((subObj) => {
          subObj.setCoords()
        })
      }
      cloned.setCoords()

      fabricCanvas.add(cloned)
      clonedObjects.push(cloned)

      elements.value.push({
        id: cloned.id,
        type: cloned.type,
        left: cloned.left,
        top: cloned.top,
      })
    })
  })

  setTimeout(() => {
    if (clonedObjects.length === 1) {
      fabricCanvas.setActiveObject(clonedObjects[0])
    }
    else if (clonedObjects.length > 1) {
      fabricCanvas.setActiveObjects(clonedObjects)
    }
    fabricCanvas.requestRenderAll()
    console.warn('已粘贴对象:', clonedObjects.map(obj => obj.id))
  }, 50)
}

function uploadImage(event) {
  const file = event.target.files[0]
  if (!file)
    return

  const reader = new FileReader()
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      // 获取图像的原始尺寸
      const imgWidth = img.width
      const imgHeight = img.height

      // 直接使用图像原始尺寸设置画布
      fabricCanvas.setWidth(imgWidth)
      fabricCanvas.setHeight(imgHeight)
      canvas.value.width = imgWidth
      canvas.value.height = imgHeight

      // 设置图像，无需缩放
      img.set({
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
      })

      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
      backgroundImage.value = true

      console.warn(`画布尺寸设置为图像原始尺寸: ${imgWidth}x${imgHeight}`)
    })
  }
  reader.readAsDataURL(file)
}

// 添加箭头
function addArrow() {
  // 双向平角箭头的路径：
  const arrow = new fabric.Path(
    'M 0 5 L 5 0 L 5 2.5 L 25 2.5 L 25 7.5 L 5 7.5 L 5 10 L 0 5 Z M 25 2.5 L 45 2.5 L 45 0 L 50 5 L 45 10 L 45 7.5 L 25 7.5 Z',
    {
      left: 100,
      top: 100,
      fill: 'red',
      scaleX: 2,
      scaleY: 2,
      selectable: true,
      id: generateId('arrow'),
    },
  )
  fabricCanvas.add(arrow)
  elements.value.push({ id: arrow.id, type: 'arrow', left: 100, top: 100 })
}

// 添加标记（圆点）
function addMarker() {
  const marker = new fabric.Circle({
    radius: 10,
    fill: 'red',
    left: 150,
    top: 150,
    selectable: true,
    id: generateId('marker'),
  })
  fabricCanvas.add(marker)
  elements.value.push({ id: marker.id, type: 'marker', left: 150, top: 150 })
}

// 文字相关配置
const textInput = ref('默认文字')
const textAlign = ref('center') // 默认左对齐
const textBackgroundColor = ref('#ffffff') // 默认白色背景

// 添加文字（模拟卡片效果，分为标题和数据区域）
function addText() {
  const dataContent = textInput.value.trim() || '默认文字' // 数据区域使用输入值

  // 创建数据文字
  const dataText = new fabric.Text(dataContent, {
    fontSize: 14,
    fill: 'black',
    textAlign: textAlign.value,
    fontWeight: 'bold', // 加粗（可选，根据需求保留或移除）
    originX: 'center',
    originY: 'center', // 改为 center，便于卡片垂直居中
  })

  // 计算卡片尺寸（基于数据文字的宽度和高度）
  const cardWidth = dataText.width + 10 // 加 20px 边距
  const cardHeight = dataText.height + 10 // 加 20px 边距

  // 创建卡片背景
  const cardRect = new fabric.Rect({
    width: cardWidth,
    height: cardHeight,
    fill: textBackgroundColor.value, // 使用输入的背景颜色
    rx: 3, // 圆角
    ry: 3,
    stroke: '#ccc', // 边框颜色
    strokeWidth: 1,
    shadow: 'rgba(0,0,0,0.2) 0 2px 4px', // 添加阴影
    originX: 'center',
    originY: 'center',
  })

  // 创建组（卡片效果）
  const cardGroup = new fabric.Group([cardRect, dataText], {
    left: 200,
    top: 200,
    selectable: true,
    id: generateId('card'),
  })

  // 调整子对象位置，使其在卡片内居中
  dataText.set({
    left: 0,
    top: 0, // 居中对齐
  })
  cardRect.set({
    left: 0,
    top: 0,
  })

  // 添加到画布
  fabricCanvas.add(cardGroup) // 假设 fabricCanvas 是 ref 定义的
  fabricCanvas.renderAll()

  // 更新 elements
  elements.value.push({
    id: cardGroup.id,
    type: 'group',
    left: cardGroup.left,
    top: cardGroup.top,
    data: dataContent, // 只保留数据字段
    align: textAlign.value,
    backgroundColor: textBackgroundColor.value,
  })

  // 重置输入框（可选）
  // textInput.value = '';
}
// 添加直线
function addLine() {
  const line = new fabric.Line([100, 150, 140, 150], {
    stroke: 'red',
    strokeWidth: 2,
    selectable: true,
    id: generateId('line'),
  })
  fabricCanvas.add(line)
  elements.value.push({ id: line.id, type: 'line', left: 100, top: 150 })
}

// 开始绘制折线
function startDrawingPolyline() {
  isDrawingPolyline.value = true
  polylinePoints.value = []
  fabricCanvas.selection = false // 禁用选择模式
  console.warn('开始绘制折线，请点击画布添加点，双击结束')

  // 监听鼠标点击添加点
  fabricCanvas.on('mouse:down', onMouseDown)
  // 监听鼠标移动实时更新临时折线
  fabricCanvas.on('mouse:move', onMouseMove)
  // 双击结束绘制
  fabricCanvas.once('mouse:dblclick', finishDrawingPolyline)
}

// 处理鼠标点击，添加点
function onMouseDown(event) {
  if (!isDrawingPolyline.value)
    return

  const pointer = fabricCanvas.getPointer(event.e)
  polylinePoints.value.push({ x: pointer.x, y: pointer.y })
  drawTempPolyline() // 每次点击后更新临时折线
}

// 处理鼠标移动，实时更新临时折线
function onMouseMove(event) {
  if (!isDrawingPolyline.value || polylinePoints.value.length === 0)
    return

  const pointer = fabricCanvas.getPointer(event.e)
  drawTempPolyline(pointer) // 传入鼠标当前位置
}

function drawTempPolyline(mousePoint = null) {
  const existingTemp = fabricCanvas.getObjects().find(obj => obj.temp)
  if (existingTemp)
    fabricCanvas.remove(existingTemp)

  const points = mousePoint
    ? [...polylinePoints.value, { x: mousePoint.x, y: mousePoint.y }]
    : [...polylinePoints.value]

  if (points.length === 1) {
    const marker = new fabric.Circle({
      left: points[0].x,
      top: points[0].y,
      radius: 3,
      fill: 'red',
      selectable: false,
      temp: true,
    })
    fabricCanvas.add(marker)
  }
  else if (points.length > 1) {
    const tempPolyline = new fabric.Polyline(points, {
      fill: '',
      stroke: 'red',
      strokeWidth: 2,
      strokeDashArray: [5, 5], // 设置最终折线为虚线
      selectable: false,
      temp: true,
    })
    fabricCanvas.add(tempPolyline)
  }
  fabricCanvas.renderAll()
}
// 完成折线绘制
function finishDrawingPolyline() {
  if (polylinePoints.value.length > 1) { // 至少两点才保存
    const polyline = new fabric.Polyline(polylinePoints.value, {
      fill: '',
      stroke: 'red',
      strokeWidth: 2,
      strokeDashArray: [5, 5], // 设置最终折线为虚线
      selectable: true,
      id: `polyline_${Date.now()}`,
    })
    fabricCanvas.add(polyline)
    elements.value.push({
      id: polyline.id,
      type: 'polyline',
      left: polyline.left,
      top: polyline.top,
      points: [...polylinePoints.value],
    })
  }

  // 清理临时折线和事件监听
  const temp = fabricCanvas.getObjects().find(obj => obj.temp)
  if (temp)
    fabricCanvas.remove(temp)
  fabricCanvas.off('mouse:down', onMouseDown)
  fabricCanvas.off('mouse:move', onMouseMove)
  fabricCanvas.off('mouse:dblclick', finishDrawingPolyline) // 新增清理
  isDrawingPolyline.value = false
  fabricCanvas.selection = true // 恢复选择模式
  polylinePoints.value = []
}

// 组合选中元素
function groupSelected() {
  const activeObjects = fabricCanvas.getActiveObjects()
  if (activeObjects.length < 2) {
    console.warn('请至少选中两个元素进行组合')
    return
  }

  // 获取当前选中区域的边界
  const selection = fabricCanvas.getActiveObject()
  if (!selection) {
    console.warn('未找到选中对象')
    return
  }

  // 计算组的中心点
  const groupWidth = selection.width * selection.scaleX
  const groupHeight = selection.height * selection.scaleY
  const centerX = selection.left + groupWidth / 2
  const centerY = selection.top + groupHeight / 2

  // 创建组，以中心点为原点
  const group = new fabric.Group(activeObjects, {
    left: centerX,
    top: centerY,
    originX: 'center', // 设置原点为中心
    originY: 'center',
    selectable: true,
    id: generateId('group'),
    hasBorders: true,
    borderColor: 'blue',
    borderDashArray: [5, 5],
  })

  // 调整组内对象的相对坐标
  group.forEachObject((obj) => {
    obj.set({
      left: obj.left - centerX,
      top: obj.top - centerY,
    })
  })
  group.setCoords() // 更新组的边界框

  // 先添加组到画布
  fabricCanvas.add(group)

  // 移除原始对象
  activeObjects.forEach((obj) => {
    fabricCanvas.remove(obj)
    elements.value = elements.value.filter(el => el.id !== obj.id)
  })

  // 更新 elements
  elements.value.push({ id: group.id, type: 'group', left: group.left, top: group.top })

  // 清除选中状态并强制刷新
  fabricCanvas.discardActiveObject()
  fabricCanvas.requestRenderAll()

  // 调试日志
  console.warn('组合完成，新组:', {
    id: group.id,
    left: group.left,
    top: group.top,
    width: group.width,
    height: group.height,
    objects: group.getObjects().map(obj => ({
      id: obj.id,
      type: obj.type,
      left: obj.left,
      top: obj.top,
    })),
  })
}

// 组合选中元素（修正后）
// const groupSelected = () => {
//     const activeObjects = fabricCanvas.getActiveObjects();
//     if (activeObjects.length < 2) {
//         console.warn('请至少选中两个元素进行组合');
//         return;
//     }

//     // 生成组的唯一 ID
//     const groupId = generateId('group');

//     // 计算选中元素的边界框
//     const boundingRect = activeObjects.reduce((rect, obj) => {
//         const objLeft = obj.left || 0;
//         const objTop = obj.top || 0;
//         const objWidth = (obj.width * obj.scaleX) || 0;
//         const objHeight = (obj.height * obj.scaleY) || 0;

//         rect.minX = Math.min(rect.minX, objLeft);
//         rect.minY = Math.min(rect.minY, objTop);
//         rect.maxX = Math.max(rect.maxX, objLeft + objWidth);
//         rect.maxY = Math.max(rect.maxY, objTop + objHeight);

//         return rect;
//     }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

//     // 计算组的中心点
//     const groupLeft = boundingRect.minX + (boundingRect.maxX - boundingRect.minX) / 2;
//     const groupTop = boundingRect.minY + (boundingRect.maxY - boundingRect.minY) / 2;

//     // 创建组
//     const group = new fabric.Group(activeObjects, {
//         left: groupLeft, // 基于选中元素的中心点
//         top: groupTop,
//         originX: 'center',
//         originY: 'center',
//         selectable: true,
//         evented: true,    // 确保组可交互
//         id: groupId,
//         hasBorders: true,
//         borderColor: 'blue',
//         borderDashArray: [5, 5],
//     });

//     group.forEachObject((obj) => {
//         obj.set({
//             selectable: false, // 组内元素不可单独选中
//             evented: false,   // 组内元素不单独响应事件
//         });
//     });

//     // 添加组到画布
//     fabricCanvas.add(group);
//     fabricCanvas.remove(...activeObjects); // 移除原始对象
//     fabricCanvas.discardActiveObject();
//     fabricCanvas.requestRenderAll();

//     // 更新 elements 数组
//     elements.value = elements.value.filter(
//         el => !activeObjects.some(obj => obj.id === el.id)
//     );
//     elements.value.push({
//         id: group.id,
//         type: 'group',
//         left: group.left,
//         top: group.top,
//         children: group.getObjects().map(obj => obj.id), // 记录子元素 ID
//     });

//     console.warn('组合完成，新组:', {
//         id: group.id,
//         left: group.left,
//         top: group.top,
//         width: group.width,
//         height: group.height,
//         children: group.getObjects().map(obj => ({
//             id: obj.id,
//             type: obj.type,
//             left: obj.left,
//             top: obj.top,
//         })),
//     });
// };

// const groupSelected = () => {
//     const activeObjects = fabricCanvas.getActiveObjects();
//     if (activeObjects.length < 2) {
//         console.warn('请至少选中两个元素进行组合');
//         return;
//     }

//     // 生成组的唯一 ID
//     const groupId = generateId('group');

//     // 计算选中元素的边界框
//     const boundingRect = activeObjects.reduce((rect, obj) => {
//         const objLeft = obj.left || 0;
//         const objTop = obj.top || 0;
//         const objWidth = (obj.width * obj.scaleX) || 0;
//         const objHeight = (obj.height * obj.scaleY) || 0;

//         rect.minX = Math.min(rect.minX, objLeft);
//         rect.minY = Math.min(rect.minY, objTop);
//         rect.maxX = Math.max(rect.maxX, objLeft + objWidth);
//         rect.maxY = Math.max(rect.maxY, objTop + objHeight);

//         return rect;
//     }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

//     // 计算组的中心点
//     const groupLeft = boundingRect.minX + (boundingRect.maxX - boundingRect.minX) / 2;
//     const groupTop = boundingRect.minY + (boundingRect.maxY - boundingRect.minY) / 2;

//     // 创建组
//     const group = new fabric.Group(activeObjects, {
//         left: groupLeft,
//         top: groupTop,
//         originX: 'center',
//         originY: 'center',
//         selectable: true, // 确保组可选中
//         evented: true,    // 确保组可交互
//         id: groupId,
//         hasBorders: true,
//         borderColor: 'blue',
//         borderDashArray: [5, 5],
//     });

//     // 确保组内元素不可单独选中
//     group.forEachObject((obj) => {
//         obj.set({
//             selectable: false,
//             evented: false,
//         });
//     });

//     // 添加组到画布
//     fabricCanvas.add(group);
//     fabricCanvas.remove(...activeObjects); // 移除原始对象
//     fabricCanvas.discardActiveObject();
//     fabricCanvas.requestRenderAll();

//     // 更新 elements 数组
//     elements.value = elements.value.filter(
//         el => !activeObjects.some(obj => obj.id === el.id)
//     );
//     elements.value.push({
//         id: group.id,
//         type: 'group',
//         left: group.left,
//         top: group.top,
//         children: group.getObjects().map(obj => obj.id), // 记录子元素 ID
//     });

//     console.warn('组合完成，新组:', {
//         id: group.id,
//         left: group.left,
//         top: group.top,
//         width: group.width,
//         height: group.height,
//         children: group.getObjects().map(obj => ({
//             id: obj.id,
//             type: obj.type,
//             left: obj.left,
//             top: obj.top,
//         })),
//     });
// };

// 删除选中元素
function deleteSelected() {
  const activeObjects = fabricCanvas.getActiveObjects()
  if (activeObjects.length === 0) {
    console.warn('请先选中要删除的元素')
    return
  }

  activeObjects.forEach((obj) => {
    fabricCanvas.remove(obj)
    elements.value = elements.value.filter(el => el.id !== obj.id)
  })

  fabricCanvas.discardActiveObject()
  fabricCanvas.requestRenderAll()

  console.warn('已删除选中元素，剩余元素:', elements.value)
}

// 绑定元素ID
function bindElementId() {
  const activeObject = fabricCanvas.getActiveObject()
  if (!activeObject) {
    console.warn('请先选中一个元素')
    return
  }
  if (elements.value.some(el => el.id === selectedElementId.value)) {
    console.warn('ID已存在，请使用唯一ID')
    return
  }
  if (!selectedElementId.value) {
    console.warn('请输入一个有效的ID')
    return
  }

  activeObject.set('id', selectedElementId.value)
  const elementIndex = elements.value.findIndex(el => el.id === activeObject.id)
  if (elementIndex !== -1) {
    elements.value[elementIndex].id = selectedElementId.value
  }
  else {
    elements.value.push({
      id: selectedElementId.value,
      type: activeObject.type,
      left: activeObject.left,
      top: activeObject.top,
    })
  }
  console.warn(`已将元素绑定ID: ${selectedElementId.value}`)
  fabricCanvas.requestRenderAll()
}

// const saveCanvas = () => {
//     if (!switchId.value) {
//         console.warn('请输入道岔整体ID');
//         return;
//     }

//     const json = fabricCanvas.toJSON(['id']);
//     const backgroundImage = fabricCanvas.backgroundImage;

//     if (!backgroundImage) {
//         console.warn('未找到背景图像，无法保存');
//         return;
//     }

//     // 计算背景图像的实际显示尺寸
//     const bgWidth = backgroundImage.width * backgroundImage.scaleX;
//     const bgHeight = backgroundImage.height * backgroundImage.scaleY;

//     // 构建保存数据
//     const canvasData = {
//         switchId: switchId.value,
//         json,
//         backgroundImage: {
//             url: backgroundImage.toDataURL(),
//             renderedWidth: bgWidth, // 实际渲染宽度
//             renderedHeight: bgHeight, // 实际渲染高度
//             left: backgroundImage.left,
//             top: backgroundImage.top
//         },
//         elements: elements.value.map(el => {
//             const obj = fabricCanvas.getObjects().find((o) => o.id === el.id);
//             if (obj) {
//                 return {
//                     ...el,
//                     relativeLeft: (obj.left - backgroundImage.left) / bgWidth,
//                     relativeTop: (obj.top - backgroundImage.top) / bgHeight
//                 };
//             }
//             return el;
//         })
//     };

//     // 保存到 localStorage
//     localStorage.setItem(`canvasData_${switchId.value}`, JSON.stringify(canvasData));
//     console.warn(`画布数据已保存到 localStorage (ID: ${switchId.value}):`, canvasData);
// };

function saveCanvas() {
  if (!switchId.value) {
    console.warn('请输入道岔整体ID')
    return
  }

  const json = fabricCanvas.toJSON(['id'])
  const backgroundImage = fabricCanvas.backgroundImage

  if (!backgroundImage) {
    console.warn('未找到背景图像，无法保存')
    return
  }

  // 计算背景图像的实际显示尺寸
  const bgWidth = backgroundImage.width * backgroundImage.scaleX
  const bgHeight = backgroundImage.height * backgroundImage.scaleY

  // 构建保存数据（修正后）
  const canvasData = {
    switchId: switchId.value,
    json,
    backgroundImage: {
      url: backgroundImage.toDataURL(),
      renderedWidth: bgWidth,
      renderedHeight: bgHeight,
      left: backgroundImage.left,
      top: backgroundImage.top,
    },
    elements: fabricCanvas.getObjects().map((obj) => {
      // 组对象直接记录其绝对坐标
      const relativeLeft = (obj.left - backgroundImage.left) / bgWidth
      const relativeTop = (obj.top - backgroundImage.top) / bgHeight

      return {
        id: obj.id,
        type: obj.type,
        relativeLeft,
        relativeTop,
        children: obj.type === 'group' ? obj.getObjects().map(child => child.id) : [],
      }
    }),
  }

  localStorage.setItem(`canvasData_${switchId.value}`, JSON.stringify(canvasData))
  console.warn(`画布数据已保存到 localStorage (ID: ${switchId.value}):`, canvasData)
}

watch(
  () => props.realTimeData,
  (newData) => {
    if (!newData)
      return
    elements.value.forEach((el) => {
      if (el.type === 'text' && newData[el.id]) {
        const textObj = fabricCanvas.getObjects().find(obj => obj.id === el.id)
        if (textObj) {
          textObj.set('text', newData[el.id])
          fabricCanvas.renderAll()
        }
      }
    })
  },
  { deep: true },
)

// 暴露方法给外部调用
defineExpose({
  getElements: () => elements.value, // 返回当前画布元素
  loadFromJSON: json => fabricCanvas.loadFromJSON(json, fabricCanvas.renderAll.bind(fabricCanvas)), // 从 JSON 加载
  saveCanvas,
})
</script>

<style>
/* 确保 n-card 充满 AppPage 的内容区域 */
:deep(.n-card) {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 10px;
  /* 可选：内边距 */
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
}

/* 外层容器 */
.track-switch-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  /* 如果内容超出，添加滚动条 */
}

/* 编辑器容器 */
.track-switch-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

/* 子工具组样式 */
.text-tools,
.id-tools,
.save-tools {
  display: flex;
  gap: 5px;
}

/* 画布样式 */
canvas {
  border: 1px solid #ccc;
  max-width: 100%;
  /* 限制画布不超过容器 */
  height: auto;
  /* 保持比例 */
}
</style>
