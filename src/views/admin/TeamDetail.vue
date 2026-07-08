<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const team = ref<any>(null)
const loading = ref(true)

const authHeader = () => ({ Authorization: `Basic ${localStorage.getItem('admin_token')}` })

onMounted(async () => {
  try {
    const res = await axios.get(`/api/admin/teams/${route.params.id}`, { headers: authHeader() })
    team.value = res.data
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

const parseJson = (val: any) => {
  if (!val) return []
  try { return typeof val === 'string' ? JSON.parse(val) : val } catch { return [] }
}
</script>

<template>
  <div class="p-6">
    <button @click="router.back()" class="text-brand-blue text-sm hover:underline mb-4 inline-block">← 返回列表</button>

    <div v-if="loading" class="text-gray-500">加载中...</div>
    <div v-else-if="team" class="space-y-6">
      <h2 class="text-xl font-bold text-gray-800">队伍详情 #{{ team.id }}</h2>

      <!-- Basic Info -->
      <div class="bg-white rounded-lg shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-3 border-b pb-2">队长信息</h3>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div><span class="text-gray-500">姓名：</span><span class="font-medium">{{ team.leader_name }}</span></div>
          <div><span class="text-gray-500">邮箱：</span><span>{{ team.leader_email }}</span></div>
          <div><span class="text-gray-500">性别：</span><span>{{ team.leader_gender }}</span></div>
          <div><span class="text-gray-500">国籍：</span><span>{{ team.leader_nationality }}</span></div>
          <div><span class="text-gray-500">电话：</span><span>{{ team.leader_phone }}</span></div>
          <div><span class="text-gray-500">机构：</span><span>{{ team.leader_school_unit }}</span></div>
          <div><span class="text-gray-500">专业：</span><span>{{ team.leader_major_job }}</span></div>
          <div><span class="text-gray-500">学历：</span><span>{{ team.leader_degree_position }}</span></div>
          <div><span class="text-gray-500">注册时间：</span><span>{{ team.created_at?.slice(0,19) }}</span></div>
        </div>
      </div>

      <!-- Submission Info -->
      <div class="bg-white rounded-lg shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-3 border-b pb-2">提交信息</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-gray-500">队伍名称：</span><span class="font-medium">{{ team.name || '-' }}</span></div>
          <div><span class="text-gray-500">赛道：</span><span>{{ team.track || '-' }}</span></div>
          <div class="col-span-2"><span class="text-gray-500">项目标题：</span><span class="font-medium">{{ team.project_title || '-' }}</span></div>
          <div class="col-span-2"><span class="text-gray-500">摘要：</span><span>{{ team.abstract || '-' }}</span></div>
        </div>
        <div v-if="team.links_json" class="mt-3 text-sm space-y-1">
          <div v-if="parseJson(team.links_json).github"><span class="text-gray-500">GitHub：</span><a :href="parseJson(team.links_json).github" target="_blank" class="text-brand-blue hover:underline">{{ parseJson(team.links_json).github }}</a></div>
          <div v-if="parseJson(team.links_json).video"><span class="text-gray-500">视频：</span><a :href="parseJson(team.links_json).video" target="_blank" class="text-brand-blue hover:underline">{{ parseJson(team.links_json).video }}</a></div>
        </div>
      </div>

      <!-- Members & Advisors -->
      <div class="bg-white rounded-lg shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-3 border-b pb-2">队员信息 ({{ parseJson(team.members_json).length }})</h3>
        <div v-if="parseJson(team.members_json).length" class="space-y-3">
          <div v-for="(m, i) in parseJson(team.members_json)" :key="i" class="bg-gray-50 rounded px-4 py-3 text-sm grid grid-cols-3 gap-2">
            <div><span class="text-gray-500">姓名：</span><span class="font-medium">{{ typeof m === 'string' ? JSON.parse(m).name : m.name }}</span></div>
            <div><span class="text-gray-500">邮箱：</span><span>{{ typeof m === 'string' ? JSON.parse(m).email : m.email }}</span></div>
            <div><span class="text-gray-500">学校：</span><span>{{ typeof m === 'string' ? JSON.parse(m).school_unit : m.school_unit }}</span></div>
            <div><span class="text-gray-500">专业：</span><span>{{ typeof m === 'string' ? JSON.parse(m).major_job : m.major_job }}</span></div>
            <div><span class="text-gray-500">学历：</span><span>{{ typeof m === 'string' ? JSON.parse(m).degree_position : m.degree_position }}</span></div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm">暂无队员信息</p>
      </div>

      <div class="bg-white rounded-lg shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-3 border-b pb-2">指导老师 ({{ parseJson(team.advisors_json).length }})</h3>
        <div v-if="parseJson(team.advisors_json).length" class="space-y-3">
          <div v-for="(a, i) in parseJson(team.advisors_json)" :key="i" class="bg-gray-50 rounded px-4 py-3 text-sm grid grid-cols-3 gap-2">
            <div><span class="text-gray-500">姓名：</span><span class="font-medium">{{ typeof a === 'string' ? JSON.parse(a).name : a.name }}</span></div>
            <div><span class="text-gray-500">邮箱：</span><span>{{ typeof a === 'string' ? JSON.parse(a).email : a.email }}</span></div>
            <div><span class="text-gray-500">学校：</span><span>{{ typeof a === 'string' ? JSON.parse(a).school_unit : a.school_unit }}</span></div>
            <div><span class="text-gray-500">职位：</span><span>{{ typeof a === 'string' ? JSON.parse(a).degree_position : a.degree_position }}</span></div>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm">暂无指导老师信息</p>
      </div>

      <!-- Files -->
      <div class="bg-white rounded-lg shadow p-5">
        <h3 class="font-semibold text-gray-700 mb-3 border-b pb-2">上传文件 ({{ team.files?.length || 0 }})</h3>
        <div v-if="team.files?.length" class="space-y-2">
          <div v-for="f in team.files" :key="f.id" class="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
            <div>
              <span class="font-medium text-gray-800">{{ f.original_filename }}</span>
              <span class="text-gray-400 ml-2 text-xs">v{{ f.version }} · {{ f.created_at?.slice(0,19) }}</span>
            </div>
            <button @click="downloadFile(f.id, f.original_filename)" class="text-brand-blue hover:underline text-xs font-medium">下载</button>
          </div>
        </div>
        <p v-else class="text-gray-400 text-sm">暂无上传文件</p>
      </div>
    </div>
  </div>
</template>
