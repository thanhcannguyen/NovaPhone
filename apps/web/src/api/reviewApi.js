// src/api/reviewApi.js
import axiosInstance from './axiosInstance'

export const getProductReviews = (productId, rating) =>
    axiosInstance.get(`/products/${productId}/reviews`, { params: rating ? { rating } : {} })

export const checkCanRate = (productId) =>
    axiosInstance.get(`/products/${productId}/reviews/can-review`)

export const submitReview = (productId, payload) =>
    axiosInstance.post(`/products/${productId}/reviews`, payload) // payload: { rating?, comment }

export const toggleReviewHelpful = (reviewId) =>
    axiosInstance.patch(`/reviews/${reviewId}/helpful`)