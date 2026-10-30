import { defineStore } from 'pinia'
import request from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  actions: {
    async login(account, password) {
      const res = await request.post('/auth/login', { account, password })
      this.token = res.data.token
      this.userInfo = res.data.userInfo || null
      localStorage.setItem('token', this.token)
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      return res
    },
    async register(account, password, name) {
      return await request.post('/auth/register', { account, password, name })
    },
    async fetchUserInfo() {
      const res = await request.get('/auth/userinfo')
      this.userInfo = res.data
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      return res
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token
  }
})
