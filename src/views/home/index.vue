<template>
  <div class="page-wrapper">
    <n-grid :cols="24" :x-gap="16" class="full-height-grid">

      <n-gi :span="16" style="height: 100%;">
        <n-flex vertical :size="16" class="full-height-flex">
          <div class="block-a1" style="flex: 1 1 10%; min-height: 0;">
            <img :src="highfive" alt="Logo" class="logo-image" />
            <p class="logo-text">轨道智能管控</p>
          </div>
          <div class="block-a2" style="flex: 10 1 100%; min-height: 0;">
            <n-grid :cols="2" :x-gap="10" :y-gap="5" class="card-grid">
              <n-gi v-for="card in cards" :key="card.id">
                <div class="card-container" :class="{ 'is-selected': selectedCard === card.id }"
                  @click="handleCardClick(card)">
                  <img :src="card.image" :alt="card.alt" class="card-image" />
                </div>
              </n-gi>
            </n-grid>
          </div>
        </n-flex>
      </n-gi>

      <!-- <n-gi :span="8" style="height: 100%;">
        <n-flex vertical :size="16" class="full-height-flex">
          <div class="block-b1">
            <p>B1: 用户头像 & 昵称</p>
          </div>
          <div class="block-b2">
            <p>B2: 用户信息</p>
          </div>
          <div class="block-b3">
            <p>B3: 管理信息</p>
          </div>
        </n-flex>
      </n-gi> -->
      <n-gi :span="8" style="height: 100%;">
        <n-card class="user-panel-card" :bordered="false">
          <n-flex align="center" class="b-section">
            <n-avatar round :size="54" :src="faviconSrc" />
            <div class="user-greeting">
              <p class="greeting-text">Hello, admin</p>
              <p class="timestamp-text">2023-11-18 16:18:59</p>
            </div>
          </n-flex>

          <div class="b-section">
            <n-flex justify="space-between" align="center" class="section-header">
              <h3 class="section-title">用户信息</h3>
              <div class="section-icon">❂</div>
            </n-flex>
            <div class="user-info-box">
              <n-space vertical justify="center">
                <span>姓名： admin</span>
                <span>工号： 12345678</span>
                <span>岗位： 质检员</span>
              </n-space>
            </div>
            <n-space justify="space-between" class="action-buttons">
              <n-button strong secondary type="primary" ghost>创建新用户</n-button>
              <n-button strong secondary type="primary" ghost>新增角色</n-button>
              <n-button strong secondary type="tertiary" ghost>密码重置</n-button>
            </n-space>
          </div>

          <div class="b-section">
            <n-flex justify="space-between" align="center" class="section-header">
              <h3 class="section-title">管理信息</h3>
              <div class="section-icon">•••</div>
            </n-flex>

            <n-space vertical :size="16">
              <div v-for="role in roles" :key="role.id" class="role-management-card">
                <n-flex justify="space-between" align="center">
                  <n-flex align="center">
                    <div class="role-icon">🎓</div>
                    <div>
                      <p class="role-name">{{ role.name }}</p>
                      <p class="role-key">{{ role.key }}</p>
                    </div>
                  </n-flex>
                  <n-switch v-model:value="role.active" />
                </n-flex>
                <n-space justify="space-between" class="role-buttons">
                  <n-button type="primary" strong ghost>分配用户</n-button>
                  <n-button type="info" strong ghost>编辑</n-button>
                  <n-button type="error" strong ghost>删除</n-button>
                </n-space>
              </div>
            </n-space>
          </div>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import { NGrid, NGi, NFlex } from 'naive-ui'; // 1. 引入 NFlex
import { NGrid, NGi, NFlex, NCard, NAvatar, NSpace, NButton, NSwitch } from 'naive-ui';


// 为了让模板更简洁，将卡片数据整合为一个数组
// const cards = ref([
//   { id: 1, image: new URL('@/assets/images/home/device.png', import.meta.url).href, alt: '传感器状态' },
//   { id: 2, image: new URL('@/assets/images/home/charts.png', import.meta.url).href, alt: '任务创建与管理' },
//   { id: 3, image: new URL('@/assets/images/home/train.png', import.meta.url).href, alt: '轨道检测' },
//   { id: 4, image: new URL('@/assets/images/home/tablet.png', import.meta.url).href, alt: '结果报表查询' }
// ]);



// 2. 获取路由器实例
const router = useRouter();

// 3. 在卡片数据中，为每个对象添加一个 `route` 属性
const cards = ref([
  { id: 1, image: new URL('@/assets/images/home/device.png', import.meta.url).href, alt: '传感器状态', route: '/sensor/monitor' },
  { id: 2, image: new URL('@/assets/images/home/charts.png', import.meta.url).href, alt: '任务创建与管理', route: '/taskmanage/task-list' },
  { id: 3, image: new URL('@/assets/images/home/train.png', import.meta.url).href, alt: '轨道检测', route: '/rail-detection' },
  { id: 4, image: new URL('@/assets/images/home/tablet.png', import.meta.url).href, alt: '结果报表查询', route: '/result-table/surface/index' }
]);


