<template>
  <div class="wool-page">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">羊毛设置</h2>
        <p class="page-desc">维护羊毛活动的名称、logo、期限、链接与状态</p>
      </div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增活动
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索活动名称"
        clearable
        class="keyword-input"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <el-select
        v-model="statusFilter"
        placeholder="全部状态"
        clearable
        class="status-select"
        @change="handleSearch"
      >
        <el-option label="有效" value="valid" />
        <el-option label="无效" value="invalid" />
      </el-select>

      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon> 重置
      </el-button>
    </div>

    <!-- 列表 -->
    <div class="table-card">
      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column label="活动 Logo" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.activityLogo"
              :src="row.activityLogo"
              :preview-src-list="[row.activityLogo]"
              fit="cover"
              preview-teleported
              class="activity-logo"
            >
              <template #error>
                <div class="logo-fallback"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
            <div v-else class="logo-fallback"><el-icon><Picture /></el-icon></div>
          </template>
        </el-table-column>

        <el-table-column prop="activityName" label="活动名称" min-width="160" show-overflow-tooltip />

        <el-table-column label="活动期限" min-width="230">
          <template #default="{ row }">{{ formatPeriod(row) }}</template>
        </el-table-column>

        <el-table-column label="活动链接" min-width="200">
          <template #default="{ row }">
            <a
              v-if="row.activityLink"
              :href="row.activityLink"
              target="_blank"
              rel="noopener noreferrer"
              class="activity-link"
            >{{ row.activityLink }}</a>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'valid' ? 'success' : 'info'" effect="light">
              {{ row.status === 'valid' ? '有效' : '无效' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建信息" width="150">
          <template #default="{ row }">
            <div class="meta-line">{{ formatTime(row.createAt) }}</div>
            <div class="meta-sub">{{ row.createBy || '-' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="更新信息" width="150">
          <template #default="{ row }">
            <div class="meta-line">{{ formatTime(row.updateAt) }}</div>
            <div class="meta-sub">{{ row.updateBy || '-' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" plain @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑羊毛活动' : '新增羊毛活动'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" maxlength="50" show-word-limit placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动 Logo" prop="activityLogo">
          <div class="logo-field">
            <el-input v-model="form.activityLogo" maxlength="500" placeholder="请输入 logo 图片地址（http/https）" />
            <el-image v-if="form.activityLogo" :src="form.activityLogo" fit="cover" class="logo-preview">
              <template #error>
                <div class="logo-fallback"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
          </div>
        </el-form-item>

        <el-form-item label="活动期限" prop="period">
          <div class="period-field">
            <el-checkbox v-model="form.unlimited" @change="handleUnlimitedChange">无限期</el-checkbox>

            <el-date-picker
              v-if="form.unlimited"
              v-model="form.startAtValue"
              type="datetime"
              placeholder="请选择活动开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="period-picker"
              @change="revalidatePeriod"
            />
            <el-date-picker
              v-else
              v-model="form.period"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="period-picker"
              @change="revalidatePeriod"
            />
          </div>
        </el-form-item>

        <el-form-item label="活动链接" prop="activityLink">
          <el-input v-model="form.activityLink" maxlength="500" placeholder="请输入活动链接（http/https）" />
        </el-form-item>

        <el-form-item label="活动状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="valid">有效</el-radio>
            <el-radio value="invalid">无效</el-radio>
          </el-radio-group>
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
import { Plus, Search, Refresh, Picture } from '@element-plus/icons-vue'
import {
  getWoolActivities,
  createWoolActivity,
  updateWoolActivity,
  deleteWoolActivity
} from '../../api/woolActivity'

// ───────── 列表 ─────────
const list = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const statusFilter = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await getWoolActivities({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim(),
      status: statusFilter.value
    })
    const data = res.data || {}
    list.value = data.list || []
    total.value = data.total || 0
  } catch {
    // 错误已由 request 拦截器统一提示
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  keyword.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchList()
}

function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
  fetchList()
}

function handleCurrentChange(val) {
  currentPage.value = val
  fetchList()
}

// ───────── 时间格式化 ─────────
function pad(num) {
  return String(num).padStart(2, '0')
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 无限期结束时间：9999-12-31 23:59:59，界面上展示为 9999-99-99
const UNLIMITED_END_AT = 253402300799999

function isUnlimited(row) {
  return Number(row.endAt) >= UNLIMITED_END_AT
}

function formatPeriod(row) {
  if (!row.startAt) return '-'
  if (isUnlimited(row)) return `${formatTime(row.startAt)} ~ 9999-99-99`
  if (!row.endAt) return '-'
  return `${formatTime(row.startAt)} ~ ${formatTime(row.endAt)}`
}

function toPickerValue(timestamp) {
  if (!timestamp) return null
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function toTimestamp(value) {
  if (!value) return null
  const ts = new Date(String(value).replace(' ', 'T')).getTime()
  return Number.isNaN(ts) ? null : ts
}

// ───────── 弹窗 / 表单 ─────────
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()

const defaultForm = () => ({
  activityName: '',
  activityLogo: '',
  activityLink: '',
  period: [],
  startAtValue: '',
  unlimited: false,
  status: 'valid'
})

const form = ref(defaultForm())

function validatePeriod(rule, value, callback) {
  if (form.value.unlimited) {
    if (!form.value.startAtValue) return callback(new Error('请选择活动开始时间'))
    return callback()
  }
  if (!value || value.length !== 2) return callback(new Error('请选择活动期限'))
  callback()
}

const rules = {
  activityName: [{ required: true, message: '请填写活动名称', trigger: 'blur' }],
  period: [{ validator: validatePeriod, trigger: 'change' }]
}

function handleUnlimitedChange(checked) {
  if (checked) {
    form.value.period = []
  } else {
    form.value.startAtValue = ''
  }
  formRef.value?.clearValidate('period')
}

function revalidatePeriod() {
  formRef.value?.validateField('period').catch(() => {})
}

function openDialog(row) {
  editingId.value = row?._id || null
  if (row) {
    const unlimited = isUnlimited(row)
    form.value = {
      activityName: row.activityName || '',
      activityLogo: row.activityLogo || '',
      activityLink: row.activityLink || '',
      period: !unlimited && row.startAt && row.endAt
        ? [toPickerValue(row.startAt), toPickerValue(row.endAt)]
        : [],
      startAtValue: unlimited ? toPickerValue(row.startAt) : '',
      unlimited,
      status: row.status === 'invalid' ? 'invalid' : 'valid'
    }
  } else {
    form.value = defaultForm()
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()

  let startAt
  let endAt
  if (form.value.unlimited) {
    startAt = toTimestamp(form.value.startAtValue)
    if (!startAt) {
      ElMessage.warning('请选择活动开始时间')
      return
    }
    endAt = UNLIMITED_END_AT
  } else {
    const period = form.value.period || []
    if (period.length !== 2) {
      ElMessage.warning('请选择完整的活动期限')
      return
    }
    startAt = toTimestamp(period[0])
    endAt = toTimestamp(period[1])
  }

  const payload = {
    activityName: form.value.activityName,
    activityLogo: form.value.activityLogo,
    activityLink: form.value.activityLink,
    startAt,
    endAt,
    status: form.value.status
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateWoolActivity(editingId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createWoolActivity(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

// ───────── 删除 ─────────
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定要删除活动「${row.activityName}」吗？`, '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await deleteWoolActivity(row._id)
  ElMessage.success('已删除')
  if (list.value.length === 1 && currentPage.value > 1) currentPage.value -= 1
  fetchList()
}
</script>

<style scoped>
.wool-page {
  padding: 4px 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
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

/* ── 筛选栏 ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
}

.keyword-input {
  width: 240px;
}

.status-select {
  width: 150px;
}

/* ── 表格卡片 ── */
.table-card {
  padding: 8px 16px 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
}

.activity-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 18px;
}

.logo-preview {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid var(--line);
  flex: none;
}

.activity-link {
  color: var(--brand);
  text-decoration: none;
  word-break: break-all;
}

.activity-link:hover {
  text-decoration: underline;
}

.meta-line {
  color: #475467;
  font-size: 12px;
  line-height: 1.6;
}

.meta-sub {
  color: #9aa5b5;
  font-size: 11px;
  line-height: 1.6;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ── 弹窗表单 ── */
.logo-field {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.period-field {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.period-picker {
  flex: 1;
}
</style>
