<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLanguage } from '../../composables/useLanguage'
import axios from 'axios'

const { isEnglish } = useLanguage()
const scores = ref<any[]>([])
const loading = ref(true)

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('expert_token')}` })

onMounted(async () => {
  try {
    const res = await axios.get('/api/expert/my-scores', { headers: authHeader() })
    scores.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">{{ isEnglish ? 'My Scores' : '我的评分记录' }}</h2>

    <div v-if="loading" class="text-gray-500 py-8 text-center">{{ isEnglish ? 'Loading...' : '加载中...' }}</div>
    <div v-else-if="scores.length" class="space-y-4">
      <div v-for="s in scores" :key="s.id" class="bg-white rounded-lg shadow p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-base font-semibold text-gray-800">{{ s.project_title }}</h3>
            <span class="text-xs bg-blue-100 text-brand-blue font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">{{ s.track }}</span>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-brand-blue">{{ Number(s.total_score).toFixed(1) }}</p>
            <p class="text-xs text-gray-400">{{ isEnglish ? 'Total' : '总分' }}</p>
          </div>
        </div>

        <!-- Score breakdown -->
        <div class="grid grid-cols-5 gap-2 text-center text-xs mt-3">
          <div class="bg-gray-50 rounded p-2">
            <p class="text-gray-400 mb-1">{{ isEnglish ? 'Originality' : '原创性' }}</p>
            <p class="font-bold text-gray-700">{{ s.score_originality }}</p>
            <p class="text-gray-400">×25%</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-gray-400 mb-1">{{ isEnglish ? 'Technical' : '技术性' }}</p>
            <p class="font-bold text-gray-700">{{ s.score_technical }}</p>
            <p class="text-gray-400">×25%</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-gray-400 mb-1">{{ isEnglish ? 'Engineering' : '工程化' }}</p>
            <p class="font-bold text-gray-700">{{ s.score_engineering }}</p>
            <p class="text-gray-400">×20%</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-gray-400 mb-1">{{ isEnglish ? 'Impact' : '意义' }}</p>
            <p class="font-bold text-gray-700">{{ s.score_significance }}</p>
            <p class="text-gray-400">×20%</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-gray-400 mb-1">{{ isEnglish ? 'Reprod.' : '可重复' }}</p>
            <p class="font-bold text-gray-700">{{ s.score_reproducibility }}</p>
            <p class="text-gray-400">×10%</p>
          </div>
        </div>

        <div v-if="s.comments" class="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-3">
          <span class="font-medium text-gray-500">{{ isEnglish ? 'Comments: ' : '评语：' }}</span>{{ s.comments }}
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ isEnglish ? 'Submitted' : '提交时间' }}: {{ s.submitted_at?.slice(0,19) }}</p>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">
      {{ isEnglish ? 'No scores submitted yet.' : '暂无评分记录。' }}
    </div>
  </div>
</template>
