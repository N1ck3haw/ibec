<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
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

const PROV_NAME_EN: Record<string, string> = {
  '北京':'Beijing','天津':'Tianjin','上海':'Shanghai','重庆':'Chongqing',
  '河北':'Hebei','山西':'Shanxi','辽宁':'Liaoning','吉林':'Jilin',
  '黑龙江':'Heilongjiang','江苏':'Jiangsu','浙江':'Zhejiang','安徽':'Anhui',
  '福建':'Fujian','江西':'Jiangxi','山东':'Shandong','河南':'Henan',
  '湖北':'Hubei','湖南':'Hunan','广东':'Guangdong','海南':'Hainan',
  '四川':'Sichuan','贵州':'Guizhou','云南':'Yunnan','陕西':'Shaanxi',
  '甘肃':'Gansu','青海':'Qinghai','台湾':'Taiwan',
  '内蒙古':'Inner Mongolia','广西':'Guangxi','西藏':'Tibet','宁夏':'Ningxia',
  '新疆':'Xinjiang','香港':'Hong Kong','澳门':'Macau','南海诸岛':'South China Sea Islands','十段线':'Ten-dash Line',
}

const COUNTRY_CN_MAP: Record<string, string> = {
  'Afghanistan':'阿富汗','Aland':'奥兰群岛','Albania':'阿尔巴尼亚','Algeria':'阿尔及利亚',
  'American Samoa':'美属萨摩亚','Andorra':'安道尔','Angola':'安哥拉',
  'Antigua and Barb.':'安提瓜和巴布达','Argentina':'阿根廷','Armenia':'亚美尼亚',
  'Australia':'澳大利亚','Austria':'奥地利','Azerbaijan':'阿塞拜疆',
  'Bahamas':'巴哈马','Bahrain':'巴林','Bangladesh':'孟加拉国','Barbados':'巴巴多斯',
  'Belarus':'白俄罗斯','Belgium':'比利时','Belize':'伯利兹','Benin':'贝宁',
  'Bermuda':'百慕大','Bhutan':'不丹','Bolivia':'玻利维亚',
  'Bosnia and Herz.':'波斯尼亚和黑塞哥维那','Botswana':'博茨瓦纳',
  'Br. Indian Ocean Ter.':'英属印度洋领地','Brazil':'巴西','Brunei':'文莱',
  'Bulgaria':'保加利亚','Burkina Faso':'布基纳法索','Burundi':'布隆迪',
  'Cambodia':'柬埔寨','Cameroon':'喀麦隆','Canada':'加拿大','Cape Verde':'佛得角',
  'Cayman Is.':'开曼群岛','Central African Rep.':'中非','Chad':'乍得',
  'Chile':'智利','China':'中国','Colombia':'哥伦比亚','Comoros':'科摩罗',
  'Congo':'刚果','Costa Rica':'哥斯达黎加','Croatia':'克罗地亚','Cuba':'古巴',
  'Curaçao':'库拉索','Cyprus':'塞浦路斯','Czech Rep.':'捷克',
  "Côte d'Ivoire":'科特迪瓦','Dem. Rep. Congo':'刚果民主共和国',
  'Dem. Rep. Korea':'朝鲜','Denmark':'丹麦','Djibouti':'吉布提','Dominica':'多米尼克',
  'Dominican Rep.':'多米尼加','Ecuador':'厄瓜多尔','Egypt':'埃及',
  'El Salvador':'萨尔瓦多','Eq. Guinea':'赤道几内亚','Eritrea':'厄立特里亚',
  'Estonia':'爱沙尼亚','Ethiopia':'埃塞俄比亚','Faeroe Is.':'法罗群岛',
  'Falkland Is.':'福克兰群岛','Fiji':'斐济','Finland':'芬兰',
  'Fr. Polynesia':'法属波利尼西亚','Fr. S. Antarctic Lands':'法属南部领地',
  'France':'法国','Gabon':'加蓬','Gambia':'冈比亚','Georgia':'格鲁吉亚',
  'Germany':'德国','Ghana':'加纳','Greece':'希腊','Greenland':'格陵兰',
  'Grenada':'格林纳达','Guam':'关岛','Guatemala':'危地马拉','Guinea':'几内亚',
  'Guinea-Bissau':'几内亚比绍','Guyana':'圭亚那','Haiti':'海地',
  'Heard I. and McDonald Is.':'赫德岛和麦克唐纳群岛','Honduras':'洪都拉斯',
  'Hungary':'匈牙利','Iceland':'冰岛','India':'印度','Indonesia':'印度尼西亚',
  'Iran':'伊朗','Iraq':'伊拉克','Ireland':'爱尔兰','Isle of Man':'马恩岛',
  'Israel':'以色列','Italy':'意大利','Jamaica':'牙买加','Japan':'日本',
  'Jersey':'泽西岛','Jordan':'约旦','Kazakhstan':'哈萨克斯坦','Kenya':'肯尼亚',
  'Kiribati':'基里巴斯','Korea':'韩国','Kuwait':'科威特','Kyrgyzstan':'吉尔吉斯斯坦',
  'Lao PDR':'老挝','Latvia':'拉脱维亚','Lebanon':'黎巴嫩','Lesotho':'莱索托',
  'Liberia':'利比里亚','Libya':'利比亚','Liechtenstein':'列支敦士登',
  'Lithuania':'立陶宛','Luxembourg':'卢森堡','Macedonia':'北马其顿',
  'Madagascar':'马达加斯加','Malawi':'马拉维','Malaysia':'马来西亚',
  'Mali':'马里','Malta':'马耳他','Mauritania':'毛里塔尼亚','Mauritius':'毛里求斯',
  'Mexico':'墨西哥','Micronesia':'密克罗尼西亚','Moldova':'摩尔多瓦',
  'Mongolia':'蒙古','Montenegro':'黑山','Montserrat':'蒙特塞拉特',
  'Morocco':'摩洛哥','Mozambique':'莫桑比克','Myanmar':'缅甸',
  'N. Cyprus':'北塞浦路斯','N. Mariana Is.':'北马里亚纳群岛','Namibia':'纳米比亚',
  'Nepal':'尼泊尔','Netherlands':'荷兰','New Caledonia':'新喀里多尼亚',
  'New Zealand':'新西兰','Nicaragua':'尼加拉瓜','Niger':'尼日尔','Nigeria':'尼日利亚',
  'Niue':'纽埃','Norway':'挪威','Oman':'阿曼','Pakistan':'巴基斯坦',
  'Palau':'帕劳','Palestine':'巴勒斯坦','Panama':'巴拿马',
  'Papua New Guinea':'巴布亚新几内亚','Paraguay':'巴拉圭','Peru':'秘鲁',
  'Philippines':'菲律宾','Poland':'波兰','Portugal':'葡萄牙','Puerto Rico':'波多黎各',
  'Qatar':'卡塔尔','Romania':'罗马尼亚','Russia':'俄罗斯','Rwanda':'卢旺达',
  'S. Geo. and S. Sandw. Is.':'南乔治亚和南桑威奇群岛','S. Sudan':'南苏丹',
  'Saint Helena':'圣赫勒拿','Saint Lucia':'圣卢西亚','Samoa':'萨摩亚',
  'Saudi Arabia':'沙特阿拉伯','Senegal':'塞内加尔','Serbia':'塞尔维亚',
  'Seychelles':'塞舌尔','Siachen Glacier':'锡亚琴冰川',
  'Sierra Leone':'塞拉利昂','Singapore':'新加坡','Slovakia':'斯洛伐克',
  'Slovenia':'斯洛文尼亚','Solomon Is.':'所罗门群岛','Somalia':'索马里',
  'South Africa':'南非','Spain':'西班牙','Sri Lanka':'斯里兰卡',
  'St. Pierre and Miquelon':'圣皮埃尔和密克隆','St. Vin. and Gren.':'圣文森特和格林纳丁斯',
  'Sudan':'苏丹','Suriname':'苏里南','Swaziland':'斯威士兰','Sweden':'瑞典',
  'Switzerland':'瑞士','Syria':'叙利亚','São Tomé and Principe':'圣多美和普林西比',
  'Tajikistan':'塔吉克斯坦','Tanzania':'坦桑尼亚','Thailand':'泰国',
  'Timor-Leste':'东帝汶','Togo':'多哥','Tonga':'汤加',
  'Trinidad and Tobago':'特立尼达和多巴哥','Tunisia':'突尼斯','Turkey':'土耳其',
  'Turkmenistan':'土库曼斯坦','Turks and Caicos Is.':'特克斯和凯科斯群岛',
  'U.S. Virgin Is.':'美属维尔京群岛','Uganda':'乌干达','Ukraine':'乌克兰',
  'United Arab Emirates':'阿联酋','United Kingdom':'英国','United States':'美国',
  'Uruguay':'乌拉圭','Uzbekistan':'乌兹别克斯坦','Vanuatu':'瓦努阿图',
  'Venezuela':'委内瑞拉','Vietnam':'越南','W. Sahara':'西撒哈拉',
  'Yemen':'也门','Zambia':'赞比亚','Zimbabwe':'津巴布韦',
}

