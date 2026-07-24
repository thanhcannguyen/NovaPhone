
import axiosInstance from './axiosInstance'

export const getCartApi = () => axiosInstance.get('/cart')
export const addToCartApi = (productId, quantity) => axiosInstance.post('/cart', { productId, quantity })
export const updateCartItemApi = (productId, quantity) => axiosInstance.put(`/cart/${productId}`, { quantity })
export const removeCartItemApi = (productId) => axiosInstance.delete(`/cart/${productId}`)
export const clearCartApi = () => axiosInstance.delete('/cart')