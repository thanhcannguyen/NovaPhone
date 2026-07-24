
// frontend/src/api/orderApi.js
import axiosInstance from './axiosInstance'

export const createOrderApi = (data) => {
    return axiosInstance.post('/orders', data)
}

export const getMyOrdersApi = () => {
    return axiosInstance.get('/orders/my')
}

export const getOrderByIdApi = (id) => {
    return axiosInstance.get(`/orders/${id}`)
}

export const getAllOrdersApi = () => {
    return axiosInstance.get('/orders')
}

export const updateOrderStatusApi = (id, status) => {
    return axiosInstance.put(`/orders/${id}/status`, { status })
}