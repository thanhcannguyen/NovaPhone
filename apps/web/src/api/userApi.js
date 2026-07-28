// src/api/userApi.js
import axiosInstance from './axiosInstance'

export const getAllUsers = () => axiosInstance.get('/users')
export const getProfile = () => axiosInstance.get('/users/profile')
export const updateProfile = (data) => axiosInstance.put('/users/profile', data)

export const uploadAvatar = (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return axiosInstance.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}