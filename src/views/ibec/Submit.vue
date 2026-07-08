<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'
import AnnouncementBar from '../../components/AnnouncementBar.vue'
import axios from 'axios'

const router = useRouter()
const { isEnglish } = useLanguage()

// Interfaces
interface Person {
  name: string
  email: string
  school_unit: string
  major_job: string
  degree_position: string
}

interface TeamForm {
  team_name: string
  leader: Person
  members: Person[]
  advisors: Person[]
  contact_phone: string
  project_title: string
  project_description: string
  track: string
  github_link: string
  video_link: string
}

// Initial State
const initialPerson: Person = { name: '', email: '', school_unit: '', major_job: '', degree_position: '' }

const form = ref<TeamForm>({
  team_name: '',
  leader: { ...initialPerson },
  members: [{ ...initialPerson }],
  advisors: [{ ...initialPerson }],
  contact_phone: '',
  project_title: '',
  project_description: '',
  track: 'AI-driven Life Science Discovery',
  github_link: '',
  video_link: ''
})

const isReadOnly = ref(false)
const files = ref<any[]>([])
const loading = ref(false)
const uploadLoading = ref(false)
const error = ref('')
const success = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedUploadFilename = ref('')

// Constants
const tracks = [
  { id: 'AI-driven Life Science Discovery', label: { en: 'AI-driven Life Science Discovery', zh: 'AI驱动的生命科学发现' } },
  { id: 'Novel Bioinformatics Algorithms / Methods', label: { en: 'Novel Bioinformatics Algorithms / Methods', zh: '新型生物信息学算法 / 方法' } },
  { id: 'Bioinformatics Resources / Platforms', label: { en: 'Bioinformatics Resources / Platforms', zh: '生物信息学资源 / 平台' } },
  { id: 'Bio-engineering Applications', label: { en: 'Bio-engineering Applications', zh: '生物工程应用实现' } }
]

const majorOptions = [
  { value: 'Computer Science', label: { en: 'Computer Science', zh: '计算机科学' } },
  { value: 'Software Engineering', label: { en: 'Software Engineering', zh: '软件工程' } },
  { value: 'Artificial Intelligence', label: { en: 'Artificial Intelligence', zh: '人工智能' } },
  { value: 'Bioinformatics', label: { en: 'Bioinformatics', zh: '生物信息学' } },
  { value: 'Biological Sciences', label: { en: 'Biological Sciences', zh: '生物科学' } },
  { value: 'Medicine', label: { en: 'Medicine', zh: '医学' } },
  { value: 'Clinical Medicine', label: { en: 'Clinical Medicine', zh: '临床医学' } },
  { value: 'Pharmacy', label: { en: 'Pharmacy', zh: '药学' } },
  { value: 'Chemistry', label: { en: 'Chemistry', zh: '化学' } },
  { value: 'Physics', label: { en: 'Physics', zh: '物理学' } },
  { value: 'Mathematics', label: { en: 'Mathematics', zh: '数学' } },
  { value: 'Statistics', label: { en: 'Statistics', zh: '统计学' } },
  { value: 'Electrical Engineering', label: { en: 'Electrical Engineering', zh: '电气工程' } },
  { value: 'Mechanical Engineering', label: { en: 'Mechanical Engineering', zh: '机械工程' } },
  { value: 'Civil Engineering', label: { en: 'Civil Engineering', zh: '土木工程' } },
  { value: 'Business Administration', label: { en: 'Business Administration', zh: '工商管理' } },
  { value: 'Finance', label: { en: 'Finance', zh: '金融' } },
  { value: 'Economics', label: { en: 'Economics', zh: '经济学' } },
  { value: 'Design', label: { en: 'Design', zh: '设计' } },
  { value: 'Arts', label: { en: 'Arts', zh: '艺术' } }
]

const degreeOptions = [
  { value: 'High School Student', label: { en: 'High School Student', zh: '高中生' } },
  { value: 'Undergraduate Student', label: { en: 'Undergraduate Student', zh: '本科生' } },
  { value: 'Master Student', label: { en: 'Master Student', zh: '硕士生' } },
  { value: 'PhD Student', label: { en: 'PhD Student', zh: '博士生' } },
  { value: 'Postdoc', label: { en: 'Postdoc', zh: '博士后' } },
  { value: 'Lecturer', label: { en: 'Lecturer', zh: '讲师' } },
  { value: 'Assistant Professor', label: { en: 'Assistant Professor', zh: '助理教授' } },
  { value: 'Associate Professor', label: { en: 'Associate Professor', zh: '副教授' } },
  { value: 'Professor', label: { en: 'Professor', zh: '教授' } },
  { value: 'Researcher', label: { en: 'Researcher', zh: '研究员' } },
  { value: 'Engineer', label: { en: 'Engineer', zh: '工程师' } },
  { value: 'Manager', label: { en: 'Manager', zh: '经理' } },
  { value: 'Director', label: { en: 'Director', zh: '总监' } }
]

