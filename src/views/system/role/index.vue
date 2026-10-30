<template>
  <div class="page-container">
    <div class="page-header">
      <h2>角色配置</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增角色
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索角色名称/编码"
        clearable
        style="width: 250px;"
        @keyup.enter="fetchList"
        @clear="fetchList"
      />
      <el-button type="primary" @click="fetchList">查询</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="roleName" label="角色名称" width="160" />
      <el-table-column prop="roleCode" label="角色编码" width="160" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="菜单权限" width="120">
        <template #default="{ row }">
          <el-button size="small" text @click="showMenus(row)">
            {{ row.menuIds?.length || 0 }} 个
          </el-button>
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑角色' : '新增角色'" width="560px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="dialogForm.roleCode" placeholder="如 admin / editor" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dialogForm.description" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            :props="{ children: 'children', label: 'menuName' }"
            node-key="_id"
            show-checkbox
            default-expand-all
            :default-checked-keys="dialogForm.menuIds"
            style="width: 100%;"
          />
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

    <el-dialog v-model="menuDialogVisible" title="菜单权限" width="400px">
      <el-tree
        :data="menuTree"
        :props="{ children: 'children', label: 'menuName' }"
        default-expand-all
      />
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
const menuTree = ref([])
const menuTreeRef = ref()

const dialogVisible = ref(false)
const dialogFormRef = ref()
const editingId = ref('')
const submitting = ref(false)
const menuDialogVisible = ref(false)

const dialogForm = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  menuIds: [],
  status: 1
})

const dialogRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

async function fetchList() {
  loading.value = true
  try {
    const res = await request.post('/role/list', {
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

async function fetchMenuTree() {
  const res = await request.post('/menu/list')
  menuTree.value = res.data
}

function showMenus(row) {
  menuDialogVisible.value = true
}

function openDialog(row) {
  editingId.value = row ? row._id : ''
  if (row) {
    Object.assign(dialogForm, {
      roleName: row.roleName,
      roleCode: row.roleCode,
      description: row.description || '',
      menuIds: row.menuIds || [],
      status: row.status
    })
  } else {
    Object.assign(dialogForm, {
      roleName: '',
      roleCode: '',
      description: '',
      menuIds: [],
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
      const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
      const data = { ...dialogForm, menuIds: checkedKeys }
      if (editingId.value) {
        await request.post('/role/update', { _id: editingId.value, ...data })
        ElMessage.success('修改成功')
      } else {
        await request.post('/role/add', data)
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
  await ElMessageBox.confirm(`确定删除角色 ${row.roleName} 吗？`, '提示', {
    type: 'warning'
  })
  await request.post('/role/delete', { _id: row._id })
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(() => {
  fetchList()
  fetchMenuTree()
})
</script>
