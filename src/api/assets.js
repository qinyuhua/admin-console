import request from './request'

/**
 * 获取资产分组列表（管理端）
 */
export const getAssets = (data) => {
  return request({
    url: '/asset/admin/list',
    method: 'post',
    data
  })
}

/**
 * 获取资产明细列表（管理端）
 */
export const getAssetItems = (data) => {
  return request({
    url: '/asset/admin/item/list',
    method: 'post',
    data
  })
}

/**
 * 更新资产状态
 */
export const updateAssetStatus = (id, status) => {
  return request({
    url: '/asset/admin/status',
    method: 'post',
    data: { _id: id, status }
  })
}

/**
 * 获取资产统计数据
 */
export const getAssetStats = () => {
  return request({
    url: '/asset/admin/stats',
    method: 'get'
  })
}
