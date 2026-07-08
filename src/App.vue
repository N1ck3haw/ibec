<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLanguage } from './composables/useLanguage'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const router = useRouter()
const route = useRoute()
const { isEnglish, toggleLang: toggle } = useLanguage()

const layout = computed(() => route.meta.layout || 'main')

// admin
const isAdminLoggedIn = computed(() => !!localStorage.getItem('admin_token'))
const logoutAdmin = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

// expert
const isExpertLoggedIn = computed(() => !!localStorage.getItem('expert_token'))
const expertName = computed(() => localStorage.getItem('expert_name') || '')
const logoutExpert = () => {
  localStorage.removeItem('expert_token')
  localStorage.removeItem('expert_name')
  router.push('/expert/login')
}
</script>

<template>
  <!-- main layout: Navbar + Footer -->
  <div v-if="layout === 'main'" class="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
    <Navbar />
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer />
  </div>

  <!-- admin layout: sidebar -->
  <div v-else-if="layout === 'admin'" class="min-h-screen bg-gray-100">
    <div class="flex h-screen">
      <aside class="w-56 bg-brand-blue text-white flex flex-col">
        <div class="px-6 py-5 border-b border-blue-800">
          <h1 class="text-lg font-bold">iBEC Admin</h1>
          <p class="text-xs text-blue-300 mt-1">管理后台</p>
        </div>
        <nav class="flex-1 px-4 py-4 space-y-1">
          <router-link to="/admin/dashboard" class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors" active-class="bg-blue-800">
            📊 数据概览
          </router-link>
          <router-link to="/admin/teams" class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors" active-class="bg-blue-800">
            👥 报名列表
          </router-link>
          <router-link to="/admin/files" class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors" active-class="bg-blue-800">
            📁 文件管理
          </router-link>
          <router-link to="/admin/scores" class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors" active-class="bg-blue-800">
            🏆 评审结果
          </router-link>
        </nav>
        <div class="px-4 py-4 border-t border-blue-800">
          <button @click="logoutAdmin" class="w-full text-left px-3 py-2 rounded-md text-sm text-blue-200 hover:bg-blue-800 transition-colors">
            退出登录
          </button>
        </div>
      </aside>
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>

  <!-- expert layout: sidebar -->
  <div v-else-if="layout === 'expert'" class="min-h-screen bg-gray-100">
    <div class="flex h-screen">
      <aside class="w-56 bg-brand-blue text-white flex flex-col">
        <div class="px-6 py-5 border-b border-blue-800">
          <h1 class="text-lg font-bold">iBEC</h1>
          <p class="text-xs text-blue-300 mt-1">{{ isEnglish ? 'Expert Review' : '专家评审系统' }}</p>
        </div>
        <nav class="flex-1 px-4 py-4 space-y-1">
          <router-link to="/expert/list" class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors" active-class="bg-blue-800">
            📋 {{ isEnglish ? 'Review Projects' : '评审项目' }}
          </router-link>
          <router-link to="/expert/my-scores" class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors" active-class="bg-blue-800">
            📊 {{ isEnglish ? 'My Scores' : '我的评分' }}
          </router-link>
        </nav>
        <div class="px-4 py-4 border-t border-blue-800 space-y-2">
          <p class="text-xs text-blue-300 truncate">{{ expertName }}</p>
          <button @click="toggle" class="w-full text-left px-3 py-1.5 rounded-md text-xs text-blue-200 hover:bg-blue-800 transition-colors">
            {{ isEnglish ? '中文' : 'English' }}
          </button>
          <button @click="logoutExpert" class="w-full text-left px-3 py-1.5 rounded-md text-sm text-blue-200 hover:bg-blue-800 transition-colors">
            {{ isEnglish ? 'Logout' : '退出登录' }}
          </button>
        </div>
      </aside>
      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>

  <!-- blank layout: login pages -->
  <div v-else>
    <router-view />
  </div>
</template>
