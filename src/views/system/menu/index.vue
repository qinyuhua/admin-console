<template>
  <div class="page-container">
    <div class="page-header">
      <h2>菜单配置</h2>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon> 新增菜单
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="_id" border default-expand-all>
      <el-table-column prop="menuName" label="菜单名称" width="200" />
      <el-table-column prop="menuType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.menuType === 'menu' ? 'primary' : 'info'">
            {{ row.menuType === 'menu' ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" width="180" />
      <el-table-column prop="component" label="组件" width="200" />
      <el-table-column prop="icon" label="图标" width="100" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑菜单' : '新增菜单'" width="520px">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="90px">
        <el-form-item label="上级菜单">
          <el-cascader
            v-model="dialogForm.parentId"
            :options="menuTreeOptions"
            :props="{ checkStrictly: true, value: '_id', label: 'menuName', emitPath: false }"
            placeholder="顶级菜单"
            clearable
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="dialogForm.menuType">
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="dialogForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径">
          <el-input v-model="dialogForm.path" placeholder="/example" />
        </el-form-item>
        <el-form-item label="组件路径">
          <el-input v-model="dialogForm.component" placeholder="views/Example.vue" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="dialogForm.icon" placeholder="图标名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialogForm.sort" :min="0" :max="999" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../../../api'

const loading = ref(false)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogFormRef = ref()
const editingId = ref('')
const submitting = ref(false)

const dialogForm = reactive({
  parentId: null,
  menuType: 'menu',
  menuName: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 1
})

const dialogRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const menuTreeOptions = computed(() => {
  return tableData.value.filter(item => item.menuType === 'menu')
})

async function fetchList() {
  loading.value = true
  try {
    const res = await request.post('/menu/list')
    tableData.value = res.data
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  editingId.value = row ? row._id : ''
  if (row) {
    Object.assign(dialogForm, {
      parentId: row.parentId || null,
      menuType: row.menuType,
      menuName: row.menuName,
      path: row.path || '',
      component: row.component || '',
      icon: row.icon || '',
      sort: row.sort,
      status: row.status
    })
  } else {
    Object.assign(dialogForm, {
      parentId: null,
      menuType: 'menu',
      menuName: '',
      path: '',
      component: '',
      icon: '',
      sort: 0,
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
        await request.post('/menu/update', { _id: editingId.value, ...dialogForm })
        ElMessage.success('修改成功')
      } else {
        await request.post('/menu/add', dialogForm)
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
  await ElMessageBox.confirm(`确定删除菜单 ${row.menuName} 吗？`, '提示', {
    type: 'warning'
  })
  await request.post('/menu/delete', { _id: row._id })
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>
