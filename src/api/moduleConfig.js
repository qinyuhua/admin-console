import request from './request'

export const getModuleConfigs = () => request.get('/module-config')
export const getModuleConfig = (id) => request.get(`/module-config/${id}`)
export const createModuleConfig = (data) => request.post('/module-config', data)
export const updateModuleConfig = (id, data) => request.put(`/module-config/${id}`, data)
export const deleteModuleConfig = (id) => request.delete(`/module-config/${id}`)
export const reorderModuleConfigs = (ids) => request.put('/module-config/reorder', { ids })
