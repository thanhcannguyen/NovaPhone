
// src/api/userApi.js
import axiosInstance from './axiosInstance'

export const getAllUsers = () => axiosInstance.get('/users')
export const getProfile = () => axiosInstance.get('/users/profile')
export const updateProfile = (data) => axiosInstance.put('/users/profile', data)