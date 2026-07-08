<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.post('/api/admin/login', form.value)
    localStorage.setItem('admin_token', res.data.token)
    router.push('/admin/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.detail || '用户名或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-md w-full max-w-sm p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-brand-blue">iBEC 管理后台</h1>
        <p class="text-sm text-gray-500 mt-1">Admin Dashboard</p>
      </div>
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input v-model="form.username" type="text" required
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input v-model="form.password" type="password" required
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="w-full bg-brand-blue text-white py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
