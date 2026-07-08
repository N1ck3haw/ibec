<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { isEnglish, toggleLang } = useLanguage()
const username = ref('')
const baseUrl = import.meta.env.BASE_URL

const checkUser = () => {
  username.value = localStorage.getItem('username') || ''
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  username.value = ''
  window.location.href = baseUrl
}

const scrollToTop = () => {
  window.scrollTo(0, 0)
}

onMounted(() => {
  checkUser()
  window.addEventListener('user-login', checkUser)
})

onUnmounted(() => {
  window.removeEventListener('user-login', checkUser)
})
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex-shrink-0 flex items-center">
            <img class="h-10 w-auto" :src="`${baseUrl}ibec.png`" alt="iBEC Logo" />
          </router-link>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link to="/" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ isEnglish ? 'Home' : '首页' }}
            </router-link>
             <router-link to="/about" @click="scrollToTop" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ isEnglish ? 'About' : '竞赛概况' }}
            </router-link>
            <router-link to="/register" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ isEnglish ? 'Register' : '报名' }}
            </router-link>
             <router-link to="/submit" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ isEnglish ? 'Submit' : '提交作品' }}
            </router-link>
          </div>
        </div>
        <div class="flex items-center space-x-4">
           <div v-if="username" class="flex items-center space-x-4">
             <span class="text-gray-700 text-sm">{{ isEnglish ? 'Welcome, ' : '欢迎您，' }}{{ username }}</span>
             <button @click="logout" class="text-gray-500 hover:text-gray-900 text-sm font-medium">
               {{ isEnglish ? 'Logout' : '退出' }}
             </button>
           </div>
           <router-link v-else to="/login" class="text-gray-500 hover:text-gray-900 text-sm font-medium">
            {{ isEnglish ? 'Login' : '登录' }}
          </router-link>
          <button @click="toggleLang" class="text-sm text-gray-500 hover:text-gray-900 font-bold border border-gray-300 rounded px-2 py-1">
            {{ isEnglish ? '中文' : 'English' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
