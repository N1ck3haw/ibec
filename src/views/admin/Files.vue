<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const files = ref<any[]>([])
const loading = ref(true)

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('admin_token')}` })

onMounted(async () => {
  try {
    const res = await axios.get('/api/admin/files', { headers: authHeader() })
    files.value = res.data
  } finally {
    loading.value = false
  }
})

const downloadFile = async (fileId: number, filename: string) => {
  const res = await axios.get(`/api/admin/files/${fileId}/download`, {
    headers: authHeader(), responseType: 'blob'
  })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">文件管理</h2>

    <div v-if="loading" class="text-gray-500 py-8 text-center">加载中...</div>
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">队伍</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">队长邮箱</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">文件名</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">版本</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">上传时间</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="f in files" :key="f.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-500">{{ f.id }}</td>
            <td class="px-4 py-3">
              <button @click="router.push(`/admin/teams/${f.team_id}`)" class="text-brand-blue hover:underline font-medium">
                {{ f.team_name || f.team_id }}
              </button>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ f.leader_email }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ f.original_filename }}</td>
            <td class="px-4 py-3 text-center">
              <span class="bg-blue-100 text-brand-blue text-xs font-semibold px-2 py-0.5 rounded-full">v{{ f.version }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ f.created_at?.slice(0,19) }}</td>
            <td class="px-4 py-3">
              <button @click="downloadFile(f.id, f.original_filename)" class="text-brand-blue hover:underline text-xs font-medium">下载</button>
            </td>
          </tr>
          <tr v-if="!files.length">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">暂无文件</td>
          </tr>
        </tbody>
      </table>
      <div class="px-4 py-3 bg-gray-50 text-sm text-gray-500">共 {{ files.length }} 个文件</div>
    </div>
  </div>
</template>
