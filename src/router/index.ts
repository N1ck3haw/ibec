import { createRouter, createWebHashHistory } from 'vue-router'

// ibec views
import Home from '../views/ibec/Home.vue'
import IbecLogin from '../views/ibec/Login.vue'
import Register from '../views/ibec/Register.vue'
import Submit from '../views/ibec/Submit.vue'
import About from '../views/ibec/About.vue'
import WorldMap from '../views/ibec/WorldMap.vue'


// admin views
import AdminLogin from '../views/admin/Login.vue'
import Dashboard from '../views/admin/Dashboard.vue'
import Teams from '../views/admin/Teams.vue'
import TeamDetail from '../views/admin/TeamDetail.vue'
import Files from '../views/admin/Files.vue'
import Scores from '../views/admin/Scores.vue'

// expert views
import ExpertLogin from '../views/expert/Login.vue'
import ReviewList from '../views/expert/ReviewList.vue'
import ReviewDetail from '../views/expert/ReviewDetail.vue'
import MyScores from '../views/expert/MyScores.vue'

const routes = [
  // ibec main
  { path: '/', component: Home, meta: { layout: 'main' } },
  { path: '/login', component: IbecLogin, meta: { layout: 'main' } },
  { path: '/register', component: Register, meta: { layout: 'main' } },
  { path: '/worldmap', component: WorldMap, meta: { layout: 'main' } },
  { path: '/submit', component: Submit, meta: { layout: 'main' } },
  { path: '/about', component: About, meta: { layout: 'main' } },

  // admin
  { path: '/admin', redirect: '/admin/login' },
  { path: '/admin/login', component: AdminLogin, meta: { layout: 'blank' } },
  { path: '/admin/dashboard', component: Dashboard, meta: { layout: 'admin', requiresAdminAuth: true } },
  { path: '/admin/teams', component: Teams, meta: { layout: 'admin', requiresAdminAuth: true } },
  { path: '/admin/teams/:id', component: TeamDetail, meta: { layout: 'admin', requiresAdminAuth: true } },
  { path: '/admin/files', component: Files, meta: { layout: 'admin', requiresAdminAuth: true } },
  { path: '/admin/scores', component: Scores, meta: { layout: 'admin', requiresAdminAuth: true } },

  // expert
  { path: '/expert', redirect: '/expert/login' },
  { path: '/expert/login', component: ExpertLogin, meta: { layout: 'blank' } },
  { path: '/expert/list', component: ReviewList, meta: { layout: 'expert', requiresExpertAuth: true } },
  { path: '/expert/review/:id', component: ReviewDetail, meta: { layout: 'expert', requiresExpertAuth: true } },
  { path: '/expert/my-scores', component: MyScores, meta: { layout: 'expert', requiresExpertAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAdminAuth && !localStorage.getItem('admin_token')) {
    next('/admin/login')
  } else if (to.meta.requiresExpertAuth && !localStorage.getItem('expert_token')) {
    next('/expert/login')
  } else if (to.path === '/admin/login' && localStorage.getItem('admin_token')) {
    next('/admin/dashboard')
  } else if (to.path === '/expert/login' && localStorage.getItem('expert_token')) {
    next('/expert/list')
  } else {
    next()
  }
})

export default router
