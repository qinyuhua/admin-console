<template>
  <div class="asset-manage-page">
    <div class="page-header">
      <h2>资产管理</h2>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ stats.totalAssets }}</div>
          <div class="stat-label">资产分组数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.totalItems }}</div>
          <div class="stat-label">资产明细数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.totalActiveUsers }}</div>
          <div class="stat-label">活跃用户数</div>
        </div>
      </div>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索资产名称"
        prefix-icon="el-icon-search"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="assets" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="资产名称" min-width="150" />
      
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'gold' ? 'warning' : 'info'">
            {{ scope.row.type === 'gold' ? '黄金' : '普通' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="amount" label="金额/克数" width="120" />

      <el-table-column prop="currency" label="币种" width="80">
        <template #default="scope">
          {{ scope.row.currency || 'CNY' }}
        </template>
      </el-table-column>

      <el-table-column label="所属用户" min-width="150">
        <template #default="scope">
          <div class="user-info" v-if="scope.row.userInfo">
            <img v-if="scope.row.userInfo.avatarUrl" :src="scope.row.userInfo.avatarUrl" class="user-avatar" />
            <span>{{ scope.row.userInfo.nickName || scope.row.userInfo.openId }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="countIn" label="计入总资产" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.countIn ? 'success' : 'info'">
            {{ scope.row.countIn ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createAt" label="创建时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.createAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
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
import { getAssets, updateAssetStatus, getAssetStats } from '../../api/assets'

export default {
  name: 'AssetManage',
  data() {
    return {
      assets: [],
      loading: false,
      searchKeyword: '',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      stats: {
        totalAssets: 0,
        totalItems: 0,
        totalActiveUsers: 0
      }
    }
  },
  mounted() {
    this.fetchStats()
    this.fetchAssets()
  },
  methods: {
    async fetchStats() {
      try {
        const response = await getAssetStats()
        if (response.success) {
          this.stats = response.data
        }
      } catch (error) {
        console.error('获取统计数据失败', error)
      }
    },
    async fetchAssets() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword
        }
        const response = await getAssets(params)
        if (response.success) {
          this.assets = response.data.list
          this.total = response.data.total
        } else {
          this.$message.error(response.message || '获取资产列表失败')
        }
      } catch (error) {
        this.$message.error('获取资产列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchAssets()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchAssets()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchAssets()
    },
    async handleToggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1
      const action = newStatus === 1 ? '启用' : '禁用'
      
      try {
        await this.$confirm(`确定要${action}该资产吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const response = await updateAssetStatus(row._id, newStatus)
        if (response.success) {
          this.$message.success(`${action}成功`)
          this.fetchAssets()
          this.fetchStats()
        } else {
          this.$message.error(response.message || `${action}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(`${action}失败`)
        }
      }
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
.asset-manage-page {
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
