<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const teams = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const trackFilter = ref('')

const tracks = [
  'AI-driven Life Science Discovery',
  'Novel Bioinformatics Algorithms / Methods',
  'Bioinformatics Resources / Platforms',
  'Bio-engineering Applications',
]

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('admin_token')}` })

const fetchTeams = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (search.value) params.search = search.value
    if (trackFilter.value) params.track = trackFilter.value
    const res = await axios.get('/api/admin/teams', { headers: authHeader(), params })
    teams.value = res.data
  } finally {
    loading.value = false
  }
}

const deleteTeam = async (team: any) => {
  if (!confirm(`确认删除队伍「${team.leader_email}」？此操作不可撤销，相关文件将一并删除。`)) return
  try {
    await axios.delete(`/api/admin/teams/${team.id}`, { headers: authHeader() })
    await fetchTeams()
  } catch (e: any) {
    alert(e.response?.data?.detail || '删除失败')
  }
}

const exportCSV = async () => {
  const res = await axios.get('/api/admin/export', { headers: authHeader(), responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ibec_teams.csv'
  a.click()
}

onMounted(fetchTeams)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">报名列表</h2>
      <button @click="exportCSV" class="bg-brand-blue text-white px-4 py-2 rounded-md text-sm hover:bg-blue-800 transition-colors">
        导出 CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="flex space-x-3 mb-4">
      <input v-model="search" @keyup.enter="fetchTeams" type="text" placeholder="搜索姓名/邮箱/队伍/项目..."
        class="border border-gray-300 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
      <select v-model="trackFilter" @change="fetchTeams"
        class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
        <option value="">全部赛道</option>
        <option v-for="t in tracks" :key="t" :value="t">{{ t }}</option>
      </select>
      <button @click="fetchTeams" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors">
        搜索
      </button>
    </div>

    <div v-if="loading" class="text-gray-500 py-8 text-center">加载中...</div>
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">队长姓名</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">邮箱</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">队伍名</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">赛道</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">国籍</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">文件</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">注册时间</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="team in teams" :key="team.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-500">{{ team.id }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ team.leader_name || '-' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ team.leader_email }}</td>
            <td class="px-4 py-3 text-gray-600">{{ team.name || '-' }}</td>
            <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ team.track || '-' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ team.leader_nationality || '-' }}</td>
            <td class="px-4 py-3 text-center">
              <span class="inline-block bg-blue-100 text-brand-blue text-xs font-semibold px-2 py-0.5 rounded-full">{{ team.file_count }}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ team.created_at?.slice(0,10) }}</td>
            <td class="px-4 py-3">
              <button @click="router.push(`/admin/teams/${team.id}`)" class="text-brand-blue hover:underline text-xs font-medium">详情</button>
              <button @click="deleteTeam(team)" class="text-red-500 hover:underline text-xs font-medium ml-3">删除</button>
            </td>
          </tr>
          <tr v-if="!teams.length">
            <td colspan="9" class="px-4 py-8 text-center text-gray-400">暂无数据</td>
          </tr>
        </tbody>
      </table>
      <div class="px-4 py-3 bg-gray-50 text-sm text-gray-500">共 {{ teams.length }} 条记录</div>
    </div>
  </div>
</template>
