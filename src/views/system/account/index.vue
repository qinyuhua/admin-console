<template>
  <div class="page-container">
    <div class="page-header">
      <h2>账号配置</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增账号
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索账号/姓名"
        clearable
        style="width: 250px;"
        @keyup.enter="fetchList"
        @clear="fetchList"
      />
      <el-button type="primary" @click="fetchList">查询</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="account" label="账号" width="200" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑账号' : '新增账号'" width="500px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="账号" prop="account">
          <el-input
            v-model="dialogForm.account"
            placeholder="手机号或邮箱"
            :disabled="!!editingId"
          />
        </el-form-item>
        <el-form-item label="密码" :prop="editingId ? '' : 'password'">
          <el-input
            v-model="dialogForm.password"
            type="password"
            show-password
            :placeholder="editingId ? '留空则不修改' : '请输入密码'"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="dialogForm.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="dialogForm.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="dialogForm.roleIds" multiple style="width: 100%;" placeholder="选择角色">
            <el-option
              v-for="r in roleOptions"
              :key="r._id"
              :label="r.roleName"
              :value="r._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dialogForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../../../api'

const loading = ref(false)
const tableData = ref([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogFormRef = ref()
const editingId = ref('')
const submitting = ref(false)
const roleOptions = ref([])

const dialogForm = reactive({
  account: '',
  password: '',
  name: '',
  phone: '',
  email: '',
  roleIds: [],
  status: 1
})

const dialogRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', { hour12: false })
}

async function fetchList() {
  loading.value = true
  try {
    const res = await request.post('/account/list', {
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  const res = await request.post('/role/all')
  roleOptions.value = res.data
}

function openDialog(row) {
  editingId.value = row ? row._id : ''
  if (row) {
    Object.assign(dialogForm, {
      account: row.account,
      password: '',
      name: row.name,
      phone: row.phone || '',
      email: row.email || '',
      roleIds: row.roleIds || [],
      status: row.status
    })
  } else {
    Object.assign(dialogForm, {
      account: '',
      password: '',
      name: '',
      phone: '',
      email: '',
      roleIds: [],
      status: 1
    })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await request.post('/account/update', { _id: editingId.value, ...dialogForm })
        ElMessage.success('修改成功')
      } else {
        await request.post('/account/add', dialogForm)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      fetchList()
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除账号 ${row.account} 吗？`, '提示', {
    type: 'warning'
  })
  await request.post('/account/delete', { _id: row._id })
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(() => {
  fetchList()
  fetchRoles()
})
</script>
