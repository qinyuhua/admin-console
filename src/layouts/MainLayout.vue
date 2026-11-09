<template>
  <el-container class="app-shell">
    <el-aside width="224px" class="app-sidebar">
      <div class="brand-mark">
        <div class="brand-symbol"><span></span><span></span><span></span></div>
        <span class="brand-name">Admin</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="app-menu"
        router
      >
        <template v-for="group in menuTree" :key="group._id">
          <el-sub-menu v-if="group.children && group.children.length" :index="String(group._id)">
            <template #title>
              <el-icon><component :is="resolveIcon(group.icon)" /></el-icon>
              <span>{{ group.menuName }}</span>
            </template>
            <el-menu-item
              v-for="child in group.children"
              :key="child._id"
              :index="child.path || `/${child._id}`"
            >
              <el-icon><component :is="resolveIcon(child.icon)" /></el-icon>
              <span>{{ child.menuName }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item
            v-else
            :index="group.path || `/${group._id}`"
          >
            <el-icon><component :is="resolveIcon(group.icon)" /></el-icon>
            <span>{{ group.menuName }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container class="content-shell">
      <el-header class="topbar">
        <div class="breadcrumb-block">
          <div class="breadcrumb-title">{{ currentPageTitle }}</div>
          <div class="breadcrumb-subtitle">欢迎回来，这里是你的控制台</div>
        </div>
        <div class="topbar-actions">
          <el-icon class="topbar-icon"><Bell /></el-icon>
          <span class="language">CN <span class="language-chevron">⌄</span></span>
          <el-divider direction="vertical" />
          <el-dropdown @command="handleCommand">
            <span class="profile-trigger">
              <el-avatar :size="34" class="profile-avatar">{{ displayName.charAt(0).toUpperCase() }}</el-avatar>
              <span class="profile-copy">
                <strong>{{ displayName }}</strong>
                <small>用户</small>
              </span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox } from 'element-plus'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import request from '../api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta.title || '')
const displayName = computed(() => auth.userInfo?.name || auth.userInfo?.username || auth.userInfo?.account || '用户')

const menuTree = ref([])

function resolveIcon(name) {
  if (!name) return ElementPlusIcons.Menu
  return ElementPlusIcons[name] || ElementPlusIcons.Menu
}

async function fetchMenuTree() {
  try {
    const res = await request.post('/menu/list')
    if (res.data) menuTree.value = res.data
  } catch (e) {
    // 菜单加载失败不阻塞主流程
  }
}

onMounted(() => {
  fetchMenuTree()
})

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      auth.logout()
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f4f8f8;
}

.app-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  border-right: 1px solid var(--line);
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 68px;
  padding: 0 18px;
  border-bottom: 1px solid var(--line);
}

.brand-symbol {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 24px;
  height: 28px;
  padding: 4px;
  border-radius: 8px;
  background: var(--brand);
}

.brand-symbol span {
  width: 4px;
  border-radius: 4px;
  background: #fff;
}

.brand-symbol span:first-child { height: 12px; }
.brand-symbol span:nth-child(2) { height: 18px; }
.brand-symbol span:last-child { height: 9px; }

.brand-name {
  color: #1e293b;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -.3px;
}

.app-menu {
  flex: 1;
  border-right: none;
  padding: 14px 9px;
  background: transparent;
}

.app-menu :deep(.el-menu-item) {
  height: 42px;
  margin: 4px 0;
  border-radius: 9px;
  color: #667085;
  font-size: 13px;
}

.app-menu :deep(.el-sub-menu) {
  margin: 4px 0;
}

.app-menu :deep(.el-sub-menu__title) {
  height: 42px;
  border-radius: 9px;
  color: #667085;
  font-size: 13px;
}

.app-menu :deep(.el-sub-menu__title:hover) {
  background: var(--brand-soft-hover);
  color: var(--brand);
}

.app-menu :deep(.el-sub-menu.is-opened .el-sub-menu__title) {
  background: var(--brand-soft-hover);
  color: var(--brand);
}

.app-menu :deep(.el-menu-item .el-icon) { color: #718096; }
.app-menu :deep(.el-sub-menu__title .el-icon) { color: #718096; }
.app-menu :deep(.el-menu-item:hover) { background: var(--brand-soft-hover); color: var(--brand); }
.app-menu :deep(.el-menu-item.is-active) {
  background: var(--brand-soft);
  color: var(--brand);
  font-weight: 600;
}
.app-menu :deep(.el-menu-item.is-active .el-icon) { color: var(--brand); }
.app-menu :deep(.el-sub-menu.is-opened .el-sub-menu__title .el-icon) { color: var(--brand); }

.content-shell { min-width: 0; }

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--line);
}

.breadcrumb-title { color: #172033; font-size: 16px; font-weight: 700; }
.breadcrumb-subtitle { margin-top: 3px; color: #9aa5b5; font-size: 11px; }
.topbar-actions { display: flex; align-items: center; gap: 18px; color: #748094; }
.topbar-icon { color: #667085; font-size: 17px; }
.language { color: #64748b; font-size: 12px; }
.language-chevron { margin-left: 3px; color: #9aa5b5; }
.profile-trigger { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.profile-avatar { background: var(--brand); color: white; font-size: 13px; font-weight: 700; }
.profile-copy { display: flex; flex-direction: column; gap: 1px; }
.profile-copy strong { color: #273244; font-size: 12px; font-weight: 600; }
.profile-copy small { color: #a2acb9; font-size: 10px; }

.main-content {
  min-height: calc(100vh - 68px);
  padding: 24px;
  background: linear-gradient(135deg, #FFF8EA 0%, #FFFBF1 46%, #FFFDF6 100%);
}

:deep(.el-divider--vertical) { height: 20px; margin: 0; border-color: var(--line); }

@media (max-width: 760px) {
  .app-sidebar { width: 70px !important; }
  .brand-mark { justify-content: center; padding: 0; }
  .brand-name, .app-menu :deep(.el-menu-item span), .app-menu :deep(.el-sub-menu__title span) { display: none; }
  .app-menu { padding-inline: 8px; }
  .app-menu :deep(.el-menu-item) { justify-content: center; padding: 0 !important; }
  .app-menu :deep(.el-sub-menu__title) { justify-content: center; padding: 0 !important; }
  .profile-copy, .language, .topbar-actions > .el-divider { display: none; }
  .topbar { padding: 0 16px; }
  .main-content { padding: 16px; }
}
</style>