const currentStep = ref(1)
const stepLabels = computed(() => [
  { id: 1, label: isEnglish.value ? 'Team Info' : '队伍信息' },
  { id: 2, label: isEnglish.value ? 'Personnel Info' : '人员信息' },
  { id: 3, label: isEnglish.value ? 'Project Info' : '作品信息' }
])

const saveDraft = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) return false
        await axios.post('/api/submit', {
            team_identity: 'Student',
            name: form.value.team_name,
            members: form.value.members.map(m => JSON.stringify(m)),
            track: form.value.track,
            advisors: form.value.advisors.map(a => JSON.stringify(a)),
            project_title: form.value.project_title,
            abstract: form.value.project_description,
            github_link: form.value.github_link,
            video_link: form.value.video_link,
        }, { headers: { Authorization: `Bearer ${token}` } })
        return true
    } catch (e) {
        console.error("Save draft failed", e)
        return false
    }
}

const nextStep = async () => {
    error.value = ''
    let validationError = ''
    
    if (currentStep.value === 1) {
        if (form.value.team_name.length < 2 || form.value.team_name.length > 50) validationError = labels.value.team_name + ' ' + labels.value.length_error
    } else if (currentStep.value === 2) {
        // Validate Personnel
        if (!emailRegex.test(form.value.leader.email)) validationError = labels.value.leader_info + ': ' + labels.value.email_invalid
        for (let i = 0; i < form.value.members.length; i++) {
            const m = form.value.members[i]
            if (!m.name || !m.email || !m.school_unit || !m.major_job || !m.degree_position) validationError = labels.value.member_info + ' ' + (i+1) + ': ' + labels.value.required_msg
            if (!emailRegex.test(m.email)) validationError = labels.value.member_info + ' ' + (i+1) + ': ' + labels.value.email_invalid
        }
        for (let i = 0; i < form.value.advisors.length; i++) {
            const a = form.value.advisors[i]
            if (!a.name || !a.email || !a.school_unit || !a.major_job || !a.degree_position) validationError = labels.value.advisor_info + ' ' + (i+1) + ': ' + labels.value.required_msg
            if (!emailRegex.test(a.email)) validationError = labels.value.advisor_info + ' ' + (i+1) + ': ' + labels.value.email_invalid
        }
    }

    if (validationError) {
        error.value = validationError
        window.scrollTo(0, 0)
        return
    }

    // Save Draft
    loading.value = true
    await saveDraft()
    loading.value = false
    
    currentStep.value++
    window.scrollTo(0, 0)
}

const prevStep = () => {
    currentStep.value--
    window.scrollTo(0, 0)
}


// Labels
const labels = computed(() => ({
  page_title: isEnglish.value ? 'Project Submission' : '作品提交',
  team_info: isEnglish.value ? 'Team Information' : '队伍信息',
  project_info: isEnglish.value ? 'Project Information' : '作品信息',
  
  team_name: isEnglish.value ? 'Team Name (2-50 chars)' : '队伍名称 (2-50字符)',
  contact_phone: isEnglish.value ? 'Contact Phone' : '联系电话',
  
  leader_info: isEnglish.value ? 'Team Leader' : '队长信息',
  member_info: isEnglish.value ? 'Team Members (1-10)' : '队员信息 (1-10人)',
  advisor_info: isEnglish.value ? 'Advisors (1-2)' : '指导教师 (1-2人)',
  
  name: isEnglish.value ? 'Name' : '姓名',
  email: isEnglish.value ? 'Email' : '电子邮箱',
  school_unit: isEnglish.value ? 'School / Unit' : '学校 / 单位名称',
  major_job: isEnglish.value ? 'Major / Job' : '专业 / 职业',
  degree_position: isEnglish.value ? 'Degree / Position' : '最高学历 / 职位',
  
  project_title: isEnglish.value ? 'Project Title' : '项目标题',
  project_description: isEnglish.value ? 'Project Description (Max 500 chars)' : '项目简介 (500字以内)',
  track: isEnglish.value ? 'Track' : '参赛赛道',
  github: isEnglish.value ? 'GitHub Repository Link (Optional)' : 'GitHub 代码仓库链接 (可选)',
  video: isEnglish.value ? 'Demo Video Link (Optional)' : '演示视频链接 (可选)',
  
  add: isEnglish.value ? 'Add' : '添加',
  remove: isEnglish.value ? 'Remove' : '移除',
  save: isEnglish.value ? 'Save Submission' : '保存提交',
  saving: isEnglish.value ? 'Saving...' : '保存中...',
  modify: isEnglish.value ? 'Modify' : '修改',
  preview_mode: isEnglish.value ? 'Preview Mode (Read-only)' : '预览模式 (只读)',
  
  file_upload: isEnglish.value ? 'File Upload (ZIP or RAR)' : '文件上传 (支持ZIP或RAR格式)',
  upload_desc: isEnglish.value ? 'Uploads before Sep 30, 2026 can be repeated; new files cover old ones. Supported formats: ZIP, RAR.' : '2026年9月30日提交截止前可以重复上传，新上传文件将自动覆盖旧版本。支持格式：ZIP、RAR。',
  upload_btn: isEnglish.value ? 'Upload File' : '上传文件',
  uploading: isEnglish.value ? 'Uploading...' : '上传中...',
  choose_file: isEnglish.value ? 'Choose File' : '选择文件',
  no_file_selected: isEnglish.value ? 'No file selected' : '未选择任何文件',
  submitted_files: isEnglish.value ? 'Submitted Files' : '已提交文件列表',
  filename: isEnglish.value ? 'Filename' : '文件名',
  version: isEnglish.value ? 'Version' : '版本',
  date: isEnglish.value ? 'Date' : '日期',
  action: isEnglish.value ? 'Action' : '操作',
  download: isEnglish.value ? 'Download' : '下载',
  delete: isEnglish.value ? 'Delete' : '删除',
  no_files: isEnglish.value ? 'No files uploaded yet.' : '暂无上传文件。',
  
  deadline_msg: isEnglish.value ? 'Time Remaining:' : '距离2026年9月30日提交截止还有剩余：',
  warning_msg: isEnglish.value ? 'Warning: Submission deadline is approaching!' : '提醒：提交截止日期临近！',
  
  required_msg: isEnglish.value ? 'This field is required' : '此项必填',
  email_invalid: isEnglish.value ? 'Invalid email format' : '邮箱格式无效',
  phone_invalid: isEnglish.value ? 'Invalid phone format' : '手机号格式无效',
  length_error: isEnglish.value ? 'Length requirement not met' : '长度不符合要求',
  next: isEnglish.value ? 'Next' : '下一步',
  prev: isEnglish.value ? 'Previous' : '上一步',
  confirm: isEnglish.value ? 'Confirm' : '确认',
}))