const CDN_URLS = {
  world: [
    'https://cdn.jsdelivr.net/npm/echarts/map/json/world.json',
    'https://unpkg.com/echarts/map/json/world.json',
  ],
  china: [
    'https://geojson.cn/api/data/china.json',
    'https://cdn.jsdelivr.net/npm/echarts/map/json/china.json',
    'https://unpkg.com/echarts/map/json/china.json',
  ],
}

// School name bilingual mapping
const SCHOOL_NAMES: Record<string, string> = {
  '海南大学':'Hainan University','浙江大学':'Zhejiang University',
  '华中农业大学':'Huazhong Agricultural University','中南大学':'Central South University',
  '齐鲁工业大学':'Qilu University of Technology','北京协和医学院':'Peking Union Medical College',
  '西藏大学':'Tibet University','兰州大学':'Lanzhou University',
  '深圳理工大学':'Shenzhen Technology University','四川大学':'Sichuan University',
  '昌平实验室':'Changping Laboratory','南方医科大学':'Southern Medical University',
  '广东食品药品职业学院':'Guangdong Food and Drug Vocational College',
  '晋中信息学院':'Jinzhong College of Information','湖北大学':'Hubei University',
  '福建医科大学':'Fujian Medical University','空军军医大学':'Air Force Medical University',
  '华东师范大学':'East China Normal University','华南农业大学':'South China Agricultural University',
  '厦门大学':'Xiamen University','上海科技大学':'ShanghaiTech University',
  '湘潭大学':'Xiangtan University','西湖大学':'Westlake University',
  '哈尔滨工业大学':'Harbin Institute of Technology','西北工业大学':'Northwestern Polytechnical University',
  '山东大学':'Shandong University','南昌大学':'Nanchang University',
  '南京农业大学':'Nanjing Agricultural University','浙江海洋大学':'Zhejiang Ocean University',
  '陕西科技大学':'Shaanxi University of Science and Technology',
  '中国中医科学院':'China Academy of Chinese Medical Sciences',
  '中山大学':'Sun Yat-sen University',
  '西北农林科技大学':'Northwest A&F University',
  '山西农业大学':'Shanxi Agricultural University','安徽医科大学':'Anhui Medical University','安徽医科大学第一附属医院':'The First Affiliated Hospital of Anhui Medical University',
  '华中科技大学':'Huazhong University of Science and Technology','中山大学孙逸仙纪念医院':'Sun Yat-sen Memorial Hospital of Sun Yat-sen University',
  '中南财经政法大学':'Zhongnan University of Economics and Law',
  '深圳北理莫斯科大学':'Shenzhen MSU-BIT University',
  '长春理工大学':'Changchun University of Science and Technology',
  '中国药科大学':'China Pharmaceutical University','长春中医药大学':'Changchun University of Chinese Medicine',
  '信阳师范大学':'Xinyang Normal University',
  '南方医科大学珠江医院':'Zhujiang Hospital, Southern Medical University',
  '东京科学大学':'Tokyo University of Science',
  '庆熙大学':'Kyunghee University','延世大学':'Yonsei University',
  '加州大学圣地亚哥分校':'University of California, San Diego',
  '朱拉隆功大学药学院':'Faculty of Pharmaceutical Sciences, Chulalongkorn University',
  '普渡大学':'Purdue University','加州大学戴维斯分校':'University of California, Davis',
  '西安交通大学':'Xi\'an Jiaotong University',
}

