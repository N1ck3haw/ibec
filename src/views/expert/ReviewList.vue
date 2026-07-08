<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'
import axios from 'axios'

const router = useRouter()
const { isEnglish } = useLanguage()
const teams = ref<any[]>([])
const loading = ref(true)

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('expert_token')}` })

const trackLabel = (track: string) => {
  const map: Record<string, string> = {
    'AI-driven Life Science Discovery': 'AI驱动的生命科学发现',
    'Novel Bioinformatics Algorithms / Methods': '新型生物信息学算法/方法',
    'Novel Bioinformatics Algorithms/methods': '新型生物信息学算法/方法',
    'Bioinformatics Resources / Platforms': '生物信息学资源/平台',
    'Bio-engineering Applications': '生物工程应用实现',
    'Novel Bioinformatic Algorithm / Method': '新型生物信息学算法/方法',
    'Bioinformatic Resource / Platform': '生物信息学资源/平台',
    'Bio-engineering (Real-world Implementation)': '生物工程应用实现',
  }
  return isEnglish.value ? track : (map[track] || track)
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/expert/teams', { headers: authHeader() })
    teams.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-2">{{ isEnglish ? 'Projects for Review' : '待评审项目' }}</h2>
    <p class="text-sm text-gray-500 mb-6">{{ isEnglish ? 'Blind review — team names are hidden.' : '盲审模式 — 队伍名称已隐藏。' }}</p>

    <div v-if="loading" class="text-gray-500 py-8 text-center">{{ isEnglish ? 'Loading...' : '加载中...' }}</div>
    <div v-else class="space-y-4">
      <div v-for="team in teams" :key="team.id"
        class="bg-white rounded-lg shadow p-5 flex items-start justify-between hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push(`/expert/review/${team.id}`)">
        <div class="flex-1 pr-4">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-xs bg-blue-100 text-brand-blue font-semibold px-2 py-0.5 rounded-full">{{ trackLabel(team.track) }}</span>
            <span v-if="team.scored" class="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
              {{ isEnglish ? 'Scored' : '已评分' }} · {{ team.total_score?.toFixed(1) }}
            </span>
            <span v-else class="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
              {{ isEnglish ? 'Pending' : '待评分' }}
            </span>
          </div>
          <h3 class="text-base font-semibold text-gray-800 mb-1">{{ team.project_title }}</h3>
          <p class="text-sm text-gray-500 line-clamp-2">{{ team.abstract }}</p>
        </div>
        <div class="text-brand-blue text-sm font-medium whitespace-nowrap">
          {{ isEnglish ? 'Review →' : '评审 →' }}
        </div>
      </div>
      <div v-if="!teams.length" class="text-center py-12 text-gray-400">
        {{ isEnglish ? 'No projects available for review.' : '暂无可评审项目。' }}
      </div>
    </div>

    <!-- Summary -->
    <div class="mt-6 bg-white rounded-lg shadow p-4 text-sm text-gray-600">
      {{ isEnglish ? 'Total' : '共' }} {{ teams.length }} {{ isEnglish ? 'projects' : '个项目' }}，
      {{ isEnglish ? 'scored' : '已评分' }} {{ teams.filter(t => t.scored).length }}，
      {{ isEnglish ? 'pending' : '待评分' }} {{ teams.filter(t => !t.scored).length }}
    </div>
  </div>
</template>
