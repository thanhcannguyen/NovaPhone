// src/api/reviewApi.js
import axiosInstance from './axiosInstance'

export const getProductReviews = (productId, rating) =>
    axiosInstance.get(`/products/${productId}/reviews`, { params: rating ? { rating } : {} })

export const checkCanRate = (productId) =>
    axiosInstance.get(`/products/${productId}/reviews/can-review`)

export const submitReview = (productId, payload) =>
    axiosInstance.post(`/products/${productId}/reviews`, payload)

export const submitReply = (reviewId, comment) =>
    axiosInstance.post(`/reviews/${reviewId}/reply`, { comment })

export const toggleReviewHelpful = (reviewId) =>
    axiosInstance.patch(`/reviews/${reviewId}/helpful`)

export const deleteReviewApi = (reviewId) =>
    axiosInstance.delete(`/reviews/${reviewId}`)

export const getAllReviewsAdmin = () =>
    axiosInstance.get('/reviews')