function getSchoolDisplay(name: string, isEn: boolean): string {
  if (isEn) {
    // Check if name has English version
    for (const [cn, en] of Object.entries(SCHOOL_NAMES)) {
      if (cn === name || en === name) return en
    }
    return name.match(/[\u4e00-\u9fff]/) ? name : name  // keep if already English
  } else {
    for (const [cn, en] of Object.entries(SCHOOL_NAMES)) {
      if (cn === name || en === name) return cn
    }
    return name
  }
}

const selectedWorldRegion = ref<string | null>(null)
const selectedChinaRegion = ref<string | null>(null)
const worldDetailSchools = ref<{name:string;count:number}[]>([])
const chinaDetailSchools = ref<{name:string;count:number}[]>([])

let teamData: any = null
const loading = ref(true)
const loadStatus = ref('加载中…')
const error = ref('')
const wc = ref<echarts.ECharts | null>(null)
const cc = ref<echarts.ECharts | null>(null)
let resizeHandler: (() => void) | null = null

// Fallback counts for provinces
const PROV_COUNTS: Record<string, number> = {
  '浙江':13,'广东':12,'湖北':7,'陕西':5,'北京':5,
  '福建':4,'山西':4,'山东':3,'上海':3,'海南':3,
  '湖南':2,'四川':2,'江苏':2,'吉林':2,
  '河北':1,'河南':1,'黑龙江':1,'西藏':1,'安徽':1,'江西':1,
  '南海诸岛':0,
}

