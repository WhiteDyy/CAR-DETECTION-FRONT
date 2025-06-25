<template>
  <div class="track-switch-viewer">
    <canvas ref="canvas" />
  </div>
</template>

<script setup>
import { fabric } from 'fabric'
import { onMounted, ref, watch } from 'vue'

const { switchId, realTimeData } = defineProps({
  switchId: String,
  realTimeData: Object,
})

const canvas = ref(null)
let fabricCanvas = null // 不使用 ref，因为它在 onMounted 中初始化

onMounted(() => {
  const savedData = localStorage.getItem(`canvasData_${switchId}`)
  if (!savedData) {
    console.error(`No data found for switchId: ${switchId}`)
    return
  }

  const canvasData = JSON.parse(savedData)
  loadCanvas(canvasData)
})

function loadCanvas(canvasData) {
  const { json, backgroundImage: bgData, elements } = canvasData

  // 按保存时的渲染尺寸初始化画布
  fabricCanvas = new fabric.Canvas(canvas.value, {
    width: bgData.renderedWidth,
    height: bgData.renderedHeight,
    selection: false, // 禁用选择
    interactive: false, // 禁用交互
  })

  // 禁用画布的鼠标事件
  canvas.value.style.pointerEvents = 'none'

  // 禁用鼠标滚轮事件
  canvas.value.addEventListener('wheel', (e) => {
    e.preventDefault()
  }, { passive: false })

  // 加载背景图（不缩放）
  fabric.Image.fromURL(bgData.url, (img) => {
    img.set({
      scaleX: 1, // 禁止缩放
      scaleY: 1,
      left: bgData.left,
      top: bgData.top,
      originX: 'left',
      originY: 'top',
    })

    fabricCanvas.setBackgroundImage(img, () => {
      loadCanvasJson(json, elements, bgData)
    })
  })
}

// const loadCanvasJson = (json, elements, bgData) => {
//     fabricCanvas.loadFromJSON(json, () => {
//         // 遍历所有对象，禁用交互
//         fabricCanvas.getObjects().forEach(obj => {
//             obj.set({
//                 selectable: false, // 不可选择
//                 evented: false // 不响应事件
//             });
//         });

//         // 根据相对坐标计算绝对坐标
//         fabricCanvas.getObjects().forEach((obj) => {
//             const el = elements.find((e) => e.id === obj.id);
//             if (el && el.relativeLeft !== undefined && el.relativeTop !== undefined) {
//                 obj.set({
//                     left: bgData.left + el.relativeLeft * bgData.renderedWidth,
//                     top: bgData.top + el.relativeTop * bgData.renderedHeight,
//                 });
//                 obj.setCoords(); // 更新边界框
//             }
//         });

//         fabricCanvas.renderAll();
//     });
// };

function loadCanvasJson(json, elements, bgData) {
  fabricCanvas.loadFromJSON(json, () => {
    // 遍历所有对象，还原位置
    fabricCanvas.getObjects().forEach((obj) => {
      const el = elements.find(e => e.id === obj.id)
      if (el) {
        obj.set({
          left: bgData.left + el.relativeLeft * bgData.renderedWidth,
          top: bgData.top + el.relativeTop * bgData.renderedHeight,
        })
        obj.setCoords()
      }

      // 如果是组，还原子元素相对坐标
      if (obj.type === 'group') {
        const groupEl = elements.find(e => e.id === obj.id)
        if (groupEl) {
          obj.getObjects().forEach((child) => {
            const childEl = groupEl.children.find(c => c.id === child.id)
            if (childEl) {
              child.set({
                left: childEl.left,
                top: childEl.top,
              })
              child.setCoords()
            }
          })
        }
      }
    })

    fabricCanvas.renderAll()
  })
}
function updateCanvasElements(data) {
  if (!fabricCanvas || !data)
    return

  fabricCanvas.forEachObject((obj) => {
    const dynamicValue = data[obj.id]
    console.warn(`处理顶级对象 - ID: ${obj.id}, 类型: ${obj.type}, 值: ${dynamicValue}`)

    if (dynamicValue) {
      if (obj.type === 'group') {
        const groupObjects = obj.getObjects()
        groupObjects.forEach((subObj) => {
          if (subObj.type === 'text' || subObj.type === 'textbox') {
            subObj.set('text', dynamicValue)
            console.warn(`更新组内文字 - 组ID: ${obj.id}, 子ID: ${subObj.id}, 新值: ${dynamicValue}`)
          }
        })
      }
      else if (obj.type === 'text' || obj.type === 'textbox') {
        obj.set('text', dynamicValue)
        console.warn(`更新独立文字 - ID: ${obj.id}, 新值: ${dynamicValue}`)
      }
      else if (obj.type === 'circle') {
        obj.set('fill', dynamicValue)
        console.warn(`更新圆形 - ID: ${obj.id}, 新值: ${dynamicValue}`)
      }
      else if (obj.type === 'path') {
        obj.set('fill', dynamicValue)
        console.warn(`更新路径 - ID: ${obj.id}, 新值: ${dynamicValue}`)
      }
    }
  })
  fabricCanvas.renderAll()
  console.warn('画布已渲染')
}

watch(
  () => realTimeData,
  (newData) => {
    updateCanvasElements(newData)
  },
  { deep: true },
)
</script>

<style scoped>
.track-switch-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
  /* 允许滚动查看完整内容 */

  canvas {
    max-width: 100%;
    height: auto;
    display: block;
  }
}
</style>
