<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useLanguage } from '../../composables/useLanguage'

const router = useRouter()
const { isEnglish } = useLanguage()

const username = ref('')
const password = ref('')
const teams = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const isAuthenticated = ref(false)
const expandedTeamId = ref<number | null>(null)
const teamFiles = ref<any[]>([])
const filesLoading = ref(false)

const checkAuth = () => {
    const auth = localStorage.getItem('admin_auth')
    if (auth) {
        isAuthenticated.value = true
        fetchTeams()
    }
}

const login = async () => {
    // Basic Auth Format: Basic base64(username:password)
    const token = btoa(`${username.value}:${password.value}`)
    const authHeader = `Basic ${token}`
    
    loading.value = true
    error.value = ''
    
    try {
        // Try to fetch teams to verify credentials
        await axios.get('/api/admin/teams', {
            headers: { Authorization: authHeader }
        })
        
        localStorage.setItem('admin_auth', authHeader)
        isAuthenticated.value = true
        fetchTeams()
    } catch (e: any) {
        error.value = 'Invalid credentials'
        isAuthenticated.value = false
    } finally {
        loading.value = false
    }
}

const logout = () => {
    localStorage.removeItem('admin_auth')
    isAuthenticated.value = false
    teams.value = []
    username.value = ''
    password.value = ''
}

const fetchTeams = async () => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) return

    try {
        const res = await axios.get('/api/admin/teams', {
            headers: { Authorization: auth }
        })
        teams.value = res.data
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
            logout()
        }
    }
}

const toggleFiles = async (teamId: number) => {
    if (expandedTeamId.value === teamId) {
        expandedTeamId.value = null
        return
    }
    
    expandedTeamId.value = teamId
    filesLoading.value = true
    teamFiles.value = []
    
    const auth = localStorage.getItem('admin_auth')
    if (!auth) return

    try {
        // Ideally we should filter by team_id on backend, but for now we fetch all files and filter client side
        // or add a query param. The current backend `list_all_files` returns all. 
        // Let's filter client side for this demo or optimize backend later.
        const res = await axios.get('/api/admin/files', {
            headers: { Authorization: auth }
        })
        teamFiles.value = res.data.filter((f: any) => f.team_id === teamId)
    } catch (e) {
        console.error(e)
    } finally {
        filesLoading.value = false
    }
}

const downloadAdminFile = async (fileId: number, filename: string) => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) return
    
    try {
        const response = await axios.get(`/api/admin/download/${fileId}`, {
            headers: { Authorization: auth },
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
    } catch (e) {
        console.error(e)
        alert('Download failed')
    }
}

const downloadCsv = async () => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) return
    
    try {
        const response = await axios.get('/api/admin/export', {
            headers: { Authorization: auth },
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'teams_export.csv');
        document.body.appendChild(link);
        link.click();
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    checkAuth()
})
</script>

<template>
    <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">
                    {{ isEnglish ? 'Admin Dashboard' : '管理后台' }}
                </h1>
                <div v-if="isAuthenticated">
                    <button @click="logout" class="text-gray-600 hover:text-gray-900">
                        {{ isEnglish ? 'Logout' : '退出登录' }}
                    </button>
                </div>
            </div>

            <!-- Login Form -->
            <div v-if="!isAuthenticated" class="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <form @submit.prevent="login" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Username</label>
                        <input v-model="username" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue p-2 border">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input v-model="password" type="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue p-2 border">
                    </div>
                    <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
                    <button type="submit" :disabled="loading" class="w-full bg-brand-blue text-white py-2 px-4 rounded-md hover:bg-blue-700">
                        {{ loading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>
            </div>

            <!-- Dashboard -->
            <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-xl font-semibold text-gray-800">
                        {{ isEnglish ? 'Registered Teams' : '已报名队伍' }} ({{ teams.length }})
                    </h2>
                    <button @click="downloadCsv" class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center">
                        <span class="mr-2">📥</span> {{ isEnglish ? 'Export CSV' : '导出 CSV' }}
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <template v-for="team in teams" :key="team.id">
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ team.id }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {{ team.name }}
                                        <div class="text-xs text-gray-500 font-normal">{{ team.leader_name }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]" :title="team.track">{{ team.track }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]" :title="team.project_title">{{ team.project_title || '-' }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <span v-if="team.file_count > 0" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Submitted ({{ team.file_count }})
                                        </span>
                                        <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button @click="toggleFiles(team.id)" class="text-brand-blue hover:text-blue-900">
                                            {{ expandedTeamId === team.id ? 'Hide Files' : 'View Files' }}
                                        </button>
                                    </td>
                                </tr>
                                <!-- Files Expansion -->
                                <tr v-if="expandedTeamId === team.id" class="bg-gray-50">
                                    <td colspan="6" class="px-6 py-4">
                                        <div v-if="filesLoading" class="text-sm text-gray-500">Loading files...</div>
                                        <div v-else-if="teamFiles.length === 0" class="text-sm text-gray-500 italic">No files uploaded.</div>
                                        <table v-else class="min-w-full divide-y divide-gray-200 border rounded-md bg-white">
                                            <thead>
                                                <tr class="bg-gray-100">
                                                    <th class="px-4 py-2 text-xs font-medium text-gray-500">Filename</th>
                                                    <th class="px-4 py-2 text-xs font-medium text-gray-500">Type</th>
                                                    <th class="px-4 py-2 text-xs font-medium text-gray-500">Version</th>
                                                    <th class="px-4 py-2 text-xs font-medium text-gray-500">Date</th>
                                                    <th class="px-4 py-2 text-xs font-medium text-gray-500">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="file in teamFiles" :key="file.id">
                                                    <td class="px-4 py-2 text-sm text-gray-900">{{ file.original_filename }}</td>
                                                    <td class="px-4 py-2 text-sm text-gray-500">{{ file.file_type }}</td>
                                                    <td class="px-4 py-2 text-sm text-gray-500">v{{ file.version }}</td>
                                                    <td class="px-4 py-2 text-sm text-gray-500">{{ new Date(file.created_at).toLocaleString() }}</td>
                                                    <td class="px-4 py-2 text-sm">
                                                        <button @click="downloadAdminFile(file.id, file.original_filename)" class="text-blue-600 hover:text-blue-900">Download</button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