function getSchoolList(region: string, isWorld: boolean): {name:string;count:number}[] {
  if (!teamData) return []
  const map = isWorld ? teamData.world : teamData.china
  return map[region]?.schools || []
}

function getRegionCount(region: string, isWorld: boolean): number {
  if (!teamData) return 0
  const map = isWorld ? teamData.world : teamData.china
  return map[region]?.count || 0
}

function tooltipHtml(name: string, count: number, isEn: boolean) {
  return `<div style="font-size:14px;font-weight:600;color:#1a202c">${name}</div><div style="font-size:12px;color:#4a5568">${count} ${isEn ? 'teams' : '组'}</div>`
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
  const isEn = isEnglish.value
  const el = document.getElementById('worldMap')
  if (!el) return
  if (!wc.value) {
    wc.value = echarts.init(el)
    wc.value.on('click', (params: any) => {
      const regionName = params.name
      if (selectedWorldRegion.value === regionName) {
        selectedWorldRegion.value = null
        worldDetailSchools.value = []
      } else {
        selectedWorldRegion.value = regionName
        const key = !isEn ? Object.entries(COUNTRY_CN_MAP).find(([,cn]) => cn === regionName)?.[0] || regionName : regionName
        worldDetailSchools.value = getSchoolList(key === '中国' ? 'China' : key, true)
      }
    })
  }
  const worldData = Object.entries(teamData?.world || {China:{count:76,schools:[]}}).map(([name, info]: any) => ({
    name: isEn ? name : (COUNTRY_CN_MAP[name] || name),
    value: info.count,
  }))
  wc.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const displayName = isEn ? p.name : (COUNTRY_CN_MAP[p.name] || p.name)
        return tooltipHtml(displayName, p.value || 0, isEn)
      },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(0,0,0,0.06)', borderWidth: 1,
      padding: [8, 12],
      extraCssText: 'border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.10)',
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
      type: 'map', map: isEn ? 'world-en' : 'world-cn',
      roam: true, selectedMode: false,
      aspectScale: 0.85, zoom: 1.1, center: [15, 15],
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#1a202c' },
        itemStyle: { areaColor: '#ef4444', borderColor: '#fff', borderWidth: 1.5, shadowBlur: 14, shadowColor: 'rgba(239,68,68,0.25)' },
      },
      itemStyle: { areaColor: '#eff6ff', borderColor: '#dce1e8', borderWidth: 0.6 },
      data: worldData,
    }],
  }, true)
}