// Validation Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^1[3-9]\d{9}$|^(\d{3,4}-)?\d{7,8}$/ // Supports CN mobile and landline

// Fetch Data
const fetchTeam = async (forEdit = false) => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }
  try {
    const res = await axios.get('/api/team', { headers: { Authorization: `Bearer ${token}` } })
    const user = res.data
    form.value.leader.name = user.leader_name || ''
    form.value.leader.email = user.leader_email || ''
    form.value.leader.school_unit = user.leader_school_unit || ''
    form.value.leader.major_job = user.leader_major_job || ''
    form.value.leader.degree_position = user.leader_degree_position || ''
    form.value.contact_phone = user.leader_phone || ''
    if (user.name) form.value.team_name = user.name
    if (user.track) form.value.track = user.track
    if (user.project_title) form.value.project_title = user.project_title
    if (user.abstract) form.value.project_description = user.abstract
    if (user.links?.github) form.value.github_link = user.links.github
    if (user.links?.video) form.value.video_link = user.links.video
    if (user.members?.length) {
      try { form.value.members = user.members.map((m: any) => typeof m === 'string' ? JSON.parse(m) : m) } catch {}
    }
    if (user.advisors?.length) {
      try { form.value.advisors = user.advisors.map((a: any) => typeof a === 'string' ? JSON.parse(a) : a) } catch {}
    }
    // If already submitted, show preview mode (skip if entering edit mode)
    if (user.project_title && !forEdit) {
      isReadOnly.value = true
      currentStep.value = 3
    }
    fetchFiles()
  } catch (e) {
    console.error(e)
    router.push('/login')
  }
}

const enterEditMode = async () => {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  try {
    const res = await axios.get('/api/team', { headers: { Authorization: `Bearer ${token}` } })
    const user = res.data
    form.value.leader.name = user.leader_name || ''
    form.value.leader.email = user.leader_email || ''
    form.value.leader.school_unit = user.leader_school_unit || ''
    form.value.leader.major_job = user.leader_major_job || ''
    form.value.leader.degree_position = user.leader_degree_position || ''
    form.value.contact_phone = user.leader_phone || ''
    if (user.name) form.value.team_name = user.name
    if (user.track) form.value.track = user.track
    if (user.project_title) form.value.project_title = user.project_title
    if (user.abstract) form.value.project_description = user.abstract
    if (user.links?.github) form.value.github_link = user.links.github
    if (user.links?.video) form.value.video_link = user.links.video
    if (user.members?.length) {
      try { form.value.members = user.members.map((m: any) => typeof m === 'string' ? JSON.parse(m) : m) } catch {}
    }
    if (user.advisors?.length) {
      try { form.value.advisors = user.advisors.map((a: any) => typeof a === 'string' ? JSON.parse(a) : a) } catch {}
    }
  } catch (e) {
    console.error(e)
    return
  }
  isReadOnly.value = false
  currentStep.value = 1
}

