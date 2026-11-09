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

/** 管理端：新增资产分组 */
export const addAsset = (data) => request({ url: '/asset/admin/add', method: 'post', data })
/** 管理端：更新资产分组 */
export const updateAsset = (data) => request({ url: '/asset/admin/update', method: 'post', data })
/** 管理端：删除资产分组（软删+级联明细） */
export const deleteAsset = (_id) => request({ url: '/asset/admin/delete', method: 'post', data: { _id } })

/** 管理端：新增资产明细 */
export const addAssetItem = (data) => request({ url: '/asset/admin/item/add', method: 'post', data })
/** 管理端：更新资产明细 */
export const updateAssetItem = (data) => request({ url: '/asset/admin/item/update', method: 'post', data })
/** 管理端：删除资产明细 */
export const deleteAssetItem = (_id) => request({ url: '/asset/admin/item/delete', method: 'post', data: { _id } })
