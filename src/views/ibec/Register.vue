<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'
import AnnouncementBar from '../../components/AnnouncementBar.vue'
import SliderCaptcha from '../../components/SliderCaptcha.vue'
import axios from 'axios'

const router = useRouter()
const { isEnglish } = useLanguage()

// Form Data
const form = ref({
  // Account
  leader_email: '',
  password: '',
  password_confirm: '',
  captcha_text: '',
  captcha_id: '',
  // Personal
  leader_name: '',
  leader_gender: 'Male',
  leader_dob: '',
  leader_nationality: '',
  leader_phone: '',
  leader_address: '',
  leader_id_number: '',
  
  // Edu/Work
  leader_school_unit: '',
  leader_major_job: '',
  leader_degree_position: '',
  leader_start_date: '',
  
  // Emergency
  emergency_name: '',
  emergency_relation: '',
  emergency_phone: ''
})

const loading = ref(false)
const errorMsg = ref('')
const captchaImage = ref('')
const captchaError = ref('')
const sliderVerified = ref(false)
const sliderRef = ref<any>(null)

// Constants
const tracks = [
  { id: 'AI-driven Life Science Discovery', label: { en: 'AI-driven Life Science Discovery', zh: 'AI驱动的生命科学发现' } },
  { id: 'Novel Bioinformatics Algorithms / Methods', label: { en: 'Novel Bioinformatics Algorithms / Methods', zh: '新型生物信息学算法 / 方法' } },
  { id: 'Bioinformatics Resources / Platforms', label: { en: 'Bioinformatics Resources / Platforms', zh: '生物信息学资源 / 平台' } },
  { id: 'Bio-engineering Applications', label: { en: 'Bio-engineering Applications', zh: '生物工程应用实现' } }
]

const identities = [
  { id: 'Student', label: { en: 'Student', zh: '学生' } },
  { id: 'Freelancer', label: { en: 'Freelancer', zh: '自由职业者' } },
  { id: 'Other', label: { en: 'Other', zh: '其他' } }
]
const genders = [
    { value: 'Male', label: { en: 'Male', zh: '男' } },
    { value: 'Female', label: { en: 'Female', zh: '女' } }
]

// Country Codes
const countryCodes = [
  { code: '+86', label: { zh: '中国 (+86)', en: 'China (+86)' }, length: 11 },
  { code: '+1', label: { zh: '美国 (+1)', en: 'USA (+1)' }, length: 10 },
  { code: '+44', label: { zh: '英国 (+44)', en: 'UK (+44)' }, length: 10 },
  { code: '+81', label: { zh: '日本 (+81)', en: 'Japan (+81)' }, length: 10 },
  { code: '+49', label: { zh: '德国 (+49)', en: 'Germany (+49)' }, length: 10 },
  { code: '+33', label: { zh: '法国 (+33)', en: 'France (+33)' }, length: 9 },
  { code: '+61', label: { zh: '澳大利亚 (+61)', en: 'Australia (+61)' }, length: 9 },
  { code: '+1', label: { zh: '加拿大 (+1)', en: 'Canada (+1)' }, length: 10 },
  { code: '+7', label: { zh: '俄罗斯 (+7)', en: 'Russia (+7)' }, length: 10 },
  { code: '+381', label: { zh: '塞尔维亚 (+381)', en: 'Serbia (+381)' }, length: 9 },
  { code: '+249', label: { zh: '苏丹 (+249)', en: 'Sudan (+249)' }, length: 9 },
  { code: 'Other', label: { zh: '其他', en: 'Other' }, length: 0 },
]

const selectedCountryCode = ref('+86')
const customCountryCode = ref('')
const confirmCountryCode = ref(false)

