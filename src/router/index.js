import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/layout/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/layout/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/account',
    children: [
      {
        path: 'account',
        name: 'AccountConfig',
        component: () => import('../views/system/account/index.vue'),
        meta: { title: '账号配置', icon: 'User' }
      },
      {
        path: 'menu',
        name: 'MenuConfig',
        component: () => import('../views/system/menu/index.vue'),
        meta: { title: '菜单配置', icon: 'Menu' }
      },
      {
        path: 'role',
        name: 'RoleConfig',
        component: () => import('../views/system/role/index.vue'),
        meta: { title: '角色配置', icon: 'UserFilled' }
      },
      {
        path: 'miniapp-user',
        name: 'MiniAppUserConfig',
        component: () => import('../views/miniapp-user/index.vue'),
        meta: { title: '小程序用户', icon: 'Iphone' }
      },
      {
        path: 'asset',
        name: 'AssetManage',
        component: () => import('../views/asset/index.vue'),
        meta: { title: '资产管理', icon: 'TrendCharts' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return '/login'
  }
  if (to.meta.public && auth.isLoggedIn) {
    return '/'
  }
})

export default router
