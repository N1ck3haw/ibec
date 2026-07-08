<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref<any>(null)
const recentTeams = ref<any[]>([])
const loading = ref(true)
const deletingTeamId = ref<number | null>(null)
const actionError = ref('')

const authHeader = () => {
  const token = localStorage.getItem('admin_token')
  return { Authorization: `Basic ${token}` }
}

const fetchDashboard = async () => {
  const res = await axios.get('/api/admin/dashboard', { headers: authHeader() })
  stats.value = res.data
}

const fetchRecentTeams = async () => {
  const res = await axios.get('/api/admin/teams', { headers: authHeader() })
  recentTeams.value = res.data.slice(0, 12)
}

const deleteTeam = async (team: any) => {
  if (!confirm(`确认删除用户「${team.leader_email}」？此操作不可撤销，相关文件将一并删除。`)) return
  actionError.value = ''
  deletingTeamId.value = team.id
  try {
    await axios.delete(`/api/admin/teams/${team.id}`, { headers: authHeader() })
    await Promise.all([fetchDashboard(), fetchRecentTeams()])
  } catch (e: any) {
    actionError.value = e.response?.data?.detail || '删除失败'
  } finally {
    deletingTeamId.value = null
  }
}

onMounted(async () => {
  try {
    await Promise.all([fetchDashboard(), fetchRecentTeams()])
  } finally {
    loading.value = false
  }
})

const trackColors = ['#003366','#0055a5','#0077cc','#3399dd','#66bbee']
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">数据概览</h2>

    <div v-if="loading" class="text-gray-500">加载中...</div>
    <div v-else-if="stats">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
          <div class="text-4xl">👥</div>
          <div>
            <p class="text-sm text-gray-500">总报名队伍</p>
            <p class="text-3xl font-bold text-brand-blue">{{ stats.total_teams }}</p>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
          <div class="text-4xl">📁</div>
          <div>
            <p class="text-sm text-gray-500">已上传文件</p>
            <p class="text-3xl font-bold text-brand-blue">{{ stats.total_files }}</p>
          </div>
        </div>
      </div>

      <!-- By Track -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">各赛道报名数</h3>
          <div class="space-y-3">
            <div v-for="(item, idx) in stats.by_track" :key="item.track">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600 truncate max-w-xs">{{ item.track }}</span>
                <span class="font-semibold text-gray-800">{{ item.count }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" :style="{
                  width: stats.total_teams ? (Number(item.count) / Number(stats.total_teams) * 100) + '%' : '0%',
                  backgroundColor: trackColors[(idx as number) % trackColors.length]
                }"></div>
              </div>
            </div>
            <div v-if="!stats.by_track.length" class="text-gray-400 text-sm">暂无数据</div>
          </div>
        </div>

        <!-- By Nationality -->
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">国籍分布 Top 15</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="item in stats.by_nationality" :key="item.nationality" class="flex justify-between text-sm">
              <span class="text-gray-600">{{ item.nationality }}</span>
              <span class="font-semibold text-gray-800">{{ item.count }}</span>
            </div>
            <div v-if="!stats.by_nationality.length" class="text-gray-400 text-sm">暂无数据</div>
          </div>
        </div>
      </div>

      <!-- By School + By Date -->
      <div class="grid grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">机构分布 Top 10</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="item in stats.by_school" :key="item.school" class="flex justify-between text-sm">
              <span class="text-gray-600 truncate max-w-xs">{{ item.school }}</span>
              <span class="font-semibold text-gray-800">{{ item.count }}</span>
            </div>
            <div v-if="!stats.by_school.length" class="text-gray-400 text-sm">暂无数据</div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">注册时间趋势</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="item in stats.by_date" :key="item.date" class="flex justify-between text-sm">
              <span class="text-gray-600">{{ item.date }}</span>
              <span class="font-semibold text-gray-800">+{{ item.count }}</span>
            </div>
            <div v-if="!stats.by_date.length" class="text-gray-400 text-sm">暂无数据</div>
          </div>
        </div>
      </div>

      <!-- User Management -->
      <div class="mt-6 bg-white rounded-lg shadow p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-700">最近注册用户（支持删除）</h3>
          <span class="text-xs text-gray-400">共 {{ recentTeams.length }} 条</span>
        </div>
        <p v-if="actionError" class="mb-3 text-sm text-red-600">{{ actionError }}</p>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">ID</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">队长</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">邮箱</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">队伍</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">注册时间</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="team in recentTeams" :key="team.id" class="hover:bg-gray-50">
                <td class="px-3 py-2 text-gray-500">{{ team.id }}</td>
                <td class="px-3 py-2 text-gray-700">{{ team.leader_name || '-' }}</td>
                <td class="px-3 py-2 text-gray-700">{{ team.leader_email }}</td>
                <td class="px-3 py-2 text-gray-700">{{ team.name || '-' }}</td>
                <td class="px-3 py-2 text-gray-500">{{ team.created_at?.slice(0, 19) }}</td>
                <td class="px-3 py-2">
                  <button
                    @click="deleteTeam(team)"
                    :disabled="deletingTeamId === team.id"
                    class="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                  >
                    {{ deletingTeamId === team.id ? '删除中...' : '删除用户' }}
                  </button>
                </td>
              </tr>
              <tr v-if="!recentTeams.length">
                <td colspan="6" class="px-3 py-6 text-center text-gray-400">暂无可管理用户</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