const fetchFiles = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await axios.get('/api/files', { headers: { Authorization: `Bearer ${token}` } })
    files.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// Form Management
const addMember = () => {
  if (form.value.members.length < 10) {
      form.value.members.push({ ...initialPerson })
  }
}
const removeMember = (index: number) => {
  if (form.value.members.length > 1) {
      form.value.members.splice(index, 1)
  }
}
const addAdvisor = () => {
  if (form.value.advisors.length < 2) { // Max 2 advisors? User said "at least 1, at most 5" for members. Wait.
      // User said: "at least 1, at most 5 members".
      // User said: "Advisor info (Name...)" - didn't specify count limit here, but in previous prompt said "at least 1, max 2". 
      // Current prompt doesn't specify max advisors, but implies plural. I'll stick to 1-2 as per previous or general logic.
      // Actually previous prompt said "at least 1, max 2". Current prompt says "Advisor Info...".
      // I will allow adding up to 2 for now.
      form.value.advisors.push({ ...initialPerson })
  }
}
const removeAdvisor = (index: number) => {
  if (form.value.advisors.length > 1) {
      form.value.advisors.splice(index, 1)
  }
}

// Validation Logic
const validateForm = () => {
    if (form.value.team_name.length < 2 || form.value.team_name.length > 50) return labels.value.team_name + ' ' + labels.value.length_error
    if (!emailRegex.test(form.value.leader.email)) return labels.value.leader_info + ': ' + labels.value.email_invalid
    for (let i = 0; i < form.value.members.length; i++) {
        const m = form.value.members[i]
        if (!m.name || !m.email || !m.school_unit || !m.major_job || !m.degree_position) return labels.value.member_info + ' ' + (i+1) + ': ' + labels.value.required_msg
        if (!emailRegex.test(m.email)) return labels.value.member_info + ' ' + (i+1) + ': ' + labels.value.email_invalid
    }
    for (let i = 0; i < form.value.advisors.length; i++) {
        const a = form.value.advisors[i]
        if (!a.name || !a.email || !a.school_unit || !a.major_job || !a.degree_position) return labels.value.advisor_info + ' ' + (i+1) + ': ' + labels.value.required_msg
        if (!emailRegex.test(a.email)) return labels.value.advisor_info + ' ' + (i+1) + ': ' + labels.value.email_invalid
    }
    if (!form.value.project_title) return labels.value.project_title + ': ' + labels.value.required_msg
    if (!form.value.project_description || form.value.project_description.length > 500) return labels.value.project_description + ': ' + labels.value.length_error
    return ''
}

const submit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  const validationError = validateForm()
  if (validationError) {
      error.value = validationError
      loading.value = false
      window.scrollTo(0, 0)
      return
  }

  try {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    await axios.post('/api/submit', {
        team_identity: 'Student',
        name: form.value.team_name,
        members: form.value.members.map(m => JSON.stringify(m)),
        track: form.value.track,
        advisors: form.value.advisors.map(a => JSON.stringify(a)),
        project_title: form.value.project_title,
        abstract: form.value.project_description,
        github_link: form.value.github_link,
        video_link: form.value.video_link,
    }, { headers: { Authorization: `Bearer ${token}` } })
    success.value = isEnglish.value ? 'Submission updated successfully!' : '提交信息更新成功！'
    isReadOnly.value = true
    window.scrollTo(0, 0)
  } catch (err: any) {
    error.value = err.response?.data?.detail || (isEnglish.value ? 'Submission failed' : '提交失败')
  } finally {
    loading.value = false
  }
}

const fileError = ref('')
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// File Upload (Modified)
const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    fileError.value = ''

    if (!target.files || target.files.length === 0) {
        selectedUploadFilename.value = ''
        return
    }
    const file = target.files[0]
    selectedUploadFilename.value = file.name

    const allowedExtensions = ['.zip', '.rar']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
        fileError.value = isEnglish.value ? 'Invalid file format. Only ZIP or RAR are allowed.' : '文件格式无效。仅支持 ZIP 或 RAR 格式。'
        selectedUploadFilename.value = ''
        target.value = ''
        return
    }

    const MAX_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_SIZE) {
        fileError.value = isEnglish.value ? 'File exceeds the 50 MB size limit. Please compress and try again.' : '文件大小超过 50 MB 限制，请压缩后重新上传。'
        selectedUploadFilename.value = ''
        target.value = ''
        return
    }

    // Naming: TeamName.zip or TeamName.rar
    const nameWithoutExt = file.name.replace(/\.(zip|rar)$/i, '')
    if (!nameWithoutExt || nameWithoutExt.includes('_') || nameWithoutExt.includes(' ')) {
        fileError.value = isEnglish.value
            ? 'Warning: Filename should be your team name only (e.g., BioTeam.zip)'
            : '警告：文件名应仅为队伍名称（例如：BioTeam.zip）'
    }

    uploadLoading.value = true
    const token = localStorage.getItem('token')
    try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('file_type', 'pdf')
        await axios.post('/api/upload', formData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
        await fetchFiles()
        success.value = isEnglish.value ? 'File uploaded successfully!' : '文件上传成功！'
        if (fileInput.value) fileInput.value.value = ''
        selectedUploadFilename.value = ''
    } catch (e: any) {
        error.value = e.response?.data?.detail || (isEnglish.value ? 'Upload failed' : '上传失败')
    } finally {
        uploadLoading.value = false
    }
}

