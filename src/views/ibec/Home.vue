<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '../../composables/useLanguage'
import * as echarts from 'echarts'

const { isEnglish } = useLanguage()
const baseUrl = import.meta.env.BASE_URL
const promoVideoSrc = `${baseUrl}video.mp4`

// Countdown Logic
const registrationDeadline = new Date('2026-07-04T23:59:59').getTime()
const timeLeft = ref('')
let timer: any = null

const updateTimer = () => {
  const now = new Date().getTime()
  const distance = registrationDeadline - now
  if (distance < 0) {
    timeLeft.value = isEnglish.value ? 'Registration Closed' : '报名已截止'
    return
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)
  
  if (isEnglish.value) {
      timeLeft.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
  } else {
      timeLeft.value = `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`
  }
}

onMounted(() => {
    updateTimer()
    timer = setInterval(updateTimer, 1000)
    initMaps()
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
    wc.value?.dispose()
    cc.value?.dispose()
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})

// Parallax Mouse Tracking
const heroRef = ref<HTMLElement | null>(null)
const offsetX = ref(0)
const offsetY = ref(0)

const handleMouseMove = (e: MouseEvent) => {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  offsetX.value = x * 20
  offsetY.value = y * 10
}

const tracks = [
  { id: 'track-1', title: { en: 'AI-driven Life Science Discovery', zh: 'AI驱动的生命科学发现' }, icon: '🧬', desc: { en: 'Using AI to solve biological problems.', zh: '利用AI解决生物学问题。' } },
  { id: 'track-2', title: { en: 'Novel Bioinformatics Algorithms / Methods', zh: '新型生物信息学算法' }, icon: '🧮', desc: { en: 'Developing new algorithms for data analysis.', zh: '开发用于数据分析的新算法。' } },
  { id: 'track-3', title: { en: 'Bioinformatics Resources / Platforms', zh: '生物信息学资源/平台' }, icon: '💻', desc: { en: 'Building databases and tools.', zh: '构建数据库和工具。' } },
  { id: 'track-4', title: { en: 'Bio-engineering Applications', zh: '生物工程应用实现' }, icon: '⚙️', desc: { en: 'Real-world applications in bio-engineering.', zh: '生物工程中的实际应用。' } },
]

// ===== Maps Data & Functions =====
const DIST_DATA = {
  total: 81,
  chinaTotal: 76,
  provinces: {
    '浙江': 14, '广东': 13, '湖北': 7, '陕西': 6, '北京': 5,
    '福建': 4, '山西': 4, '山东': 3, '上海': 3, '海南': 3,
    '湖南': 2, '四川': 2, '江苏': 2, '吉林': 2,
    '河北': 1, '河南': 1, '黑龙江': 1, '西藏': 1, '安徽': 1, '江西': 1,
  },
  countries: { 'Thailand': 3, 'United States': 1, 'Japan': 1 },
}

const provinceCount = Object.keys(DIST_DATA.provinces).length
const countryCount = Object.keys(DIST_DATA.countries).length

const PROV_MAP: Record<string, string> = {
  '广东':'广东','浙江':'浙江','湖北':'湖北','北京':'北京',
  '陕西':'陕西','福建':'福建','山东':'山东','山西':'山西',
  '上海':'上海','海南':'海南','湖南':'湖南','四川':'四川',
  '江苏':'江苏','吉林':'吉林','河北':'河北','河南':'河南',
  '黑龙江':'黑龙江','西藏':'西藏','安徽':'安徽','江西':'江西',
}

const PROV_NAME_EN: Record<string, string> = {
  '广东':'Guangdong','浙江':'Zhejiang','湖北':'Hubei','北京':'Beijing',
  '陕西':'Shaanxi','福建':'Fujian','山东':'Shandong','山西':'Shanxi',
  '上海':'Shanghai','海南':'Hainan','湖南':'Hunan','四川':'Sichuan',
  '江苏':'Jiangsu','吉林':'Jilin','河北':'Hebei','河南':'Henan',
  '黑龙江':'Heilongjiang','西藏':'Tibet','安徽':'Anhui','江西':'Jiangxi',
}

