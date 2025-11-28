/**********************************
 * @Description: 入口文件
 * @FilePath: main.js
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/04 22:41:32
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './directives'

import { setupRouter } from './router'
import { setupStore, useAppStore } from './store'
import { setupNaiveDiscreteApi } from './utils'
import '@/styles/reset.css'
import '@/styles/global.css'
import 'uno.css'
import '@/assets/styles/fonts.css'

async function bootstrap() {
  const app = createApp(App)
  setupStore(app)
  // 默认启用暗色模式
  const appStore = useAppStore()
  document.documentElement.classList.add('dark')
  appStore.isDark = true
  setupDirectives(app)
  await setupRouter(app)
  app.mount('#app')
  setupNaiveDiscreteApi()
}

bootstrap()
