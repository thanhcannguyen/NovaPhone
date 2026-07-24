
// routes/category.route.js
import express from 'express'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js'
import {
    protect,
    restrictTo
} from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public — ai cũng xem được
router.get('/', getCategories)

// Admin only — phải login + phải là admin
router.post('/', protect, restrictTo('admin'), createCategory)
router.put('/:id', protect, restrictTo('admin'), updateCategory)
router.delete('/:id', protect, restrictTo('admin'), deleteCategory)

export default router