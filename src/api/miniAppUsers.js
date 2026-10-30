import request from './request'

/**
 * 获取小程序用户列表
 */
export const getMiniAppUsers = (data) => {
  return request({
    url: '/miniapp/users',
    method: 'post',
    data
  })
}

/**
 * 更新小程序用户状态
 */
export const updateMiniAppUserStatus = (userId, status) => {
  return request({
    url: `/miniapp/users/${userId}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 删除小程序用户
 */
export const deleteMiniAppUser = (userId) => {
  return request({
    url: `/miniapp/users/${userId}`,
    method: 'delete'
  })
}