// Dropdown Options
const nationalityOptions = [
  { value: 'China', label: { en: 'China', zh: '中国' } },
  { value: 'United States', label: { en: 'United States', zh: '美国' } },
  { value: 'United Kingdom', label: { en: 'United Kingdom', zh: '英国' } },
  { value: 'Canada', label: { en: 'Canada', zh: '加拿大' } },
  { value: 'Australia', label: { en: 'Australia', zh: '澳大利亚' } },
  { value: 'Germany', label: { en: 'Germany', zh: '德国' } },
  { value: 'France', label: { en: 'France', zh: '法国' } },
  { value: 'Japan', label: { en: 'Japan', zh: '日本' } },
  { value: 'South Korea', label: { en: 'South Korea', zh: '韩国' } },
  { value: 'Singapore', label: { en: 'Singapore', zh: '新加坡' } },
  { value: 'Russia', label: { en: 'Russia', zh: '俄罗斯' } },
  { value: 'India', label: { en: 'India', zh: '印度' } },
  { value: 'Brazil', label: { en: 'Brazil', zh: '巴西' } },
  { value: 'Italy', label: { en: 'Italy', zh: '意大利' } },
  { value: 'Spain', label: { en: 'Spain', zh: '西班牙' } },
  { value: 'Netherlands', label: { en: 'Netherlands', zh: '荷兰' } },
  { value: 'Switzerland', label: { en: 'Switzerland', zh: '瑞士' } },
  { value: 'Sweden', label: { en: 'Sweden', zh: '瑞典' } },
  { value: 'Serbia', label: { en: 'Serbia', zh: '塞尔维亚' } },
  { value: 'Sudan', label: { en: 'Sudan', zh: '苏丹' } },
]

// "Other" Confirmations
const confirmNationality = ref(false)
const confirmMajor = ref(false)
const confirmDegree = ref(false)

// Helper for handling "Other" select
const handleSelectChange = (field: string, value: string) => {
    // If user selects "Other", clear the model value so input box appears (based on v-if logic below)
    // Actually, our v-if logic checks if value is 'Other' OR not in list.
    // If value is 'Other', we set form field to '' so user can type.
    if (value === 'Other') {
        if (field === 'nationality') {
            form.value.leader_nationality = 'Other'
            confirmNationality.value = false
        }
        if (field === 'major') {
            form.value.leader_major_job = 'Other'
            confirmMajor.value = false
        }
        if (field === 'degree') {
            form.value.leader_degree_position = 'Other'
            confirmDegree.value = false
        }
        if (field === 'countryCode') {
            selectedCountryCode.value = 'Other'
            customCountryCode.value = ''
            confirmCountryCode.value = false
        }
    } else {
        if (field === 'nationality') form.value.leader_nationality = value
        if (field === 'major') form.value.leader_major_job = value
        if (field === 'degree') form.value.leader_degree_position = value
        if (field === 'countryCode') selectedCountryCode.value = value
    }
}


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


