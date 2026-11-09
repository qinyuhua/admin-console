<template>
  <div class="asset-item-page">
    <div class="page-header">
      <h2>资产明细</h2>
      <div class="stats">
        <div class="stat-item stat-blue">
          <div class="stat-value">{{ stats.totalItems }}</div>
          <div class="stat-label">明细总数</div>
        </div>
        <div class="stat-item stat-purple">
          <div class="stat-value">{{ stats.totalAssets }}</div>
          <div class="stat-label">所属分组数</div>
        </div>
        <div class="stat-item stat-green">
          <div class="stat-value">{{ stats.totalActiveUsers }}</div>
          <div class="stat-label">活跃用户数</div>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="明细名称关键词"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
        style="width: 200px"
      />
      <el-select
        v-model="filterUserId"
        placeholder="所属用户"
        clearable
        @change="handleSearch"
        style="width: 180px"
      >
        <el-option
          v-for="u in userOptions"
          :key="u._id"
          :label="u.nickName || u.openId"
          :value="u._id"
        />
      </el-select>
      <el-select
        v-model="filterAssetId"
        placeholder="所属资产"
        clearable
        filterable
        @change="handleSearch"
        style="width: 200px"
      >
        <el-option
          v-for="a in assetOptions"
          :key="a._id"
          :label="a.name"
          :value="a._id"
        />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
      <div style="flex: 1" />
      <el-button type="primary" @click="openAdd">+ 新增明细</el-button>
    </div>

    <el-table :data="items" style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="明细名称" min-width="160" fixed="left" />

      <el-table-column label="所属资产" min-width="140">
        <template #default="scope">
          <div class="asset-cell" v-if="scope.row.assetInfo">
            <span class="asset-color" :style="{ background: getAssetColor(scope.row.assetInfo) }" />
            <el-tag :type="scope.row.assetInfo.type === 'gold' ? 'warning' : 'info'" size="small">
              {{ scope.row.assetInfo.type === 'gold' ? '黄金' : '普通' }}
            </el-tag>
            <span>{{ scope.row.assetInfo.name }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="所属用户" min-width="160">
        <template #default="scope">
          <div class="user-info" v-if="scope.row.userInfo">
            <img v-if="scope.row.userInfo.avatarUrl" :src="scope.row.userInfo.avatarUrl" class="user-avatar" />
            <span>{{ scope.row.userInfo.nickName || scope.row.userInfo.openId }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="amount" label="金额" width="120">
        <template #default="scope">
          {{ scope.row.amount ? `¥${parseFloat(scope.row.amount).toFixed(2)}` : '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="grams" label="克数" width="100">
        <template #default="scope">
          {{ scope.row.grams ? `${scope.row.grams}g` : '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="cost" label="成本价" width="110">
        <template #default="scope">
          {{ scope.row.cost ? `¥${scope.row.cost}/g` : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="收益率" width="120">
        <template #default="scope">
          <span v-if="scope.row.yieldRate">
            {{ scope.row.yieldRate }}%
            {{ scope.row.yieldType === 'year' ? '/年' : scope.row.yieldType === 'month' ? '/月' : '' }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="countIn" label="计入" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.countIn !== false ? 'success' : 'info'" size="small">
            {{ scope.row.countIn !== false ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createAt" label="创建时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.createAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing ? '编辑明细' : '新增明细'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="所属资产" prop="assetId">
          <el-select
            v-model="form.assetId"
            filterable
            placeholder="选择所属资产分组"
            style="width: 100%"
          >
            <el-option
              v-for="a in assetOptions"
              :key="a._id"
              :label="`${a.name} (${a.type === 'gold' ? '黄金' : '普通'})`"
              :value="a._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="明细名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：余额宝/金条A" />
        </el-form-item>

        <el-form-item label="金额">
          <el-input v-model="form.amount" placeholder="请输入金额">
            <template #append>¥</template>
          </el-input>
        </el-form-item>

        <el-form-item label="克数">
          <el-input v-model="form.grams" placeholder="黄金明细专用">
            <template #append>g</template>
          </el-input>
        </el-form-item>

        <el-form-item label="成本价">
          <el-input v-model="form.cost" placeholder="元/克">
            <template #append>¥/g</template>
          </el-input>
        </el-form-item>

        <el-form-item label="收益率类型">
          <el-select v-model="form.yieldType" placeholder="无">
            <el-option label="无" value="" />
            <el-option label="年化" value="year" />
            <el-option label="月化" value="month" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.yieldType" label="收益率">
          <el-input v-model="form.yieldRate" placeholder="百分比，如 3.5">
            <template #append>%</template>
          </el-input>
        </el-form-item>

        <el-form-item label="计入合计">
          <el-switch v-model="form.countIn" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAssetItems, getAssetStats, addAssetItem, updateAssetItem, deleteAssetItem, getAssets
} from '../../api/assets'
import { getMiniAppUsers } from '../../api/miniAppUsers'

export default {
  name: 'AssetItemManage',
  data() {
    return {
      items: [],
      assetOptions: [],
      userOptions: [],
      loading: false,
      saving: false,
      searchKeyword: '',
      filterUserId: '',
      filterAssetId: '',
      currentPage: 1,
      pageSize: 20,
      total: 0,
      stats: { totalItems: 0, totalAssets: 0, totalActiveUsers: 0 },
      dialogVisible: false,
      editing: null,
      form: this.emptyForm(),
      rules: {
        assetId: [{ required: true, message: '请选择所属资产', trigger: 'change' }],
        name: [{ required: true, message: '请输入明细名称', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.fetchStats()
    this.fetchAssets()
    this.fetchUsers()
    this.fetchItems()
  },
  methods: {
    emptyForm() {
      return {
        assetId: '', name: '', amount: '', grams: '', cost: '',
        yieldType: '', yieldRate: '', countIn: true, sort: 0
      }
    },

    async fetchUsers() {
      try {
        const res = await getMiniAppUsers({ page: 1, pageSize: 500 })
        if (res.success) this.userOptions = res.data?.list || res.data || []
      } catch {}
    },

    async fetchStats() {
      try {
        const res = await getAssetStats()
        if (res.success) this.stats = res.data
      } catch {}
    },

    async fetchAssets() {
      try {
        const res = await getAssets({ page: 1, pageSize: 500 })
        if (res.success) this.assetOptions = res.data.list
      } catch {}
    },

    async fetchItems() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.searchKeyword || undefined,
          userId: this.filterUserId || undefined,
          assetId: this.filterAssetId || undefined
        }
        const res = await getAssetItems(params)
        if (res.success) {
          this.items = res.data.list
          this.total = res.data.total
        } else {
          this.$message.error(res.message || '获取明细失败')
        }
      } catch {
        this.$message.error('获取明细失败')
      } finally {
        this.loading = false
      }
    },

    handleReset() {
      this.searchKeyword = ''
      this.filterUserId = ''
      this.filterAssetId = ''
      this.currentPage = 1
      this.fetchItems()
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchItems()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchItems()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchItems()
    },

    async openAdd() {
      this.editing = null
      this.form = this.emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef?.clearValidate())
    },

    openEdit(row) {
      this.editing = row
      this.form = { ...row, assetId: row.assetId }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.formRef?.clearValidate())
    },

    async handleSave() {
      try {
        await this.$refs.formRef.validate()
      } catch { return }

      this.saving = true
      try {
        const payload = { ...this.form }
        const res = this.editing
          ? await updateAssetItem({ ...payload, _id: this.editing._id })
          : await addAssetItem(payload)

        if (res.success) {
          this.$message.success(this.editing ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.fetchItems()
          this.fetchStats()
        } else {
          this.$message.error(res.message || '操作失败')
        }
      } catch {
        this.$message.error('操作失败')
      } finally {
        this.saving = false
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除明细「${row.name}」？`, '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
        })
        const res = await deleteAssetItem(row._id)
        if (res.success) {
          this.$message.success('删除成功')
          this.fetchItems()
          this.fetchStats()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch {}
    },

    getAssetColor(assetInfo) {
      return assetInfo && assetInfo.color ? assetInfo.color : '#1677ff'
    },

    formatTime(ts) {
      if (!ts) return '-'
      return new Date(ts).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.asset-item-page {
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
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}
.stat-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-purple { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.stat-green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 14px;
  opacity: 0.9;
}
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.asset-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.asset-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
