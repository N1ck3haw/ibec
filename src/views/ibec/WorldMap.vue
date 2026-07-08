<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '../../composables/useLanguage'
import * as echarts from 'echarts'

const { isEnglish } = useLanguage()
const loading = ref(true)
const loadStatus = ref('加载中…')
const error = ref('')
const wc = ref<echarts.ECharts | null>(null)
const cc = ref<echarts.ECharts | null>(null)

// ===== 参赛者地区分布数据 =====
// 以注册时提交的通讯地址为准
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
        { min: 31, label: '30+', color: '#8b1a1a' },
        { min: 11, max: 30, label: '11–30', color: '#c53030' },
        { min: 4, max: 10, label: '4–10', color: '#e53e3e' },
        { min: 1, max: 3, label: '1–3', color: '#fc8181' },
        { min: 0, max: 0, label: '0', color: '#fff5f5' },
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
        itemStyle: { areaColor: '#c53030', borderColor: '#fff', borderWidth: 1.5, shadowBlur: 14, shadowColor: 'rgba(197,48,48,0.25)' },
      },
      itemStyle: { areaColor: '#fff5f5', borderColor: '#dce1e8', borderWidth: 0.6 },
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
      inRange: { color: ['#fff5f5', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'] },
      calculable: true,
      left: 16, bottom: 20,
      itemWidth: 14, itemHeight: 80,
      handleStyle: { color: '#c53030' },
      indicatorStyle: { borderColor: '#c53030' },
    },
    series: [{
      type: 'map', map: 'china',
      roam: true, selectedMode: false,
      label: { show: true, fontSize: 11, color: '#2d3748', fontWeight: 500 },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
        itemStyle: { areaColor: '#c53030', borderColor: '#fff', borderWidth: 1.5, shadowBlur: 14, shadowColor: 'rgba(197,48,48,0.25)' },
      },
      itemStyle: { areaColor: '#fff5f5', borderColor: '#e2e8f0', borderWidth: 0.8 },
      data: chinaData,
    }],
  })
}

let resizeHandler: (() => void) | null = null

onMounted(async () => {
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
})

onUnmounted(() => {
  wc.value?.dispose()
  cc.value?.dispose()
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEnglish ? 'Participant Distribution' : '参赛团队地理分布' }}
      </h1>
      <div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span class="inline-flex items-center gap-1">
          <strong class="text-red-700 text-lg">{{ DIST_DATA.total }}</strong>
          {{ isEnglish ? 'teams' : '参赛团队' }}
        </span>
        <span class="w-px h-5 bg-gray-300"></span>
        <span class="inline-flex items-center gap-1">
          <strong class="text-red-700 text-lg">{{ countryCount }}</strong>
          {{ isEnglish ? 'countries' : '国家' }}
        </span>
        <span class="w-px h-5 bg-gray-300"></span>
        <span class="inline-flex items-center gap-1">
          <strong class="text-red-700 text-lg">{{ provinceCount }}</strong>
          {{ isEnglish ? 'Chinese provinces' : '中国省份' }}
        </span>
      </div>
      <!-- 数据说明 -->
      <p class="mt-3 text-xs text-gray-400 italic">
        {{ isEnglish
          ? 'Note: Distribution is based on the leader_address submitted during registration.'
          : '注：本分布以参赛者注册时提交的通讯地址为准。' }}
      </p>
    </div>

    <!-- 世界地图 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div class="flex items-center gap-2 px-6 pt-4 pb-1">
        <span class="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {{ isEnglish ? 'World' : '世界分布' }}
        </span>
      </div>
      <div id="worldMap" class="w-full h-[420px]"></div>
    </div>

    <!-- 中国地图 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex items-center gap-2 px-6 pt-4 pb-1">
        <span class="w-2 h-2 rounded-full bg-red-800 flex-shrink-0"></span>
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {{ isEnglish ? 'China · By Province' : '中国 · 分省统计' }}
        </span>
      </div>
      <div id="chinaMap" class="w-full h-[420px]"></div>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div class="text-center bg-white px-10 py-7 rounded-2xl shadow-lg">
        <div class="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-sm text-gray-500">{{ loadStatus }}</p>
      </div>
    </div>

    <!-- 错误 -->
    <div v-if="error" class="text-center py-16 text-red-600">
      <p>⚠️ {{ error }}</p>
      <p class="text-xs text-gray-400 mt-2">
        {{ isEnglish ? 'Please check your network and refresh.' : '请检查网络后刷新' }}
      </p>
    </div>
  </div>
</template>