function renderChina() {
  const isEn = isEnglish.value
  const el = document.getElementById('chinaMap')
  if (!el) return
  if (!cc.value) {
    cc.value = echarts.init(el)
    cc.value.on('click', (params: any) => {
      const regionName = params.name
      if (selectedChinaRegion.value === regionName) {
        selectedChinaRegion.value = null
        chinaDetailSchools.value = []
      } else {
        selectedChinaRegion.value = regionName
        const cnName = Object.entries(PROV_NAME_EN).find(([,en]) => en === regionName)?.[0] || regionName
        chinaDetailSchools.value = getSchoolList(cnName, false)
      }
    })
  }
  const chinaData = teamData
    ? Object.entries(teamData.china).filter(([,v]: any) => v.count > 0).map(([k, v]: any) => ({ name: isEn ? (PROV_NAME_EN[k] || k) : k, value: v.count }))
    : Object.entries(PROV_COUNTS).map(([k, v]) => ({ name: isEn ? (PROV_NAME_EN[k] || k) : k, value: v }))
  cc.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        return tooltipHtml(p.name, p.value || 0, isEn)
      },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: 'rgba(0,0,0,0.06)', borderWidth: 1,
      padding: [8, 12],
      extraCssText: 'border-radius:8px;box-shadow:0 4px 24px rgba(0,0,0,0.10)',
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
      type: 'map', map: isEn ? 'china-en' : 'china-cn',
      roam: true, selectedMode: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
        itemStyle: { areaColor: '#ef4444', borderColor: '#fff', borderWidth: 1.5, shadowBlur: 14, shadowColor: 'rgba(239,68,68,0.25)' },
      },
      itemStyle: { areaColor: '#eff6ff', borderColor: '#e2e8f0', borderWidth: 0.8 },
      data: chinaData,
    }],
  }, true)
}

