<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'
import axios from 'axios'

const router = useRouter()
const { isEnglish, toggle } = useLanguage()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post('/api/expert/login', form.value)
    localStorage.setItem('expert_token', res.data.token)
    localStorage.setItem('expert_name', res.data.name)
    router.push('/expert/list')
  } catch (e: any) {
    error.value = e.response?.data?.detail || (isEnglish.value ? 'Invalid credentials' : '用户名或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-md w-full max-w-sm p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-brand-blue">iBEC</h1>
        <p class="text-sm text-gray-500 mt-1">{{ isEnglish ? 'Expert Review System' : '专家评审系统' }}</p>
      </div>
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ isEnglish ? 'Username' : '用户名' }}</label>
          <input v-model="form.username" type="text" required
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ isEnglish ? 'Password' : '密码' }}</label>
          <input v-model="form.password" type="password" required
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="w-full bg-brand-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
          {{ loading ? (isEnglish ? 'Logging in...' : '登录中...') : (isEnglish ? 'Login' : '登录') }}
        </button>
      </form>
      <div class="mt-4 text-center">
        <button @click="toggle" class="text-xs text-gray-400 hover:text-gray-600">{{ isEnglish ? '中文' : 'English' }}</button>
      </div>
    </div>
  </div>
</template>
