<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('admin_token')}` })

const tab = ref<'teams' | 'experts'>('teams')
const teamScores = ref<any[]>([])
const expertScores = ref<any[]>([])
const loading = ref(true)

const selectedTeam = ref<any>(null)
const teamDetail = ref<any[]>([])
const detailLoading = ref(false)

const loadData = async () => {
  loading.value = true
  const [t, e] = await Promise.all([
    axios.get('/api/admin/scores/summary', { headers: authHeader() }),
    axios.get('/api/admin/scores/by-expert', { headers: authHeader() }),
  ])
  teamScores.value = t.data
  expertScores.value = e.data
  loading.value = false
}

const openTeam = async (team: any) => {
  selectedTeam.value = team
  detailLoading.value = true
  const res = await axios.get(`/api/admin/scores/by-team/${team.id}`, { headers: authHeader() })
  teamDetail.value = res.data
  detailLoading.value = false
}

onMounted(loadData)
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">评审结果</h2>

    <!-- Tabs -->
    <div class="flex space-x-2 mb-6">
      <button @click="tab = 'teams'" :class="tab === 'teams' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 border'" class="px-4 py-2 rounded-md text-sm font-medium">
        按队伍查看
      </button>
      <button @click="tab = 'experts'" :class="tab === 'experts' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 border'" class="px-4 py-2 rounded-md text-sm font-medium">
        按专家查看
      </button>
    </div>

    <div v-if="loading" class="text-gray-500 py-8 text-center">加载中...</div>

    <!-- Teams tab -->
    <div v-else-if="tab === 'teams'">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">项目名称</th>
              <th class="px-4 py-3 text-left">赛道</th>
              <th class="px-4 py-3 text-center">评分人数</th>
              <th class="px-4 py-3 text-center">平均总分</th>
              <th class="px-4 py-3 text-center">原创性</th>
              <th class="px-4 py-3 text-center">技术性</th>
              <th class="px-4 py-3 text-center">工程化</th>
              <th class="px-4 py-3 text-center">意义</th>
              <th class="px-4 py-3 text-center">可重复</th>
              <th class="px-4 py-3 text-center">详情</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in teamScores" :key="t.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{{ t.project_title }}</td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ t.track }}</td>
              <td class="px-4 py-3 text-center">{{ t.scored_count }}</td>
              <td class="px-4 py-3 text-center font-bold text-brand-blue">{{ t.avg_total ?? '—' }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ t.avg_originality ?? '—' }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ t.avg_technical ?? '—' }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ t.avg_engineering ?? '—' }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ t.avg_significance ?? '—' }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ t.avg_reproducibility ?? '—' }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="openTeam(t)" class="text-brand-blue hover:underline text-xs font-medium">查看</button>
              </td>
            </tr>
            <tr v-if="!teamScores.length">
              <td colspan="10" class="px-4 py-8 text-center text-gray-400">暂无评分数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Team detail modal -->
      <div v-if="selectedTeam" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="selectedTeam = null">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
          <div class="px-6 py-4 border-b flex items-center justify-between">
            <h3 class="font-bold text-gray-800 text-base">{{ selectedTeam.project_title }}</h3>
            <button @click="selectedTeam = null" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <div class="p-6">
            <div v-if="detailLoading" class="text-center text-gray-400 py-6">加载中...</div>
            <div v-else-if="teamDetail.length" class="space-y-4">
              <div v-for="s in teamDetail" :key="s.username" class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-gray-700 text-sm">{{ s.expert_name }} ({{ s.username }})</span>
                  <span class="text-2xl font-bold text-brand-blue">{{ Number(s.total_score).toFixed(1) }}</span>
                </div>
                <div class="grid grid-cols-5 gap-2 text-xs text-center">
                  <div class="bg-white rounded p-1"><p class="text-gray-400">原创性</p><p class="font-bold">{{ s.score_originality }}</p></div>
                  <div class="bg-white rounded p-1"><p class="text-gray-400">技术性</p><p class="font-bold">{{ s.score_technical }}</p></div>
                  <div class="bg-white rounded p-1"><p class="text-gray-400">工程化</p><p class="font-bold">{{ s.score_engineering }}</p></div>
                  <div class="bg-white rounded p-1"><p class="text-gray-400">意义</p><p class="font-bold">{{ s.score_significance }}</p></div>
                  <div class="bg-white rounded p-1"><p class="text-gray-400">可重复</p><p class="font-bold">{{ s.score_reproducibility }}</p></div>
                </div>
                <div v-if="s.comments" class="mt-2 text-xs text-gray-600 bg-white rounded p-2">{{ s.comments }}</div>
                <p class="text-xs text-gray-400 mt-1">{{ s.submitted_at?.slice(0, 19) }}</p>
              </div>
            </div>
            <div v-else class="text-center text-gray-400 py-6">该项目暂无评分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Experts tab -->
    <div v-else-if="tab === 'experts'">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">专家姓名</th>
              <th class="px-4 py-3 text-left">账号</th>
              <th class="px-4 py-3 text-center">已评项目</th>
              <th class="px-4 py-3 text-center">总项目数</th>
              <th class="px-4 py-3 text-center">完成率</th>
              <th class="px-4 py-3 text-center">平均分</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="e in expertScores" :key="e.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">{{ e.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ e.username }}</td>
              <td class="px-4 py-3 text-center">{{ e.scored_count }}</td>
              <td class="px-4 py-3 text-center">{{ e.total_projects }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <div class="w-20 bg-gray-200 rounded-full h-1.5">
                    <div class="bg-brand-blue h-1.5 rounded-full" :style="{ width: e.total_projects ? (e.scored_count / e.total_projects * 100) + '%' : '0%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ e.total_projects ? Math.round(e.scored_count / e.total_projects * 100) : 0 }}%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center font-bold text-brand-blue">{{ e.avg_score ?? '—' }}</td>
            </tr>
            <tr v-if="!expertScores.length">
              <td colspan="6" class="px-4 py-8 text-center text-gray-400">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
