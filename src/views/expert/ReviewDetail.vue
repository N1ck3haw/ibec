<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const { isEnglish } = useLanguage()
const team = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)
const success = ref('')
const error = ref('')

const scores = ref({
  score_originality: 0,
  score_technical: 0,
  score_engineering: 0,
  score_significance: 0,
  score_reproducibility: 0,
  comments: ''
})

const tiers = [
  { key: 'outstanding',       min: 90, max: 100, zh: '卓越',  en: 'Outstanding',       descZh: '表现远超预期，在创意、完成度与专业性上均属典范。',             descEn: 'Performance far exceeds expectations, exemplary in creativity, completeness, and professionalism.' },
  { key: 'excellent',         min: 80, max: 89,  zh: '优秀',  en: 'Excellent',          descZh: '整体表现突出，关键环节处理出色，具备较高水准。',               descEn: 'Overall performance is prominent, with excellent handling of key aspects and a high standard.' },
  { key: 'good',              min: 70, max: 79,  zh: '良好',  en: 'Good',               descZh: '达到竞赛基本要求，完成度较好，表现稳定。',                     descEn: 'Meets the basic requirements of the competition, with good completeness and stable performance.' },
  { key: 'satisfactory',      min: 60, max: 69,  zh: '合格',  en: 'Satisfactory',       descZh: '符合基本规范，但存在提升空间，整体可接受。',                   descEn: 'Complies with basic standards, with room for improvement, overall acceptable.' },
  { key: 'needs_improvement', min: 0,  max: 59,  zh: '需改进', en: 'Needs Improvement', descZh: '未完全达到竞赛预期，建议参考反馈进一步优化。',                 descEn: 'Does not fully meet competition expectations, suggests further optimization based on feedback.' },
]

const scoreKeys = ['score_originality', 'score_technical', 'score_engineering', 'score_significance', 'score_reproducibility']

const selectedTiers = ref<Record<string, string | null>>(
  Object.fromEntries(scoreKeys.map(k => [k, null]))
)

const getTier = (key: string) => tiers.find(t => t.key === selectedTiers.value[key]) ?? null

const selectTier = (key: string, tierKey: string) => {
  selectedTiers.value[key] = tierKey
  const tier = tiers.find(t => t.key === tierKey)!
  const cur = (scores.value as any)[key] as number
  if (cur < tier.min || cur > tier.max) {
    (scores.value as any)[key] = tier.min
  }
}