async function initMaps() {
  try {
    // Load team data
    try {
      const td = await fetch(`${baseUrl}team-data.json`)
      if (td.ok) teamData = await td.json()
    } catch {}
    
    const [wj, cj] = await Promise.all([
      fetchJson(CDN_URLS.world, isEnglish.value ? 'world map' : '世界地图'),
      fetchJson(CDN_URLS.china, isEnglish.value ? 'China map' : '中国地图'),
    ])
    
    // Merge 南海诸岛 geometry into China feature on world map
    const nhFeature = cj.features?.find((f: any) => f.properties?.name === '南海诸岛')
    const chinaFeature = wj.features?.find((f: any) => f.properties?.name === 'China')
    if (nhFeature && chinaFeature && chinaFeature.geometry?.type === 'MultiPolygon') {
      if (nhFeature.geometry?.type === 'MultiPolygon') {
        chinaFeature.geometry.coordinates.push(...nhFeature.geometry.coordinates)
      } else if (nhFeature.geometry?.type === 'Polygon') {
        chinaFeature.geometry.coordinates.push(nhFeature.geometry.coordinates)
      }
    }
    
    echarts.registerMap('world-en', wj)
    const worldCn = JSON.parse(JSON.stringify(wj))
    worldCn.features.forEach((f: any) => {
      if (f.properties?.name && COUNTRY_CN_MAP[f.properties.name]) {
        f.properties.name = COUNTRY_CN_MAP[f.properties.name]
      }
    })
    echarts.registerMap('world-cn', worldCn)
    echarts.registerMap('china-cn', JSON.parse(JSON.stringify(cj, (key, val) => {
      if (key === 'features') return val.filter((f: any) => f.properties?.name !== '十段线')
      return val
    })))
    const enMap = JSON.parse(JSON.stringify(cj, (key, val) => {
      if (key === 'features') return val.filter((f: any) => f.properties?.name !== '十段线')
      return val
    }))
    enMap.features.forEach((f: any) => {
      if (f.properties?.name && PROV_NAME_EN[f.properties.name]) {
        f.properties.name = PROV_NAME_EN[f.properties.name]
      }
    })
    echarts.registerMap('china-en', enMap)
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

watch(isEnglish, () => {
  if (cc.value) renderChina()
  if (wc.value) renderWorld()
})
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
      <!-- Sponsor Notice -->
      <div class="absolute bottom-6 right-6 z-20">
        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 shadow-lg">
          <p class="text-base font-medium text-white/90 tracking-wide">
            {{ isEnglish ? '🏆 Sponsors: To Be Announced' : '🏆 赞助商：待公布' }}
          </p>
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
              <strong class="text-brand-blue text-lg">{{ teamData ? teamData.total : 81 }}</strong>
              {{ isEnglish ? 'teams' : '参赛团队' }}
            </span>
            <span class="w-px h-5 bg-gray-300"></span>
            <span class="inline-flex items-center gap-1">
              <strong class="text-brand-blue text-lg">{{ teamData ? Object.keys(teamData.world).filter(k => k !== 'Unknown').length : 3 }}</strong>
              {{ isEnglish ? 'countries' : '国家' }}
            </span>
            <span class="w-px h-5 bg-gray-300"></span>
            <span class="inline-flex items-center gap-1">
              <strong class="text-brand-blue text-lg">{{ teamData ? Object.keys(teamData.china).length : 21 }}</strong>
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

        <!-- World Detail Panel -->
        <div v-if="selectedWorldRegion"
             class="bg-white rounded-xl shadow-sm border border-brand-blue/20 overflow-hidden mb-6">
          <div class="flex items-center justify-between px-6 py-3 bg-brand-blue/5">
            <span class="text-sm font-semibold text-brand-blue">
              {{ isEnglish ? 'Schools / Organizations in' : '学校/单位 ·' }} {{ selectedWorldRegion }}
            </span>
            <button @click="selectedWorldRegion = null; worldDetailSchools = []"
                    class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
          <div class="px-6 py-4 max-h-[300px] overflow-y-auto">
            <div v-if="worldDetailSchools.length === 0" class="text-sm text-gray-400 text-center py-4">
              {{ isEnglish ? 'No teams registered in this country.' : '当前无队伍报名。' }}
            </div>
            <div v-for="s in worldDetailSchools" :key="s.name"
                 class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span class="text-sm text-gray-800">{{ getSchoolDisplay(s.name, isEnglish) }}</span>
              <span class="text-xs text-gray-400 ml-2 whitespace-nowrap" v-if="s.count > 1">x{{ s.count }}</span>
            </div>
          </div>
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

        <!-- China Detail Panel -->
        <div v-if="selectedChinaRegion"
             class="bg-white rounded-xl shadow-sm border border-brand-blue/20 overflow-hidden mb-6">
          <div class="flex items-center justify-between px-6 py-3 bg-brand-blue/5">
            <span class="text-sm font-semibold text-brand-blue">
              {{ isEnglish ? 'Schools / Organizations in' : '学校/单位 ·' }} {{ selectedChinaRegion }}
            </span>
            <button @click="selectedChinaRegion = null; chinaDetailSchools = []"
                    class="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
          <div class="px-6 py-4 max-h-[300px] overflow-y-auto">
            <div v-if="chinaDetailSchools.length === 0" class="text-sm text-gray-400 text-center py-4">
              {{ isEnglish ? 'No teams registered in this province.' : '当前无队伍报名。' }}
            </div>
            <div v-for="s in chinaDetailSchools" :key="s.name"
                 class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span class="text-sm text-gray-800">{{ getSchoolDisplay(s.name, isEnglish) }}</span>
              <span class="text-xs text-gray-400 ml-2 whitespace-nowrap" v-if="s.count > 1">x{{ s.count }}</span>
            </div>
          </div>
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