const highfive = new URL('@/assets/images/home/highfive.png', import.meta.url).href;
const selectedCard = ref(null);

// B 区用户头像 (这是本次新增的关键修复)
const faviconSrc = new URL('@/assets/images/home/favicon.png', import.meta.url).href;

// 2. 新增：为管理信息创建数据源
const roles = ref([
  { id: 'super_admin', name: '超级管理员', key: 'SUPER_ADMIN', active: false },
  { id: 'qa', name: '质检员', key: 'ROLE_QA', active: true }
]);


function handleCardClick(card) {
  // 首先，更新选中卡片的样式状态
  selectedCard.value = card.id;
  
  // 然后，执行页面跳转
  if (card.route) {
    router.push(card.route);
  }
}


</script>

<style scoped>
/* 全局样式和 page-wrapper 保持不变 */
.page-wrapper {
  /* 保持从 100vh 改为 100% 的修复 */
  height: 100%;

  /* --- 核心改动开始 --- */

  /* 1. 保持宽度为100%，以适应较小的屏幕 */
  width: 100%;
  /* 2. 新增：设定一个最大宽度，防止在宽屏下无限拉伸 */
  max-width: 1920px;
  /* 3. 新增：使用 margin: auto 实现水平居中 */
  margin: 0 auto;

  /* --- 核心改动结束 --- */

  padding: 16px;
  background-color: #101820;
  box-sizing: border-box;
}

.full-height-grid {
  height: 100%;
}

/* --- 核心改动：为 n-flex 容器和其子元素定义样式 --- */

/* 让 n-flex 容器撑满其父元素 n-gi 的高度 */
.full-height-flex {
  height: 100%;
}

/* A 区块样式 */
.block-a1 {
  background-color: #e67d2200;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px;
}

.block-a2 {
  display: flex;
  /* 让内部的 card-grid 可以撑满 */
}

/* B 区块样式 */
.block-b1,
.block-b2,
.block-b3 {
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-b1 {
  background-color: #c0392b;
  height: 100px;
  flex-shrink: 0;
  /* 防止被压缩 */
}

.block-b2 {
  background-color: #8e44ad;
  height: 150px;
  flex-shrink: 0;
  /* 防止被压缩 */
}

.block-b3 {
  background-color: #27ae60;
  flex-grow: 1;
  /* 占据剩余所有空间 */
}

/* 卡片区的 n-grid 样式 */
.card-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}


/* ... 其他如 logo, card-container, card-image 等样式保持不变 ... */
.logo-image {
  height: 55px;
  width: 55px;
  margin-right: 16px;
}

.logo-text {
  font-size: 48px;
  font-weight: bold;
  color: white;
}

.card-container {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

.card-container:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.2);
}

.card-container.is-selected {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.2);
  outline: 3px solid #3b82f6;
  outline-offset: 4px;
}

p:not(.logo-text) {
  color: white;
  font-family: sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
}

/* B区最外层卡片容器 - 这里定义了圆角 */
.user-panel-card {
  height: 100%;
  background-color: rgba(41, 50, 65, 0.5) !important;
  backdrop-filter: blur(20px);
  border-radius: 24px !important;
  /*! 关键：定义了24px的圆角 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
  padding: 16px;
  /* 为卡片内容提供内边距 */
  box-sizing: border-box;
}

/* 允许卡片内容在超出时滚动 */
:deep(.user-panel-card > .n-card__content) {
  height: 100%;
  overflow-y: auto;
  padding: 0 !important;
  /* 清除n-card默认的padding，使用我们自己的 */
}

/* B区内每个部分的通用间距 */
.b-section {
  margin-bottom: 24px;
}

.b-section:last-child {
  margin-bottom: 0;
}

/* ... B1, B2, B3 内部其他所有细节样式保持不变 ... */
.user-greeting {
  margin-left: 12px;
}

.greeting-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.timestamp-text {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}

.section-icon {
  font-size: 1.5rem;
  color: #94a3b8;
}

.user-info-box {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(107, 33, 168, 0.3));
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  font-size: 1rem;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info-box span {
  font-weight: 500;
}

.action-buttons {
  margin-top: 16px;
  width: 100%;
}

.action-buttons .n-button {
  flex: 1;
}

.role-management-card {
  background-color: rgba(30, 41, 59, 0.6);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #3d474a;
}

.role-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.role-name {
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.role-key {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

.role-buttons {
  margin-top: 16px;
  width: 100%;
}

.role-buttons .n-button {
  flex: 1;
}


/* ---- B 区按钮样式最终修复 ---- */

.action-buttons .n-button,
.action-buttons .n-button:hover,
.action-buttons .n-button:focus {
  color: #ffffff !important;
  background-color: transparent !important;

  /* --- 核心修复：同时定义边框的宽度、样式和颜色 --- */
  border-width: 1px !important;
  /* 1. 指定边框宽度为 1px */
  border-style: solid !important;
  /* 2. 指定边框样式为实线 */
  border-color: #ffffff !important;
  /* 3. 指定边框颜色为白色 */
}

/* 为悬浮状态添加一个轻微的半透明白色背景，以提供更好的交互反馈 */
.action-buttons .n-button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>