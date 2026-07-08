import { createApp } from 'vue'
import axios from 'axios'
import './style.css'
import App from './App.vue'
import router from './router'

const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '')

axios.interceptors.request.use(config => {
  if (config.url && config.url.startsWith('/api')) {
    config.url = baseUrl + config.url
  }
  return config
})

createApp(App).use(router).mount('#app')
