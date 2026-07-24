
import axios from 'axios'

const axiosInstance = axios.create({
    // ✅ Mới - trỏ vào Render
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Tự động gắn token vào mọi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Xử lý lỗi chung từ backend
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default axiosInstance