// Computed Labels
const labels = computed(() => ({
  section_account: isEnglish.value ? 'Account Information' : '账号信息',
  section_personal: isEnglish.value ? 'Personal Information (Leader)' : '个人基本信息 (队长)',
  section_edu: isEnglish.value ? 'Education / Work Background' : '教育 / 工作背景',
  section_emergency: isEnglish.value ? 'Emergency Contact' : '紧急联系人',
  
  email: isEnglish.value ? 'Email' : '邮箱',
  password: isEnglish.value ? 'Password (At least 8 chars, mixed case & numbers)' : '密码 (至少8位，包含大小写字母和数字)',
  password_confirm: isEnglish.value ? 'Confirm Password' : '确认密码',
  captcha: isEnglish.value ? 'Captcha' : '验证码',
  name: isEnglish.value ? 'Full Name' : '姓名',
  gender: isEnglish.value ? 'Gender' : '性别',
  dob: isEnglish.value ? 'Date of Birth' : '出生日期',
  nationality: isEnglish.value ? 'Nationality' : '国籍',
  phone: isEnglish.value ? 'Phone Number' : '电话号码',
  address: isEnglish.value ? 'Address' : '通讯地址',
  id_number: isEnglish.value ? 'Student/Work ID Number' : '学生证/工作证号码',
  
  school_unit: isEnglish.value ? 'School / Unit' : '学校 / 单位名称',
  major_job: isEnglish.value ? 'Major / Job' : '专业 / 职业',
  degree_position: isEnglish.value ? 'Degree / Position' : '学历 / 职位',
  start_date: isEnglish.value ? 'Start Date' : '入学 / 工作时间',
  
  emergency_name: isEnglish.value ? 'Contact Name (Optional)' : '联系人姓名 (选填)',
  emergency_relation: isEnglish.value ? 'Relationship (Optional)' : '关系 (选填)',
  emergency_phone: isEnglish.value ? 'Contact Phone (Optional)' : '联系电话 (选填)',
  
  team_identity: isEnglish.value ? 'Identity' : '参赛身份',
  team_name: isEnglish.value ? 'Team Name' : '队伍名称',
  track: isEnglish.value ? 'Track' : '参赛赛道',
  members: isEnglish.value ? 'Team Members (Name, Role...)' : '队伍成员 (姓名, 角色...)',
  
  submit: isEnglish.value ? 'Register' : '提交报名',
  add_member: isEnglish.value ? 'Add Member' : '添加成员',
  remove: isEnglish.value ? 'Remove' : '移除',
  
  required_msg: isEnglish.value ? 'Please fill in this field' : '请填写此字段',
  password_mismatch: isEnglish.value ? 'Passwords do not match' : '两次输入的密码不一致',
  confirm_msg: isEnglish.value ? 'I confirm this information is correct' : '我确认此信息正确',
}))


// Validation Logic
const phoneValidation = computed(() => ({ error: '' }))

const passwordStrength = computed(() => {
  const pwd = form.value.password
  const criteria = [
    { id: 'len', label: { en: 'At least 8 characters', zh: '至少8个字符' }, valid: pwd.length >= 8 },
    { id: 'upper', label: { en: 'Uppercase letter (A-Z)', zh: '大写字母 (A-Z)' }, valid: /[A-Z]/.test(pwd) },
    { id: 'lower', label: { en: 'Lowercase letter (a-z)', zh: '小写字母 (a-z)' }, valid: /[a-z]/.test(pwd) },
    { id: 'special', label: { en: 'Special character (!@#$%^&*)', zh: '特殊符号 (!@#$%^&*)' }, valid: /[!@#$%^&*]/.test(pwd) }
  ]
  
  const validCount = criteria.filter(c => c.valid).length
  const allValid = validCount === 4
  
  let colorClass = 'text-red-600'
  if (allValid) colorClass = 'text-green-600'
  else if (validCount > 0) colorClass = 'text-orange-500'
  
  return { criteria, allValid, validCount, colorClass }
})

// Methods
const fetchCaptcha = async () => {
  captchaError.value = ''
  try {
    const response = await axios.get(`/api/captcha?_=${Date.now()}`, { responseType: 'blob' })
    const headers: any = response.headers || {}
    const captchaId =
      headers['x-captcha-id'] ||
      headers['X-Captcha-ID'] ||
      (typeof headers.get === 'function' ? headers.get('x-captcha-id') : '')
    if (captchaImage.value && captchaImage.value.startsWith('blob:')) {
      URL.revokeObjectURL(captchaImage.value)
    }
    // Keep header channel when available; backend has cookie fallback now.
    form.value.captcha_id = captchaId || ''
    captchaImage.value = URL.createObjectURL(response.data)
  } catch (e) {
    console.error('Failed to load captcha', e)
    form.value.captcha_id = ''
    captchaImage.value = ''
    captchaError.value = isEnglish.value ? 'Captcha failed to load, click to retry' : '验证码加载失败，请点击重试'
  }
}

const drawCaptcha = fetchCaptcha

watch(() => form.value.captcha_text, () => {
  if (captchaError.value) captchaError.value = ''
})

const passwordMismatch = computed(() => {
  return form.value.password && form.value.password_confirm && form.value.password !== form.value.password_confirm
})

const isReadOnly = ref(false)
const currentUser = ref<any>(null)

const applyRegisteredProfile = (user: any) => {
  const profileFields = [
    'leader_email',
    'leader_name',
    'leader_gender',
    'leader_dob',
    'leader_nationality',
    'leader_address',
    'leader_id_number',
    'leader_school_unit',
    'leader_major_job',
    'leader_degree_position',
    'leader_start_date',
    'emergency_name',
    'emergency_relation',
    'emergency_phone',
  ] as const

  profileFields.forEach((field) => {
    form.value[field] = user[field] ?? ''
  })

  const storedPhone = String(user.leader_phone ?? '').trim()
  const matchedCountryCode = countryCodes
    .filter(country => country.code !== 'Other')
    .sort((a, b) => b.code.length - a.code.length)
    .find(country => storedPhone === country.code || storedPhone.startsWith(`${country.code} `))

  if (matchedCountryCode) {
    selectedCountryCode.value = matchedCountryCode.code
    form.value.leader_phone = storedPhone.slice(matchedCountryCode.code.length).trim()
    customCountryCode.value = ''
  } else if (storedPhone.startsWith('+')) {
    const [countryCode, ...phoneParts] = storedPhone.split(/\s+/)
    selectedCountryCode.value = 'Other'
    customCountryCode.value = countryCode
    form.value.leader_phone = phoneParts.join(' ')
  } else {
    selectedCountryCode.value = 'Other'
    customCountryCode.value = ''
    form.value.leader_phone = storedPhone
  }
}

const checkLoginStatus = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const response = await axios.get('/api/team', { headers: { Authorization: `Bearer ${token}` } })
      currentUser.value = response.data
      applyRegisteredProfile(response.data)
      isReadOnly.value = true
    } catch {
      localStorage.removeItem('token')
    }
  }
}