const initTiers = () => {
  scoreKeys.forEach(key => {
    const val = (scores.value as any)[key] as number
    if (val === 0) return  // 未评分时不预选档位
    const tier = tiers.find(t => val >= t.min && val <= t.max)
    if (tier) selectedTiers.value[key] = tier.key
  })
}

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('expert_token')}` })

const criteria = computed(() => [
  {
    key: 'score_originality',
    label: isEnglish.value ? 'Originality & Innovation (25%)' : '原创性与创新性（25%）',
    desc: isEnglish.value
      ? 'Degree of innovation in methods, models, applications or concepts; whether new ideas or breakthroughs are proposed.'
      : '方法、模型、应用或概念的创新程度，是否提出新思路或取得实质性突破。',
    weight: 0.25
  },
  {
    key: 'score_technical',
    label: isEnglish.value ? 'Technical Rigor (25%)' : '技术严谨性（25%）',
    desc: isEnglish.value
      ? 'Soundness of methodology, solidity of theoretical foundation, and adherence to rigorous scientific standards.'
      : '方法学的合理性、理论基础的扎实性，以及是否遵循严格的科学规范。',
    weight: 0.25
  },
  {
    key: 'score_engineering',
    label: isEnglish.value ? 'Engineering Design & Transferability (20%)' : '工程化设计与转化潜力（20%）',
    desc: isEnglish.value
      ? 'Modularity, usability, efficiency optimization, and practical feasibility of the system.'
      : '系统的模块化、可用性、效能优化程度及实际落地可行性。',
    weight: 0.20
  },
  {
    key: 'score_significance',
    label: isEnglish.value ? 'Scientific & Social Impact (20%)' : '科学与社会意义（20%）',
    desc: isEnglish.value
      ? 'Potential value of the project in addressing major challenges in academia, industry, or society.'
      : '项目在学术、工业或社会层面应对重大挑战的潜在价值。',
    weight: 0.20
  },
  {
    key: 'score_reproducibility',
    label: isEnglish.value ? 'Reproducibility & Data Transparency (10%)' : '可重复性与数据透明度（10%）',
    desc: isEnglish.value
      ? 'Clarity and completeness of workflows, code and data; ease of reproduction.'
      : '工作流程、代码与数据的清晰完整程度，是否易于复现。',
    weight: 0.10
  },
])

const totalScore = computed(() => {
  return criteria.value.reduce((sum, c) => {
    return sum + (scores.value[c.key as keyof typeof scores.value] as number) * c.weight
  }, 0)
})

const downloadFile = async (fileId: number, filename: string) => {
  const res = await axios.get(`/api/expert/files/${fileId}/download`, {
    headers: authHeader(), responseType: 'blob'
  })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

const submitScore = async () => {
  error.value = ''
  success.value = ''
  const missingTierKey = scoreKeys.find(key => !selectedTiers.value[key])
  if (missingTierKey) {
    error.value = isEnglish.value ? 'Please select a tier for every criterion before submitting.' : '提交前请先为每个评分维度选择档位。'
    return
  }
  for (const key of scoreKeys) {
    const tier = getTier(key)
    const value = (scores.value as any)[key] as number
    if (!tier || value < tier.min || value > tier.max) {
      error.value = isEnglish.value
        ? 'Detected a score outside the selected tier range. Please adjust and submit again.'
        : '检测到分值超出已选档位区间，请调整后再提交。'
      return
    }
  }
  submitting.value = true
  try {
    await axios.post('/api/expert/scores', {
      team_id: team.value.id,
      ...scores.value,
    }, { headers: authHeader() })
    success.value = isEnglish.value ? 'Score submitted successfully!' : '评分提交成功！'
    setTimeout(() => router.push('/expert/list'), 1500)
  } catch (e: any) {
    error.value = e.response?.data?.detail || (isEnglish.value ? 'Submission failed' : '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await axios.get(`/api/expert/teams/${route.params.id}`, { headers: authHeader() })
    team.value = res.data
    if (res.data.existing_score) {
      const s = res.data.existing_score
      scores.value.score_originality = s.score_originality
      scores.value.score_technical = s.score_technical
      scores.value.score_engineering = s.score_engineering
      scores.value.score_significance = s.score_significance
      scores.value.score_reproducibility = s.score_reproducibility
      scores.value.comments = s.comments || ''
    }
    initTiers()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <button @click="router.back()" class="text-brand-blue text-sm hover:underline mb-4 inline-block">
      ← {{ isEnglish ? 'Back to list' : '返回列表' }}
    </button>

    <div v-if="loading" class="text-gray-500 py-8 text-center">{{ isEnglish ? 'Loading...' : '加载中...' }}</div>
    <div v-else-if="team" class="space-y-6">

      <!-- Project Info -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center space-x-2 mb-3">
          <span class="text-xs bg-blue-100 text-brand-blue font-semibold px-2 py-0.5 rounded-full">{{ team.track }}</span>
          <span v-if="team.existing_score" class="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
            {{ isEnglish ? 'Previously scored' : '已有评分，可修改' }}
          </span>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-3">{{ team.project_title }}</h2>
        <p class="text-sm text-gray-600 leading-relaxed">{{ team.abstract }}</p>

        <!-- Links -->
        <div v-if="team.links?.github || team.links?.video" class="mt-4 space-y-1 text-sm">
          <div v-if="team.links.github">
            <span class="text-gray-500">GitHub: </span>
            <a :href="team.links.github" target="_blank" class="text-brand-blue hover:underline">{{ team.links.github }}</a>
          </div>
          <div v-if="team.links.video">
            <span class="text-gray-500">{{ isEnglish ? 'Video: ' : '视频：' }}</span>
            <a :href="team.links.video" target="_blank" class="text-brand-blue hover:underline">{{ team.links.video }}</a>
          </div>
        </div>

        <!-- Files -->
        <div v-if="team.files?.length" class="mt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">{{ isEnglish ? 'Submitted Files' : '提交文件' }}</p>
          <div class="space-y-2">
            <div v-for="f in team.files" :key="f.id" class="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
              <span class="text-gray-700">{{ f.original_filename }} <span class="text-gray-400 text-xs">v{{ f.version }}</span></span>
              <button @click="downloadFile(f.id, f.original_filename)"
                class="text-brand-blue hover:underline text-xs font-medium">
                {{ isEnglish ? 'Download' : '下载' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Scoring Form -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-1">{{ isEnglish ? 'Scoring' : '评分' }}</h3>
        <p class="text-sm text-gray-500 mb-6">{{ isEnglish ? 'Score each criterion from 0 to 100.' : '请对每项指标打分（0-100分）。' }}</p>

        <!-- tier instruction -->
        <p class="text-sm text-gray-500 mb-4 italic">
          {{ isEnglish ? 'Select a tier first, then fine-tune the score within that range.' : '请先选择档位，再在该档区间内微调分值。' }}
        </p>
        <div class="mb-5 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
          <p class="text-sm font-semibold text-gray-600 mb-2">
            {{ isEnglish ? 'Scoring Arrangement (Five-Tier System)' : '评分安排（五档制）' }}
          </p>
          <div class="space-y-1">
            <div v-for="t in tiers" :key="`legend-${t.key}`" class="text-sm text-gray-500">
              <span class="font-medium text-gray-700">{{ isEnglish ? t.en : t.zh }}</span>
              <span class="mx-1">({{ t.min }}-{{ t.max }})</span>
              <span>{{ isEnglish ? t.descEn : t.descZh }}</span>
            </div>
          </div>
        </div>

        <div class="divide-y divide-gray-200">
          <div v-for="c in criteria" :key="c.key" class="py-6 first:pt-0 last:pb-0">
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-base font-semibold text-gray-700">{{ c.label }}</p>
                <p class="text-sm text-gray-500 mt-0.5">{{ c.desc }}</p>
              </div>
              <span class="text-2xl font-bold text-brand-blue ml-4 w-12 text-right">
                {{ (scores as any)[c.key] }}
              </span>
            </div>

            <!-- tier buttons -->
            <div class="flex flex-wrap gap-2 mb-3">
              <button
                v-for="t in tiers" :key="t.key"
                @click="selectTier(c.key, t.key)"
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium border transition-colors',
                  selectedTiers[c.key] === t.key
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-blue hover:text-brand-blue'
                ]">
                {{ isEnglish ? t.en : t.zh }}
                <span class="ml-1 opacity-70">({{ t.min }}–{{ t.max }})</span>
              </button>
            </div>

            <!-- range slider, locked to tier range -->
            <template v-if="getTier(c.key)">
              <input type="range"
                :min="getTier(c.key)!.min"
                :max="getTier(c.key)!.max"
                step="1"
                v-model.number="(scores as any)[c.key]"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
              <div class="flex justify-between text-sm text-gray-400 mt-0.5">
                <span>{{ getTier(c.key)!.min }}</span>
                <span>{{ getTier(c.key)!.max }}</span>
              </div>
            </template>
            <p v-else class="text-sm text-gray-400 italic">{{ isEnglish ? 'Please select a tier above.' : '请先选择档位。' }}</p>
          </div>
        </div>

        <!-- Total -->
        <div class="mt-6 bg-blue-50 rounded-lg p-4 flex items-center justify-between">
          <span class="text-sm font-semibold text-gray-700">{{ isEnglish ? 'Weighted Total Score' : '加权总分' }}</span>
          <span class="text-3xl font-bold text-brand-blue">{{ totalScore.toFixed(1) }}</span>
        </div>

        <!-- Comments -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ isEnglish ? 'Comments (optional)' : '评语（可选）' }}</label>
          <textarea v-model="scores.comments" rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            :placeholder="isEnglish ? 'Enter your comments...' : '请输入评语...'"></textarea>
        </div>

        <p v-if="error" class="mt-3 text-red-600 text-sm">{{ error }}</p>
        <p v-if="success" class="mt-3 text-green-600 text-sm font-medium">{{ success }}</p>

        <button @click="submitScore" :disabled="submitting"
          class="mt-4 w-full bg-brand-blue text-white py-2.5 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors">
          {{ submitting ? (isEnglish ? 'Submitting...' : '提交中...') : (team.existing_score ? (isEnglish ? 'Update Score' : '更新评分') : (isEnglish ? 'Submit Score' : '提交评分')) }}
        </button>
      </div>
    </div>
  </div>
</template>
