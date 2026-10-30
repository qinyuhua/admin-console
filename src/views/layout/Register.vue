<template>
  <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <el-card style="width: 420px; border-radius: 12px;" shadow="always">
      <template #header>
        <div style="text-align: center;">
          <h2 style="margin: 0; color: #303133;">注册</h2>
          <p style="margin: 8px 0 0; color: #909399; font-size: 13px;">手机号或邮箱均可注册</p>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" @submit.prevent="handleRegister">
        <el-form-item prop="account">
          <el-input
            v-model="form.account"
            placeholder="手机号 / 邮箱"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="name">
          <el-input
            v-model="form.name"
            placeholder="昵称（选填）"
            size="large"
            :prefix-icon="UserFilled"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（至少6位）"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%;"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        <div style="text-align: center; font-size: 14px;">
          已有账号？<el-link type="primary" @click="goLogin">返回登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  account: '',
  name: '',
  password: '',
  confirmPassword: ''
})

const validateAccount = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号或邮箱'))
  } else if (/^1[3-9]\d{9}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正确的手机号或邮箱'))
  }
}

const validateConfirm = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  account: [{ validator: validateAccount, trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validateConfirm, trigger: 'blur' }]
}

async function handleRegister() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await auth.register(form.account, form.password, form.name)
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch {
      // error handled by interceptor
    } finally {
      loading.value = false
    }
  })
}

function goLogin() {
  router.push('/login')
}
</script>