const CDN_URLS = {
  world: [
    'https://cdn.jsdelivr.net/npm/echarts/map/json/world.json',
    'https://unpkg.com/echarts/map/json/world.json',
  ],
  china: [
    'https://cdn.jsdelivr.net/npm/echarts/map/json/china.json',
    'https://unpkg.com/echarts/map/json/china.json',
    'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  ],
}

const loading = ref(true)
const loadStatus = ref('加载中…')
const error = ref('')
const wc = ref<echarts.ECharts | null>(null)
const cc = ref<echarts.ECharts | null>(null)
let resizeHandler: (() => void) | null = null

async function fetchJson(urls: string[], label: string) {
  for (const url of urls) {
    try {
      loadStatus.value = isEnglish.value ? `Loading ${label}…` : `加载${label}…`
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!r.ok) continue
      return await r.json()
    } catch { /* try next */ }
  }
  throw new Error(isEnglish.value ? `Failed to load ${label}` : `${label}加载失败`)
}

function renderWorld() {
  const d = DIST_DATA
  const el = document.getElementById('worldMap')
  if (!el) return
  const chart = echarts.init(el)
  wc.value = chart
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const v = p.value || 0
        return `<div style="font-size:14px;font-weight:600;color:#1a202c;margin-bottom:2px">${p.name}</div>
                <div style="font-size:13px;color:#4a5568">${v} ${isEnglish.value ? 'teams' : '组'}</div>`
      },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(0,0,0,0.06)', borderWidth: 1,
      padding: [10, 14],
      extraCssText: 'border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.10)',
    },
    visualMap: {
      type: 'piecewise',
      pieces: [
        { min: 31, label: '30+', color: '#dc2626' },
        { min: 11, max: 30, label: '11–30', color: '#ef4444' },
        { min: 4, max: 10, label: '4–10', color: '#8b5cf6' },
        { min: 1, max: 3, label: '1–3', color: '#60a5fa' },
        { min: 0, max: 0, label: '0', color: '#eff6ff' },
      ],
      left: 16, bottom: 20,
      itemWidth: 14, itemHeight: 14,
      textStyle: { fontSize: 12, color: '#4a5568' },
      itemGap: 6,
    },
    series: [{
      type: 'map', map: 'world',
      roam: true, selectedMode: false,
      aspectScale: 0.85, zoom: 1.1, center: [15, 15],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#1a202c' },
        itemStyle: { areaColor: '#ef4444', borderColor: '#fff', borderWidth: 1.5, shadowBlur: 14, shadowColor: 'rgba(239,68,68,0.25)' },
      },
      itemStyle: { areaColor: '#eff6ff', borderColor: '#dce1e8', borderWidth: 0.6 },
      data: [
        { name: 'China', value: d.chinaTotal },
        ...Object.entries(d.countries).map(([name, value]) => ({ name, value })),
      ],
    }],
  })
}

function renderChina() {
  const d = DIST_DATA
  const el = document.getElementById('chinaMap')
  if (!el) return
  const chart = echarts.init(el)
  cc.value = chart
  const chinaData = Object.entries(d.provinces)
    .filter(([k]) => PROV_MAP[k])
    .map(([k, v]) => ({ name: PROV_MAP[k], value: v }))
  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const v = p.value || 0
        return `<div style="font-size:14px;font-weight:600;color:#1a202c;margin-bottom:2px">${p.name}</div>
                <div style="font-size:13px;color:#4a5568">${v} ${isEnglish.value ? 'teams' : '组'}</div>`
      },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(0,0,0,0.06)', borderWidth: 1,
      padding: [10, 14],
      extraCssText: 'border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.10)',
    },
    visualMap: {
      min: 0,
      max: Math.max(15, ...chinaData.map(d => d.value)),
      text: [isEnglish.value ? 'High' : '多', isEnglish.value ? 'Low' : '少'],
      textStyle: { color: '#4a5568', fontSize: 11 },
      inRange: { color: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#818cf8', '#a78bfa', '#f87171', '#ef4444', '#dc2626'] },
      calculable: true,
      left: 16, bottom: 20,
      itemWidth: 14, itemHeight: 80,
      handleStyle: { color: '#3b82f6' },
      indicatorStyle: { borderColor: '#3b82f6' },
    },
    series: [{
      type: 'map', map: 'china',
      roam: true, selectedMode: false,
      label: { show: true, fontSize: 11, color: '#2d3748', fontWeight: 500 },
      nameMap: isEnglish.value ? PROV_NAME_EN : undefined,
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
        itemStyle: { areaColor: '#ef4444', borderColor: '#fff', borderWidth: 1.5, shadowBlur: 14, shadowColor: 'rgba(239,68,68,0.25)' },
      },
      itemStyle: { areaColor: '#eff6ff', borderColor: '#e2e8f0', borderWidth: 0.8 },
      data: chinaData,
    }],
  })
}

