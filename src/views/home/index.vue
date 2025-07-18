<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:22
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <div class="bg-gray-900 text-white min-h-screen p-6 rounded-2xl">
    <!-- Main Content with Rounded Border -->
    <div class="rounded-2xl bg-gray-900 p-6 relative">
      <!-- HELLO Text in Component's Top Left Corner -->
      <div class="absolute top-20 left-30 flex items-center">
        <img src="/highfive.png" alt="传感器" class="w-1/4 mx-2">
        <h1 class="text-9xl font-extrabold text-white">HELLO</h1>

      </div>

      <!-- Left Panel with Images -->
      <div class="w-2/3 grid grid-cols-2 gap-20 mt-160 ml-20">
        <div class="text-center">
          <img src="/device.png" alt="传感器" class="w-3/4 mx-auto mb-30">

        </div>
        <div class="text-center">
          <img src="/charts.png" alt="任务管理" class="w-3/4 mx-auto mb-2 ml-20">

        </div>
        <div class="text-center">
          <img src="/train.png" alt="轨道检测" class="w-3/4 mx-auto mb-2">

        </div>
        <div class="text-center">
          <img src="/tablet.png" alt="报告查询" class="w-3/4 mx-auto mb-2 ml-20">

        </div>
      </div>

      <!-- Right Panel with User Info -->
      <div class="w-1/3 ml-8 absolute top-26 right-26">
        
        <!-- 管理信息卡片 -->
        <div
          class="w-[300px] p-14 space-y-20 rounded-2xl bg-slate-800/60 backdrop-blur-md shadow-xl border border-white/10">

          <!-- 顶部头像和时间 -->
          <div class="flex items-center space-x-4">
            <img src="/favicon.png" alt="头像" class="w-54 h-54 rounded-full border-3 border-blue">
            <div>
              <p class="text-white text-7xl font-semibold">Hello, admin</p>
              <p class="text-7xl text-gray-300">2023-11-18 16:18:59</p>
            </div>
          </div>

          <!-- 用户信息 -->
          <div class="rounded-xl p-25 mt-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white text-8xl font-medium space-y-1 leading-relaxed ">
            <p>姓名：<span >admin</span></p>
            <p>工号：<span >12345678</span></p>
            <p>岗位：<span >质检员</span></p>
          </div>

          <!-- 顶部按钮组 -->
          <div class="flex justify-between mt-12 space-x-2">
            <button class="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-1.5 rounded-lg text-xl">创建新用户</button>
            <button class="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-1.5 rounded-lg text-xl">新增角色</button>
            <button class="flex-1 bg-black hover:bg-gray-700 text-white py-1.5 rounded-lg text-xl">密码重置</button>
          </div>

          <!-- 管理信息 -->
          <div class="mt-4 space-y-3">
            <div class="text-white text-base font-semibold">管理信息</div>
            <!-- 角色项 -->
            <div class="bg-slate-900/60 rounded-xl p-3 space-y-2">
              <!-- 超级管理员 -->
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-white text-sm">超级管理员</p>
                  <p class="text-gray-400 text-sm">SUPER_ADMIN</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                  <div
                    class="w-9 h-5 bg-gray-600 peer-checked:bg-teal-400 rounded-full peer-focus:ring-2 peer-focus:ring-teal-300 transition-all">
                  </div>
                  <div
                    class="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4">
                  </div>
                </label>
              </div>
              <div class="flex justify-between space-x-2">
                <button class="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 text-sm rounded">分配用户</button>
                <button
                  class="border border-cyan-400 hover:bg-cyan-600 text-white px-2 py-1 text-sm rounded">编辑</button>
                <button class="border border-red-400 hover:bg-red-600 text-white px-2 py-1 text-sm rounded">删除</button>
              </div>
            </div>

            <!-- 质检员 -->
            <div class="bg-slate-900/60 rounded-xl p-3 space-y-2">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-white text-sm">质检员</p>
                  <p class="text-gray-400 text-sm">ROLE_QA</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked class="sr-only peer">
                  <div
                    class="w-9 h-5 bg-gray-600 peer-checked:bg-teal-400 rounded-full peer-focus:ring-2 peer-focus:ring-teal-300 transition-all">
                  </div>
                  <div
                    class="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4">
                  </div>
                </label>
              </div>
              <div class="flex justify-between space-x-2">
                <button class="bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 text-sm rounded">分配用户</button>
                <button
                  class="border border-cyan-400 hover:bg-cyan-600 text-white px-2 py-1 text-sm rounded">编辑</button>
                <button class="border border-red-400 hover:bg-red-600 text-white px-2 py-1 text-sm rounded">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store'

const userStore = useUserStore()
</script>

<style scoped>
.mt-20 {
  margin-top: 80px;
}
</style>