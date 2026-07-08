<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'

const router = useRouter()
const { isEnglish } = useLanguage()

const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.post('/api/login', {
      email: form.value.email,
      password: form.value.password
    })
    const { token, leader_name } = response.data
    localStorage.setItem('token', token)
    if (leader_name) localStorage.setItem('username', leader_name)
    window.dispatchEvent(new Event('user-login'))
    router.push('/submit')
  } catch (err: any) {
    error.value = err.response?.data?.detail || (isEnglish.value ? 'Invalid email or password' : '邮箱或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AnnouncementBar />
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isEnglish ? 'Sign in to your account' : '登录您的账号' }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="login">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">{{ isEnglish ? 'Email address' : '邮箱地址' }}</label>
            <div class="mt-1">
              <input v-model="form.email" id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">{{ isEnglish ? 'Password' : '密码' }}</label>
            <div class="mt-1">
              <input v-model="form.password" id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm">
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50">
              {{ loading ? (isEnglish ? 'Signing in...' : '登录中...') : (isEnglish ? 'Sign in' : '登录') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