const downloadFile = async (fileId: number, filename: string) => {
    try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`/api/download/${fileId}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
        })
        const url = URL.createObjectURL(res.data)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (e) {
        alert(isEnglish.value ? 'Download failed' : '下载失败')
    }
}

const deleteFile = async (fileId: number) => {
    if (!confirm(isEnglish.value ? 'Delete this file?' : '确认删除此文件？')) return
    try {
        const token = localStorage.getItem('token')
        await axios.delete(`/api/files/${fileId}`, { headers: { Authorization: `Bearer ${token}` } })
        await fetchFiles()
        success.value = isEnglish.value ? 'File deleted.' : '文件已删除。'
    } catch (e) {
        alert(isEnglish.value ? 'Delete failed' : '删除失败')
    }
}

// Countdown (Same as before)
const deadline = new Date('2026-09-30T23:59:59').getTime()
const timeLeft = ref('')
const isNearDeadline = ref(false)
let timer: any = null
const updateTimer = () => {
  const now = new Date().getTime()
  const distance = deadline - now
  if (distance < 0) {
    timeLeft.value = isEnglish.value ? 'Competition Ended' : '竞赛已结束'
    isNearDeadline.value = false
    return
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  if (isEnglish.value) {
      timeLeft.value = `${days} days ${hours} hours ${minutes} minutes`
  } else {
      timeLeft.value = `${days}天 ${hours}小时 ${minutes}分`
  }
  if (days < 7) isNearDeadline.value = true
}

onMounted(() => {
    fetchTeam()
    updateTimer()
    timer = setInterval(updateTimer, 60000)
})
onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>

<template>
  <AnnouncementBar />
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    
    <!-- Countdown Banner -->
    <div class="mb-8 bg-brand-blue rounded-lg shadow-lg p-4 text-white flex justify-between items-center">
        <div class="flex items-center">
            <span class="text-2xl mr-2">⏳</span>
            <span class="font-bold text-lg">{{ labels.deadline_msg }} {{ timeLeft }}</span>
        </div>
        <div v-if="isNearDeadline" class="bg-red-500 px-3 py-1 rounded text-sm font-bold animate-pulse">
            {{ labels.warning_msg }}
        </div>
    </div>
  
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- File Upload Section -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ labels.project_info }}</h3>
        </div>
        <div class="px-4 py-5 sm:p-6">
             <div class="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 class="text-md font-bold text-gray-800 mb-4">{{ labels.file_upload }}</h4>
                
                <div class="mb-4 text-sm text-gray-600 space-y-2">
                    <p class="font-bold">{{ isEnglish ? 'Submission Requirements:' : '提交要求：' }}</p>
                    <ul class="list-disc pl-5">
                        <li v-if="isEnglish">
                            Please package all materials into a single <strong>ZIP</strong> or <strong>RAR</strong> file.
                        </li>
                        <li v-else>
                            请将所有材料打包为一个 <strong>ZIP</strong> 或 <strong>RAR</strong> 格式的压缩文件。
                        </li>
                        <li v-if="isEnglish">
                            The package must contain: <strong>Project Report (PDF)</strong>, <strong>Technical Abstract (PDF)</strong>, and optional supplementary materials.
                        </li>
                        <li v-else>
                            压缩包内必须包含：<strong>项目报告 (PDF)</strong>、<strong>技术摘要 (PDF)</strong> 及可选的补充材料。
                        </li>
                        <li v-if="isEnglish">
                            <strong>Naming Convention:</strong> <code>TeamName.zip</code> (e.g., <em>BioTeam.zip</em>)
                        </li>
                        <li v-else>
                            <strong>命名规范：</strong> <code>队伍名称.zip</code> (例如：<em>BioTeam.zip</em>)
                        </li>
                        <li v-if="isEnglish">
                            <strong>File size limit: 50 MB maximum.</strong>
                        </li>
                        <li v-else>
                            <strong>文件大小限制：最大 50 MB。</strong>
                        </li>
                    </ul>
                </div>

                <div class="flex items-center space-x-4">
                    <input type="file" ref="fileInput" @change="handleFileUpload" accept=".zip,.rar" class="hidden" />
                    <button type="button" @click="triggerFileSelect" class="py-2 px-4 rounded-full border-0 text-sm font-semibold bg-blue-50 text-brand-blue hover:bg-blue-100">
                      {{ labels.choose_file }}
                    </button>
                    <span class="text-sm text-gray-500 truncate">{{ selectedUploadFilename || labels.no_file_selected }}</span>
                    <span v-if="uploadLoading" class="text-brand-blue">{{ labels.uploading }}</span>
                </div>
                <p class="mt-2 text-xs text-red-500" v-if="fileError">{{ fileError }}</p>
             </div>
             
             <div>
                <h4 class="text-md font-bold text-gray-800 mb-4">{{ labels.submitted_files }}</h4>
                <div v-if="files.length > 0" class="overflow-hidden border border-gray-200 rounded-md shadow-sm">
                    <ul class="divide-y divide-gray-200">
                        <li v-for="file in files" :key="file.id" class="px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">📦</span>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ file.original_filename }}</p>
                                    <p class="text-xs text-gray-500">
                                        {{ new Date(file.created_at).toLocaleString() }} • v{{ file.version }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex space-x-2">
                                <button @click="downloadFile(file.id, file.original_filename)" class="text-sm font-medium text-brand-blue hover:text-blue-800 border border-brand-blue rounded px-3 py-1 transition-colors">
                                    {{ labels.download }}
                                </button>
                                <button @click="deleteFile(file.id)" class="text-sm font-medium text-red-600 hover:text-red-800 border border-red-600 rounded px-3 py-1 transition-colors">
                                    {{ labels.delete }}
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-else class="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-md">
                    <p class="text-gray-500 italic">{{ labels.no_files }}</p>
                </div>
             </div>
        </div>
      </div>

      <!-- Team Submission Form -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <span v-for="step in stepLabels" :key="step.id" :class="{'text-brand-blue font-bold': currentStep === step.id, 'text-gray-400': currentStep !== step.id}">
                     {{ step.id }}. {{ step.label }} <span v-if="step.id < 3" class="mx-1">></span>
                 </span>
              </div>
              <div v-if="isReadOnly" class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                  {{ labels.preview_mode }}
              </div>
          </div>
          
          <div v-if="error" class="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="success" class="mb-4 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-sm">
            <div class="flex flex-col">
              <div class="flex items-center mb-2">
                  <span class="text-2xl mr-2">✅</span>
                  <h3 class="text-lg font-bold text-green-800">{{ success }}</h3>
              </div>
              <p class="text-sm text-green-700">
                  {{ isEnglish ? 'You can resubmit multiple times before the deadline. New submissions will automatically overwrite previous versions, and the latest submission will prevail.' : '您可在截止日期前多次提交，新提交将自动覆盖之前的文件版本，以最后一次提交内容为准。' }}
              </p>
            </div>
          </div>

          <form class="mt-5 space-y-6" @submit.prevent="submit">
            <!-- 1. Basic Team Info -->
            <div v-show="currentStep === 1">
                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">{{ labels.team_name }} *</label>
                        <input v-model="form.team_name" type="text" required minlength="2" maxlength="50" :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">{{ labels.contact_phone }} *</label>
                        <input v-model="form.contact_phone" type="tel" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                     <div class="sm:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">{{ labels.track }}</label>
                        <select v-model="form.track" :disabled="isReadOnly" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100">
                            <option v-for="track in tracks" :key="track.id" :value="track.id">{{ isEnglish ? track.label.en : track.label.zh }}</option>
                        </select>
                    </div>
                </div>
                <div class="mt-6">
                    <button v-if="!isReadOnly" type="button" @click="nextStep" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                        {{ labels.next }}
                    </button>
                </div>
            </div>

            <!-- 2. Personnel Info -->
            <div v-show="currentStep === 2">
                <h4 class="text-md font-bold text-gray-800">{{ labels.leader_info }}</h4>
                <!-- Leader Fields ... -->

            <!-- 2. Personnel Info content continues -->
            <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6 bg-gray-50 p-4 rounded-md">
                <div class="sm:col-span-3">
                    <label class="block text-xs font-medium text-gray-500">{{ labels.name }} *</label>
                    <input v-model="form.leader.name" type="text" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                </div>
                <div class="sm:col-span-3">
                    <label class="block text-xs font-medium text-gray-500">{{ labels.email }} *</label>
                    <input v-model="form.leader.email" type="email" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500">{{ labels.school_unit }} *</label>
                    <input v-model="form.leader.school_unit" type="text" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500">{{ labels.major_job }} *</label>
                    <div class="mt-1 flex flex-col space-y-2">
                      <select 
                        :value="majorOptions.some(o => o.value === form.leader.major_job) ? form.leader.major_job : (form.leader.major_job ? 'Other' : '')" 
                        @change="(e: any) => form.leader.major_job = e.target.value"
                        :disabled="isReadOnly"
                        class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                      >
                        <option value="" disabled>{{ isEnglish ? 'Select Major/Job' : '选择专业/职业' }}</option>
                        <option v-for="opt in majorOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                        <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                      </select>
                      <input 
                        v-if="form.leader.major_job === 'Other' || (form.leader.major_job && !majorOptions.some(o => o.value === form.leader.major_job))"
                        v-model="form.leader.major_job" 
                        type="text" 
                        :placeholder="isEnglish ? 'Please specify' : '请输入'"
                        required 
                        :disabled="isReadOnly" 
                        class="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                      >
                    </div>
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-xs font-medium text-gray-500">{{ labels.degree_position }} *</label>
                    <div class="mt-1 flex flex-col space-y-2">
                      <select 
                        :value="degreeOptions.some(o => o.value === form.leader.degree_position) ? form.leader.degree_position : (form.leader.degree_position ? 'Other' : '')" 
                        @change="(e: any) => form.leader.degree_position = e.target.value"
                        :disabled="isReadOnly"
                        class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                      >
                        <option value="" disabled>{{ isEnglish ? 'Select Degree/Position' : '选择学历/职位' }}</option>
                        <option v-for="opt in degreeOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                        <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                      </select>
                      <input 
                        v-if="form.leader.degree_position === 'Other' || (form.leader.degree_position && !degreeOptions.some(o => o.value === form.leader.degree_position))"
                        v-model="form.leader.degree_position" 
                        type="text" 
                        :placeholder="isEnglish ? 'Please specify' : '请输入'"
                        required 
                        :disabled="isReadOnly" 
                        class="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                      >
                    </div>
                </div>
            </div>

            <!-- 3. Advisors Info -->
            <h4 class="text-md font-bold text-gray-800 flex justify-between items-center mt-6">
                {{ labels.advisor_info }}
                <button type="button" @click="addAdvisor" :disabled="isReadOnly || form.advisors.length >= 2" class="text-xs text-brand-blue hover:text-blue-800 disabled:opacity-50" v-if="!isReadOnly">
                    + {{ labels.add }}
                </button>
            </h4>
            <div v-for="(advisor, index) in form.advisors" :key="'advisor-'+index" class="bg-blue-50 p-4 rounded-md relative mt-4">
                <button type="button" @click="removeAdvisor(index)" :disabled="isReadOnly" class="absolute top-2 right-2 text-red-500 text-xs hover:text-red-700" v-if="form.advisors.length > 1 && !isReadOnly">{{ labels.remove }}</button>
                <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.name }} *</label>
                        <input v-model="advisor.name" type="text" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-3">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.email }} *</label>
                        <input v-model="advisor.email" type="email" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.school_unit }} *</label>
                        <input v-model="advisor.school_unit" type="text" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.major_job }} *</label>
                        <div class="mt-1 flex flex-col space-y-2">
                          <select 
                            :value="majorOptions.some(o => o.value === advisor.major_job) ? advisor.major_job : (advisor.major_job ? 'Other' : '')" 
                            @change="(e: any) => advisor.major_job = e.target.value"
                            :disabled="isReadOnly"
                            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                          >
                            <option value="" disabled>{{ isEnglish ? 'Select Major/Job' : '选择专业/职业' }}</option>
                            <option v-for="opt in majorOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                            <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                          </select>
                          <input 
                            v-if="advisor.major_job === 'Other' || (advisor.major_job && !majorOptions.some(o => o.value === advisor.major_job))"
                            v-model="advisor.major_job" 
                            type="text" 
                            :placeholder="isEnglish ? 'Please specify' : '请输入'"
                            required 
                            :disabled="isReadOnly" 
                            class="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                          >
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.degree_position }} *</label>
                        <div class="mt-1 flex flex-col space-y-2">
                          <select 
                            :value="degreeOptions.some(o => o.value === advisor.degree_position) ? advisor.degree_position : (advisor.degree_position ? 'Other' : '')" 
                            @change="(e: any) => advisor.degree_position = e.target.value"
                            :disabled="isReadOnly"
                            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                          >
                            <option value="" disabled>{{ isEnglish ? 'Select Degree/Position' : '选择学历/职位' }}</option>
                            <option v-for="opt in degreeOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                            <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                          </select>
                          <input 
                            v-if="advisor.degree_position === 'Other' || (advisor.degree_position && !degreeOptions.some(o => o.value === advisor.degree_position))"
                            v-model="advisor.degree_position" 
                            type="text" 
                            :placeholder="isEnglish ? 'Please specify' : '请输入'"
                            required 
                            :disabled="isReadOnly" 
                            class="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                          >
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. Members Info -->
            <h4 class="text-md font-bold text-gray-800 flex justify-between items-center mt-6">
                {{ labels.member_info }}
                <button type="button" @click="addMember" :disabled="isReadOnly || form.members.length >= 10" class="text-xs text-brand-blue hover:text-blue-800 disabled:opacity-50" v-if="!isReadOnly">
                    + {{ labels.add }}
                </button>
            </h4>
            <div v-for="(member, index) in form.members" :key="'member-'+index" class="bg-gray-50 p-4 rounded-md relative mt-4">
                 <button type="button" @click="removeMember(index)" :disabled="isReadOnly" class="absolute top-2 right-2 text-red-500 text-xs hover:text-red-700" v-if="form.members.length > 1 && !isReadOnly">{{ labels.remove }}</button>
                <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.name }} *</label>
                        <input v-model="member.name" type="text" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-3">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.email }} *</label>
                        <input v-model="member.email" type="email" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.school_unit }} *</label>
                        <input v-model="member.school_unit" type="text" required :disabled="isReadOnly" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.major_job }} *</label>
                        <div class="mt-1 flex flex-col space-y-2">
                          <select 
                            :value="majorOptions.some(o => o.value === member.major_job) ? member.major_job : (member.major_job ? 'Other' : '')" 
                            @change="(e: any) => member.major_job = e.target.value"
                            :disabled="isReadOnly"
                            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                          >
                            <option value="" disabled>{{ isEnglish ? 'Select Major/Job' : '选择专业/职业' }}</option>
                            <option v-for="opt in majorOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                            <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                          </select>
                          <input 
                            v-if="member.major_job === 'Other' || (member.major_job && !majorOptions.some(o => o.value === member.major_job))"
                            v-model="member.major_job" 
                            type="text" 
                            :placeholder="isEnglish ? 'Please specify' : '请输入'"
                            required 
                            :disabled="isReadOnly" 
                            class="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                          >
                        </div>
                    </div>
                    <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-500">{{ labels.degree_position }} *</label>
                        <div class="mt-1 flex flex-col space-y-2">
                          <select 
                            :value="degreeOptions.some(o => o.value === member.degree_position) ? member.degree_position : (member.degree_position ? 'Other' : '')" 
                            @change="(e: any) => member.degree_position = e.target.value"
                            :disabled="isReadOnly"
                            class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                          >
                            <option value="" disabled>{{ isEnglish ? 'Select Degree/Position' : '选择学历/职位' }}</option>
                            <option v-for="opt in degreeOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                            <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                          </select>
                          <input 
                            v-if="member.degree_position === 'Other' || (member.degree_position && !degreeOptions.some(o => o.value === member.degree_position))"
                            v-model="member.degree_position" 
                            type="text" 
                            :placeholder="isEnglish ? 'Please specify' : '请输入'"
                            required 
                            :disabled="isReadOnly" 
                            class="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                          >
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 flex justify-between">
                <button type="button" @click="prevStep" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                    {{ labels.prev }}
                </button>
                <button v-if="!isReadOnly" type="button" @click="nextStep" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                    {{ labels.next }}
                </button>
            </div>
          </div> <!-- End of Step 2 -->

            <div class="border-t border-gray-200 pt-4" v-show="false"></div>

            <!-- 5. Project Description (Step 3) -->
             <div v-show="currentStep === 3">

              <label for="project_title" class="block text-sm font-medium text-gray-700">{{ labels.project_title }} *</label>
              <div class="mt-1">
                <input v-model="form.project_title" type="text" id="project_title" required :disabled="isReadOnly" class="shadow-sm focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
              </div>

            <div>
              <label for="abstract" class="block text-sm font-medium text-gray-700">{{ labels.project_description }} *</label>
              <div class="mt-1">
                <textarea v-model="form.project_description" id="abstract" rows="5" required maxlength="500" :disabled="isReadOnly" class="shadow-sm focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border border-gray-300 rounded-md p-2 disabled:bg-gray-100" placeholder="..."></textarea>
                <p class="text-xs text-gray-500 text-right">{{ form.project_description.length }}/500</p>
              </div>
            </div>

             <div>
              <label for="github_link" class="block text-sm font-medium text-gray-700">{{ labels.github }}</label>
              <div class="mt-1">
                <input v-model="form.github_link" type="url" id="github_link" :disabled="isReadOnly" class="shadow-sm focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" placeholder="https://github.com/...">
              </div>
            </div>
            
             <div>
              <label for="video_link" class="block text-sm font-medium text-gray-700">{{ labels.video }}</label>
              <div class="mt-1">
                <input v-model="form.video_link" type="url" id="video_link" :disabled="isReadOnly" class="shadow-sm focus:ring-brand-blue focus:border-brand-blue block w-full sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" placeholder="https://youtube.com/...">
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4" v-show="false"></div>

            <div>
              <div v-if="!isReadOnly" class="flex justify-between mt-6">
                  <button type="button" @click="prevStep" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                      {{ labels.prev }}
                  </button>
                  <button type="submit" :disabled="loading" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                    {{ loading ? labels.saving : labels.save }}
                  </button>
              </div>
              <div v-else class="mt-6">
                  <button type="button" @click="enterEditMode" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    {{ labels.modify }}
                  </button>
              </div>
            </div>
          </div> <!-- End of Step 3 -->
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
