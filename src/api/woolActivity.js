import request from './request'

export const getWoolActivities = (params) => request.get('/wool-activity', { params })
export const getWoolActivity = (id) => request.get(`/wool-activity/${id}`)
export const createWoolActivity = (data) => request.post('/wool-activity', data)
export const updateWoolActivity = (id, data) => request.put(`/wool-activity/${id}`, data)
export const deleteWoolActivity = (id) => request.delete(`/wool-activity/${id}`)
