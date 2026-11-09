<template>
  <div class="module-config-page">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">模块配置</h2>
        <p class="page-desc">管理小程序首页展示的功能模块，可配置标题、副标题等信息</p>
      </div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增模块
      </el-button>
    </div>

    <!-- 卡片列表 -->
    <div v-loading="loading" class="card-grid">
      <div
        v-for="(item, index) in list"
        :key="item._id"
        class="module-card"
        :class="{ disabled: !item.enabled }"
      >
        <!-- 拖拽排序把手 & 序号 -->
        <div class="card-order">
          <span class="order-badge">{{ index + 1 }}</span>
        </div>

        <!-- 图标区 -->
        <div class="card-icon-wrap" :style="{ background: item.iconBg || 'var(--brand-soft)' }">
          <el-icon v-if="item.icon" class="card-icon" :style="{ color: item.iconColor || 'var(--brand)' }">
            <component :is="item.icon" />
          </el-icon>
          <el-icon v-else class="card-icon" style="color:var(--brand)"><Grid /></el-icon>
        </div>

        <!-- 内容 -->
        <div class="card-body">
          <div class="card-title">{{ item.title || '（未填写标题）' }}</div>
          <div class="card-subtitle">{{ item.subtitle || '—' }}</div>
          <div v-if="item.description" class="card-desc">{{ item.description }}</div>
          <div class="card-tags">
            <el-tag size="small" :type="item.enabled ? 'success' : 'info'">
              {{ item.enabled ? '已启用' : '已禁用' }}
            </el-tag>
            <el-tag size="small" type="warning">排序 {{ item.order ?? index }}</el-tag>
          </div>
        </div>

        <!-- 操作 -->
        <div class="card-actions">
          <el-button size="small" plain @click="openDialog(item)">编辑</el-button>
          <el-button
            size="small"
            plain
            :type="item.enabled ? 'warning' : 'success'"
            @click="handleToggle(item)"
          >{{ item.enabled ? '禁用' : '启用' }}</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(item)">删除</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && list.length === 0" description="暂无模块配置，点击右上角新增" class="empty-state" />
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑模块配置' : '新增模块配置'"
      width="560px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="模块标题" prop="title">
          <el-input v-model="form.title" placeholder="如：资产总览" maxlength="30" show-word-limit />
        </el-form-item>

        <el-form-item label="模块副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="如：查看您的所有资产" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="模块描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="对该模块功能的详细说明（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="图标名称" prop="icon">
              <el-input v-model="form.icon" placeholder="如：TrendCharts" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序顺序" prop="order">
              <el-input-number v-model="form.order" :min="0" :max="999" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="图标背景色" prop="iconBg">
              <el-color-picker v-model="form.iconBg" />
              <span class="color-preview" :style="{ background: form.iconBg }" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标颜色" prop="iconColor">
              <el-color-picker v-model="form.iconColor" />
              <span class="color-preview" :style="{ background: form.iconColor }" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="跳转路径" prop="path">
          <el-input v-model="form.path" placeholder="如：/pages/asset/index（可选）" />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ editingId ? '保存修改' : '确认新增' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid } from '@element-plus/icons-vue'
import {
  getModuleConfigs,
  createModuleConfig,
  updateModuleConfig,
  deleteModuleConfig
} from '../../api/moduleConfig'

// ───────── 列表 ─────────
const list = ref([])
const loading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getModuleConfigs()
    list.value = (res.data || res || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch {
    // 错误已由 request 拦截器统一提示
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

// ───────── 弹窗 / 表单 ─────────
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()

const defaultForm = () => ({
  title: '',
  subtitle: '',
  description: '',
  icon: '',
  iconBg: 'var(--brand-soft)',
  iconColor: 'var(--brand)',
  path: '',
  order: 0,
  enabled: true
})

const form = ref(defaultForm())

const rules = {
  title: [{ required: true, message: '请填写模块标题', trigger: 'blur' }]
}

function openDialog(row) {
  editingId.value = row?._id || null
  form.value = row
    ? {
        title: row.title || '',
        subtitle: row.subtitle || '',
        description: row.description || '',
        icon: row.icon || '',
        iconBg: row.iconBg || 'var(--brand-soft)',
        iconColor: row.iconColor || 'var(--brand)',
        path: row.path || '',
        order: row.order ?? 0,
        enabled: row.enabled !== false
      }
    : defaultForm()
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateModuleConfig(editingId.value, form.value)
      ElMessage.success('修改成功')
    } else {
      await createModuleConfig(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ───────── 启用 / 禁用 ─────────
async function handleToggle(row) {
  const next = !row.enabled
  try {
    await updateModuleConfig(row._id, { ...row, enabled: next })
    ElMessage.success(next ? '已启用' : '已禁用')
    fetchList()
  } catch {}
}

// ───────── 删除 ─────────
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定要删除模块「${row.title}」吗？`, '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteModuleConfig(row._id)
  ElMessage.success('已删除')
  fetchList()
}
</script>

<style scoped>
.module-config-page {
  padding: 4px 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #172033;
}

.page-desc {
  margin: 0;
  font-size: 13px;
  color: #9aa5b5;
}

/* ── 卡片网格 ── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.module-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.module-card:hover {
  border-color: var(--brand);
  box-shadow: 0 4px 18px rgba(180, 83, 9, 0.12);
}

.module-card.disabled {
  opacity: 0.6;
  background: #fafafa;
}

.card-order {
  position: absolute;
  top: 14px;
  right: 16px;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 11px;
  font-weight: 700;
}

.card-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-body {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #172033;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 13px;
  color: #667085;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 12px;
  color: #9aa5b5;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f4f4;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 60px 0;
}

/* ── 弹窗表单 ── */
.dialog-form {
  padding: 0 8px;
}

.color-preview {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
