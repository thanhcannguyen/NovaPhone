import express from 'express'
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin
} from '../controllers/product.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public
router.get('/', getProducts)
router.get('/:id', getProductById)

// Admin only
router.get('/admin/all', protect, restrictTo('admin'), getAllProductsAdmin)
router.post('/', protect, restrictTo('admin'), createProduct)
router.put('/:id', protect, restrictTo('admin'), updateProduct)
router.delete('/:id', protect, restrictTo('admin'), deleteProduct)

export default router
