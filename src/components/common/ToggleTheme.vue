<template>
  <i id="toggleTheme" class="mr-16 cursor-pointer" :class="isDark ? 'i-fe:moon' : 'i-fe:sun'" @click="toggleDark" />
</template>

<script setup>
import { useAppStore } from '@/store'
import { useDark, useToggle } from '@vueuse/core'

const appStore = useAppStore()
const isDark = useDark()
async function toggleDark({ clientX, clientY }) {
  function handler() {
    appStore.toggleDark()
    useToggle(isDark)()
  }

  if (!document.startViewTransition) {
    return handler()
  }

  const clipPath = [
    `circle(0px at ${clientX}px ${clientY}px)`,
    `circle(${Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY),
    )}px at ${clientX}px ${clientY}px)`,
  ]

  await document.startViewTransition(handler).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 500,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`,
    },
  )
}
</script>
<style>
/* 默认（亮色）模式 */
body {
  background-color: #ffffff;
  /* 亮色背景 */
  color: #222222;
  /* 亮色文字 */
  transition: background-color 0.3s ease;
}

/* ✨ 夜间模式的样式（使用渐变背景） */
html.dark body {
  /* 使用 background 属性替代 background-color。
    linear-gradient() 用于创建线性渐变。
    'to bottom' 表示渐变方向从上到下。
    #314648 是起始颜色。
    #080F13 是结束颜色。
  */
  background: linear-gradient(to bottom, #314648, #080F13);
  color: #fff;
  /* 夜间模式文字色保持不变 */

  /* 注意：CSS transition 无法平滑地为渐变背景添加动画，
     但您的代码中使用了 View Transition API，它会提供更高级的切换动画。*/
}

#app>div>div.wh-full.flex>article>div {
  background-color: transparent;
  /* 保持文章背景透明 */
  background: linear-gradient(to right, #314648, #080F13);
}
</style>