const handleSubmit = async () => {
  if (isReadOnly.value) return // Should not happen if button disabled, but safe check

  errorMsg.value = ''
  captchaError.value = ''
  
  // Validation
  if (passwordMismatch.value) {
    errorMsg.value = labels.value.password_mismatch
    return
  }

  // Password Strength
  if (!passwordStrength.value.allValid) {
    errorMsg.value = isEnglish.value 
      ? 'Password must contain uppercase, lowercase, special characters and be at least 8 characters'
      : '密码必须包含大小写字母、特殊符号且不少于8位'
    return
  }

  // Phone validation removed - trust user input

  // Check "Other" Confirmations
  const isNationalityOther = (form.value.leader_nationality === 'Other' || (form.value.leader_nationality && !nationalityOptions.some(o => o.value === form.value.leader_nationality)))
  if (isNationalityOther) {
      if (!form.value.leader_nationality || form.value.leader_nationality === 'Other') {
          errorMsg.value = isEnglish.value ? 'Please enter your nationality' : '请输入您的国籍'
          return
      }
  }

  const isMajorOther = (form.value.leader_major_job === 'Other' || (form.value.leader_major_job && !majorOptions.some(o => o.value === form.value.leader_major_job)))
  if (isMajorOther) {
      if (!form.value.leader_major_job || form.value.leader_major_job === 'Other') {
          errorMsg.value = isEnglish.value ? 'Please enter your major/job' : '请输入您的专业/职业'
          return
      }
  }

  const isDegreeOther = (form.value.leader_degree_position === 'Other' || (form.value.leader_degree_position && !degreeOptions.some(o => o.value === form.value.leader_degree_position)))
  if (isDegreeOther) {
      if (!form.value.leader_degree_position || form.value.leader_degree_position === 'Other') {
          errorMsg.value = isEnglish.value ? 'Please enter your degree/position' : '请输入您的学历/职位'
          return
      }
  }
  
  // Slider verification
  if (!sliderVerified.value) {
    errorMsg.value = isEnglish.value ? 'Please complete the slider verification' : '请完成滑块验证'
    return
  }

  // Captcha is validated server-side
  loading.value = true

  try {
    const finalPhone = selectedCountryCode.value === 'Other'
        ? `${customCountryCode.value} ${form.value.leader_phone}`
        : `${selectedCountryCode.value} ${form.value.leader_phone}`

    const payload = {
      leader_email: form.value.leader_email,
      password: form.value.password,
      captcha_id: form.value.captcha_id,
      captcha_text: form.value.captcha_text,
      leader_name: form.value.leader_name,
      leader_gender: form.value.leader_gender,
      leader_dob: form.value.leader_dob,
      leader_nationality: form.value.leader_nationality,
      leader_phone: finalPhone,
      leader_address: form.value.leader_address,
      leader_id_number: form.value.leader_id_number,
      leader_school_unit: form.value.leader_school_unit,
      leader_major_job: form.value.leader_major_job,
      leader_degree_position: form.value.leader_degree_position,
      leader_start_date: form.value.leader_start_date,
      emergency_name: form.value.emergency_name,
      emergency_relation: form.value.emergency_relation,
      emergency_phone: form.value.emergency_phone,
    }

    await axios.post('/api/register', payload)
    alert(isEnglish.value ? 'Registration Successful! Please Login.' : '注册成功！请登录。')
    router.push('/login')
  } catch (e: any) {
    const msg = e.response?.data?.detail || e.message
    if (msg === 'Invalid Captcha') {
      captchaError.value = isEnglish.value ? 'Invalid captcha, please try again' : '验证码错误，请重新输入'
      form.value.captcha_text = ''
    } else {
      errorMsg.value = msg
    }
    fetchCaptcha()
    sliderVerified.value = false
    sliderRef.value?.reset()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  drawCaptcha()
  checkLoginStatus()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-4xl">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isEnglish ? 'Register a new team' : '注册新队伍' }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-8" @submit.prevent="handleSubmit">
          <div v-if="isReadOnly" class="rounded-md bg-blue-50 p-4 border border-blue-200">
            <p class="text-sm text-blue-800">
              {{ isEnglish ? 'You have already registered. This page is now read-only for profile preview.' : '您已完成注册，当前页面为只读预览，不可修改。' }}
            </p>
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMsg" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ errorMsg }}</h3>
              </div>
            </div>
          </div>

          <!-- Section 1: Account -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ labels.section_account }}</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.email }} *</label>
                <input v-model="form.leader_email" type="email" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>

              <div class="sm:col-span-3">
                <!-- Empty for spacing -->
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.password }} *</label>
                <input v-model="form.password" type="password" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
                
                <!-- Password Strength Meter -->
                <div v-if="form.password && !isReadOnly" class="mt-2 text-xs">
                    <div class="flex space-x-1 mb-2">
                        <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" 
                            :class="i <= passwordStrength.validCount ? (passwordStrength.allValid ? 'bg-green-500' : 'bg-orange-500') : 'bg-gray-200'"></div>
                    </div>
                    <p :class="passwordStrength.colorClass" class="font-medium mb-1">
                        {{ passwordStrength.allValid 
                            ? (isEnglish ? 'Password Strength: Strong' : '密码强度：强') 
                            : (isEnglish ? 'Password Requirements:' : '密码要求：') }}
                    </p>
                    <ul class="list-disc pl-4 space-y-1 text-gray-500" v-if="!passwordStrength.allValid">
                        <li v-for="c in passwordStrength.criteria" :key="c.id" 
                            :class="c.valid ? 'text-green-600' : 'text-red-500'" class="transition-colors duration-200">
                            {{ isEnglish ? c.label.en : c.label.zh }}
                            <span v-if="c.valid">✓</span>
                        </li>
                    </ul>
                </div>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.password_confirm }} *</label>
                <input v-model="form.password_confirm" type="password" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :class="{'border-red-500': passwordMismatch}" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
                <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">{{ labels.password_mismatch }}</p>
              </div>
            </div>
          </div>

          <!-- Section 2: Personal (Leader) -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ labels.section_personal }}</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.name }} *</label>
                <input v-model="form.leader_name" type="text" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.gender }}</label>
                <select v-model="form.leader_gender" :disabled="isReadOnly" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100">
                  <option v-for="g in genders" :key="g.value" :value="g.value">{{ isEnglish ? g.label.en : g.label.zh }}</option>
                </select>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.dob }} *</label>
                <input v-model="form.leader_dob" type="date" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.nationality }} *</label>
                <div class="mt-1 flex flex-col space-y-2">
                  <select 
                    :value="nationalityOptions.some(o => o.value === form.leader_nationality) ? form.leader_nationality : (form.leader_nationality ? 'Other' : '')" 
                    @change="(e: any) => handleSelectChange('nationality', e.target.value)"
                    :disabled="isReadOnly"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="" disabled>{{ isEnglish ? 'Select Nationality' : '选择国籍' }}</option>
                    <option v-for="opt in nationalityOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                    <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                  </select>
                  <div v-if="form.leader_nationality === 'Other' || (form.leader_nationality && !nationalityOptions.some(o => o.value === form.leader_nationality))" class="mt-2">
                      <input 
                        :value="form.leader_nationality === 'Other' ? '' : form.leader_nationality"
                        @input="(e: any) => form.leader_nationality = e.target.value || 'Other'"
                        type="text" 
                        :placeholder="isEnglish ? 'Please specify' : '请输入'"
                        required 
                        :disabled="isReadOnly" 
                        class="focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                      >
                  </div>
                </div>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.phone }} *</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    <select :value="selectedCountryCode" @change="(e: any) => handleSelectChange('countryCode', e.target.value)" class="h-full bg-transparent border-none focus:ring-0 text-sm">
                        <option v-for="c in countryCodes" :key="c.code" :value="c.code">
                            {{ isEnglish ? c.label.en : c.label.zh }}
                        </option>
                    </select>
                  </span>
                  <input v-model="form.leader_phone" type="tel" required :disabled="isReadOnly" class="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-brand-blue focus:ring-brand-blue sm:text-sm p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
                </div>
                <div v-if="selectedCountryCode === 'Other'" class="mt-2">
                    <input v-model="customCountryCode" type="text" :placeholder="isEnglish ? 'Country Code (e.g. +123)' : '国家代码 (例如 +123)'" class="focus:ring-brand-blue focus:border-brand-blue block w-28 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border">
                </div>
                <p v-if="selectedCountryCode !== 'Other' && phoneValidation.error && form.leader_phone && !isReadOnly" class="mt-1 text-sm text-red-600">{{ phoneValidation.error }}</p>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.id_number }} *</label>
                <input v-model="form.leader_id_number" type="text" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>
              
               <div class="sm:col-span-6">
                <label class="block text-sm font-medium text-gray-700">{{ labels.address }} *</label>
                <input v-model="form.leader_address" type="text" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>
            </div>
          </div>

          <!-- Section 3: Edu/Work -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ labels.section_edu }}</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.school_unit }} *</label>
                <input v-model="form.leader_school_unit" type="text" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.major_job }} *</label>
                <div class="mt-1 flex flex-col space-y-2">
                  <select 
                    :value="majorOptions.some(o => o.value === form.leader_major_job) ? form.leader_major_job : (form.leader_major_job ? 'Other' : '')" 
                    @change="(e: any) => handleSelectChange('major', e.target.value)"
                    :disabled="isReadOnly"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="" disabled>{{ isEnglish ? 'Select Major/Job' : '选择专业/职业' }}</option>
                    <option v-for="opt in majorOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                    <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                  </select>
                  <div v-if="form.leader_major_job === 'Other' || (form.leader_major_job && !majorOptions.some(o => o.value === form.leader_major_job))" class="mt-2">
                      <input 
                        :value="form.leader_major_job === 'Other' ? '' : form.leader_major_job"
                        @input="(e: any) => form.leader_major_job = e.target.value || 'Other'"
                        type="text" 
                        :placeholder="isEnglish ? 'Please specify' : '请输入'"
                        required 
                        :disabled="isReadOnly" 
                        class="focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                      >
                  </div>
                </div>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.degree_position }} *</label>
                <div class="mt-1 flex flex-col space-y-2">
                  <select 
                    :value="degreeOptions.some(o => o.value === form.leader_degree_position) ? form.leader_degree_position : (form.leader_degree_position ? 'Other' : '')" 
                    @change="(e: any) => handleSelectChange('degree', e.target.value)"
                    :disabled="isReadOnly"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
                  >
                    <option value="" disabled>{{ isEnglish ? 'Select Degree/Position' : '选择学历/职位' }}</option>
                    <option v-for="opt in degreeOptions" :key="opt.value" :value="opt.value">{{ isEnglish ? opt.label.en : opt.label.zh }}</option>
                    <option value="Other">{{ isEnglish ? 'Other' : '其他' }}</option>
                  </select>
                  <div v-if="form.leader_degree_position === 'Other' || (form.leader_degree_position && !degreeOptions.some(o => o.value === form.leader_degree_position))" class="mt-2">
                      <input 
                        :value="form.leader_degree_position === 'Other' ? '' : form.leader_degree_position"
                        @input="(e: any) => form.leader_degree_position = e.target.value || 'Other'"
                        type="text" 
                        :placeholder="isEnglish ? 'Please specify' : '请输入'"
                        required 
                        :disabled="isReadOnly" 
                        class="focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100"
                      >
                  </div>
                </div>
              </div>

              <div class="sm:col-span-3">
                <label class="block text-sm font-medium text-gray-700">{{ labels.start_date }} *</label>
                <input v-model="form.leader_start_date" type="date" required :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100" :oninvalid="`this.setCustomValidity('${labels.required_msg}')`" oninput="this.setCustomValidity('')">
              </div>
            </div>
          </div>

          <!-- Section 4: Emergency -->
          <div class="border-b border-gray-200 pb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">{{ labels.section_emergency }}</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">{{ labels.emergency_name }}</label>
                <input v-model="form.emergency_name" type="text" :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">{{ labels.emergency_relation }}</label>
                <input v-model="form.emergency_relation" type="text" :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">{{ labels.emergency_phone }}</label>
                <input v-model="form.emergency_phone" type="tel" :disabled="isReadOnly" class="mt-1 focus:ring-brand-blue focus:border-brand-blue block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border disabled:bg-gray-100">
              </div>
            </div>
          </div>

          <!-- Section 5: Team removed -->

          <!-- Captcha -->
          <div v-if="!isReadOnly">
            <label class="block text-sm font-medium text-gray-700">{{ labels.captcha }} *</label>
            <div class="mt-1 flex items-center">
              <input
                v-model="form.captcha_text"
                type="text"
                required
                class="focus:ring-brand-blue focus:border-brand-blue block w-32 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border mr-4"
                :class="{'border-red-500': captchaError}"
                :oninvalid="`this.setCustomValidity('${labels.required_msg}')`"
                oninput="this.setCustomValidity('')"
              >
              <img :src="captchaImage" alt="Captcha" class="h-10 cursor-pointer border rounded" @click="drawCaptcha" title="Click to refresh">
              <span v-if="captchaError" class="ml-2 text-sm text-red-600">{{ captchaError }}</span>
            </div>
          </div>
          
          <!-- Slider Verification -->
          <div v-if="!isReadOnly">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ isEnglish ? 'Slide to Verify *' : '滑块验证 *' }}
            </label>
            <SliderCaptcha ref="sliderRef" :lang="isEnglish ? 'en' : 'zh'" @verified="sliderVerified = $event" />
          </div>

          <div>
            <button v-if="!isReadOnly" type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50">
              {{ loading ? 'Processing...' : labels.submit }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
