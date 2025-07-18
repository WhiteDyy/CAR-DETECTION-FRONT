<template>
  <div class="relative wh-full">
    <video class="absolute top-0 left-0 w-full h-full object-cover -z-1" src="@/assets/video/login.mp4" autoplay loop
      muted playsinline></video>

    <!-- 左上角Logo和标题 -->
    <div class="absolute top-20 left-20 flex items-center z-10">
      <img src="@/assets/images/logo.png" class="h-40 mr-5" />
      <h1 class="text-2xl font-bold text-white logo-title">{{ title }}</h1>
    </div>

    <!-- 左下角文字描述 -->
    <div class="absolute bottom-80 left-20 z-10 text-white jakarta-font">
      <div class="text-40 font-medium leading-tight">轨检智控安全管家，守护轨道每一程!</div>
      <div class="text-24 font-medium mt-2">Track Inspection & Intelligent Control Safety Manager, safeguarding every
        journey on the rails!</div>
    </div>


    <div class="wh-full flex items-center justify-end">
      <div class="m-auto mr-100 max-w-420 min-w-345 f-c-c rounded-8 bg-opacity-20 bg-cover p-12 card-shadow auto-bg">
        <div class="w-320 flex-col px-20 py-32">
          <!-- 登录标题左对齐 -->
          <h1 class="text-left text-40 text-#fff font-normal mb-5">
            登录
          </h1>

          <!-- 用户名输入框 -->
          <n-input v-model:value="loginInfo.username" autofocus class="mt-10 h-40 items-center input-black-text"
            placeholder="请输入用户名" :maxlength="20">
            <template #prefix>
              <i class="i-fe:user mr-12 opacity-20" />
            </template>
          </n-input>

          <!-- 密码输入框 -->
          <n-input v-model:value="loginInfo.password" class="mt-10 h-40 items-center input-black-text" type="password"
            show-password-on="mousedown" placeholder="请输入密码" :maxlength="20" @keydown.enter="handleLogin()">
            <template #prefix>
              <i class="i-fe:lock mr-12 opacity-20" />
            </template>
          </n-input>

          <!-- 验证码区域 -->
          <div class="mt-10 flex items-center">
            <n-input v-model:value="loginInfo.captcha" class="h-40 items-center input-black-text" placeholder="请输入验证码"
              :maxlength="4" @keydown.enter="handleLogin()">
              <template #prefix>
                <i class="i-fe:key mr-12 opacity-20" />
              </template>
            </n-input>
            <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" height="40" class="ml-12 w-80 cursor-pointer"
              @click="initCaptcha" />
          </div>

          <!-- 记住密码和忘记密码 -->
          <div class="mt-20 flex justify-between items-center">
            <n-checkbox class="text-yellow-500" :checked="isRemember" label="记住我"
              :on-update:checked="(val) => (isRemember = val)" />
            <span class="text-yellow-500 text-sm cursor-pointer hover:underline">忘记密码?</span>
          </div>

          <!-- 登录按钮 -->
          <div class="mt-20 flex">
            <n-button class="h-40 flex-1 rounded-5 text-16 login-btn" type="primary" :loading="loading"
              @click="handleLogin()">
              登录
            </n-button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { useAuthStore } from "@/store";
import { lStorage, throttle } from "@/utils";
import { useStorage } from "@vueuse/core";
import api from "./api";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const title = import.meta.env.VITE_TITLE;

const loginInfo = ref({
  username: "",
  password: "",
  captcha: "",
});

const captchaUrl = ref("");
const initCaptcha = throttle(() => {
  captchaUrl.value = `${import.meta.env.VITE_AXIOS_BASE_URL
    }/auth/captcha?${Date.now()}`;
}, 500);

initCaptcha();

const isRemember = useStorage("isRemember", true);
const loading = ref(false);

async function handleLogin() {
  const { username, password, captcha } = loginInfo.value;
  if (!username || !password) {
    return $message.warning("请输入用户名和密码");
  }
  if (!captcha) {
    return $message.warning("请输入验证码");
  }
  try {
    loading.value = true;
    $message.loading("正在验证，请稍后...", { key: "login" });
    const { data } = await api.login({
      username,
      password: password.toString(),
      captcha,
    });
    if (isRemember.value) {
      lStorage.set("loginInfo", { username, password });
    } else {
      lStorage.remove("loginInfo");
    }
    onLoginSuccess(data);
  } catch (error) {
    if (error?.code === 10003) {
      initCaptcha();
    }
    $message.destroy("login");
    console.error(error);
  }
  loading.value = false;
}

async function onLoginSuccess(data = {}) {
  authStore.setToken(data);
  $message.loading("登录中...", { key: "login" });
  try {
    $message.success("登录成功", { key: "login" });
    if (route.query.redirect) {
      const path = route.query.redirect;
      delete route.query.redirect;
      router.push({ path, query: route.query });
    } else {
      router.push("/");
    }
  } catch (error) {
    console.error(error);
    $message.destroy("login");
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.auto-bg {
  background-color: rgba(255, 255, 255, 0);
  backdrop-filter: blur(10px);
}

.logo-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (prefers-color-scheme: dark) {
  .auto-bg {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .logo-title {
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
  }
}
</style>