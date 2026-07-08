import { ref } from 'vue'

const STORAGE_KEY = 'ibec_lang'
const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'zh'
  return localStorage.getItem(STORAGE_KEY) || 'zh'
}
const isEnglish = ref(getStoredLanguage() === 'en')

export function useLanguage() {
  const persist = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, isEnglish.value ? 'en' : 'zh')
  }

  const toggleLang = () => {
    isEnglish.value = !isEnglish.value
    persist()
  }

  const setLanguage = (lang: 'en' | 'zh') => {
    isEnglish.value = lang === 'en'
    persist()
  }

  return {
    isEnglish,
    toggleLang,
    toggle: toggleLang,
    setLanguage
  }
}