async function initMaps() {
  try {
    const [wj, cj] = await Promise.all([
      fetchJson(CDN_URLS.world, isEnglish.value ? 'world map' : '世界地图'),
      fetchJson(CDN_URLS.china, isEnglish.value ? 'China map' : '中国地图'),
    ])
    echarts.registerMap('world', wj)
    echarts.registerMap('china', cj)
    renderWorld()
    renderChina()
    loading.value = false
    resizeHandler = () => { wc.value?.resize(); cc.value?.resize() }
    window.addEventListener('resize', resizeHandler)
  } catch (e: any) {
    error.value = e.message || String(e)
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div ref="heroRef" class="relative overflow-hidden h-[600px]" @mousemove="handleMouseMove">
       <!-- Background Image with Ken Burns + Parallax -->
      <div class="absolute inset-0 parallax-layer"
           :style="{ transform: `translate(${offsetX}px, ${offsetY}px)` }">
        <img :src="`${baseUrl}xing.jpg`" class="w-full h-full object-cover ken-burns-img" alt="Background" />
      </div>
      <!-- Blue Overlay -->
      <div class="absolute inset-0 bg-brand-blue opacity-70 mix-blend-multiply"></div>

      <div class="relative z-10 max-w-7xl mx-auto h-full flex items-center">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="sm:text-center lg:text-left">
            <!-- Modified Title Layout -->
            <h1 class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl leading-tight">
              <template v-if="isEnglish">
                  <span class="text-white mr-2">1st International</span>
                  <span class="text-blue-300">Bioinformatics Engineering Competition</span>
              </template>
              <template v-else>
                  <span class="text-white mr-2">第一届国际</span>
                  <span class="text-blue-300">生物信息工程竞赛</span>
              </template>
            </h1>
            
            <p class="mt-3 text-base text-gray-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              {{ isEnglish ? 'Join us to explore the future of AI and Life Sciences.' : '加入我们，探索人工智能与生命科学的未来。' }}
            </p>
            
            <!-- Countdown -->
            <div class="mt-6">
                <p class="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-1">
                    {{ isEnglish ? 'Registration Deadline Countdown' : '注册截止倒计时' }}
                </p>
                <div class="inline-block bg-black bg-opacity-30 rounded-lg px-4 py-2 backdrop-filter backdrop-blur-sm">
                    <p class="text-2xl sm:text-3xl font-mono font-bold text-white">
                        {{ timeLeft }}
                    </p>
                </div>
            </div>

            <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div class="rounded-md shadow">
                <router-link to="/register" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-blue bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  {{ isEnglish ? 'Register Now' : '立即报名' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-base text-brand-blue font-semibold tracking-wide uppercase">
            {{ isEnglish ? 'Schedule' : '日程安排' }}
          </h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {{ isEnglish ? 'Competition Timeline' : '大赛时间轴' }}
          </p>
        </div>

        <div class="mt-10">
          <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-4 md:gap-x-8 md:gap-y-10">
            <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-blue text-white">
                  1
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {{ isEnglish ? 'July 4, 2026' : '2026年7月4日' }}
                </p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                {{ isEnglish ? 'Registration Deadline' : '注册截止' }}
              </dd>
            </div>
             <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-blue text-white">
                  2
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {{ isEnglish ? 'Sep 30, 2026' : '2026年9月30日' }}
                </p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                {{ isEnglish ? 'Submission Deadline' : '提交截止' }}
              </dd>
            </div>
             <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-blue text-white">
                  3
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {{ isEnglish ? 'Oct 2026' : '2026年10月' }}
                </p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                {{ isEnglish ? 'Preliminary Review' : '初赛评审' }}
              </dd>
            </div>
             <div class="relative">
              <dt>
                <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-brand-blue text-white">
                  4
                </div>
                <p class="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {{ isEnglish ? 'Dec 2026' : '2026年12月' }}
                </p>
              </dt>
              <dd class="mt-2 ml-16 text-base text-gray-500">
                {{ isEnglish ? 'Final Round' : '决赛展示' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    
    <!-- Maps -->
    <div class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6 text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {{ isEnglish ? 'Participant Distribution' : '参赛团队地理分布' }}
          </h2>
          <div class="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
            <span class="inline-flex items-center gap-1">
              <strong class="text-brand-blue text-lg">{{ DIST_DATA.total }}</strong>
              {{ isEnglish ? 'teams' : '参赛团队' }}
            </span>
            <span class="w-px h-5 bg-gray-300"></span>
            <span class="inline-flex items-center gap-1">
              <strong class="text-brand-blue text-lg">{{ countryCount }}</strong>
              {{ isEnglish ? 'countries' : '国家' }}
            </span>
            <span class="w-px h-5 bg-gray-300"></span>
            <span class="inline-flex items-center gap-1">
              <strong class="text-brand-blue text-lg">{{ provinceCount }}</strong>
              {{ isEnglish ? 'Chinese provinces' : '中国省份' }}
            </span>
          </div>
          <p class="mt-3 text-xs text-gray-400 italic">
            {{ isEnglish
              ? 'Note: Distribution is based on the leader_address submitted during registration.'
              : '注：本分布以参赛者注册时提交的通讯地址为准。' }}
          </p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="flex items-center gap-2 px-6 pt-4 pb-1">
            <span class="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ isEnglish ? 'World' : '世界分布' }}
            </span>
          </div>
          <div id="worldMap" class="w-full h-[420px]"></div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex items-center gap-2 px-6 pt-4 pb-1">
            <span class="w-2 h-2 rounded-full bg-red-800 flex-shrink-0"></span>
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ isEnglish ? 'China · By Province' : '中国 · 分省统计' }}
            </span>
          </div>
          <div id="chinaMap" class="w-full h-[420px]"></div>
        </div>

        <div v-if="loading" class="mt-6 text-center">
          <div class="inline-flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-xl">
            <div class="w-6 h-6 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
            <span class="text-sm text-gray-500">{{ loadStatus }}</span>
          </div>
        </div>

        <div v-if="error" class="mt-6 text-center py-8 text-red-600">
          <p>⚠️ {{ error }}</p>
          <p class="text-xs text-gray-400 mt-2">
            {{ isEnglish ? 'Please check your network and refresh.' : '请检查网络后刷新' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Promo Video -->
    <div class="py-12 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {{ isEnglish ? 'Competition Introduction Video' : '赛事介绍视频' }}
          </h2>
          <p class="mt-2 text-sm sm:text-base text-gray-500">
            {{ isEnglish ? 'Click play to learn about iBEC.' : '点击播放，快速了解 iBEC 竞赛。' }}
          </p>
        </div>
        <div class="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-black">
          <video
            class="w-full h-auto max-h-[70vh]"
            controls
            preload="metadata"
            :poster="`${baseUrl}video.png`"
            :src="promoVideoSrc"
          >
            {{ isEnglish ? 'Your browser does not support video playback.' : '当前浏览器不支持视频播放。' }}
          </video>
        </div>
      </div>
    </div>

     <!-- Tracks -->
    <div class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center mb-10">
           <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {{ isEnglish ? 'Competition Tracks' : '竞赛赛道' }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div 
            v-for="track in tracks" 
            :key="track.id" 
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3"
          >
            <div class="flex-shrink-0 text-4xl">
              {{ track.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <span class="absolute inset-0" aria-hidden="true"></span>
              <p class="text-sm font-medium text-gray-900">
                {{ isEnglish ? track.title.en : track.title.zh }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                {{ isEnglish ? track.desc.en : track.desc.zh }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes kenBurns {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.ken-burns-img {
  animation: kenBurns 20s ease-in-out infinite;
  will-change: transform;
}

.parallax-layer {
  transition: transform 0.15s ease-out;
  will-change: transform;
}
</style>
