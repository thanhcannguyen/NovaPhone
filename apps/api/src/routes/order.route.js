
import express from 'express'
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/order.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'

const router = express.Router()

// ----------------------------------------
// User routes — cần đăng nhập
// ----------------------------------------
router.post('/', protect, createOrder)   // tạo đơn hàng
router.get('/my', protect, getMyOrders)   // xem đơn của mình

// ----------------------------------------
// Dùng chung user + admin
// Service tự kiểm tra quyền bên trong
// ----------------------------------------
router.get('/:id', protect, getOrderById)  // xem chi tiết đơn

// ----------------------------------------
// Admin routes — cần login + role admin
// ----------------------------------------
router.get('/', protect, restrictTo('admin'), getAllOrders)
router.put('/:id/status', protect, restrictTo('admin'), updateOrderStatus)

export default router