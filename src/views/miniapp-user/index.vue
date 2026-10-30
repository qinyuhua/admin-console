<template>
  <div class="miniapp-user-page">
    <div class="page-header">
      <h2>小程序用户管理</h2>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ wechatUsers }}</div>
          <div class="stat-label">微信用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ alipayUsers }}</div>
          <div class="stat-label">支付宝用户</div>
        </div>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索昵称、OpenID"
        prefix-icon="el-icon-search"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="platformFilter" placeholder="平台筛选" clearable @change="handleSearch">
        <el-option label="全部" value="" />
        <el-option label="微信" value="wechat" />
        <el-option label="支付宝" value="alipay" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleSearch">
        <el-option label="全部" value="" />
        <el-option label="正常" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="users" style="width: 100%" v-loading="loading">
      <el-table-column prop="nickName" label="昵称" min-width="120">
        <template #default="scope">
          <div class="user-info">
            <img v-if="scope.row.avatarUrl" :src="scope.row.avatarUrl" class="user-avatar" />
            <span>{{ scope.row.nickName || '未设置' }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="platform" label="平台" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.platform === 'wechat' ? 'success' : 'warning'">
            {{ scope.row.platform === 'wechat' ? '微信' : '支付宝' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="openId" label="OpenID" min-width="200" show-overflow-tooltip />

      <el-table-column prop="gender" label="性别" width="80">
        <template #default="scope">
          {{ getGenderText(scope.row.gender) }}
        </template>
      </el-table-column>

      <el-table-column prop="city" label="地区" min-width="150">
        <template #default="scope">
          {{ getLocationText(scope.row) }}
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="lastLoginAt" label="最后登录" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.lastLoginAt) }}
        </template>
      </el-table-column>

      <el-table-column prop="createAt" label="注册时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.createAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px; text-align: center"
    />
  </div>
</template>

<script>
import { getMiniAppUsers, updateMiniAppUserStatus, deleteMiniAppUser } from '../../api/miniAppUsers'

export default {
  name: 'MiniAppUserConfig',
  data() {
    return {
      users: [],
      loading: false,
      searchKeyword: '',
      platformFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      totalUsers: 0,
      wechatUsers: 0,
      alipayUsers: 0
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword,
          platform: this.platformFilter,
          status: this.statusFilter
        }
        const response = await getMiniAppUsers(params)
        if (response.success) {
          this.users = response.data.list
          this.total = response.data.total
          this.totalUsers = response.data.totalUsers
          this.wechatUsers = response.data.wechatUsers
          this.alipayUsers = response.data.alipayUsers
        } else {
          this.$message.error(response.message || '获取用户列表失败')
        }
      } catch (error) {
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchUsers()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchUsers()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchUsers()
    },
    async handleToggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1
      const action = newStatus === 1 ? '启用' : '禁用'
      
      try {
        await this.$confirm(`确定要${action}该用户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await updateMiniAppUserStatus(row._id, newStatus)
        if (response.success) {
          this.$message.success(`${action}成功`)
          this.fetchUsers()
        } else {
          this.$message.error(response.message || `${action}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(`${action}失败`)
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该用户吗？此操作不可恢复！', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })

        const response = await deleteMiniAppUser(row._id)
        if (response.success) {
          this.$message.success('删除成功')
          this.fetchUsers()
        } else {
          this.$message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    getGenderText(gender) {
      const map = { 0: '未知', 1: '男', 2: '女' }
      return map[gender] || '未知'
    },
    getLocationText(row) {
      const parts = [row.country, row.province, row.city].filter(Boolean)
      return parts.length > 0 ? parts.join(' ') : '未知'
    },
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.miniapp-user-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar .el-input {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
